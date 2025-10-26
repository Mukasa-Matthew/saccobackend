# 📧 Email Setup - Quick Guide

## Current Status
Email is **not configured**. You need to add SMTP credentials to send emails.

## Why Email Failed
Your `.env` file is missing SMTP configuration.

## ⚡ Quick Setup (5 Minutes)

### 1. Gmail Setup

Go to: https://myaccount.google.com/apppasswords

Steps:
1. Enable 2-Factor Authentication on your Google Account
2. Go to App Passwords page
3. Select "Mail" and "Other (custom name)"
4. Type "SACCO System"
5. Click Generate
6. Copy the password (looks like: `abcd efgh ijkl mnop`)

### 2. Update .env File

Open your `.env` file and ADD these lines:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=matthewmukasa0@gmail.com
SMTP_PASSWORD=your_16_char_app_password_here
SMTP_FROM=noreply@sacco.com
FRONTEND_URL=http://localhost:3001
```

### 3. Restart Server

```bash
npm run dev
```

### 4. Test Email

The server will restart automatically. Now test:

```powershell
$body = @{email="matthewmukasa0@gmail.com"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/test/test-email" -Method Post -Body $body -ContentType "application/json"
```

## 📧 What You'll Receive

When email is configured, you'll get a beautiful HTML email with:
- Professional design
- Your login credentials
- Welcome message
- Direct login link
- Security warnings

## 🎯 Alternative: Skip Email

**Email is optional!** The system works perfectly without it:
- All credentials are returned in API responses
- You can manually send credentials via WhatsApp/SMS
- System fully functional

## 📝 Email Template Preview

Open `test-email.html` in your browser to see the beautiful design!

---

**Ready to configure email?** Follow steps 1-4 above! 🚀

