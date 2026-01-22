const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');
const { hfGenerateText } = require('../utils/hfGenerate');

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// AI Question Extraction
const extractQuestionsWithAI = async (text, meta) => {
    const { className, subject, chapter, unit } = meta;

    // Log extraction for debug
    console.log(`[Shifu AI] Text sent for extraction: ${text.length} chars. Subject: ${subject}`);

    const prompt = `
    You are an expert exam setter. Your goal is to generate high-quality exam questions based on the provided material.
    
    Context:
    - Class: ${className}
    - Subject: ${subject}
    - Chapter: ${chapter}
    - Unit: ${unit}

    Instructions:
    1. Analyze the "Raw Material" below.
    2. Extract concepts, definitions, and facts.
    3. Generate a set of questions (approx 5-10) covering these concepts.
    4. VARIETY: Generate a mix of 60% MCQs, 30% Short Answers, and 10% Long Answers.
    5. If the text is sparse or unclear, use the Chapter/Unit metadata to generate topically relevant questions. NEVER return an empty array.

    Output Format (Strict JSON):
    [
      {
        "text": "Question content...",
        "type": "MCQ", // or "SHORT", "LONG"
        "options": ["A", "B", "C", "D"], // Required for MCQs
        "answer": "Correct Answer",
        "className": "${className}",
        "subject": "${subject}",
        "chapter": "${chapter}",
        "unit": "${unit}"
      }
    ]

    Raw Material:
    ${text.substring(0, 20000)}
    `;

    const attemptGeneration = async (retryCount = 0) => {
        try {
            if (retryCount > 0) {
                console.log(`[Shifu AI] Waiting before retry ${retryCount}...`);
                await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
            }

            const responseText = await hfGenerateText(prompt);
            console.log(`[Shifu AI] Response received. First 100 chars: ${responseText.substring(0, 100)}...`);

            // Clean up potentially messy JSON response
            let cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            const firstBracket = cleanedText.indexOf('[');
            const lastBracket = cleanedText.lastIndexOf(']');

            if (firstBracket !== -1 && lastBracket !== -1) {
                cleanedText = cleanedText.substring(firstBracket, lastBracket + 1);
            }

            let parsed;
            try {
                parsed = JSON.parse(cleanedText);
            } catch (jsonError) {
                console.error(`[Shifu AI] JSON Parse Failed.`, jsonError.message);
                throw new Error("Invalid JSON received from AI");
            }

            if (!Array.isArray(parsed)) {
                throw new Error("AI response is not an array");
            }

            return parsed.map(q => ({
                ...q,
                className: q.className || q.class || className,
                type: (q.type || 'MCQ').toUpperCase()
            }));

        } catch (error) {
            console.error(`AI Extraction Attempt ${retryCount + 1} Failed:`, error.message);
            if (retryCount < 2) {
                return attemptGeneration(retryCount + 1);
            }
            throw new Error(`AI Generation Failed: ${error.message}`);
        }
    };

    return attemptGeneration();
};


/**
 * Robust PDF Parsing
 * Handles pdf-parse v2 class structure
 */
const parsePdfBuffer = async (buffer) => {
    try {
        // Handle pdf-parse v2+ which exports a class named PDFParse
        if (pdf.PDFParse) {
            const { PDFParse } = pdf;
            // Constructor takes an object with data property
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            return result.text;
        }

        // Handle standard/older pdf-parse which exports a function
        if (typeof pdf === 'function') {
            const data = await pdf(buffer);
            return data.text;
        }

        throw new Error("PDF parser is not correctly initialized.");
    } catch (err) {
        console.error("PDF Parsing Inner Error:", err);
        // Fallback for some weird edge cases or misconfiguration
        throw new Error(`Failed to parse PDF: ${err.message}`);
    }
}

