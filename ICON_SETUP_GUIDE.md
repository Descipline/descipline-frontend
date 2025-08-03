# App Icon and Splash Screen Setup Instructions

## Issue
After updating splash-icon.png and app icon configuration, the changes don't appear in the app.

## Solution
This is a common Expo issue where icon/splash changes require cache clearing and prebuild.

## Steps to Fix

### 1. Clear Expo Cache
```bash
npx expo r -c
# or
yarn expo r -c
```

### 2. Clear All Caches (Nuclear Option)
```bash
# Clear Expo cache
npx expo r -c

# Clear Metro cache  
npx react-native start --reset-cache

# Clear npm cache
npm cache clean --force

# Clear yarn cache (if using yarn)
yarn cache clean
```

### 3. Regenerate Native Projects
```bash
# Delete existing native folders
rm -rf android ios

# Regenerate with latest config
npx expo prebuild --clean

# Or for development build
npx expo run:android
npx expo run:ios
```

### 4. Development vs Production Icons

**Development (Expo Go):**
- Icons may not update in Expo Go app
- Use development build or production build to see changes

**Production/Development Build:**
- Icons will update after prebuild
- Changes require app reinstallation

### 5. Current Configuration

**App Icon:** `./assets/images/adaptive-icon.png`
**Splash Screen:** `./assets/images/splash-icon.png`
**Background:** `#1a0d2e` (DESCIPLINE brand dark color)

### 6. Verify Changes
1. Build a development build: `npx expo run:android` or `npx expo run:ios`
2. Or create a preview build: `eas build --profile preview`
3. Install fresh app (uninstall old version first)

## Alternative: EAS Build
If local builds don't work, use EAS Build:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build preview
eas build --profile preview --platform android
```

## Notes
- Expo Go may cache icons aggressively
- Always test icon changes in development/production builds
- Icon changes require app reinstallation, not just hot reload
- Clear all caches if icons still don't update