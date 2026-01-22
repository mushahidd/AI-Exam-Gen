const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://ai-exam-gen.vercel.app',
    'https://ai-exam-gen-git-main-mushahidds-projects.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/teacherAI'));

app.get('/', (req, res) => {
  res.send('AI Exam Generator API is running');
});

const bcrypt = require('bcryptjs');

// Admin Seed
const seedAdmin = async () => {
  try {
    const adminEmail = 'tlcexamination@ex.com';
    const adminPassword = 'tlc123451';

    const existingAdmin = await prisma.user.findUnique({
      where: { username: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          username: adminEmail,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Start server (for Railway/local)
seedAdmin().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  });
});

// Export for serverless (if needed)
module.exports = app;
