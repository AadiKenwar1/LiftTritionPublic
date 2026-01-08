# Token Generator Test Script
# Tests the /token-generator endpoint

$apiUrl = "https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2/token-generator"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Token Generator Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Generate token with valid input
Write-Host "Test 1: Generate token with valid input..." -ForegroundColor Yellow
$testUserId = "test-user-123"
$testAuthToken = "test-apple-identity-token"

$body = @{
    userId = $testUserId
    authToken = $testAuthToken
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body `
        -ErrorAction Stop
    
    $responseData = $response.Content | ConvertFrom-Json
    
    if ($responseData.token) {
        Write-Host "✅ SUCCESS: Token generated!" -ForegroundColor Green
        Write-Host "Token: $($responseData.token.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host "Expires In: $($responseData.expiresIn)`n" -ForegroundColor Gray
        
        # Save token for next test
        $generatedToken = $responseData.token
    } else {
        Write-Host "❌ FAILED: No token in response" -ForegroundColor Red
        Write-Host "Response: $($response.Content)`n" -ForegroundColor Red
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAILED: Status Code $statusCode" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 2: Missing userId (should fail)
Write-Host "Test 2: Request with missing userId..." -ForegroundColor Yellow
$bodyMissingUserId = @{
    authToken = $testAuthToken
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $bodyMissingUserId `
        -ErrorAction Stop
    
    Write-Host "❌ UNEXPECTED: Request succeeded without userId!" -ForegroundColor Red
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($response.Content)`n" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ CORRECT: Got 400 Bad Request (as expected)" -ForegroundColor Green
        Write-Host "Error handling is working correctly!`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
}

# Test 3: Missing authToken (should fail)
Write-Host "Test 3: Request with missing authToken..." -ForegroundColor Yellow
$bodyMissingAuthToken = @{
    userId = $testUserId
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $bodyMissingAuthToken `
        -ErrorAction Stop
    
    Write-Host "❌ UNEXPECTED: Request succeeded without authToken!" -ForegroundColor Red
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($response.Content)`n" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ CORRECT: Got 400 Bad Request (as expected)" -ForegroundColor Green
        Write-Host "Error handling is working correctly!`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
}

# Test 4: Test generated token with API Gateway (if token was generated)
if ($generatedToken) {
    Write-Host "Test 4: Testing generated token with API Gateway..." -ForegroundColor Yellow
    $openAIUrl = "https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2/open-ai"
    $authHeader = "Bearer $generatedToken"
    
    try {
        $response = Invoke-WebRequest -Uri $openAIUrl `
            -Method POST `
            -UseBasicParsing `
            -Headers @{
                "Authorization" = $authHeader
                "Content-Type" = "application/json"
            } `
            -Body '{"type":"chat","question":"test"}' `
            -ErrorAction Stop
        
        Write-Host "✅ SUCCESS: Generated token works with API Gateway!" -ForegroundColor Green
        Write-Host "Status Code: $($response.StatusCode)`n" -ForegroundColor Gray
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
        Write-Host "Note: This might fail if token-generator uses different secret than authorizer`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "Test 4: Skipped (no token generated in Test 1)`n" -ForegroundColor Gray
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan




