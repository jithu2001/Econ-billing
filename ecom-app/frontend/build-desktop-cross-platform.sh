#!/bin/bash

echo "🏗️  Building PropertyCare Desktop App (Cross-Platform)..."

# Detect OS
OS=""
ARCH=""
case "$(uname -s)" in
    Linux*)     OS=linux;;
    Darwin*)    OS=darwin;;
    MINGW*|MSYS*|CYGWIN*)     OS=windows;;
    *)          OS="UNKNOWN"
esac

case "$(uname -m)" in
    x86_64)     ARCH=amd64;;
    arm64)      ARCH=arm64;;
    aarch64)    ARCH=arm64;;
    *)          ARCH=amd64
esac

echo "📋 Detected OS: $OS, Architecture: $ARCH"

# Step 1: Build Golang backend for multiple platforms
echo "📦 Building Golang backend..."
cd ../backend

# Build for current platform
echo "  Building for current platform ($OS/$ARCH)..."
if [ "$OS" = "windows" ]; then
    go build -o main.exe ./cmd/api/main.go
else
    go build -o main ./cmd/api/main.go
fi

if [ $? -eq 0 ]; then
    echo "✅ Backend built for current platform"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Optional: Build for other platforms
if [ "$1" = "--all" ]; then
    echo "  Building for all platforms..."
    
    # Windows AMD64
    echo "  Building for Windows (amd64)..."
    GOOS=windows GOARCH=amd64 go build -o main-windows-amd64.exe ./cmd/api/main.go
    
    # macOS AMD64
    echo "  Building for macOS (amd64)..."
    GOOS=darwin GOARCH=amd64 go build -o main-darwin-amd64 ./cmd/api/main.go
    
    # macOS ARM64
    echo "  Building for macOS (arm64)..."
    GOOS=darwin GOARCH=arm64 go build -o main-darwin-arm64 ./cmd/api/main.go
    
    # Linux AMD64
    echo "  Building for Linux (amd64)..."
    GOOS=linux GOARCH=amd64 go build -o main-linux-amd64 ./cmd/api/main.go
    
    echo "✅ All platform builds completed"
fi

# Step 2: Return to frontend and build React app
echo "⚛️  Building React frontend..."
cd ../frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Step 3: Display platform-specific instructions
echo ""
echo "🖥️  Platform-specific packaging instructions:"
echo ""
echo "For CURRENT platform ($OS):"
case "$OS" in
    darwin)
        echo "  npm run dist-mac        - Create macOS installer (.dmg)"
        ;;
    windows)
        echo "  npm run dist-win        - Create Windows installer (.exe)"
        ;;
    linux)
        echo "  npm run dist-linux      - Create Linux installer (.AppImage)"
        ;;
esac

echo ""
echo "For ALL platforms:"
echo "  npm run dist            - Create installers for all platforms"
echo ""
echo "To test the app:"
echo "  npm run electron        - Test the desktop app"
echo ""
echo "🎉 Build complete! Desktop app is ready for testing and packaging."