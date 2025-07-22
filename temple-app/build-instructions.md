# Temple Donations Android APK Build Instructions

## Project Overview
This Cordova project packages your Temple Donation Management System as an Android APK that connects to your web application at `https://temple-giving-dharanipriya154.replit.dev`.

## Prerequisites
To build the APK, you need:

1. **Node.js** (v16 or later)
2. **Android Studio** with Android SDK
3. **Java Development Kit (JDK)** 8 or 11
4. **Cordova CLI** (`npm install -g cordova`)

## Setup Instructions

### 1. Install Android Studio
- Download Android Studio from https://developer.android.com/studio
- Install Android SDK Platform-Tools
- Install Android SDK Build-Tools (version 30.0.3 or later)
- Install Android SDK Platform (API level 30 or later)

### 2. Set Environment Variables
```bash
export ANDROID_HOME=/path/to/android-sdk
export ANDROID_SDK_ROOT=/path/to/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

### 3. Build the APK

#### Development Build (Debug)
```bash
cd temple-app
cordova build android
```

#### Production Build (Release)
```bash
cd temple-app
cordova build android --release
```

### 4. Sign the APK (For Release)
```bash
# Generate keystore (one time only)
keytool -genkey -v -keystore temple-donations.keystore -alias temple-donations -keyalg RSA -keysize 2048 -validity 10000

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore temple-donations.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk temple-donations

# Align the APK
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk temple-donations.apk
```

## APK Location
After successful build:
- **Debug APK**: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`

## App Features
- **Bilingual Interface**: English and Tamil support
- **Connection Status**: Visual indicator for online/offline status
- **Full Web App Access**: Complete temple donation system functionality
- **Mobile Optimized**: Native Android app experience
- **Auto-retry**: Automatic reconnection on network issues

## Troubleshooting

### Common Issues
1. **ANDROID_HOME not set**: Ensure Android SDK path is correctly set
2. **Build tools missing**: Install required Android SDK components
3. **Java version**: Use JDK 8 or 11 (JDK 17+ may cause issues)
4. **Gradle issues**: Try `cordova clean android` before rebuilding

### Network Configuration
The app connects to your live temple system at:
`https://temple-giving-dharanipriya154.replit.dev`

To change the server URL, edit the `WEB_APP_URL` constant in `www/index.html`.

## App Configuration
- **Package ID**: `com.temple.donations`
- **App Name**: Temple Donations
- **Version**: 1.0.0
- **Min SDK**: API 24 (Android 7.0)
- **Target SDK**: API 35

## Permissions
The app requests these permissions:
- INTERNET: For connecting to the web application
- ACCESS_NETWORK_STATE: For checking connectivity
- WRITE_EXTERNAL_STORAGE: For data export functionality
- READ_EXTERNAL_STORAGE: For file import functionality

## Installation
1. Enable "Unknown Sources" in Android settings
2. Install the APK file on your device
3. Launch "Temple Donations" app
4. The app will connect to your live system automatically

## Support
For build issues or questions, refer to:
- Cordova Documentation: https://cordova.apache.org/docs/
- Android Developer Guide: https://developer.android.com/guide