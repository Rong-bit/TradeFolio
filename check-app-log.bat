@echo off
REM 檢查應用日誌和崩潰信息
echo ========================================
echo TradeFolio 應用診斷工具
echo ========================================
echo.

set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe

if not exist "%ADB_PATH%" (
    echo 錯誤: 找不到 adb.exe
    pause
    exit /b 1
)

echo 1. 檢查應用是否已安裝...
echo.
"%ADB_PATH%" shell pm list packages | findstr /i "tradefolio"
echo.

echo 2. 檢查應用的詳細信息...
echo.
"%ADB_PATH%" shell dumpsys package com.tradefolio.app | findstr /i "versionName versionCode"
echo.

echo 3. 清理舊日誌...
echo.
"%ADB_PATH%" logcat -c
echo.

echo 4. 嘗試啟動應用...
echo.
"%ADB_PATH%" shell am start -n com.tradefolio.app/.LauncherActivity
echo.

echo 5. 等待 3 秒後查看日誌...
echo.
timeout /t 3 /nobreak >nul
echo.

echo 6. 查看應用崩潰或錯誤日誌...
echo.
"%ADB_PATH%" logcat -d | findstr /i "tradefolio TradeFolio AndroidRuntime FATAL Exception"
echo.

echo 7. 查看完整的崩潰堆棧（如果有的話）...
echo.
"%ADB_PATH%" logcat -d | findstr /C:"AndroidRuntime" /A:50
echo.

echo.
echo ========================================
echo 診斷完成
echo ========================================
echo.
echo 如果看到崩潰信息，請將完整的錯誤訊息提供給開發者
echo.
pause

