# Test Profile Picture Upload Script

# Configuration
$baseUrl = "http://localhost:5000/api/v1"
$testEmail = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "Test@1234"

# Function to make API requests
function Invoke-ApiRequest {
    param (
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$ContentType = "application/json",
        [string]$Token = $null
    )
    
    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = $Url
        Method = $Method
        Headers = $headers
        ContentType = $ContentType
        ErrorAction = 'Stop'
    }
    
    if ($Body) {
        if ($Body -is [string]) {
            $params.Body = $Body
        } else {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
    }
    
    try {
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
        }
    } catch {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode.value__
            Message = $errorDetails.message -or $_.Exception.Message
            Error = $errorDetails.error -or $_.Exception.Message
        }
    }
}

# 1. Register a new test user
Write-Host "Registering test user: $testEmail" -ForegroundColor Cyan
$registerData = @{
    name = "Test User"
    email = $testEmail
    password = $testPassword
    passwordConfirm = $testPassword
}

$registerResult = Invoke-ApiRequest -Url "$baseUrl/auth/register" -Method POST -Body $registerData

if (-not $registerResult.Success) {
    Write-Host "Failed to register user: $($registerResult.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "User registered successfully" -ForegroundColor Green

# 2. Login to get JWT token
Write-Host "Logging in..." -ForegroundColor Cyan
$loginData = @{
    email = $testEmail
    password = $testPassword
}

$loginResult = Invoke-ApiRequest -Url "$baseUrl/auth/login" -Method POST -Body $loginData

if (-not $loginResult.Success) {
    Write-Host "Failed to login: $($loginResult.Message)" -ForegroundColor Red
    exit 1
}

$token = $loginResult.Data.token
Write-Host "Login successful. Token received." -ForegroundColor Green

# 3. Create a test image
$testDir = "$pwd\test-images"
if (-not (Test-Path $testDir)) { New-Item -ItemType Directory -Path $testDir | Out-Null }
$imagePath = "$testDir\test-upload-$(Get-Date -Format 'yyyyMMddHHmmss').jpg"

# Create a simple 1x1 pixel red image
[byte[]] $imageBytes = 0x42,0x4D,0x3E,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x36,0x00,0x00,0x00,0x28,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x18,0x00,0x00,0x00,0x00,0x00,0x08,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,0x00,0x00
[System.IO.File]::WriteAllBytes($imagePath, $imageBytes)
Write-Host "Created test image at: $imagePath" -ForegroundColor Cyan

# 4. Upload profile picture
Write-Host "Uploading profile picture..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/profiles/me/picture" `
        -Method Post `
        -Headers $headers `
        -InFile $imagePath `
        -ContentType "multipart/form-data"
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "Profile picture uploaded successfully!" -ForegroundColor Green
    
    # 5. Get profile to see the picture URL
    $profile = Invoke-ApiRequest -Url "$baseUrl/profiles/me" -Token $token
    if ($profile.Success) {
        $userId = $profile.Data.data.user._id
        $pictureUrl = "http://localhost:5000/api/v1/profiles/$userId/picture"
        Write-Host "Profile picture URL: $pictureUrl" -ForegroundColor Green
        Write-Host "Open this URL in your browser to view the uploaded image." -ForegroundColor Cyan
        
        # 6. Test deleting the profile picture
        Write-Host "Testing profile picture deletion..." -ForegroundColor Cyan
        $deleteResult = Invoke-ApiRequest -Url "$baseUrl/profiles/me/picture" -Method DELETE -Token $token
        if ($deleteResult.Success) {
            Write-Host "Profile picture deleted successfully!" -ForegroundColor Green
        } else {
            Write-Host "Failed to delete profile picture: $($deleteResult.Message)" -ForegroundColor Yellow
        }
    }
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    Write-Host "Failed to upload profile picture: $($errorDetails.message -or $_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed." -ForegroundColor Cyan
