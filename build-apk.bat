@echo off
REM 構建簽名的 Release APK 文件
REM 請確保已正確配置 gradle.properties 中的簽名信息

echo ========================================
echo 開始構建 TradeFolio Release APK
echo ========================================
echo.

REM 自動檢測並設置 JAVA_HOME
if "%JAVA_HOME%"=="" (
    echo 正在檢測 Java 安裝位置...
    if exist "C:\Program Files\Android\Android Studio\jbr" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
        echo 找到 Android Studio JDK: %JAVA_HOME%
    ) else if exist "C:\Program Files\Java\jdk-17" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-17"
        echo 找到 Java JDK: %JAVA_HOME%
    ) else if exist "C:\Program Files\Java\jdk-11" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-11"
        echo 找到 Java JDK: %JAVA_HOME%
    ) else (
        echo 錯誤: 找不到 Java 安裝，請手動設置 JAVA_HOME 環境變量
        pause
        exit /b 1
    )
) else (
    echo 使用已設置的 JAVA_HOME: %JAVA_HOME%
)

REM 檢查是否配置了簽名
if not exist "gradle.properties" (
    echo 錯誤: 找不到 gradle.properties 文件
    pause
    exit /b 1
)

echo.
echo 正在清理舊的構建文件...
call gradlew.bat clean
if %ERRORLEVEL% NEQ 0 (
    echo 清理失敗！
    pause
    exit /b 1
)

echo.
echo 正在構建 Release APK...
call gradlew.bat assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 構建成功！
    echo ========================================
    echo.
    echo APK 文件位置:
    echo app\build\outputs\apk\release\app-release.apk
    echo.
    echo 應用將連接到: https://rong-bit.github.io/TradeFolio/
    echo.
) else (
    echo.
    echo ========================================
    echo 構建失敗！
    echo ========================================
    echo.
    echo 請檢查錯誤信息並確保：
    echo 1. 已正確配置 gradle.properties 中的簽名信息
    echo 2. 密鑰庫文件路徑正確
    echo 3. 密碼正確
    echo 4. JAVA_HOME 已正確設置
    echo.
)

pause

