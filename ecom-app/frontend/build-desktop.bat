@echo off
echo Building PropertyCare Desktop App...

echo Building Golang backend...
cd ..\backend
go build -o main.exe .\cmd\api\main.go
if %errorlevel% equ 0 (
    echo Backend built successfully
) else (
    echo Backend build failed
    exit /b 1
)

echo Building React frontend...
cd ..\frontend
call npm run build
if %errorlevel% equ 0 (
    echo Frontend built successfully
) else (
    echo Frontend build failed
    exit /b 1
)

echo Testing Electron app...
echo You can now run:
echo   npm run electron        - Test the desktop app
echo   npm run dist-win        - Create Windows installer (.exe)
echo.
echo Build complete! Desktop app is ready for testing and packaging.