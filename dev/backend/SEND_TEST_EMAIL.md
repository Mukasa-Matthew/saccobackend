# 📧 How to Send Test Email

## Currently: Email Not Configured

Your `.env` file doesn't have SMTP credentials configured yet.

## Option 1: Skip Email for Now (Recommended)
The system works **perfectly without email**. Credentials are always returned in API responses!

## Option 2: Set Up Gmail (3 Minutes)

### Step 1: Get Gmail App Password
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to: https://myaccount.google.com/apppasswords
4. Generate app password for "Mail"
5. Copy the 16-character password

### Step 2: Add to .env

Add these lines to your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM=noreply@sacco.com
FRONTEND_URL=http://localhost:3001
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Test Email
```powershell
$body = @{email="matthewmukasa0@gmail.com"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/test/test-email" -Method Post -Body $body -ContentType "application/json"
```

## Option 3: View Email Template

The email template preview is in `test-email.html` - just open it in your browser to see what it looks like!

---

**Bottom line:** Your system is working! Email is optional. The credentials are always in the API response, so you can manually send them via WhatsApp, SMS, or any method you prefer.

