# build.ps1 — Build Econ as a single Wails-packaged Windows executable.
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootDir

Write-Host "[1/2] Generating Wails bindings..." -ForegroundColor Cyan
wails generate module
if ($LASTEXITCODE -ne 0) { Write-Host "Binding generation failed" -ForegroundColor Red; exit 1 }

Write-Host "[2/2] Running wails build..." -ForegroundColor Cyan
wails build -clean -platform windows/amd64 -o Econ.exe
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "Build completed successfully." -ForegroundColor Green
Write-Host "Output: $(Join-Path $RootDir 'build/bin/Econ.exe')"
