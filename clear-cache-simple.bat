@echo off
echo Clearing Expo cache for icon/name updates...
echo.

echo Stopping any running processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo Clearing Expo cache...
call npx expo start --clear

echo.
echo ✅ Done! 
echo Remember to uninstall and reinstall the app to see changes.
pause