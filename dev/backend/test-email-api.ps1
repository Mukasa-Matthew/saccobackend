# Test Email Functionality
Write-Host "=== Testing Email Features ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Step 1: Test all features
Write-Host "1. Testing all features..." -ForegroundColor Yellow
try {
    $features = Invoke-RestMethod -Uri "$baseUrl/test/test-features" -Method Get
    Write-Host "✓ Feature check complete" -ForegroundColor Green
    Write-Host "  Database: $($features.data.features.database)" -ForegroundColor $(if ($features.data.features.database) { "Green" } else { "Red" })
    Write-Host "  Models: $($features.data.features.models)" -ForegroundColor $(if ($features.data.features.models) { "Green" } else { "Red" })
    Write-Host "  Email: $($features.data.features.email_service)" -ForegroundColor $(if ($features.data.features.email_service) { "Green" } else { "Yellow" })
    Write-Host "  Audit: $($features.data.features.audit_service)" -ForegroundColor $(if ($features.data.features.audit_service) { "Green" } else { "Red" })
} catch {
    Write-Host "✗ Feature check failed" -ForegroundColor Red
}
Write-Host ""

# Step 2: Test email
Write-Host "2. Testing email to matthewmukasa0@gmail.com..." -ForegroundColor Yellow
$emailData = @{
    email = "matthewmukasa0@gmail.com"
} | ConvertTo-Json

try {
    $emailResult = Invoke-RestMethod -Uri "$baseUrl/test/test-email" -Method Post -Body $emailData -ContentType "application/json"
    
    if ($emailResult.success) {
        Write-Host "✓ Email sent successfully!" -ForegroundColor Green
        Write-Host "  Check your email inbox: $($emailResult.data.email)" -ForegroundColor White
        Write-Host "  Message ID: $($emailResult.data.messageId)" -ForegroundColor White
    } else {
        Write-Host "⚠ Email not sent (SMTP not configured)" -ForegroundColor Yellow
        Write-Host "  To configure email, add SMTP settings to .env file" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Email test failed" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note:" -ForegroundColor Yellow
Write-Host "  - If email fails, you need to configure SMTP in .env" -ForegroundColor White
Write-Host "  - See DEPLOYMENT.md for email setup instructions" -ForegroundColor White
Write-Host "  - Email template preview: test-email.html" -ForegroundColor White

