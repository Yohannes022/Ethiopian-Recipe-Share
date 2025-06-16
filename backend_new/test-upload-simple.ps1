# Simple test script for file upload

# Configuration
$baseUrl = "http://localhost:5000/api/v1"
$testEmail = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "Test@1234"

# 1. Create a test image
$testDir = "$pwd\test-images"
if (-not (Test-Path $testDir)) { New-Item -ItemType Directory -Path $testDir | Out-Null }
$imagePath = "$testDir\test-$(Get-Date -Format 'yyyyMMddHHmmss').jpg"

# Create a simple 1x1 pixel red image
[byte[]] $imageBytes = 0x42,0x4D,0x3E,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x36,0x00,0x00,0x00,0x28,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x18,0x00,0x00,0x00,0x00,0x00,0x08,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,0x00,0x00
[System.IO.File]::WriteAllBytes($imagePath, $imageBytes)
Write-Host "Created test image at: $imagePath"

# 2. Register a test user
Write-Host "Registering test user..."
$registerBody = @{
    name = "Test User"
    email = $testEmail
    password = $testPassword
    passwordConfirm = $testPassword
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"
    Write-Host "User registered successfully"
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "User already exists, continuing..."
    } else {
        Write-Host "Failed to register user: $($_.Exception.Message)"
        exit 1
    }
}

# 3. Login to get JWT token
Write-Host "Logging in..."
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "Login successful. Token received."
} catch {
    Write-Host "Failed to login: $($_.Exception.Message)"
    exit 1
}

# 4. Upload profile picture
Write-Host "`nUploading profile picture..."
try {
    # Using curl for the upload
    $curlPath = "$env:ProgramFiles\Git\mingw64\bin\curl.exe"
    if (Test-Path $curlPath) {
        $curlArgs = @(
            "-X", "POST",
            "$baseUrl/profiles/me/picture",
            "-H", "Authorization: Bearer $token",
            "-F", "profilePicture=@$imagePath"
        )
        
        Write-Host "Running: $curlPath $($curlArgs -join ' ')"
        & $curlPath @curlArgs
    } else {
        Write-Host "curl not found at $curlPath"
        Write-Host "Please install Git for Windows or provide the path to curl.exe"
    }
} catch {
    Write-Host "Upload failed: $($_.Exception.Message)"
}

Write-Host "`nTest completed."
