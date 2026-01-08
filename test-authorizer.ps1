# API Gateway Authorizer Test Script
# Tests JWT token verification and legacy token fallback

$apiUrl = "https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2/open-ai"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Authorizer Test (JWT + Legacy)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Legacy base64 JSON token (should work via fallback)
Write-Host "Test 1: Legacy base64 JSON token..." -ForegroundColor Yellow
$legacyTokenData = @{
    userId = "test-user-123"
    timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
} | ConvertTo-Json -Compress

$legacyBytes = [System.Text.Encoding]::UTF8.GetBytes($legacyTokenData)
$legacyToken = [Convert]::ToBase64String($legacyBytes)
$legacyAuthHeader = "Bearer $legacyToken"

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{
            "Authorization" = $legacyAuthHeader
            "Content-Type" = "application/json"
        } `
        -Body '{"type":"chat","question":"test"}' `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS: Legacy token accepted (fallback working)" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)`n" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAILED: Status Code $statusCode" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 2: Simple userId string (should work via fallback)
Write-Host "Test 2: Simple userId string token..." -ForegroundColor Yellow
$simpleToken = "test-user-456"
$simpleAuthHeader = "Bearer $simpleToken"

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{
            "Authorization" = $simpleAuthHeader
            "Content-Type" = "application/json"
        } `
        -Body '{"type":"chat","question":"test"}' `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS: Simple token accepted (fallback working)" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)`n" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAILED: Status Code $statusCode" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 3: Invalid JWT token (should fail)
Write-Host "Test 3: Invalid JWT token..." -ForegroundColor Yellow
$invalidJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"
$invalidAuthHeader = "Bearer $invalidJWT"

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{
            "Authorization" = $invalidAuthHeader
            "Content-Type" = "application/json"
        } `
        -Body '{"type":"chat","question":"test"}' `
        -ErrorAction Stop
    
    Write-Host "❌ UNEXPECTED: Invalid JWT was accepted!" -ForegroundColor Red
    Write-Host "Status Code: $($response.StatusCode)`n" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host "✅ CORRECT: Invalid JWT rejected (as expected)" -ForegroundColor Green
        Write-Host "Status Code: $statusCode`n" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
}

# Test 4: No token (should fail)
Write-Host "Test 4: Request without token..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{"Content-Type" = "application/json"} `
        -Body '{"type":"chat","question":"test"}' `
        -ErrorAction Stop
    
    Write-Host "❌ UNEXPECTED: Request succeeded without token!" -ForegroundColor Red
    Write-Host "Status Code: $($response.StatusCode)`n" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ CORRECT: Got 401 Unauthorized (as expected)" -ForegroundColor Green
        Write-Host "Authorization is working correctly!`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Note: JWT token test requires token-generator Lambda" -ForegroundColor Yellow
Write-Host "Run this after creating the token-generator function" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan




