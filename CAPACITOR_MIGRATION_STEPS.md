# TradeFolio 转换为 Capacitor 独立 APK 执行步骤

本文档详细说明如何将 TradeFolio 从 TWA（Trusted Web Activity）转换为 Capacitor 独立 APK 的完整步骤。

## 前置要求

- Node.js（建议 v18 或更高版本）
- Android Studio（用于构建APK）
- Java JDK（Android Studio 通常会包含）
- Google Play Console 账号（如果要在 Google Play 上架）
- Supabase 账号和项目（用于会员验证）
- Google Cloud Console 账号（用于 Google Sign-In 配置）

## 步骤 1: 安装依赖

确保所有必要的依赖已安装：

```bash
npm install
```

如果需要安装或更新 Capacitor：

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

## 步骤 2: 构建 Web 应用

首先构建 Web 应用，生成 `dist` 目录：

```bash
npm run build
```

验证 `dist` 目录已生成且包含所有必要文件。

## 步骤 3: 初始化 Capacitor Android 项目

如果 `android` 目录不存在，需要初始化：

```bash
npx cap add android
```

如果 `android` 目录已存在（从 TWA 迁移），可以选择：

**选项 A: 保留现有 Android 项目结构**
- 保留现有的 `app` 目录结构
- 手动更新配置文件

**选项 B: 重新初始化（推荐用于完全迁移到 Capacitor）**
```bash
# 备份现有 android 目录（如果需要）
mv android android_backup

# 重新初始化
npx cap add android
```

## 步骤 4: 同步 Web 资源到 Android

将构建好的 Web 应用同步到 Android 项目：

```bash
npx cap sync android
```

这个命令会：
- 将 `dist` 目录的内容复制到 Android 项目的 `assets` 目录
- 更新 Android 项目的配置文件
- 确保所有必要的文件都在正确的位置

## 步骤 5: 配置 Android 项目

### 5.1 检查 `android/app/build.gradle`

确保最低 SDK 版本至少为 21：

```gradle
android {
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 35
        // ...
    }
}
```

### 5.2 检查应用ID

在 `android/app/build.gradle` 中确认应用ID：

```gradle
android {
    defaultConfig {
        applicationId "com.tradefolio.app"
        // ...
    }
}
```

### 5.3 配置签名（用于发布版本）

在 `android/gradle.properties` 或 `android/local.properties` 中配置签名信息：

```properties
RELEASE_STORE_FILE=../android.keystore
RELEASE_STORE_PASSWORD=您的密钥库密码
RELEASE_KEY_ALIAS=android
RELEASE_KEY_PASSWORD=您的密钥密码
```

如果还没有密钥库，可以使用现有脚本创建：

```bash
# Windows
create-keystore.bat

# Linux/Mac
./create-keystore.sh
```

## 步骤 6: 配置环境变量

### 6.1 Supabase 配置

创建 `.env.local` 文件（如果不存在）：

```env
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase Anon Key
```

这些变量用于：
- 会员验证查询
- 查询 `authorized_users` 表
- 调用 `is_user_member` RPC 函数

### 6.2 Google Sign-In 配置（Android）

在 Android 项目中配置 Google Sign-In：

1. **在 Google Cloud Console 创建 OAuth 2.0 客户端ID**
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 选择或创建项目
   - 启用 "Google Sign-In API"
   - 创建 OAuth 2.0 客户端ID（Android 类型）
   - 需要应用的 SHA-1 指纹和包名 `com.tradefolio.app`

2. **获取 SHA-1 指纹**
   ```bash
   # Windows
   get-fingerprint.bat
   
   # Linux/Mac
   keytool -list -v -keystore android.keystore -alias android
   ```

3. **在 Android 项目中配置**
   - 将 `google-services.json` 文件（如果需要）放到 `android/app/` 目录
   - 或通过 AndroidManifest.xml 配置

## 步骤 7: 实现 Android 原生 Google Sign-In（可选但推荐）

为了在 Android 平台实现自动登录，需要实现 Google Sign-In 的原生桥接。

### 选项 A: 使用 Capacitor 插件

安装 Google Auth 插件：

```bash
npm install @codetrix-studio/capacitor-google-auth
npx cap sync android
```

然后在 Android 项目中配置（参考插件文档）。

### 选项 B: 手动实现原生桥接

需要修改 Android 原生代码：

1. 在 `android/app/src/main/java/com/tradefolio/app/` 创建 GoogleAuthBridge.java
2. 实现 Google Sign-In 逻辑
3. 通过 WebView JavaScript 接口暴露给 Web 端
4. 更新 `services/googleAuth.ts` 中的 `getGoogleAccountEmail` 函数

**注意**: 如果没有实现 Android 原生 Google Sign-In，Android 平台将回退到手动输入邮箱的方式。

## 步骤 8: 更新 AndroidManifest.xml（如果需要）

检查 `android/app/src/main/AndroidManifest.xml`：

