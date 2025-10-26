# Testing Your Backend

## ✅ Quick Tests

### 1. Check Server Health
```bash
curl http://localhost:3000/health
```

### 2. Test All Features
```powershell
# Run PowerShell test
.\test-email-api.ps1
```

### 3. Test Email Specifically
```powershell
$body = @{
    email = "matthewmukasa0@gmail.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/test/test-email" -Method Post -Body $body -ContentType "application/json"
```

### 4. Check Feature Status
```bash
curl http://localhost:3000/api/test/test-features
```

## 📧 Email Test

The email will be sent with:
- Professional HTML template
- Welcome message
- Login credentials
- SACCO information
- Security warning
- Direct login link

**Note:** Email requires SMTP configuration. See `EMAIL_SETUP.md`

## 🔍 What Gets Tested

✓ Database connection  
✓ Model functionality  
✓ Email service  
✓ Audit service  
✓ API endpoints  

## 📝 Test Results

If email fails, you'll see:
```
⚠ Email not configured (optional)
```

This is expected if SMTP is not set up. The system will still work - credentials will be returned in the API response.

## 🎯 Next Steps

1. Configure email (optional) - see `EMAIL_SETUP.md`
2. Or proceed without email - credentials are always in API response

