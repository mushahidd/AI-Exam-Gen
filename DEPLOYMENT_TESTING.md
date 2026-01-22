# 🚀 Deployment & Testing Guide for Email Verification

## ⚠️ IMPORTANT: Database Update
I have updated the `start` script in `server/package.json` to run `npx prisma db push` automatically. This ensures your production database schema is updated when you deploy.

---

## 📦 Step 1: Deploy Changes

You need to push your local changes to GitHub to trigger the deployment.

```bash
git add .
git commit -m "Implement email verification system"
git push
```

**Wait for deployments to finish:**
- **Railway (Backend)**: ~2-3 minutes
- **Vercel (Frontend)**: ~1-2 minutes

---

## 📧 Step 2: Testing Email Verification (Without Real Email)

Since you haven't configured a real email service (Gmail, etc.) on Railway yet, the system will use **Ethereal Email** (Test Mode).

### How to get the Verification Code:

1. **Go to your live site**: https://ai-exam-gen.vercel.app
2. **Register a new account**
3. You will be redirected to the `/verify-email` page.
4. **Go to Railway Dashboard**: https://railway.app
5. Click on your **Server** project
6. Click on the **Deployments** tab
7. Click on the **View Logs** for the active deployment
8. Look for a log like this:
   ```
   📧 Test email sent!
   Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
   ```
   OR you might see the code directly if I logged it (I didn't log the code directly for security, but the Preview URL will show the email).
   
   *Wait, looking at the code I wrote:*
   ```javascript
   console.log('📧 Test email sent!');
   console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
   ```
   
   **Click the Preview URL** from the logs. It will open a fake inbox showing the email with the **6-digit code**.

9. **Enter the code** on your website.
10. **Success!** You should be verified and able to login.

---

## ⚙️ Step 3: Configure Real Email (For Production)

When you are ready to send REAL emails to users, you need to add these environment variables in **Railway**:

1. Go to **Railway Dashboard** → **Settings** → **Variables**
2. Add the following:

| Variable | Value |
|----------|-------|
| `EMAIL_SERVICE` | `gmail` (or other service) |
| `EMAIL_USER` | `your-email@gmail.com` |
| `EMAIL_PASS` | `your-app-password` (NOT your login password) |

**Note for Gmail:** You must use an **App Password**:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search for "App Passwords"
4. Create one for "Mail" / "Other"
5. Use that 16-character password in `EMAIL_PASS`

---

## 🔄 Summary

1. **Push code** to GitHub.
2. **Wait** for deployment.
3. **Register** on your site.
4. **Check Railway Logs** for the "Preview URL".
5. **Get the code** from the preview link.
6. **Verify** your account.

You're all set! 🚀
