# Comprehensive GraphQL Operations Test Script
# Tests all queries and mutations through the GraphQL proxy

$apiUrl = "https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2/graphql"
$tokenGeneratorUrl = "https://um1z6mkple.execute-api.us-east-1.amazonaws.com/prod-v2/token-generator"

# Test tracking
$testResults = @{
    Passed = 0
    Failed = 0
    Total = 0
}
$createdIds = @{
    SettingsId = $null
    WorkoutId = $null
    ExerciseId = $null
    ExerciseLogId = $null
    UserExerciseId = $null
    NutritionId = $null
}

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Invoke-GraphQLRequest {
    param(
        [string]$Query,
        [hashtable]$Variables = @{},
        [string]$AuthHeader
    )
    
    $body = @{
        query = $Query
        variables = $Variables
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-WebRequest -Uri $apiUrl `
            -Method POST `
            -UseBasicParsing `
            -Headers @{
                "Authorization" = $AuthHeader
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -ErrorAction Stop
        
        $responseData = $response.Content | ConvertFrom-Json
        return @{
            Success = $true
            Data = $responseData.data
            Errors = $responseData.errors
            StatusCode = $response.StatusCode
            RawResponse = $response.Content
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        # Try to get error body
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
        } catch {
            $errorBody = ""
        }
        
        return @{
            Success = $false
            StatusCode = $statusCode
            Error = $errorMessage
            ErrorBody = $errorBody
        }
    }
}

function Test-Operation {
    param(
        [string]$TestName,
        [string]$Query,
        [hashtable]$Variables = @{},
        [string]$AuthHeader,
        [scriptblock]$Validation = $null
    )
    
    $testResults.Total++
    Write-Host "  Testing: $TestName..." -ForegroundColor Yellow -NoNewline
    
    $result = Invoke-GraphQLRequest -Query $Query -Variables $Variables -AuthHeader $AuthHeader
    
    if (-not $result.Success) {
        Write-Host " ❌ FAILED (HTTP $($result.StatusCode))" -ForegroundColor Red
        Write-Host "    Error: $($result.Error)" -ForegroundColor Red
        if ($result.ErrorBody) {
            Write-Host "    Body: $($result.ErrorBody)" -ForegroundColor Red
        }
        $testResults.Failed++
        return $null
    }
    
    if ($result.Errors) {
        Write-Host " ❌ FAILED (GraphQL Errors)" -ForegroundColor Red
        $result.Errors | ForEach-Object {
            Write-Host "    - $($_.message)" -ForegroundColor Red
        }
        $testResults.Failed++
        return $null
    }
    
    if ($Validation) {
        $validationResult = & $Validation $result.Data
        if (-not $validationResult) {
            Write-Host " ❌ FAILED (Validation)" -ForegroundColor Red
            $testResults.Failed++
            return $null
        }
    }
    
    Write-Host " ✅ PASSED" -ForegroundColor Green
    $testResults.Passed++
    return $result.Data
}

# ============================================================================
# SETUP: Get JWT Token
# ============================================================================
Write-TestHeader "SETUP: Authentication"

$testUserId = "test-user-full-$(Get-Random -Minimum 1000 -Maximum 9999)"
$testAuthToken = "test-apple-identity-token"

Write-Host "Generating JWT token for userId: $testUserId..." -ForegroundColor Yellow

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
        $authHeader = "Bearer $jwtToken"
        Write-Host "✅ Token generated successfully`n" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: No token in response" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ FAILED: Could not generate token" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================================================
# SETTINGS TESTS (Special case: uses 'id' instead of 'userId')
# ============================================================================
Write-TestHeader "SETTINGS Operations"

# CreateSettings
$createSettingsQuery = @'
mutation CreateSettings($input: CreateSettingsInput!) {
  createSettings(input: $input) {
    id
    mode
    unit
    calorieGoal
    proteinGoal
    onboardingCompleted
  }
}
'@

$createSettingsVariables = @{
    input = @{
        id = $testUserId
        mode = $false
        unit = $false
        calorieGoal = 2000
        proteinGoal = 150
        carbsGoal = 250
        fatsGoal = 65
        onboardingCompleted = $false
    }
}

$settingsData = Test-Operation -TestName "CreateSettings" -Query $createSettingsQuery -Variables $createSettingsVariables -AuthHeader $authHeader -Validation {
    param($data)
    if ($data.createSettings -and $data.createSettings.id -eq $testUserId) {
        $createdIds.SettingsId = $data.createSettings.id
        return $true
    }
    return $false
}

# GetSettings
$getSettingsQuery = @"
query GetSettings {
  getSettings(id: "$testUserId") {
    id
    mode
    unit
    calorieGoal
    proteinGoal
    carbsGoal
    fatsGoal
    onboardingCompleted
  }
}
"@

Test-Operation -TestName "GetSettings" -Query $getSettingsQuery -AuthHeader $authHeader -Validation {
    param($data)
    return $data.getSettings -and $data.getSettings.id -eq $testUserId
}

# UpdateSettings
$updateSettingsQuery = @'
mutation UpdateSettings($input: UpdateSettingsInput!) {
  updateSettings(input: $input) {
    id
    calorieGoal
    proteinGoal
  }
}
'@

$updateSettingsVariables = @{
    input = @{
        id = $testUserId
        calorieGoal = 2200
        proteinGoal = 160
    }
}

Test-Operation -TestName "UpdateSettings" -Query $updateSettingsQuery -Variables $updateSettingsVariables -AuthHeader $authHeader -Validation {
    param($data)
    return $data.updateSettings -and $data.updateSettings.calorieGoal -eq 2200
}

# ============================================================================
# WORKOUT TESTS
# ============================================================================
Write-TestHeader "WORKOUT Operations"

# CreateWorkout
$createWorkoutQuery = @'
mutation CreateWorkout($input: CreateWorkoutInput!) {
  createWorkout(input: $input) {
    id
    userId
    name
    order
    archived
  }
}
'@

$createWorkoutVariables = @{
    input = @{
        name = "Test Workout"
        order = 1
        archived = $false
    }
}

$workoutData = Test-Operation -TestName "CreateWorkout" -Query $createWorkoutQuery -Variables $createWorkoutVariables -AuthHeader $authHeader -Validation {
    param($data)
    if ($data.createWorkout -and $data.createWorkout.id -and $data.createWorkout.userId -eq $testUserId) {
        $createdIds.WorkoutId = $data.createWorkout.id
        return $true
    }
    return $false
}

# ListWorkouts
$listWorkoutsQuery = @"
query ListWorkouts {
  listWorkouts {
    items {
      id
      userId
      name
      order
    }
  }
}
'@

Test-Operation -TestName "ListWorkouts" -Query $listWorkoutsQuery -AuthHeader $authHeader -Validation {
    param($data)
    return $data.listWorkouts -and $data.listWorkouts.items.Count -gt 0
}

# GetWorkout
if ($createdIds.WorkoutId) {
    $getWorkoutQuery = @"
query GetWorkout {
  getWorkout(id: "$($createdIds.WorkoutId)") {
    id
    userId
    name
    order
  }
}
"@
    
    Test-Operation -TestName "GetWorkout" -Query $getWorkoutQuery -AuthHeader $authHeader -Validation {
        param($data)
        return $data.getWorkout -and $data.getWorkout.id -eq $createdIds.WorkoutId
    }
}

# UpdateWorkout
if ($createdIds.WorkoutId) {
    $updateWorkoutQuery = @'
mutation UpdateWorkout($input: UpdateWorkoutInput!) {
  updateWorkout(input: $input) {
    id
    name
  }
}
'@
    
    $updateWorkoutVariables = @{
        input = @{
            id = $createdIds.WorkoutId
            name = "Updated Workout"
        }
    }
    
    Test-Operation -TestName "UpdateWorkout" -Query $updateWorkoutQuery -Variables $updateWorkoutVariables -AuthHeader $authHeader -Validation {
        param($data)
        return $data.updateWorkout -and $data.updateWorkout.name -eq "Updated Workout"
    }
}

# ============================================================================
# EXERCISE TESTS (depends on Workout)
# ============================================================================
Write-TestHeader "EXERCISE Operations"

if ($createdIds.WorkoutId) {
    # CreateExercise
    $createExerciseQuery = @'
mutation CreateExercise($input: CreateExerciseInput!) {
  createExercise(input: $input) {
    id
    workoutId
    userId
    name
    order
  }
}
'@
    
    $createExerciseVariables = @{
        input = @{
            workoutId = $createdIds.WorkoutId
            name = "Test Exercise"
            order = 1
            archived = $false
        }
    }
    
    $exerciseData = Test-Operation -TestName "CreateExercise" -Query $createExerciseQuery -Variables $createExerciseVariables -AuthHeader $authHeader -Validation {
        param($data)
        if ($data.createExercise -and $data.createExercise.id -and $data.createExercise.userId -eq $testUserId) {
            $createdIds.ExerciseId = $data.createExercise.id
            return $true
        }
        return $false
    }
    
    # ListExercises
    $listExercisesQuery = @"
query ListExercises {
  listExercises {
    items {
      id
      workoutId
      userId
      name
    }
  }
}
'@
    
    Test-Operation -TestName "ListExercises" -Query $listExercisesQuery -AuthHeader $authHeader -Validation {
        param($data)
        return $data.listExercises -and $data.listExercises.items.Count -gt 0
    }
    
    # GetExercise
    if ($createdIds.ExerciseId) {
        $getExerciseQuery = @"
query GetExercise {
  getExercise(id: "$($createdIds.ExerciseId)") {
    id
    workoutId
    userId
    name
  }
}
"@
        
        Test-Operation -TestName "GetExercise" -Query $getExerciseQuery -AuthHeader $authHeader -Validation {
            param($data)
            return $data.getExercise -and $data.getExercise.id -eq $createdIds.ExerciseId
        }
    }
    
    # UpdateExercise
    if ($createdIds.ExerciseId) {
        $updateExerciseQuery = @'
mutation UpdateExercise($input: UpdateExerciseInput!) {
  updateExercise(input: $input) {
    id
    name
  }
}
'@
        
        $updateExerciseVariables = @{
            input = @{
                id = $createdIds.ExerciseId
                name = "Updated Exercise"
            }
        }
        
        Test-Operation -TestName "UpdateExercise" -Query $updateExerciseQuery -Variables $updateExerciseVariables -AuthHeader $authHeader -Validation {
            param($data)
            return $data.updateExercise -and $data.updateExercise.name -eq "Updated Exercise"
        }
    }
} else {
    Write-Host "  ⚠️  SKIPPED: Exercise tests require Workout (CreateWorkout failed)" -ForegroundColor Yellow
}

# ============================================================================
# EXERCISE LOG TESTS (depends on Exercise and Workout)
# ============================================================================
Write-TestHeader "EXERCISE LOG Operations"

if ($createdIds.ExerciseId -and $createdIds.WorkoutId) {
    # CreateExerciseLog
    $createExerciseLogQuery = @'
mutation CreateExerciseLog($input: CreateExerciseLogInput!) {
  createExerciseLog(input: $input) {
    id
    exerciseId
    workoutId
    userId
    date
    weight
    reps
    rpe
  }
}
'@
    
    $createExerciseLogVariables = @{
        input = @{
            exerciseId = $createdIds.ExerciseId
            workoutId = $createdIds.WorkoutId
            date = "2025-01-01"
            weight = 100.0
            reps = 10
            rpe = 8.0
        }
    }
    
    $exerciseLogData = Test-Operation -TestName "CreateExerciseLog" -Query $createExerciseLogQuery -Variables $createExerciseLogVariables -AuthHeader $authHeader -Validation {
        param($data)
        if ($data.createExerciseLog -and $data.createExerciseLog.id -and $data.createExerciseLog.userId -eq $testUserId) {
            $createdIds.ExerciseLogId = $data.createExerciseLog.id
            return $true
        }
        return $false
    }
    
    # ListExerciseLogs
    $listExerciseLogsQuery = @"
query ListExerciseLogs {
  listExerciseLogs {
    items {
      id
      exerciseId
      workoutId
      userId
      date
      weight
      reps
    }
  }
}
'@
    
    Test-Operation -TestName "ListExerciseLogs" -Query $listExerciseLogsQuery -AuthHeader $authHeader -Validation {
        param($data)
        return $data.listExerciseLogs -and $data.listExerciseLogs.items.Count -gt 0
    }
    
    # GetExerciseLog
    if ($createdIds.ExerciseLogId) {
        $getExerciseLogQuery = @"
query GetExerciseLog {
  getExerciseLog(id: "$($createdIds.ExerciseLogId)") {
    id
    exerciseId
    workoutId
    userId
    date
    weight
    reps
  }
}
"@
        
        Test-Operation -TestName "GetExerciseLog" -Query $getExerciseLogQuery -AuthHeader $authHeader -Validation {
            param($data)
            return $data.getExerciseLog -and $data.getExerciseLog.id -eq $createdIds.ExerciseLogId
        }
    }
    
    # UpdateExerciseLog
    if ($createdIds.ExerciseLogId) {
        $updateExerciseLogQuery = @'
mutation UpdateExerciseLog($input: UpdateExerciseLogInput!) {
  updateExerciseLog(input: $input) {
    id
    weight
    reps
  }
}
'@
        
        $updateExerciseLogVariables = @{
            input = @{
                id = $createdIds.ExerciseLogId
                weight = 110.0
                reps = 12
            }
        }
        
        Test-Operation -TestName "UpdateExerciseLog" -Query $updateExerciseLogQuery -Variables $updateExerciseLogVariables -AuthHeader $authHeader -Validation {
            param($data)
            return $data.updateExerciseLog -and $data.updateExerciseLog.weight -eq 110.0
        }
    }
} else {
    Write-Host "  ⚠️  SKIPPED: ExerciseLog tests require Exercise and Workout" -ForegroundColor Yellow
}

# ============================================================================
# USER EXERCISE TESTS (independent)
# ============================================================================
Write-TestHeader "USER EXERCISE Operations"

# CreateUserExercise
$createUserExerciseQuery = @'
mutation CreateUserExercise($input: CreateUserExerciseInput!) {
  createUserExercise(input: $input) {
    id
    userId
    name
    isCompound
    fatigueFactor
    mainMuscle
    accessoryMuscles
  }
}
'@

$createUserExerciseVariables = @{
    input = @{
        name = "Test User Exercise"
        isCompound = $true
        fatigueFactor = 0.9
        mainMuscle = "Chest"
        accessoryMuscles = @("Shoulders", "Triceps")
    }
}

$userExerciseData = Test-Operation -TestName "CreateUserExercise" -Query $createUserExerciseQuery -Variables $createUserExerciseVariables -AuthHeader $authHeader -Validation {
    param($data)
    if ($data.createUserExercise -and $data.createUserExercise.id -and $data.createUserExercise.userId -eq $testUserId) {
        $createdIds.UserExerciseId = $data.createUserExercise.id
        return $true
    }
    return $false
}

# ListUserExercises
$listUserExercisesQuery = @"
query ListUserExercises {
  listUserExercises {
    items {
      id
      userId
      name
      isCompound
      mainMuscle
    }
  }
}
'@

Test-Operation -TestName "ListUserExercises" -Query $listUserExercisesQuery -AuthHeader $authHeader -Validation {
    param($data)
    return $data.listUserExercises -and $data.listUserExercises.items.Count -gt 0
}

# GetUserExercise
if ($createdIds.UserExerciseId) {
    $getUserExerciseQuery = @"
query GetUserExercise {
  getUserExercise(id: "$($createdIds.UserExerciseId)") {
    id
    userId
    name
    isCompound
    mainMuscle
  }
}
"@
    
    Test-Operation -TestName "GetUserExercise" -Query $getUserExerciseQuery -AuthHeader $authHeader -Validation {
        param($data)
        return $data.getUserExercise -and $data.getUserExercise.id -eq $createdIds.UserExerciseId
    }
}

# UpdateUserExercise
if ($createdIds.UserExerciseId) {
    $updateUserExerciseQuery = @'
mutation UpdateUserExercise($input: UpdateUserExerciseInput!) {
  updateUserExercise(input: $input) {
    id
    name
  }
}
'@
    
    $updateUserExerciseVariables = @{
        input = @{
            id = $createdIds.UserExerciseId
            name = "Updated User Exercise"
        }
    }
    
    Test-Operation -TestName "UpdateUserExercise" -Query $updateUserExerciseQuery -Variables $updateUserExerciseVariables -AuthHeader $authHeader -Validation {
        param($data)
        return $data.updateUserExercise -and $data.updateUserExercise.name -eq "Updated User Exercise"
    }
}

# ============================================================================
# NUTRITION TESTS (independent)
# ============================================================================
Write-TestHeader "NUTRITION Operations"

# CreateNutrition
$createNutritionQuery = @'
mutation CreateNutrition($input: CreateNutritionInput!) {
  createNutrition(input: $input) {
    id
    userId
    name
    date
    time
    protein
    carbs
    fats
    calories
  }
}
'@

$createNutritionVariables = @{
    input = @{
        name = "Test Food"
        date = "2025-01-01"
        time = 12.0
        protein = 20.0
        carbs = 30.0
        fats = 10.0
        calories = 290.0
        isPhoto = $false
        saved = $false
        isPlaceholder = $false
    }
}

$nutritionData = Test-Operation -TestName "CreateNutrition" -Query $createNutritionQuery -Variables $createNutritionVariables -AuthHeader $authHeader -Validation {
    param($data)
    if ($data.createNutrition -and $data.createNutrition.id -and $data.createNutrition.userId -eq $testUserId) {
        $createdIds.NutritionId = $data.createNutrition.id
        return $true
    }
    return $false
}

# ListNutritions
$listNutritionsQuery = @"
query ListNutritions {
  listNutritions {
    items {
      id
      userId
      name
      date
      calories
    }
  }
}
'@

Test-Operation -TestName "ListNutritions" -Query $listNutritionsQuery -AuthHeader $authHeader -Validation {
    param($data)
    return $data.listNutritions -and $data.listNutritions.items.Count -gt 0
}

# GetNutrition
if ($createdIds.NutritionId) {
    $getNutritionQuery = @"
query GetNutrition {
  getNutrition(id: "$($createdIds.NutritionId)") {
    id
    userId
    name
    date
    calories
  }
}
"@
    
    Test-Operation -TestName "GetNutrition" -Query $getNutritionQuery -AuthHeader $authHeader -Validation {
        param($data)
        return $data.getNutrition -and $data.getNutrition.id -eq $createdIds.NutritionId
    }
}

# UpdateNutrition
if ($createdIds.NutritionId) {
    $updateNutritionQuery = @'
mutation UpdateNutrition($input: UpdateNutritionInput!) {
  updateNutrition(input: $input) {
    id
    calories
  }
}
'@
    
    $updateNutritionVariables = @{
        input = @{
            id = $createdIds.NutritionId
            calories = 300.0
        }
    }
    
    Test-Operation -TestName "UpdateNutrition" -Query $updateNutritionQuery -Variables $updateNutritionVariables -AuthHeader $authHeader -Validation {
        param($data)
        return $data.updateNutrition -and $data.updateNutrition.calories -eq 300.0
    }
}

# ============================================================================
# DELETE OPERATIONS (Cleanup)
# ============================================================================
Write-TestHeader "DELETE Operations (Cleanup)"

# DeleteExerciseLog
if ($createdIds.ExerciseLogId) {
    $deleteExerciseLogQuery = @'
mutation DeleteExerciseLog($input: DeleteExerciseLogInput!) {
  deleteExerciseLog(input: $input) {
    id
  }
}
'@
    
    $deleteExerciseLogVariables = @{
        input = @{
            id = $createdIds.ExerciseLogId
        }
    }
    
    Test-Operation -TestName "DeleteExerciseLog" -Query $deleteExerciseLogQuery -Variables $deleteExerciseLogVariables -AuthHeader $authHeader
}

# DeleteExercise
if ($createdIds.ExerciseId) {
    $deleteExerciseQuery = @'
mutation DeleteExercise($input: DeleteExerciseInput!) {
  deleteExercise(input: $input) {
    id
  }
}
'@
    
    $deleteExerciseVariables = @{
        input = @{
            id = $createdIds.ExerciseId
        }
    }
    
    Test-Operation -TestName "DeleteExercise" -Query $deleteExerciseQuery -Variables $deleteExerciseVariables -AuthHeader $authHeader
}

# DeleteWorkout
if ($createdIds.WorkoutId) {
    $deleteWorkoutQuery = @'
mutation DeleteWorkout($input: DeleteWorkoutInput!) {
  deleteWorkout(input: $input) {
    id
  }
}
'@
    
    $deleteWorkoutVariables = @{
        input = @{
            id = $createdIds.WorkoutId
        }
    }
    
    Test-Operation -TestName "DeleteWorkout" -Query $deleteWorkoutQuery -Variables $deleteWorkoutVariables -AuthHeader $authHeader
}

# DeleteUserExercise
if ($createdIds.UserExerciseId) {
    $deleteUserExerciseQuery = @'
mutation DeleteUserExercise($input: DeleteUserExerciseInput!) {
  deleteUserExercise(input: $input) {
    id
  }
}
'@
    
    $deleteUserExerciseVariables = @{
        input = @{
            id = $createdIds.UserExerciseId
        }
    }
    
    Test-Operation -TestName "DeleteUserExercise" -Query $deleteUserExerciseQuery -Variables $deleteUserExerciseVariables -AuthHeader $authHeader
}

# DeleteNutrition
if ($createdIds.NutritionId) {
    $deleteNutritionQuery = @'
mutation DeleteNutrition($input: DeleteNutritionInput!) {
  deleteNutrition(input: $input) {
    id
  }
}
'@
    
    $deleteNutritionVariables = @{
        input = @{
            id = $createdIds.NutritionId
        }
    }
    
    Test-Operation -TestName "DeleteNutrition" -Query $deleteNutritionQuery -Variables $deleteNutritionVariables -AuthHeader $authHeader
}

# DeleteSettings
if ($createdIds.SettingsId) {
    $deleteSettingsQuery = @'
mutation DeleteSettings($input: DeleteSettingsInput!) {
  deleteSettings(input: $input) {
    id
  }
}
'@
    
    $deleteSettingsVariables = @{
        input = @{
            id = $createdIds.SettingsId
        }
    }
    
    Test-Operation -TestName "DeleteSettings" -Query $deleteSettingsQuery -Variables $deleteSettingsVariables -AuthHeader $authHeader
}

# ============================================================================
# SECURITY TESTS
# ============================================================================
Write-TestHeader "SECURITY Tests"

# Test: Request without Authorization header
Write-Host "  Testing: Unauthorized request (no token)..." -ForegroundColor Yellow -NoNewline
$testResults.Total++
$unauthorizedResult = Invoke-GraphQLRequest -Query $getSettingsQuery -AuthHeader ""
if (-not $unauthorizedResult.Success -and ($unauthorizedResult.StatusCode -eq 401 -or $unauthorizedResult.StatusCode -eq 403)) {
    Write-Host " ✅ PASSED" -ForegroundColor Green
    $testResults.Passed++
} else {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    Write-Host "    Expected 401/403, got $($unauthorizedResult.StatusCode)" -ForegroundColor Red
    $testResults.Failed++
}

# Test: Invalid GraphQL query
Write-Host "  Testing: Invalid GraphQL query..." -ForegroundColor Yellow -NoNewline
$testResults.Total++
$invalidQuery = "query Invalid { nonExistentField { id } }"
$invalidResult = Invoke-GraphQLRequest -Query $invalidQuery -AuthHeader $authHeader
if ($invalidResult.Success -and $invalidResult.Errors) {
    Write-Host " ✅ PASSED" -ForegroundColor Green
    $testResults.Passed++
} else {
    Write-Host " ❌ FAILED" -ForegroundColor Red
    $testResults.Failed++
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-TestHeader "TEST SUMMARY"

Write-Host "Total Tests: $($testResults.Total)" -ForegroundColor Cyan
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor $(if ($testResults.Failed -eq 0) { "Green" } else { "Red" })

if ($testResults.Failed -eq 0) {
    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some tests failed" -ForegroundColor Red
    exit 1
}

