# Build Script for Econ - Lodge Management System
# Creates a single executable with embedded frontend

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "Building Econ - Lodge Management System"
Write-Host "========================================"
Write-Host ""

# Set directories
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $RootDir "frontend"
$BackendDir = Join-Path $RootDir "backend"
$WebDir = Join-Path $BackendDir "internal\web"
$BinDir = Join-Path $RootDir "bin"

# Create bin directory if it doesn't exist
if (-not (Test-Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir | Out-Null
}

# Step 1: Build Frontend
Write-Host "[1/3] Building frontend..." -ForegroundColor Cyan
Set-Location $FrontendDir
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend built successfully." -ForegroundColor Green
Write-Host ""

# Step 2: Copy frontend dist to backend web folder
Write-Host "[2/3] Copying frontend files to backend..." -ForegroundColor Cyan
$DistTarget = Join-Path $WebDir "dist"
if (Test-Path $DistTarget) {
    Remove-Item -Recurse -Force $DistTarget
}
Copy-Item -Recurse -Force (Join-Path $FrontendDir "dist") $DistTarget
Write-Host "Frontend files copied successfully." -ForegroundColor Green
Write-Host ""

# Step 3: Build Backend
Write-Host "[3/3] Building backend..." -ForegroundColor Cyan
Set-Location $BackendDir
go build -o (Join-Path $BinDir "econ.exe") ./cmd/server
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Backend built successfully." -ForegroundColor Green
Write-Host ""

# Done
Write-Host "========================================"
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Output: $(Join-Path $BinDir 'econ.exe')"
Write-Host ""
Write-Host "To run the application:"
Write-Host "  1. Navigate to: $BinDir"
Write-Host "  2. Run: .\econ.exe"
Write-Host "  3. Open browser: http://localhost:8080"
Write-Host ""

Set-Location $RootDir
