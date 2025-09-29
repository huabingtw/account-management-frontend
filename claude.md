# 帳號管理中心前端專案

## 專案概述
- **專案名稱**: 帳號管理中心前端 (Account Management Center Frontend)
- **位置**: D:\Codes\PHP\DTSCorp\accounts.huabing.tw\htdocs\frontend
- **技術棧**: React + DaisyUI + Tailwind CSS
- **架構**: 前後端分離，採用 OpenCart 風格設計模式

## 系統架構

### 技術選型
- **React**: 主要前端框架
- **DaisyUI + Tailwind CSS**: UI 組件庫和樣式系統
- **React Router**: 前端路由管理
- **Vite**: 開發伺服器和建構工具

### 核心功能模組
1. **用戶基本資料管理**
   - Email (登入帳號)
   - 手機號碼、姓名、密碼
   - 個人資料編輯

2. **系統管理功能** (SysAdmin)
   - 權限定義管理
   - 角色管理
   - 參數設定
   - 關聯系統管理
   - 擴充欄位管理

3. **安全管理**
   - 多裝置安全管理
   - 二次驗證機制 (2FA)
   - 信任裝置管理

## OpenCart 風格設計規範

### 列表頁設計標準

#### **佈局結構**
```
┌─────────────────────────────────────────────────────────────┐
│ 頁面標題 + 麵包屑                                              │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐  ┌─────────────────────────────────┐ │
│ │                      │  │ 篩選面板                          │ │
│ │                      │  │ ┌─────────────────────────────┐ │ │
│ │                      │  │ │ 每頁顯示選單                  │ │ │
│ │                      │  │ └─────────────────────────────┘ │ │
│ │                      │  │ ┌─────────────────────────────┐ │ │
│ │      資料列表          │  │ │ 篩選條件                    │ │ │
│ │                      │  │ │ - filter_code               │ │ │
│ │   ┌──────────────┐   │  │ │ - filter_name               │ │ │
│ │   │ 標題列 + 新增  │   │  │ │ - filter_description        │ │ │
│ │   │   + 每頁選單   │   │  │ └─────────────────────────────┘ │ │
│ │   └──────────────┘   │  │ ┌─────────────────────────────┐ │ │
│ │   ┌──────────────┐   │  │ │ [查詢] [清除]                │ │ │
│ │   │   資料表格     │   │  │ └─────────────────────────────┘ │ │
│ │   └──────────────┘   │  └─────────────────────────────────┘ │
│ │   ┌──────────────┐   │                                     │
│ │   │   分頁控制     │   │                                     │
│ │   └──────────────┘   │                                     │
│ │                      │                                     │
│ └──────────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

#### **必備功能元件**
1. **右上角每頁顯示選單**
   ```jsx
   <select
     className="select select-bordered select-sm w-auto"
     value={perPage}
     onChange={(e) => setPerPage(parseInt(e.target.value))}
   >
     <option value={10}>10 筆</option>
     <option value={25}>25 筆</option>
     <option value={50}>50 筆</option>
     <option value={100}>100 筆</option>
   </select>
   ```

2. **右側篩選面板** (lg:col-span-1, 桌面版永遠顯示，手機版可收合)
   - 篩選條件輸入欄位
   - 底部等寬按鈕組

3. **篩選按鈕組**
   ```jsx
   <div className="flex gap-2">
     <button className="btn btn-primary flex-1 btn-sm" onClick={handleSearch}>
       查詢
     </button>
     <button className="btn btn-ghost flex-1 btn-sm" onClick={handleClear}>
       清除
     </button>
   </div>
   ```

#### **AJAX 查詢機制**
- 使用 `formHandler.js` 處理 AJAX 請求
- 查詢時只更新列表區域，不重新載入整頁
- 支援 URL 參數同步 (page, limit, filter_*)
- 保持篩選狀態和分頁狀態

### 編輯頁設計標準

#### **佈局結構**
```
┌─────────────────────────────────────────────────────────────┐
│ ← 返回列表 + 頁面標題 + 麵包屑                                  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐  ┌─────────────────────────────────┐ │
│ │                      │  │ 側邊欄資訊                        │ │
│ │                      │  │ ┌─────────────────────────────┐ │ │
│ │                      │  │ │ 資料摘要                      │ │ │
│ │      主要表單          │  │ │ - ID, 建立時間, 更新時間     │ │ │
│ │                      │  │ └─────────────────────────────┘ │ │
│ │   ┌──────────────┐   │  │ ┌─────────────────────────────┐ │ │
│ │   │   表單欄位    │   │  │ │ 操作提示                      │ │ │
│ │   │              │   │  │ │ - 使用說明                   │ │ │
│ │   │              │   │  │ │ - 注意事項                   │ │ │
│ │   └──────────────┘   │  │ └─────────────────────────────┘ │ │
│ │   ┌──────────────┐   │  │ ┌─────────────────────────────┐ │ │
│ │   │ [取消][送出]  │   │  │ │ 其他相關資訊                  │ │ │
│ │   └──────────────┘   │  │ │ (如：JSON 預覽)              │ │ │
│ │                      │  │ └─────────────────────────────┘ │ │
│ └──────────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### **OpenCart 風格表單處理**
1. **AJAX 提交機制**
   - 使用 `formHandler.js` 統一處理
   - 提交後留在編輯頁，不跳轉到列表
   - 新增成功後自動切換到編輯模式，URL 更新

