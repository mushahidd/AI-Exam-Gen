// API routes for AI Exam Generator
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Public endpoint - Get platform statistics
router.get('/stats', async (req, res) => {
    try {
        const examCount = await prisma.exam.count();
        const teacherCount = await prisma.user.count({
            where: { role: { in: ['TEACHER', 'ADMIN'] } }
        });
        res.json({ totalExams: examCount, activeTeachers: teacherCount });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Users
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, email: true, password: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.delete('/users/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const id = parseInt(userId);

        // Transaction to ensure cleanup
        await prisma.$transaction(async (prisma) => {
            // First delete all classes owned by this teacher
            // Because Class cascade deletes Sessions/Exams, this cleans up everything
            await prisma.class.deleteMany({
                where: { teacherId: id }
            });

            // Then delete the user
            await prisma.user.delete({
                where: { id: id }
            });
        });

        res.json({ message: 'User and all related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user: ' + error.message });
    }
});

router.put('/users/:userId/password', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { password } = req.body;
    try {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id: parseInt(userId) }, data: { password: hashedPassword } });
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// Classes
router.get('/classes', authenticateToken, async (req, res) => {
    try {
        const classes = await prisma.class.findMany({ include: { _count: { select: { exams: true } } } });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

router.get('/classes/:classId', authenticateToken, async (req, res) => {
    const { classId } = req.params;
    try {
        const cls = await prisma.class.findUnique({ where: { id: parseInt(classId) } });
        if (!cls) return res.status(404).json({ error: 'Class not found' });
        res.json(cls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch class' });
    }
});

router.post('/classes', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { name } = req.body;
    try {
        const newClass = await prisma.class.create({ data: { name, teacherId: req.user.id } });
        res.json(newClass);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create class' });
    }
});

router.put('/classes/:classId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { classId } = req.params;
    const { name } = req.body;
    try {
        const updatedClass = await prisma.class.update({
            where: { id: parseInt(classId) },
            data: { name }
        });
        res.json(updatedClass);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update class' });
    }
});

router.delete('/classes/:classId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { classId } = req.params;
    try {
        await prisma.class.delete({ where: { id: parseInt(classId) } });
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete class' });
    }
});

// Sessions for a class (filter by exam type)
router.get('/classes/:classId/sessions', authenticateToken, async (req, res) => {
    const { classId } = req.params;
    const { type } = req.query;
    try {
        const sessions = await prisma.session.findMany({
            where: { classId: parseInt(classId) },
            include: { _count: { select: { exams: type ? { where: { type } } : true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await prisma.session.findUnique({ where: { id: parseInt(sessionId) } });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

router.post('/sessions', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { name, classId } = req.body;
    try {
        const session = await prisma.session.create({ data: { name, classId: parseInt(classId) } });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create session' });
    }
});

router.put('/sessions/:sessionId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { sessionId } = req.params;
    const { name } = req.body;
    try {
        const updatedSession = await prisma.session.update({
            where: { id: parseInt(sessionId) },
            data: { name }
        });
        res.json(updatedSession);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update session' });
    }
});

router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { sessionId } = req.params;
    try {
        await prisma.session.delete({ where: { id: parseInt(sessionId) } });
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// Subjects for a session (filter by exam type)
router.get('/sessions/:sessionId/subjects', authenticateToken, async (req, res) => {
    const { sessionId } = req.params;
    const { type } = req.query;
    try {
        const subjects = await prisma.subject.findMany({
            where: { sessionId: parseInt(sessionId) },
            include: { _count: { select: { exams: type ? { where: { type } } : true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

router.get('/subjects/:subjectId', authenticateToken, async (req, res) => {
    const { subjectId } = req.params;
    try {
        const subject = await prisma.subject.findUnique({ where: { id: parseInt(subjectId) } });
        if (!subject) return res.status(404).json({ error: 'Subject not found' });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subject' });
    }
});

router.post('/subjects', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { name, sessionId } = req.body;
    try {
        const subject = await prisma.subject.create({ data: { name, sessionId: parseInt(sessionId) } });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create subject' });
    }
});

router.put('/subjects/:subjectId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { subjectId } = req.params;
    const { name } = req.body;
    try {
        const updatedSubject = await prisma.subject.update({
            where: { id: parseInt(subjectId) },
            data: { name }
        });
        res.json(updatedSubject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subject' });
    }
});

router.delete('/subjects/:subjectId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });
    const { subjectId } = req.params;
    try {
        await prisma.subject.delete({ where: { id: parseInt(subjectId) } });
        res.json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});

// Exams for a class (filter by type, session, subject)
router.get('/classes/:classId/exams', authenticateToken, async (req, res) => {
    const { classId } = req.params;
    const { type, sessionId, subjectId } = req.query;
    try {
        const where = { classId: parseInt(classId) };
        if (type) where.type = type;
        if (sessionId) where.sessionId = parseInt(sessionId);
        if (subjectId) where.subjectId = parseInt(subjectId);
        const exams = await prisma.exam.findMany({ where, include: { _count: { select: { questions: true } } } });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

router.post('/exams', authenticateToken, async (req, res) => {
    const { title, classId, type, sessionId, subjectId } = req.body;
    try {
        const exam = await prisma.exam.create({
            data: {
                title,
                classId: parseInt(classId),
                type: type || 'Monthly',
                sessionId: sessionId ? parseInt(sessionId) : null,
                subjectId: subjectId ? parseInt(subjectId) : null
            }
        });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create exam' });
    }
});

router.post('/questions', authenticateToken, async (req, res) => {
    const { text, type, examId, options } = req.body;
    try {
        const question = await prisma.question.create({
            data: { text, type, examId: parseInt(examId), options: options ? JSON.stringify(options) : undefined }
        });
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add question' });
    }
});

// Delete a question
router.delete('/questions/:questionId', authenticateToken, async (req, res) => {
    const { questionId } = req.params;
    try {
        await prisma.question.delete({ where: { id: parseInt(questionId) } });
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

// Get exam by ID
router.get('/exams/:examId', authenticateToken, async (req, res) => {
    const { examId } = req.params;
    try {
        const exam = await prisma.exam.findUnique({ where: { id: parseInt(examId) }, include: { questions: true, subject: true, class: true } });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
});

router.put('/exams/:examId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can edit exams' });
    }
    const { examId } = req.params;
    const { title, time, date, maxMarks, sectionAMarks, sectionBMarks, sectionCMarks } = req.body;
    try {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (time !== undefined) updateData.time = time;
        if (date !== undefined) updateData.date = date;
        if (maxMarks !== undefined) updateData.maxMarks = maxMarks;
        if (sectionAMarks !== undefined) updateData.sectionAMarks = sectionAMarks;
        if (sectionBMarks !== undefined) updateData.sectionBMarks = sectionBMarks;
        if (sectionCMarks !== undefined) updateData.sectionCMarks = sectionCMarks;

        const exam = await prisma.exam.update({
            where: { id: parseInt(examId) },
            data: updateData
        });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update exam' });
    }
});

router.delete('/exams/:examId', authenticateToken, async (req, res) => {
    const { examId } = req.params;
    try {
        await prisma.exam.delete({ where: { id: parseInt(examId) } });
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete exam' });
    }
});


// Question Bank
router.get('/question-bank', authenticateToken, async (req, res) => {
    const { subject, chapter, topic, unit, className, type } = req.query;
    try {
        const where = {};
        if (subject) where.subject = { contains: subject, mode: 'insensitive' };
        if (chapter) where.chapter = { equals: chapter, mode: 'insensitive' };
        if (topic) where.topic = { contains: topic, mode: 'insensitive' };
        if (unit) where.unit = { equals: unit, mode: 'insensitive' };
        if (className) where.className = className;
        if (type) where.type = type;

        const questions = await prisma.questionBank.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(questions);
    } catch (error) {
        console.error('Error fetching question bank:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

router.post('/question-bank', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });

    const { text, type, options, subject, chapter, topic } = req.body;

    // Basic validation
    if (!text || !type) {
        return res.status(400).json({ error: 'Text and Type are required' });
    }

    try {
        const question = await prisma.questionBank.create({
            data: {
                text,
                type,
                options: options ? JSON.stringify(options) : undefined, // Ensure options are stringified if passed as array
                subject,
                chapter,
                topic
            }
        });
        res.json(question);
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to add question' });
    }
});

router.put('/question-bank/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });

    const { id } = req.params;
    const { text, type, options, subject, chapter, topic } = req.body;

    try {
        const updatedQuestion = await prisma.questionBank.update({
            where: { id: parseInt(id) },
            data: {
                text,
                type,
                options: options ? (typeof options === 'string' ? options : JSON.stringify(options)) : undefined,
                subject,
                chapter,
                topic
            }
        });
        res.json(updatedQuestion);
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

router.delete('/question-bank/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied. Admins only.' });

    const { id } = req.params;

    try {
        await prisma.questionBank.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

module.exports = router;
