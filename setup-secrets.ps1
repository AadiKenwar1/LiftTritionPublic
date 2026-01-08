# setup-secrets.ps1
# One-time setup script to create AWS Secrets Manager secrets

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS Secrets Manager Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Generate a secure random secret
Write-Host "Generating secure random JWT secret..." -ForegroundColor Yellow
$chars = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$secretJson = "{`"JWT_SECRET`":`"$chars`"}"

# Check if secret already exists
Write-Host "Checking if jwt-secret already exists..." -ForegroundColor Yellow
try {
    $existing = aws secretsmanager describe-secret --secret-id jwt-secret --region us-east-1 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  Secret 'jwt-secret' already exists!" -ForegroundColor Yellow
        $response = Read-Host "Do you want to update it? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "Updating secret..." -ForegroundColor Yellow
            aws secretsmanager update-secret `
                --secret-id jwt-secret `
                --secret-string $secretJson `
                --region us-east-1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Secret updated successfully!" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to update secret." -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "Skipping secret creation." -ForegroundColor Gray
        }
    } else {
        throw "Secret does not exist"
    }
} catch {
    # Secret doesn't exist, create it
    Write-Host "Creating new secret..." -ForegroundColor Yellow
    aws secretsmanager create-secret `
        --name jwt-secret `
        --secret-string $secretJson `
        --region us-east-1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secret 'jwt-secret' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create secret. Check AWS credentials." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan




