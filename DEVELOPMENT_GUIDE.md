# AI Exam Generator - Development Guide

## 🎉 Project Status

✅ **Google OAuth Login**: Working on production  
✅ **Frontend**: Deployed on Vercel (https://ai-exam-gen.vercel.app)  
✅ **Backend**: Deployed on Railway (https://ai-exam-gen-production.up.railway.app)  
✅ **Database**: PostgreSQL on Neon.tech  

---

## 🔑 Environment Variables

### Frontend (.env for local, Vercel for production)
```env
VITE_GOOGLE_CLIENT_ID=993252639441-ap8k7rp0tu5vdluqomild6os4cqhsc2g.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000  # or Railway URL for production
```

### Backend (server/.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=993252639441-ap8k7rp0tu5vdluqomild6os4cqhsc2g.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENROUTER_API_KEY=your-openrouter-api-key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- PostgreSQL database (or use Neon.tech)

### Installation Steps

1. **Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

2. **Setup Environment Variables**
- Copy `.env.example` to `.env` in root directory
- Copy `server/.env.example` to `server/.env`
- Fill in your actual values

3. **Setup Database** (Backend only)
```bash
cd server
npx prisma generate
npx prisma db push
```

4. **Run Development Servers**
```bash
# Terminal 1 - Backend (from server directory)
npm run dev  # Runs on http://localhost:5000

# Terminal 2 - Frontend (from root directory)
npm run dev  # Runs on http://localhost:5173
```

---

## 🔧 Google OAuth Configuration

### Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services → Credentials**
3. Find your OAuth 2.0 Client ID
4. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (local development)
   - `https://ai-exam-gen.vercel.app` (production)
5. Add **Authorized redirect URIs**:
   - `http://localhost:5173`
   - `https://ai-exam-gen.vercel.app`
6. Save changes

### Troubleshooting

**Issue: "redirect_uri_mismatch"**
- Verify URLs in Google Cloud Console match exactly
- No trailing slashes
- Check http vs https

**Issue: Google button not showing**
- Verify `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- Restart dev server after changing `.env`
- Check browser console for warning messages

**Issue: "Access blocked: Authorization Error"**
- Configure OAuth consent screen
- Add test users (if in testing mode)

---

## 📦 Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_API_URL` (Railway backend URL)
4. Deploy

### Railway (Backend)
1. Connect GitHub repository
2. Select `server` directory as root
3. Add environment variables (see .env.example)
4. Deploy

---

## 🔐 Default Credentials

**Admin Account:**
- Email: `tlcexamination@ex.com`
- Password: `tlc123451`

---

## 🧪 Testing

### Local Testing
1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm run dev`
3. Visit http://localhost:5173
4. Test Google login

### Production Testing
- Visit https://ai-exam-gen.vercel.app
- Test all features including Google OAuth

---

## 📝 Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Backend commands
cd server
npm run dev          # Start backend
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
```

---

## 🐛 Known Issues & Fixes

### Google OAuth Not Working
**Fixed!** Now properly configured with environment variables and graceful fallback.

### Node modules missing
Run `npm install` in both root and server directories.

### Database connection errors
Check `DATABASE_URL` in `server/.env` and ensure database is accessible.

---

## 📚 Project Structure

```
ai-exam-gen/
├── src/                    # Frontend React app
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   ├── context/            # Auth context
│   └── config/             # API config
├── server/                 # Backend Express app
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── utils/          # Utilities
│   └── prisma/             # Database schema
├── .env                    # Local environment variables
├── .env.production         # Production environment variables
└── package.json            # Dependencies
```

---

For more details, see the main README.md file.
