# 帳號管理中心

類似 Atlassian 的統一帳號管理系統，支援多系統 SSO 與安全管理。

## 🚀 技術棧

- **前端**: React + DaisyUI + Tailwind CSS
- **建構工具**: Vite
- **架構**: 前後端分離

## 🔧 環境設定

### 環境配置文件

```
.env.local           # 本地 Apache 環境
.env.development     # 遠端開發環境
.env.production      # 正式環境
```

### API 端點對應

| 環境 | API 端點 | 描述 |
|------|----------|------|
| 本地環境 | `https://account.huabing.test/api` | 本地 Apache 伺服器 |
| 開發環境 | `https://account-dev.huabing.tw/api` | 遠端開發伺服器 |
| 正式環境 | `https://account.huabing.tw/api` | 正式生產伺服器 |

## 📋 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式（環境切換指令）

```bash
# 本地環境（Apache 伺服器）- 最常用
npm run dev:local

# 開發環境（遠端開發伺服器）
npm run dev:development

# 正式環境預覽
npm run dev:production
```

### 打包部署

```bash
# 開發環境打包
npm run build:development

# 正式環境打包
npm run build:production
```

### 預覽打包結果

```bash
npm run preview
```

## 🔑 功能特色

### 核心功能
- ✅ 用戶基本資料管理（Email、手機、姓名、密碼）
- ✅ 系統授權管理（POS、HRM 等系統存取控制）
- ✅ Google OAuth 整合
- 🚧 統一身份驗證 (SSO)

### 安全功能
- 🚧 裝置識別與記錄
- 🚧 新裝置登入檢測
- 🚧 二次驗證機制 (Email/SMS)
- 🚧 信任裝置管理
- 🚧 多因子驗證 (MFA)

## 🌐 環境變數說明

### 必要環境變數

```env
VITE_API_BASE_URL=         # API 基礎路徑
VITE_GOOGLE_CLIENT_ID=     # Google OAuth Client ID
VITE_APP_ENV=              # 環境識別
VITE_DEBUG_MODE=           # 調試模式
VITE_API_TIMEOUT=          # API 請求超時時間
```

### 本地開發設定

如需自訂本地設定，複製並修改：

```bash
cp .env.local.example .env.local
```

## 📁 專案結構

```
src/
├── components/         # React 組件
├── pages/             # 頁面組件
├── services/          # API 服務
├── hooks/             # React Hooks
└── styles/            # 樣式文件
```

## 🛠️ 開發提示

- 使用 `npm run dev:local` 連接本地 Apache 後端
- 開發時建議開啟 `VITE_DEBUG_MODE=true` 查看 API 請求日誌
- SSL 證書文件 (`*.pem`) 已加入 `.gitignore`

## 🔒 安全注意事項

- 🚫 不要提交 `.env.local` 文件
- 🚫 不要在程式碼中硬編碼 API 金鑰
- ✅ 生產環境務必關閉 `VITE_DEBUG_MODE`

## 📞 支援

如有問題請聯繫開發團隊或查看專案文檔。