# AI Exam Generator

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://ai-exam-gen.vercel.app)
[![Backend](https://img.shields.io/badge/backend-railway-purple)](https://ai-exam-gen-production.up.railway.app)

A modern web application for teachers and administrators to create, manage, and export professional exam papers with AI assistance.

## 🌐 Live Demo

- **Frontend**: [https://ai-exam-gen.vercel.app](https://ai-exam-gen.vercel.app)
- **Backend API**: [https://ai-exam-gen-production.up.railway.app](https://ai-exam-gen-production.up.railway.app)

## ✨ Features

### For Teachers
- 📝 Create and manage exam papers
- 🤖 **AI-Powered Question Generation** (Shifu AI using DeepSeek)
- 📚 Access Question Bank for reusable questions
- 📄 Export exams to PDF with professional formatting
- 👀 Preview exams before printing

### For Administrators
- 👥 User management (create/delete teachers)
- 🏫 Class management (add/edit/delete classes)
- 📅 Session management (academic years)
- 📖 Subject management
- 📥 Bulk import questions from files
- 🗄️ Centralized Question Bank management

### UI/UX Features
- 📱 **Fully responsive** - Works on mobile, tablet, and desktop
- ⚡ **Smooth animations** - Skeleton loaders and fade-in effects
- 🎨 Modern, clean interface with TailwindCSS
- 🔐 Secure JWT authentication
- 🔑 Google OAuth login support

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Neon.tech) |
| **ORM** | Prisma |
| **AI** | OpenRouter API (DeepSeek) |
| **Auth** | JWT, Google OAuth |
| **Hosting** | Vercel (Frontend), Railway (Backend) |

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or pnpm
- PostgreSQL database (or use Neon.tech free tier)

### Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-jwt-secret"
OPENROUTER_API_KEY="sk-or-v1-your-openrouter-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Create a `.env.production` file in the root directory for frontend:

```env
VITE_API_URL=https://your-backend-url.com
```

### Local Development

#### Backend Setup

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```
Server runs on `http://localhost:5000`

#### Frontend Setup

```bash
npm install
npm run dev
```
App runs on `http://localhost:5173`

## 📖 Usage Guide

### 1. Authentication
- Visit the app and click **"Sign in"**
- Register a new account or login with existing credentials
- Supports Google OAuth for quick login

### 2. Dashboard (Teachers/Admins)
- View all your classes
- **Admins only**: Access User Management, Question Bank, and Import Questions

### 3. Creating Exams
1. Click on a class → Select exam type (Monthly/Module/Prelim)
2. Select academic session → Select subject
3. Click **"Create Exam"** to add a new exam
4. Add questions manually or use **Shifu AI Assist** to generate questions

### 4. AI Question Generation
- Click the **AI Assist** button when creating questions
- Enter your instructions (e.g., "Generate 5 MCQs about photosynthesis")
- AI generates questions in the correct format
- Review and add questions to your exam

### 5. Export to PDF
- Click on an exam to preview
- Click **"Export to PDF"** for a professionally formatted exam paper

## 📁 Project Structure

```
ai-exam-generator/
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── context/            # Auth context
│   └── config/             # API configuration
├── server/                 # Backend Express app
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── utils/          # AI generation utilities
│   └── prisma/             # Database schema
├── public/                 # Static assets
└── components/             # Shared UI components
```

## 🔑 Default Admin Credentials

For testing purposes:
- **Email**: `tlcexamination@ex.com`
- **Password**: `tlc123451`

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
