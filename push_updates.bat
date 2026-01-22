@echo off
echo 🚀 initializing Git...
git init
git config user.email "mushahidhussain974@gmail.com"
git config user.name "Mushahid Hussain"
git remote add origin https://github.com/mushahidd/AI-Exam-Gen.git
git fetch origin

echo 📦 Adding files...
git add .

echo 💾 Committing changes...
git commit -m "Major Update: Enhanced Auth, Admin Cleanup, Gmail Enforcement"

echo ⬆️ Pushing to GitHub...
git push -u origin main --force

echo ✅ Done! Updates are live.
pause
