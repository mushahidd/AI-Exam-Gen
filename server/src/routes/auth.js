const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
    console.log('Register Request Body:', req.body);
    const { username, password, role } = req.body;

    // Email validation - STRICT @gmail.com check
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(username)) {
        return res.status(400).json({ error: 'Registration is restricted to @gmail.com addresses only.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Auto-verify user immediately since verification is disabled
        const user = await prisma.user.create({
            data: {
                username,
                email: username,
                password: hashedPassword,
                role: role || 'TEACHER',
                isEmailVerified: true, // Auto-verified
            },
        });

        console.log('User created:', user.id);

        res.json({
            message: 'Registration successful! You can now login.',
            userId: user.id
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(400).json({ error: 'Username already exists or invalid data' });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('Login Request Body:', req.body);
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            console.log('Login failed: User not found for', username);
            return res.status(400).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Login failed: Invalid password for', username);
            return res.status(400).json({ error: 'Invalid password' });
        }


        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful for:', username);
        res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Google Login
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        let user = await prisma.user.findUnique({ where: { username: email } });

        if (!user) {
            // Create user if not exists - Google users are auto-verified
            user = await prisma.user.create({
                data: {
                    username: email,
                    email: email,
                    googleId: sub,
                    role: 'TEACHER',
                    isEmailVerified: true, // Google verifies emails
                },
            });
            console.log('New Google user created:', user.id);
        } else if (!user.googleId) {
            // Link googleId if user exists but was created via password
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: sub,
                    isEmailVerified: true // Auto-verify when linking Google account
                }
            });
        }

        const jwtToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Google login successful for:', email);
        res.json({ token: jwtToken, role: user.role, username: user.username });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Google authentication failed' });
    }
});

module.exports = router;
