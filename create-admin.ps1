# PowerShell script to create the first admin user for Trinity Lodge

Write-Host "Creating admin user for Trinity Lodge..." -ForegroundColor Green
Write-Host ""

$username = Read-Host "Enter admin username (default: admin)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "admin"
}

$password = Read-Host "Enter admin password (default: admin123)" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
    $passwordPlain = "admin123"
}

Write-Host ""
Write-Host "Creating user: $username" -ForegroundColor Yellow

$body = @{
    username = $username
    password = $passwordPlain
    role = "ADMIN"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body

    Write-Host ""
    Write-Host "Admin user created successfully!" -ForegroundColor Green
    Write-Host "You can now login with:" -ForegroundColor Cyan
    Write-Host "  Username: $username"
    Write-Host "  Password: (your password)"
    Write-Host ""
    Write-Host "Token: $($response.token)" -ForegroundColor Gray
}
catch {
    Write-Host ""
    Write-Host "Error creating admin user:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
