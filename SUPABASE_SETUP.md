# Supabase 資料庫設定指南

## 步驟 1：登入 Supabase Dashboard

1. 前往 [https://supabase.com](https://supabase.com)
2. 登入您的帳號
3. 選擇或建立您的專案

## 步驟 2：執行 SQL 腳本

1. 在 Supabase Dashboard 左側選單點擊 **"SQL Editor"**
2. 點擊 **"New query"** 建立新查詢
3. 複製 `supabase-schema.sql` 檔案中的完整 SQL 腳本
4. 貼上到 SQL Editor 中
5. 點擊 **"Run"** 執行腳本

## 步驟 3：驗證表是否建立成功

1. 在左側選單點擊 **"Table Editor"**
2. 您應該會看到以下兩個表：
   - `purchases` - 購買記錄表
   - `authorized_users` - 手動授權會員表

## 步驟 4：設定環境變數

在您的後端環境（Vercel）中設定以下環境變數：

### 4.1 在 Vercel Dashboard 中設定環境變數

1. **登入 Vercel**
   - 前往 [https://vercel.com](https://vercel.com)
   - 登入您的帳號

2. **進入專案設定**
   - 在 Dashboard 中找到您的專案（如果還沒部署，請先部署）
   - 點擊專案名稱進入專案頁面
   - 點擊上方選單的 **"Settings"**（設定）

3. **開啟環境變數頁面**
   - 在左側選單點擊 **"Environment Variables"**（環境變數）

4. **新增環境變數**
   點擊 **"Add New"** 按鈕，依序新增以下環境變數：

   #### 必要變數（Supabase）

   **SUPABASE_URL**
   - Key: `SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`（從 Supabase Dashboard 複製）
   - Environment: 選擇 **Production**、**Preview**、**Development**（全部勾選）

   **SUPABASE_SERVICE_ROLE_KEY**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: 從 Supabase Dashboard 複製 **`service_role`** key（舊版）或 **`secret`** key（新版）
   - Environment: 選擇 **Production**、**Preview**、**Development**（全部勾選）
   - ⚠️ **重要**：
     - 在 Supabase Dashboard 中，您會看到兩種 key：
       - **Legacy keys**: `anon` 和 `service_role`（舊版）
       - **New keys**: `publishable` 和 `secret`（新版）
     - **請使用 `service_role`（舊版）或 `secret`（新版）**，**不要使用 `anon` 或 `publishable`**
     - 這是敏感資訊，必須保密，絕對不要公開或在客戶端使用

   #### 可選變數（Google Play 驗證）

   **GOOGLE_SERVICE_ACCOUNT_EMAIL**
   - Key: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Value: 從下載的 JSON 檔案中的 `"client_email"` 欄位複製
   - 取得方式：見下方「如何取得 Google Service Account 憑證」章節
   - Environment: 選擇 **Production**（生產環境才需要）

   **GOOGLE_PRIVATE_KEY**
   - Key: `GOOGLE_PRIVATE_KEY`
   - Value: 從下載的 JSON 檔案中的 `"private_key"` 欄位複製（整個值）
   - 取得方式：見下方「如何取得 Google Service Account 憑證」章節
   - ⚠️ **重要**：在 Vercel 中，換行符號會自動處理，但如果有 `\n`，請直接貼上多行文字
   - Environment: 選擇 **Production**

   **GOOGLE_PACKAGE_NAME**
   - Key: `GOOGLE_PACKAGE_NAME`
   - Value: `com.tradefolio.app`（這是您應用程式的套件名稱，已在 `twa-manifest.json` 中定義）
   - 取得方式：查看 `twa-manifest.json` 檔案中的 `"packageId"` 欄位
   - Environment: 選擇 **Production**

   #### 開發模式變數

   **ALLOW_UNVERIFIED_PURCHASES**（僅用於測試）
   - Key: `ALLOW_UNVERIFIED_PURCHASES`
   - Value: `true`（測試時）或 `false`（生產環境）
   - Environment: 選擇 **Preview**、**Development**（測試環境）
   - ⚠️ **生產環境請勿設定為 `true`**

5. **儲存並重新部署**
   - 新增完所有變數後，點擊 **"Save"**
   - 需要重新部署專案才能生效
   - 前往 **"Deployments"** 頁面，點擊最新的部署右側的 **"..."** → **"Redeploy"**

### 4.2 使用 Vercel CLI 設定（可選）

如果您偏好使用命令列：

```bash
# 安裝 Vercel CLI（如果還沒安裝）
npm i -g vercel

# 登入 Vercel
vercel login

# 進入專案目錄
cd your-project-directory

# 設定環境變數
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
vercel env add GOOGLE_PRIVATE_KEY production
vercel env add GOOGLE_PACKAGE_NAME production
vercel env add ALLOW_UNVERIFIED_PURCHASES preview

# 列出所有環境變數
vercel env ls
```

### 4.3 環境變數說明

```bash
# Supabase 設定（必要）
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google Play 驗證（生產環境需要）
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_PACKAGE_NAME=com.tradefolio.app

# 開發模式（僅測試環境）
ALLOW_UNVERIFIED_PURCHASES=true  # 生產環境設為 false 或移除
```

### 4.4 驗證環境變數是否設定成功

在您的 API 路由中添加臨時測試端點：

```typescript
// api/test-env.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 僅在開發環境中測試
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }

  res.json({
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasGoogleEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasGoogleKey: !!process.env.GOOGLE_PRIVATE_KEY,
    allowUnverified: process.env.ALLOW_UNVERIFIED_PURCHASES === 'true',
  });
}
```

訪問 `https://your-domain.vercel.app/api/test-env` 檢查環境變數是否正確載入。

### 如何取得 Supabase 憑證

1. 在 Supabase Dashboard 左側選單點擊 **"Settings"**
2. 點擊 **"API"**
3. 複製以下資訊：
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`（⚠️ 保密，不要公開）

### 如何取得 Google Service Account 憑證（詳細步驟）

#### 步驟 A：建立 Google Cloud 專案和 Service Account

1. **前往 Google Cloud Console**
   - 前往 [https://console.cloud.google.com](https://console.cloud.google.com)
   - 登入您的 Google 帳號

2. **建立或選擇專案**
   - 點擊頂部專案選擇器
   - 點擊 **"New Project"**（新建專案）
   - 輸入專案名稱（例如：`tradefolio-app`）
   - 點擊 **"Create"**

3. **啟用 Google Play Android Developer API**
   - 在左側選單點擊 **"APIs & Services" > "Library"**
   - 搜尋 **"Google Play Android Developer API"**
   - 點擊進入並點擊 **"Enable"**（啟用）

4. **建立 Service Account**
   - 左側選單點擊 **"IAM & Admin" > "Service Accounts"**
   - 點擊 **"Create Service Account"**（建立服務帳號）
   - 輸入服務帳號名稱（例如：`tradefolio-billing`）
   - 輸入服務帳號 ID（會自動產生）
   - 點擊 **"Create and Continue"**
   - 在角色選擇中，選擇 **"Owner"** 或 **"Editor"**（開發階段）
   - 點擊 **"Continue"** 然後 **"Done"**

5. **建立並下載 JSON 金鑰**
   - 在 Service Accounts 列表中，點擊您剛建立的服務帳號
   - 點擊 **"Keys"** 分頁
   - 點擊 **"Add Key" > "Create new key"**
   - 選擇 **"JSON"** 格式
   - 點擊 **"Create"**
   - JSON 檔案會自動下載到您的電腦
   - ⚠️ **重要**：妥善保管這個檔案，不要上傳到公開的地方

6. **從 JSON 檔案取得資訊**
   - 用文字編輯器開啟下載的 JSON 檔案
   - 找到 `"client_email"` 欄位 → 這就是 `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - 找到 `"private_key"` 欄位 → 這就是 `GOOGLE_PRIVATE_KEY`（整個字串，包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）

#### 步驟 B：連結到 Google Play Console

1. **前往 Google Play Console**
   - 前往 [https://play.google.com/console](https://play.google.com/console)
   - 登入並選擇您的應用程式
   - 如果介面是英文，可以點擊右上角設定圖示切換為繁體中文

2. **尋找 API 存取權選項**
   
   ⚠️ **重要**：您目前看到的「已連結的服務」頁面顯示的是 Google Ads、Firebase、Google Analytics 的連結，這是不同的功能。
   
   **API 存取權的位置可能不同，請嘗試以下方法：**
   
   **方法 A：直接訪問 API 存取權頁面（推薦）**
   - 在瀏覽器網址列直接輸入並訪問：
     ```
     https://play.google.com/console/developers/api-access
     ```
   - 或者先選擇一個應用程式，然後訪問：
     ```
     https://play.google.com/console/u/0/developers/[您的開發者ID]/api-access
     ```
   - 這會直接開啟 API 存取權設定頁面
   
   **方法 B：從應用程式層級尋找**
   - 先選擇一個應用程式（在左側選單點擊您的應用程式名稱）
   - 然後前往 **"設定"** > **"API 存取權"**
   - 有些情況下，API 存取權選項只在應用程式層級顯示
   
   **方法 C：檢查左側選單**
   - 在 Google Play Console 的主畫面，檢查左側選單
   - 尋找是否有 **"API 存取權"** 或 **"API access"** 選項
   - 可能位於「設定」下方，或作為獨立選單項

3. **連結服務帳號**（中文介面）
   - 在 API 存取權頁面中，您會看到 **"服務帳號"**（Service Accounts）區塊
   - 點擊 **"連結服務帳號"**（Link service account）按鈕
   - 在彈出的視窗中，選擇您剛在 Google Cloud Console 建立的 Service Account
   - 點擊 **"授予存取權"**（Grant access）

4. **授予權限**（中文介面）
   - 連結服務帳號後，系統會自動跳轉到權限設定頁面
   - 在權限設定頁面中，找到 **"財務資料"**（Financial data）區塊
   - 勾選 **"查看財務資料、訂單和取消訂閱調查回應"**（View financial data, orders, and cancellation survey responses）
   - 點擊 **"邀請使用者"**（Invite user）或 **"授予存取權"**（Grant access）按鈕
   - 確認對話框後完成授權
   - ⚠️ **注意**：如果沒有看到「財務資料」選項，可能需要先完成一些帳戶設定

5. **驗證連結**
   - 回到 **"API 存取權"**（API access）頁面
   - 在 **"服務帳號"**（Service Accounts）區塊中，您應該會看到剛連結的 Service Account
   - 確認狀態顯示為 **"作用中"**（Active）或 **"已啟用"**
   - 如果狀態不是作用中，請等待幾分鐘後重新整理頁面

### ⚠️ 如果找不到「API 存取權」選項

**您目前看到的是「已連結的服務」頁面，這是不同的功能。**

可能的原因和解決方案：

1. **API 存取權可能在應用程式層級**
   - 先選擇一個應用程式（在左側選單）
   - 然後在該應用程式的設定中尋找「API 存取權」
   - 有些功能只在應用程式層級顯示

2. **需要先建立並發布應用程式**
   - Google Play Console 的某些功能需要先建立應用程式
   - 嘗試先建立一個應用程式（即使是草稿狀態）
   - 然後再訪問 API 存取權頁面

3. **帳戶權限或狀態**
   - 確保您使用的帳號是主要開發人員帳戶的管理員
   - 確保已經完成開發人員帳戶的初始設定和付款資訊設定
   - 確認已經接受了 Google Play 的開發人員協議

4. **使用直接連結**
   - 嘗試直接訪問：`https://play.google.com/console/developers/api-access`
   - 如果被重定向，檢查是否要求選擇應用程式

5. **開發階段可以先跳過**
   - ⚠️ **重要**：如果暫時找不到 API 存取權選項，**您可以先跳過此步驟**
   - 在開發階段，設定 `ALLOW_UNVERIFIED_PURCHASES=true` 即可跳過 Google 驗證
   - 等到應用程式準備上線時，再回來完成 Service Account 連結
   - 或者聯絡 Google Play 開發者支援尋求協助

#### 步驟 C：設定到 Vercel

將以下資訊設定到 Vercel 環境變數：

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`：從 JSON 檔案的 `client_email` 欄位複製
- `GOOGLE_PRIVATE_KEY`：從 JSON 檔案的 `private_key` 欄位複製（整個值，包含換行）
- `GOOGLE_PACKAGE_NAME`：您的應用程式套件名稱，應該是 `com.tradefolio.app`

⚠️ **重要提示**：

1. **開發階段可以跳過 Google Service Account 設定**
   - 如果您暫時找不到「API 存取權」選項，**不用擔心**
   - 設定環境變數 `ALLOW_UNVERIFIED_PURCHASES=true` 即可
   - 系統會在開發模式下允許未驗證的購買，讓您可以繼續開發和測試

2. **生產環境必須完成設定**
   - 應用程式正式上線前，務必完成 Google Service Account 連結
   - 此時請聯絡 Google Play 開發者支援協助找到 API 存取權選項
   - 或者等到應用程式在 Play Store 上架後，API 存取權選項可能會自動出現

3. **設定環境變數時**
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`、`GOOGLE_PRIVATE_KEY` 可以先不設定
   - `GOOGLE_PACKAGE_NAME` 設定為 `com.tradefolio.app`（這個已知）
   - 設定 `ALLOW_UNVERIFIED_PURCHASES=true` 用於開發測試

## 步驟 5：測試資料庫連線

您可以使用 Supabase Dashboard 的 **Table Editor** 手動插入測試資料：

### 測試 purchases 表

```sql
INSERT INTO purchases (
  user_email,
  product_id,
  purchase_token,
  order_id,
  purchase_type,
  expires_at,
  is_active
) VALUES (
  'test@example.com',
  'tradefolio_lifetime',
  'test-token-123',
  'test-order-123',
  'lifetime',
  NULL,
  true
);
```

### 測試 authorized_users 表

```sql
INSERT INTO authorized_users (
  email,
  payment_status,
  payment_date,
  payment_amount,
  payment_method
) VALUES (
  'test@example.com',
  'paid',
  NOW(),
  2000.00,
  'manual'
);
```

## 資料表結構說明

### purchases 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵，自動產生 |
| user_email | TEXT | 用戶 Email（登錄用） |
| product_id | TEXT | 產品 ID（lifetime/monthly/yearly） |
| purchase_token | TEXT | Google Play 購買憑證（唯一） |
| order_id | TEXT | Google Play 訂單 ID（唯一） |
| purchase_type | TEXT | 購買類型（lifetime/subscription） |
| expires_at | TIMESTAMP | 訂閱到期時間（買斷為 NULL） |
| is_active | BOOLEAN | 是否啟用 |
| created_at | TIMESTAMP | 建立時間 |

### authorized_users 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵，自動產生 |
| email | TEXT | 用戶 Email（唯一） |
| payment_status | TEXT | 付款狀態（paid/pending/cancelled） |
| payment_date | TIMESTAMP | 付款日期 |
| payment_amount | NUMERIC | 付款金額 |
| payment_trade_no | TEXT | 交易編號 |
| payment_method | TEXT | 付款方式（manual/google_play/other） |
| created_at | TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | 更新時間 |

## 注意事項

1. **Row Level Security (RLS)** 已啟用，確保資料安全
2. **索引** 已建立，提升查詢效能
3. **唯一約束** 防止重複的購買記錄
4. **檢查約束** 確保資料完整性
5. 視圖 `active_members` 提供合併的會員列表

## 常見問題

### Q: 如何手動添加授權用戶？

A: 使用 SQL 或在 Table Editor 中插入記錄到 `authorized_users` 表：

```sql
INSERT INTO authorized_users (email, payment_status, payment_date, payment_method)
VALUES ('user@example.com', 'paid', NOW(), 'manual');
```

### Q: 如何取消訂閱？

A: 更新 `purchases` 表中的 `is_active` 欄位：

```sql
UPDATE purchases 
SET is_active = false 
WHERE user_email = 'user@example.com' AND product_id = 'tradefolio_monthly';
```

### Q: 如何查看有效會員列表？

A: 查詢視圖：

```sql
SELECT * FROM active_members;
```

或使用函數：

```sql
SELECT is_user_member('user@example.com');
```

