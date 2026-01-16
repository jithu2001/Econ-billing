@echo off
echo ========================================
echo Building Lodge Management System
echo ========================================
echo.

:: Set directories
set ROOT_DIR=%~dp0
set FRONTEND_DIR=%ROOT_DIR%frontend
set BACKEND_DIR=%ROOT_DIR%backend
set WEB_DIR=%BACKEND_DIR%\internal\web
set BIN_DIR=%ROOT_DIR%bin

:: Create bin directory if it doesn't exist
if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"

:: Step 1: Build Frontend
echo [1/3] Building frontend...
cd /d "%FRONTEND_DIR%"
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    exit /b 1
)
echo Frontend built successfully.
echo.

:: Step 2: Copy frontend dist to backend web folder
echo [2/3] Copying frontend files to backend...
if exist "%WEB_DIR%\dist" rmdir /s /q "%WEB_DIR%\dist"
xcopy /E /I /Y "%FRONTEND_DIR%\dist" "%WEB_DIR%\dist" > nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy frontend files!
    exit /b 1
)
echo Frontend files copied successfully.
echo.

:: Step 3: Build Backend
echo [3/3] Building backend...
cd /d "%BACKEND_DIR%"
go build -o "%BIN_DIR%\lodge-manager.exe" ./cmd/server
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    exit /b 1
)
echo Backend built successfully.
echo.

:: Done
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Output: %BIN_DIR%\lodge-manager.exe
echo.
echo To run the application:
echo   1. Navigate to: %BIN_DIR%
echo   2. Run: lodge-manager.exe
echo   3. Open browser: http://localhost:8080
echo.
pause
