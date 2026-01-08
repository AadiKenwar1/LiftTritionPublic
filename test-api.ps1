# API Gateway Test Script
# Tests the /open-ai endpoint with and without authorization token

$apiUrl = "https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2/open-ai"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Gateway Authorization Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Generate test token
Write-Host "Step 1: Generating test token..." -ForegroundColor Yellow
$tokenData = @{
    userId = "test-user-123"
    timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
} | ConvertTo-Json -Compress

$bytes = [System.Text.Encoding]::UTF8.GetBytes($tokenData)
$token = [Convert]::ToBase64String($bytes)
$authHeader = "Bearer $token"

Write-Host "Token generated: $token" -ForegroundColor Green
Write-Host "Authorization header: $authHeader`n" -ForegroundColor Green

# Step 2: Test WITH token (should succeed)
Write-Host "Step 2: Testing WITH authorization token..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{
            "Authorization" = $authHeader
            "Content-Type" = "application/json"
        } `
        -Body '{"type":"chat","question":"test question"}' `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS: Status Code $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)`n" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAILED: Status Code $statusCode" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Step 3: Test WITHOUT token (should fail)
Write-Host "Step 3: Testing WITHOUT authorization token..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{"Content-Type" = "application/json"} `
        -Body '{"type":"chat","question":"test question"}' `
        -ErrorAction Stop
    
    Write-Host "❌ UNEXPECTED: Request succeeded without token!" -ForegroundColor Red
    Write-Host "Status Code: $($response.StatusCode)`n" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ CORRECT: Got 401 Unauthorized (as expected)" -ForegroundColor Green
        Write-Host "Authorization is working correctly!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ UNEXPECTED ERROR: Status Code $statusCode" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

