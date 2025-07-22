# Temple Donations Mobile App

A native Android application for the Temple Donation Management System.

## Quick Start

### For Users
1. Download the APK file from the releases
2. Enable "Install from Unknown Sources" on your Android device
3. Install the APK
4. Launch "Temple Donations" app

### For Developers
1. Install Android Studio and Android SDK
2. Set ANDROID_HOME environment variable
3. Run: `./build.sh`

## Features
- ✅ **Bilingual Support**: English and Tamil
- ✅ **Real-time Connection**: Connects to live temple system
- ✅ **Mobile Optimized**: Native Android experience
- ✅ **Offline Detection**: Visual connection status
- ✅ **Auto-retry**: Automatic reconnection on network restore

## Technical Details
- **Framework**: Apache Cordova
- **Target**: Android 7.0+ (API 24+)
- **Package**: com.temple.donations
- **Server**: https://temple-giving-dharanipriya154.replit.dev

## Architecture
The app is a hybrid mobile application that:
1. Provides a native Android shell
2. Loads the full web application in an iframe
3. Handles mobile-specific features (back button, connection status)
4. Maintains consistent branding and user experience

## Files Structure
```
temple-app/
├── config.xml          # Cordova configuration
├── www/
│   └── index.html      # Mobile app interface
├── platforms/android/   # Generated Android project
├── build.sh            # Build script
└── build-instructions.md # Detailed build guide
```

## Build Output
- **Debug APK**: For testing and development
- **Release APK**: For production distribution (requires signing)

## Permissions
- Internet access for web application connectivity
- Network state checking for connection monitoring
- Storage access for import/export functionality

---

For detailed build instructions, see `build-instructions.md`