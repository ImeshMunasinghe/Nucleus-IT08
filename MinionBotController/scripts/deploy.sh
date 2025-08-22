#!/bin/bash

# MinionBot Controller Deployment Script

echo "🎯 Starting MinionBot Controller deployment process..."

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: app.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Expo CLI
if ! command -v expo &> /dev/null; then
    echo "❌ Expo CLI is not installed. Installing now..."
    npm install -g expo-cli
fi

echo "✅ Prerequisites check completed"

echo "📦 Installing dependencies..."
npm install

echo "🔍 Running TypeScript compilation check..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ TypeScript compilation successful"

echo "🏗️ Building the app..."

# Build for Android
echo "📱 Building for Android..."
expo build:android --type apk

if [ $? -eq 0 ]; then
    echo "✅ Android build completed successfully"
else
    echo "⚠️ Android build failed or was skipped"
fi

# Build for iOS (only on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building for iOS..."
    expo build:ios
    
    if [ $? -eq 0 ]; then
        echo "✅ iOS build completed successfully"
    else
        echo "⚠️ iOS build failed or was skipped"
    fi
else
    echo "ℹ️ iOS build skipped (requires macOS)"
fi

echo "🎉 Deployment process completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test the app on physical devices"
echo "2. Verify Bluetooth connectivity with your ESP32 robot"
echo "3. Test voice recognition functionality"
echo "4. Submit to app stores if ready for release"
echo ""
echo "🔗 Useful commands:"
echo "  npm start          - Start development server"
echo "  npm run android    - Run on Android device"
echo "  npm run ios        - Run on iOS device"
echo "  npm run web        - Run in web browser"