// 1. Upload and Parse Question File with AI
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { className, subject, chapter, unit } = req.body;
    if (!className || !subject || !chapter || !unit) {
        return res.status(400).json({ error: 'Missing metadata (className, subject, chapter, unit)' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    try {
        let extractedText = '';

        if (fileExt === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            extractedText = await parsePdfBuffer(dataBuffer);
        } else if (fileExt === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else if (fileExt === '.txt') {
            extractedText = fs.readFileSync(filePath, 'utf-8');
        } else {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' });
        }

        console.log(`[Upload] Extracted ${extractedText.length} characters from ${fileExt} file.`);

        if (!extractedText || extractedText.trim().length < 50) {
            throw new Error("Document text is too short or empty. Use a text-based PDF/DOCX (not scanned images).");
        }

        // Send to AI
        const aiQuestions = await extractQuestionsWithAI(extractedText, { className, subject, chapter, unit });

        // Cleanup file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        if (aiQuestions.length === 0) {
            return res.status(422).json({ error: "AI returned 0 questions. The document might not contain enough relevant text." });
        }

        res.json({
            success: true,
            count: aiQuestions.length,
            questions: aiQuestions
        });

    } catch (error) {
        console.error('Extraction Error:', error);
        // Ensure cleanup on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || 'Failed to process file' });
    }
});

// 2. Save Batch Questions from AI
router.post('/save', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });

    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'No questions provided' });
    }

    try {
        // Normalize text function for consistent comparison
        const normalizeText = (text) => {
            return (text || '')
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                .replace(/[.,!?;:]+$/g, '');  // Remove trailing punctuation
        };

        // Get all existing question texts to prevent duplicates
        const existingQuestions = await prisma.questionBank.findMany({
            select: { text: true }
        });
        const existingTexts = new Set(existingQuestions.map(q => normalizeText(q.text)));

        // Track duplicates within the batch itself
        const batchTexts = new Set();
        const newQuestions = [];
        let skippedExisting = 0;
        let skippedBatchDupes = 0;

        for (const q of questions) {
            const normalizedText = normalizeText(q.text);
            
            if (!normalizedText) {
                continue; // Skip empty questions
            }

            // Check if exists in database
            if (existingTexts.has(normalizedText)) {
                skippedExisting++;
                continue;
            }

            // Check if duplicate within this batch
            if (batchTexts.has(normalizedText)) {
                skippedBatchDupes++;
                continue;
            }

            batchTexts.add(normalizedText);
            newQuestions.push(q);
        }

        if (newQuestions.length === 0) {
            return res.json({
                success: true,
                count: 0,
                skipped: skippedExisting + skippedBatchDupes,
                message: `All questions already exist in the bank. ${skippedExisting} duplicate(s) found in database, ${skippedBatchDupes} duplicate(s) in batch.`
            });
        }

        // Save questions one by one to handle unique constraint violations gracefully
        let savedCount = 0;
        let failedCount = 0;

        for (const q of newQuestions) {
            try {
                await prisma.questionBank.create({
                    data: {
                        text: q.text.trim(),  // Store trimmed but preserve original casing
                        type: q.type,
                        options: q.options ? JSON.stringify(q.options) : '[]',
                        answer: q.answer || null,
                        subject: q.subject,
                        chapter: q.chapter,
                        topic: q.unit || q.topic,
                        unit: q.unit,
                        className: q.className
                    }
                });
                savedCount++;
            } catch (dbError) {
                // If unique constraint violation, just skip it
                if (dbError.code === 'P2002') {
                    failedCount++;
                } else {
                    throw dbError;  // Re-throw other errors
                }
            }
        }

        const totalSkipped = skippedExisting + skippedBatchDupes + failedCount;
        res.json({
            success: true,
            count: savedCount,
            skipped: totalSkipped,
            message: `Successfully saved ${savedCount} new question(s). ${totalSkipped > 0 ? `Skipped ${totalSkipped} duplicate(s).` : ''}`
        });

    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save questions: ' + error.message });
    }
});

module.exports = router;
