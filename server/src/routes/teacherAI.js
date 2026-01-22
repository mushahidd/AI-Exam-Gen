const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { hfGenerateText } = require('../utils/hfGenerate');

// Simple in-memory rate limiting (Per Day target)
const dailyLimitMap = new Map();

const rateLimiter = (req, res, next) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `${userId}-${today}`;

    if (!dailyLimitMap.has(key)) {
        dailyLimitMap.set(key, 0);
    }

    const requestsToday = dailyLimitMap.get(key);
    const maxRequestsPerDay = 15; // Increased slightly for better teacher UX

    if (requestsToday >= maxRequestsPerDay) {
        return res.status(429).json({ error: 'Daily AI generation limit reached (15/day). Please try again tomorrow.' });
    }

    dailyLimitMap.set(key, requestsToday + 1);
    next();
};

/**
 * Robust parser for various formats Hugging Face model might return
 */
const parseHFResponse = (text, requestedType, requestedCount) => {
    // 1. Try to extract JSON from the text
    try {
        // Find everything between [ and ]
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
            const jsonStr = text.substring(start, end + 1);
            const parsed = JSON.parse(jsonStr);
            if (Array.isArray(parsed)) {
                return parsed.map(q => ({
                    type: q.type || requestedType || "SHORT",
                    question: q.question || "Untitled Question",
                    options: Array.isArray(q.options) ? q.options : [],
                    answer: q.answer || ""
                })).slice(0, requestedCount);
            }
        }
    } catch (e) {
        console.warn("[AI Parser] JSON Extraction failed, falling back to regex.");
    }

    // 2. Fallback: Split by lines and look for patterns (improved for DeepSeek/Mistral)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const questions = [];
    let currentQ = null;

    lines.forEach(line => {
        // Detect Question Start (Numbered, starts with Q:, ### Question, or **Question)
        if (/^(\d+\.|\d+\)|Q:|###|Question|\*\*Question)/i.test(line)) {
            if (currentQ) questions.push(currentQ);
            currentQ = {
                type: requestedType || "SHORT",
                question: line.replace(/^(###|\*\*|\d+\.|\d+\)|Q:)\s*(Question\s*\d*:?)?\s*/i, '').replace(/\*\*$/g, '').trim(),
                options: [],
                answer: ""
            };
        }
        // Detect Options for MCQ (A), B), C), D) or A., B. etc)
        else if (currentQ && /^[A-D](\.|\))/i.test(line)) {
            currentQ.type = "MCQ";
            currentQ.options.push(line.replace(/^[A-D](\.|\))\s*/i, '').replace(/\*\*$/g, '').trim());
        }
        // Detect Answer (Ans:, Correct:, Answer:)
        else if (currentQ && /^(Ans|Correct|Answer|Γ£à)\s*(Answer)?\s*:/i.test(line)) {
            currentQ.answer = line.replace(/^(Ans|Correct|Answer|Γ£à)\s*(Answer)?\s*:\s*/i, '').replace(/\*\*$/g, '').trim();
        }
    });

    if (currentQ) questions.push(currentQ);

    // 3. Final Fallback: If no structure detected, use raw chunks
    if (questions.length === 0) {
        return [{
            type: requestedType || "LONG",
            question: text.substring(0, 500),
            options: [],
            answer: ""
        }];
    }

    return questions.slice(0, requestedCount);
};

router.post('/teacher-generate', authenticateToken, rateLimiter, async (req, res) => {
    const { className, subject, instruction, questionType, count } = req.body;

    if (!className || !subject || !instruction) {
        return res.status(400).json({ error: 'Missing required context (Class, Subject, or Instructions)' });
    }

    const requestedCount = Math.min(parseInt(count) || 3, 5); // Flan-T5 works best with fewer questions

    // Updated Prompt for Shifu (DeepSeek via OpenRouter)
    // Removed strict type constraint so teacher can specify in instruction
    const prompt = `Generate exactly ${requestedCount} exam questions for Class ${className} ${subject}.
Instructions: ${instruction}

IMPORTANT: Follow the instruction's requested question type (MCQ, Short, or Long).
Respond ONLY with a valid JSON array of objects. No intro, no outro.
Format:
[
  {
    "type": "MCQ or SHORT or LONG",
    "question": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Option 1"
  }
]
`;

    try {
        console.log(`[HF AI] Generating questions for ${subject}...`);
        const rawText = await hfGenerateText(prompt);

        if (!rawText || rawText.length < 5) {
            console.error("[HF AI] Empty or short response:", rawText);
            throw new Error("AI returned an empty response. Please try being more specific with your instructions.");
        }

        console.log("[HF AI] Parsing response...");
        const questions = parseHFResponse(rawText, questionType, requestedCount);

        res.json({
            success: true,
            questions,
            model: "deepseek-chat",
            provider: "Shifu"
        });
    } catch (error) {
        console.error("Shifu AI Route Error:", error.message);
        res.status(500).json({
            error: error.message || "Shifu AI failed to generate questions.",
            details: error.stack
        });
    }
});

module.exports = router;
