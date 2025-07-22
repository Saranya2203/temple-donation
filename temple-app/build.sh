#!/bin/bash

# Temple Donations APK Build Script
echo "Building Temple Donations Android APK..."

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "Error: ANDROID_HOME environment variable not set"
    echo "Please install Android Studio and set ANDROID_HOME to your SDK path"
    echo "Example: export ANDROID_HOME=/path/to/Android/Sdk"
    exit 1
fi

# Check if required tools are available
if ! command -v cordova &> /dev/null; then
    echo "Error: Cordova CLI not found"
    echo "Install with: npm install -g cordova"
    exit 1
fi

# Clean previous builds
echo "Cleaning previous builds..."
cordova clean android

# Add Android platform if not already added
echo "Ensuring Android platform is added..."
cordova platform add android

# Build the APK
echo "Building Android APK..."
cordova build android

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "APK locations:"
    echo "Debug APK: platforms/android/app/build/outputs/apk/debug/app-debug.apk"
    echo "Release APK: platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk"
    echo ""
    echo "To install on device:"
    echo "adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Build failed. Check the error messages above."
    echo "Common solutions:"
    echo "1. Ensure ANDROID_HOME is set correctly"
    echo "2. Install Android SDK Build Tools"
    echo "3. Check Java version (use JDK 8 or 11)"
    exit 1
fi