@echo off
REM APK 安裝腳本
echo ========================================
echo TradeFolio APK 安裝工具
echo ========================================
echo.

set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
set APK_PATH=app\build\outputs\apk\release\app-release.apk

if not exist "%ADB_PATH%" (
    echo 錯誤: 找不到 adb.exe
    echo 請確保已安裝 Android SDK
    pause
    exit /b 1
)

if not exist "%APK_PATH%" (
    echo 錯誤: 找不到 APK 文件: %APK_PATH%
    pause
    exit /b 1
)

echo 1. 檢查設備連接狀態...
echo.
"%ADB_PATH%" devices
echo.

echo 2. 等待設備連接...
echo    如果沒有設備，請：
echo    - 連接 Android 設備並啟用 USB 調試
echo    - 或啟動 Android 模擬器
echo.
pause

echo.
echo 3. 再次檢查設備...
echo.
"%ADB_PATH%" devices
echo.

echo 4. 開始安裝 APK...
echo.
"%ADB_PATH%" install -r "%APK_PATH%"
echo.

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 安裝成功！
    echo ========================================
    echo.
    echo 應用已安裝到設備，請在設備上打開應用
    echo.
) else (
    echo.
    echo ========================================
    echo 安裝失敗！
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 沒有檢測到設備或模擬器
    echo 2. USB 調試未啟用
    echo 3. 設備上已安裝的應用簽名不一致（嘗試先卸載舊版本）
    echo 4. 設備存儲空間不足
    echo.
    echo 如果設備上有舊版本，可以嘗試：
    echo adb uninstall com.tradefolio.app
    echo.
)

pause