- 确保网络权限已添加：
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  ```

- 确保主 Activity 配置正确（Capacitor 会自动处理）

## 步骤 9: 构建 APK

### 9.1 开发版本（Debug）

```bash
cd android
./gradlew assembleDebug
```

生成的 APK 位于：`android/app/build/outputs/apk/debug/app-debug.apk`

### 9.2 发布版本（Release）

```bash
cd android
./gradlew assembleRelease
```

如果配置了签名，生成的签名 APK 位于：
`android/app/build/outputs/apk/release/app-release.apk`

**Windows 用户可以使用现有脚本：**
```bash
build-release.bat
```

## 步骤 10: 测试

### 10.1 在 Android Studio 中测试

```bash
npx cap open android
```

在 Android Studio 中：
1. 连接 Android 设备或启动模拟器
2. 点击运行按钮
3. 测试应用功能

### 10.2 测试登录功能

**Web 端测试：**
1. 在浏览器中打开应用
2. 应该显示邮箱输入界面
3. 输入邮箱登录
4. 验证会员状态查询是否正常

**Android APK 测试：**
1. 安装 APK 到设备
2. 打开应用
3. 如果实现了 Google Sign-In：
   - 应该自动获取 Google 账户并登录
   - 跳过邮箱输入界面
4. 如果未实现 Google Sign-In：
   - 会显示邮箱输入界面（与 Web 端相同）

### 10.3 测试会员验证

1. 使用会员邮箱登录
2. 验证会员功能是否可用（如 rebalance 视图）
3. 使用非会员邮箱登录
4. 验证非会员功能限制是否生效

## 步骤 11: 上架 Google Play Store（可选）

如果要在 Google Play Store 上架：

### 11.1 构建 Android App Bundle (AAB)

```bash
cd android
./gradlew bundleRelease
```

生成的 AAB 位于：`android/app/build/outputs/bundle/release/app-release.aab`

### 11.2 配置 Google Play Console

1. 访问 [Google Play Console](https://play.google.com/console)
2. 创建新应用或选择现有应用
3. 填写应用信息
4. 上传 AAB 文件
5. 配置内购产品（如果使用 Google Play Billing）：
   - `tradefolio_lifetime` (NT$ 2,000)
   - `tradefolio_monthly` (NT$ 60/月)
   - `tradefolio_yearly` (NT$ 600/年)

详细步骤请参考 `ANDROID_APK_UPLOAD_GUIDE.md`

## 步骤 12: 部署和更新流程

### 每次更新应用时的流程：

1. **更新代码**
2. **构建 Web 应用**
   ```bash
   npm run build
   ```

3. **同步到 Android**
   ```bash
   npx cap sync android
   ```

4. **构建 APK/AAB**
   ```bash
   cd android
   ./gradlew assembleRelease  # 或 bundleRelease
   ```

5. **测试并发布**

## 常见问题排查

### 问题 1: `npx cap sync` 失败

**解决方案：**
- 确保 `dist` 目录存在
- 检查 `capacitor.config.ts` 配置是否正确
- 运行 `npm run build` 确保 Web 应用已构建

### 问题 2: Android 项目构建失败

**解决方案：**
- 检查 Android Studio 和 Gradle 版本
- 清理构建缓存：`cd android && ./gradlew clean`
- 检查 `build.gradle` 配置

### 问题 3: Google Sign-In 不工作

**解决方案：**
- 检查 SHA-1 指纹是否已添加到 Google Cloud Console
- 确认 OAuth 客户端ID配置正确
- 检查网络权限是否已添加
- 查看 Android Logcat 错误日志

### 问题 4: 会员验证失败

**解决方案：**
- 检查 Supabase 环境变量是否正确配置
- 验证 Supabase 数据库表结构是否正确
- 检查网络连接
- 查看浏览器控制台或 Android Logcat 的错误信息

### 问题 5: 应用无法访问网络

**解决方案：**
- 检查 `AndroidManifest.xml` 中是否有 `INTERNET` 权限
- 如果使用 HTTPS，确保 SSL 证书有效
- 检查防火墙或网络设置

## 功能说明

### 平台差异化登录

- **Web 端（网页打开）**: 显示邮箱输入界面，用户可以手动输入邮箱登录
- **Android APK（程序打开）**: 
  - 如果实现了 Google Sign-In：自动获取 Google 账户邮箱并登录，跳过输入界面
  - 如果未实现：显示邮箱输入界面（与 Web 端相同）

### 会员验证流程

1. 检查本地授权列表（`config.ts` 中的 `GLOBAL_AUTHORIZED_USERS`）
2. 查询 Supabase 数据库（`is_user_member` RPC 函数或 `active_members` 视图）
3. 如果都不是，设为非会员

### 会员开通方式

1. **Google Play Billing 内购**: 用户通过应用内购买
2. **手动授权**: 管理员在 Supabase 的 `authorized_users` 表中手动添加会员邮箱
3. **邮件申请**: 非会员通过邮件申请，管理员手动开通

### 导航菜单

- 仅使用汉堡菜单（侧边抽屉菜单）
- 没有底部导航栏
- 所有页面选项都在侧边菜单中

## 后续开发建议

1. **实现 Android 原生 Google Sign-In**
   - 这是实现 Android 自动登录的关键
   - 可以使用 Capacitor 插件或手动实现

2. **添加错误处理和用户反馈**
   - 改进网络错误处理
   - 添加加载状态指示
   - 优化错误消息显示

3. **性能优化**
   - 优化 Web 应用加载速度
   - 减少初始包大小
   - 优化图片和资源

4. **测试覆盖**
   - 添加单元测试
   - 添加集成测试
   - 在不同设备上测试

## 相关文件

- `capacitor.config.ts` - Capacitor 配置文件
- `services/googleAuth.ts` - Google 登录服务
- `services/supabase.ts` - Supabase 服务和会员查询
- `App.tsx` - 主应用组件（包含登录逻辑）
- `ANDROID_APK_UPLOAD_GUIDE.md` - Google Play 上架指南
- `SUPABASE_SETUP.md` - Supabase 设置说明

## 支持

如果遇到问题，请检查：
1. 本文档的常见问题部分
2. Capacitor 官方文档：https://capacitorjs.com/docs
3. Supabase 文档：https://supabase.com/docs
4. Google Sign-In 文档：https://developers.google.com/identity/sign-in/android

