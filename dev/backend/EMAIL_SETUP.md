# Email Setup Instructions

## Quick Setup for Gmail

### 1. Enable 2-Factor Authentication
- Go to https://myaccount.google.com/security
- Enable "2-Step Verification"

### 2. Generate App Password
- Go to https://myaccount.google.com/apppasswords
- Select "Mail" and "Other"
- Type "SACCO System"
- Click Generate
- Copy the 16-character password

### 3. Update .env File

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # Your app password
SMTP_FROM=noreply@sacco.com
FRONTEND_URL=http://localhost:3001
```

### 4. Test Email

```powershell
# Run the test script
.\test-email-api.ps1

# Or manually with curl
curl -X POST http://localhost:3000/api/test/test-email -H "Content-Type: application/json" -d '{\"email\":\"matthewmukasa0@gmail.com\"}'
```

## Alternative: Test Email Service (No Configuration Needed)

Use Ethereal Email for testing:

```bash
npm install ethereal-email
```

This provides a test inbox without SMTP configuration.

## Email Template Preview

View `test-email.html` to see what the email looks like.

## Troubleshooting

### "Failed to send email"
- Check SMTP settings in .env
- Verify app password is correct
- Check firewall settings

### "Connection refused"
- Verify SMTP_HOST and SMTP_PORT
- Check network connection

### "Authentication failed"
- Verify SMTP_USER and SMTP_PASSWORD
- Make sure app password is correct

## For Production

Consider using:
- SendGrid
- AWS SES
- Mailgun
- Custom SMTP server

All are compatible with the current email service.

