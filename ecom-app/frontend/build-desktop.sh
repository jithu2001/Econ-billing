#!/bin/bash

echo "🏗️  Building PropertyCare Desktop App..."

# Step 1: Build Golang backend
echo "📦 Building Golang backend..."
cd ../backend
go build -o main ./cmd/api/main.go
if [ $? -eq 0 ]; then
    echo "✅ Backend built successfully"
else
    echo "❌ Backend build failed"
    exit 1
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

# Step 3: Test Electron app
echo "🖥️  Testing Electron app..."
echo "You can now run:"
echo "  npm run electron        - Test the desktop app"
echo "  npm run dist-mac        - Create macOS installer (.dmg)"
echo "  npm run dist-win        - Create Windows installer (.exe)"
echo "  npm run dist-linux      - Create Linux installer (.AppImage)"
echo ""
echo "🎉 Build complete! Desktop app is ready for testing and packaging." 