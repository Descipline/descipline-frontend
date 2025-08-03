@echo off
echo Clearing Expo and React Native cache for icon and app name updates...
echo.

echo [1/6] Stopping Metro bundler...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/6] Clearing Expo cache...
call npx expo start --clear 2>nul
timeout /t 3 >nul
taskkill /f /im node.exe >nul 2>&1

echo [3/6] Clearing npm cache...
call npm cache clean --force

echo [4/6] Clearing yarn cache (if using yarn)...
call yarn cache clean 2>nul

echo [5/6] Clearing node_modules and reinstalling...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock
call npm install

echo [6/6] Clearing React Native cache...
call npx react-native start --reset-cache 2>nul & timeout /t 3 >nul & taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ Cache cleared successfully!
echo.
echo Next steps:
echo 1. Uninstall the app from your device/emulator
echo 2. Run: npx expo start --clear
echo 3. Reinstall the app to see updated icon and name
echo.
pause