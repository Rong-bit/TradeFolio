@echo off
REM APK 診斷腳本
echo ========================================
echo APK 診斷工具
echo ========================================
echo.

set APK_PATH=app\build\outputs\apk\release\app-release.apk

if not exist "%APK_PATH%" (
    echo 錯誤: 找不到 APK 文件: %APK_PATH%
    pause
    exit /b 1
)

echo 1. 檢查 APK 文件信息...
echo.
for %%F in ("%APK_PATH%") do (
    echo    文件: %%~nxF
    echo    大小: %%~zF 字節
    echo    修改時間: %%~tF
)
echo.

echo 2. 檢查 APK 簽名狀態...
echo.
"C:\Program Files\Android\Android Studio\jbr\bin\jarsigner.exe" -verify -verbose "%APK_PATH%" 2>&1 | findstr /C:"jar verified" /C:"jarsigner:" /C:"Signer" /C:"certificate"
echo.

echo 3. 檢查設備連接狀態...
echo.
adb devices
echo.

echo 4. 嘗試安裝 APK（如果設備已連接）...
echo.
adb install -r "%APK_PATH%"
echo.

echo 5. 如果安裝成功，查看應用日誌...
echo.
echo 按任意鍵查看應用日誌（logcat）...
pause >nul
adb logcat -c
adb logcat | findstr /C:"TradeFolio" /C:"tradefolio" /C:"FATAL" /C:"AndroidRuntime"
echo.

pause

