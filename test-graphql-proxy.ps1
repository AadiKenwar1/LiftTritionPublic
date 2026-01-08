# GraphQL Proxy Test Script
# Tests the /graphql endpoint with JWT authentication

$apiUrl = "https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2/graphql"
$tokenGeneratorUrl = "https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2/token-generator"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GraphQL Proxy Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Get a valid JWT token
Write-Host "Step 1: Getting JWT token..." -ForegroundColor Yellow
$testUserId = "test-user-graphql-$(Get-Random -Minimum 1000 -Maximum 9999)"
$testAuthToken = "test-apple-identity-token"

$tokenBody = @{
    userId = $testUserId
    authToken = $testAuthToken
} | ConvertTo-Json

try {
    $tokenResponse = Invoke-WebRequest -Uri $tokenGeneratorUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $tokenBody `
        -ErrorAction Stop
    
    $tokenData = $tokenResponse.Content | ConvertFrom-Json
    
    if ($tokenData.token) {
        $jwtToken = $tokenData.token
        Write-Host "✅ Token generated for userId: $testUserId" -ForegroundColor Green
        Write-Host "Token: $($jwtToken.Substring(0, 50))...`n" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAILED: No token in response" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ FAILED: Could not generate token" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$authHeader = "Bearer $jwtToken"

# Test 1: Get Settings query (should work)
Write-Host "Test 1: Get Settings query..." -ForegroundColor Yellow
$getSettingsQuery = @"
query GetSettings {
  getSettings(id: "$testUserId") {
    id
    mode
    unit
    onboardingCompleted
  }
}
"@

$graphqlBody = @{
    query = $getSettingsQuery
    variables = @{}
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{
            "Authorization" = $authHeader
            "Content-Type" = "application/json"
        } `
        -Body $graphqlBody `
        -ErrorAction Stop
    
    $responseData = $response.Content | ConvertFrom-Json
    
    if ($responseData.data) {
        Write-Host "✅ SUCCESS: Query executed!" -ForegroundColor Green
        Write-Host "Response: $($response.Content | ConvertTo-Json -Depth 5 -Compress)" -ForegroundColor Gray
        Write-Host ""
    } elseif ($responseData.errors) {
        Write-Host "⚠️  GraphQL Errors:" -ForegroundColor Yellow
        $responseData.errors | ForEach-Object {
            Write-Host "  - $($_.message)" -ForegroundColor Yellow
        }
        Write-Host ""
    } else {
        Write-Host "⚠️  Unexpected response format" -ForegroundColor Yellow
        Write-Host "Response: $($response.Content)`n" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAILED: Status Code $statusCode" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get error details
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    } catch {}
    Write-Host ""
}

# Test 2: List Nutritions query (should automatically filter by userId)
Write-Host "Test 2: List Nutritions query (with userId filter)..." -ForegroundColor Yellow
$listNutritionsQuery = @"
query ListNutritions {
  listNutritions(filter: { userId: { eq: "$testUserId" } }) {
    items {
      id
      userId
      name
      date
    }
  }
}
"@

$listBody = @{
    query = $listNutritionsQuery
    variables = @{}
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{
            "Authorization" = $authHeader
            "Content-Type" = "application/json"
        } `
        -Body $listBody `
        -ErrorAction Stop
    
    $responseData = $response.Content | ConvertFrom-Json
    
    if ($responseData.data) {
        Write-Host "✅ SUCCESS: List query executed!" -ForegroundColor Green
        $itemCount = $responseData.data.listNutritions.items.Count
        Write-Host "Found $itemCount nutrition entries" -ForegroundColor Gray
        Write-Host ""
    } elseif ($responseData.errors) {
        Write-Host "⚠️  GraphQL Errors:" -ForegroundColor Yellow
        $responseData.errors | ForEach-Object {
            Write-Host "  - $($_.message)" -ForegroundColor Yellow
        }
        Write-Host ""
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ FAILED: Status Code $statusCode" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 3: Missing Authorization header (should fail)
Write-Host "Test 3: Request without Authorization header..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $graphqlBody `
        -ErrorAction Stop
    
    Write-Host "❌ UNEXPECTED: Request succeeded without token!" -ForegroundColor Red
    Write-Host "Status Code: $($response.StatusCode)`n" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host "✅ CORRECT: Got $statusCode (authentication required)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
}

# Test 4: Invalid query (should fail gracefully)
Write-Host "Test 4: Invalid GraphQL query..." -ForegroundColor Yellow
$invalidQuery = @{
    query = "query InvalidQuery { invalidField { id } }"
    variables = @{}
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{
            "Authorization" = $authHeader
            "Content-Type" = "application/json"
        } `
        -Body $invalidQuery `
        -ErrorAction Stop
    
    $responseData = $response.Content | ConvertFrom-Json
    
    if ($responseData.errors) {
        Write-Host "✅ CORRECT: Got GraphQL errors for invalid query" -ForegroundColor Green
        $responseData.errors | ForEach-Object {
            Write-Host "  - $($_.message)" -ForegroundColor Gray
        }
        Write-Host ""
    } else {
        Write-Host "⚠️  Unexpected: No errors returned for invalid query" -ForegroundColor Yellow
        Write-Host "Response: $($response.Content)`n" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
}

# Test 5: Missing query parameter (should fail)
Write-Host "Test 5: Request without query parameter..." -ForegroundColor Yellow
$missingQueryBody = @{
    variables = @{}
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -UseBasicParsing `
        -Headers @{
            "Authorization" = $authHeader
            "Content-Type" = "application/json"
        } `
        -Body $missingQueryBody `
        -ErrorAction Stop
    
    Write-Host "❌ UNEXPECTED: Request succeeded without query!" -ForegroundColor Red
    Write-Host "Status Code: $($response.StatusCode)`n" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ CORRECT: Got 400 Bad Request (as expected)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠️  Status Code: $statusCode" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