2. **右上角通知系統**
   ```jsx
   // 使用 formHandler 自動管理通知
   import { useFormHandler } from '../../utils/formHandler'

   const formHandler = useFormHandler({
     stayOnPage: true,
     autoNotify: true
   })
   ```

3. **按鈕載入狀態**
   - 提交時自動顯示載入動畫
   - 防止重複提交
   - 成功後恢復正常狀態

## 核心工具和元件

### formHandler.js 使用規範

#### **列表頁 AJAX 查詢**
```jsx
// 不直接使用 formHandler 查詢，而是使用現有的 API 服務
import { getSystemsAPI } from '../../services/api'

const loadData = async () => {
  try {
    setLoading(true)
    const response = await getSystemsAPI(currentPage, perPage, filters.filter_code, filters.filter_name)
    if (response.success) {
      setData(response.data.data)
      setPagination(response.data.pagination)
    }
  } catch (error) {
    window.notifications.error('載入失敗: ' + error.message)
  } finally {
    setLoading(false)
  }
}
```

#### **編輯頁表單提交**
```jsx
import { useFormHandler } from '../../utils/formHandler'

const formHandler = useFormHandler({
  stayOnPage: true,      // OpenCart 風格：留在頁面
  autoNotify: true       // 自動顯示通知
})

const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    await formHandler.submitForm(formRef.current, {
      url: isEditing ? `/sys-admin/systems/${id}` : '/sys-admin/systems',
      method: isEditing ? 'PUT' : 'POST',
      onSuccess: async (response) => {
        // 新增成功後切換到編輯模式
        if (!isEditing && response.data?.id) {
          setCurrentId(response.data.id.toString())
          await loadData(response.data.id)
        }
      }
    })
  } catch (err) {
    console.error('Submit error:', err)
  }
}
```

### 通知系統規範

#### **DaisyUI Toast 通知**
- 成功：綠色 toast，3秒自動消失
- 錯誤：紅色 toast，5秒自動消失
- 警告：黃色 toast，4秒自動消失
- 右上角顯示，可手動關閉

#### **使用方式**
```jsx
// 全域通知 (formHandler 自動處理)
window.notifications.success('操作成功')
window.notifications.error('操作失敗')

// 或直接 import
import { notifications } from '../../utils/formHandler'
notifications.warning('注意事項')
```

## 檔案結構規範

### 頁面組織
```
src/pages/
├── Dashboard.jsx               # 儀表板
├── Profile.jsx                 # 個人資料
├── SysAdmin/                   # 系統管理功能
│   ├── RolePermission/         # 角色權限管理
│   │   ├── Permissions.jsx     # 權限定義列表
│   │   ├── PermissionEdit.jsx  # 權限定義編輯
│   │   ├── Roles.jsx           # 角色管理列表
│   │   └── RoleEdit.jsx        # 角色管理編輯
│   ├── Systems.jsx             # 關聯系統列表
│   ├── SystemEdit.jsx          # 關聯系統編輯
│   ├── Settings.jsx            # 參數設定列表
│   ├── SettingEdit.jsx         # 參數設定編輯
│   └── MetaKeys.jsx            # 擴充欄位管理
└── ...                         # 其他頁面
```

### 工具模組
```
src/utils/
├── formHandler.js            # OpenCart 風格表單處理器
└── ...                      # 其他工具

src/services/
├── api.js                   # API 服務函數
└── ...                     # 其他服務

src/hooks/
├── useAuth.jsx             # 認證 Hook
└── ...                     # 其他 Hooks
```

## 路由規範

### URL 設計模式
```
/sys-admin/systems              # 關聯系統列表
/sys-admin/systems/create       # 新增關聯系統
/sys-admin/systems/{id}         # 編輯關聯系統

/sys-admin/settings             # 參數設定列表
/sys-admin/settings/create      # 新增參數設定
/sys-admin/settings/{id}        # 編輯參數設定

/sys-admin/role-permission/permissions    # 權限定義列表 (新路徑)
/sys-admin/role-permission/permissions/{id} # 編輯權限定義
```

### 查詢參數規範
- `page`: 當前頁碼
- `limit`: 每頁筆數
- `filter_*`: 篩選條件 (以 filter_ 開頭)

## 開發準則

### 新功能開發流程
1. **列表頁面**
   - 參考現有的 `Systems.jsx` 或 `Settings.jsx`
   - 必須包含：右上角每頁選單、右側篩選面板、查詢/清除按鈕
   - 使用 AJAX 更新列表，不重新載入頁面

2. **編輯頁面**
   - 參考現有的 `SystemEdit.jsx` 或 `SettingEdit.jsx`
   - 使用 `useFormHandler` 處理表單提交
   - OpenCart 風格：提交後留在頁面，右上角顯示通知

3. **API 整合**
   - 在 `services/api.js` 中定義 API 函數
   - 遵循 RESTful 設計模式
   - 支援分頁和篩選參數

4. **路由配置**
   - 在 `App.jsx` 中添加路由
   - 使用 `AuthenticatedGuard` 控制權限
   - super_admin 專用功能放在 `/sys-admin/` 路徑下

### 程式碼風格
- 使用 ES6+ 語法
- 組件採用函數式組件 + Hooks
- 保持檔案結構清晰，單一職責原則
- 註解說明複雜邏輯
- 統一使用 DaisyUI 組件和 Tailwind CSS 樣式

---
*此檔案記錄前端專案的設計規範和開發準則，所有新功能開發都應遵循此標準*