import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProfileAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const navigate = useNavigate()
  const { logout, user, token, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    email: '',
    mobile: '',
    department: '',
    position: ''
  })

  // 收集調試資訊
  useEffect(() => {
    const collectDebugInfo = () => {
      const debug = {
        useAuth: {
          user: user,
          token: token,
          isAuthenticated: isAuthenticated,
          authLoading: authLoading
        },
        localStorage: {
          auth_token: localStorage.getItem('auth_token'),
          user_data: localStorage.getItem('user_data'),
          auth: localStorage.getItem('auth'),
          last_auth_check: localStorage.getItem('last_auth_check')
        },
        timestamp: new Date().toISOString()
      }
      setDebugInfo(debug)
      console.log('🔍 調試資訊:', debug)
    }

    collectDebugInfo()
  }, [user, token, isAuthenticated, authLoading])

  // 載入用戶資料
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('🚀 開始載入用戶資料...')
        const response = await getUserProfileAPI()

        setFormData({
          name: response.data?.name || '',
          display_name: response.data?.display_name || '',
          email: response.data?.email || '',
          mobile: response.data?.mobile || '',
          department: response.data?.department || '',
          position: response.data?.position || ''
        })
      } catch (err) {
        console.error('❌ 載入用戶資料失敗:', err)
        console.log('❌ 錯誤詳細資訊:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText,
          errorType: err.errorType,
          fullMessage: err.fullMessage,
          originalError: err.originalError
        })

        // 檢查是否為認證錯誤（401, 403）
        if (err.status === 401 || err.status === 403) {
          console.log('🔒 認證錯誤，準備登出...')
          // 認證失敗，清除本地資料（路由守衛會自動處理重導向）
          await logout()
          return
        }

        // 檢查是否為網路連線失敗且有 token（可能是 token 過期）
        if (err.status === 0 && localStorage.getItem('auth_token')) {
          console.log('🔄 網路連線失敗但有 token，可能是認證過期，嘗試清除認證...')
          setError('認證可能已過期，請重新登入')
          setTimeout(async () => {
            await logout()
          }, 2000) // 2秒後自動跳轉
          return
        }

        // 其他錯誤（網路問題、伺服器錯誤、資料問題），顯示錯誤訊息
        console.log('⚠️  其他錯誤，顯示錯誤訊息')
        setError(`載入用戶資料失敗：${err.message} (狀態碼: ${err.status || '無'})`)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: 實作更新用戶資料 API
      console.log('Profile updated:', formData)
      setIsEditing(false)
    } catch (err) {
      console.error('更新用戶資料失敗:', err)
      setError('更新失敗，請稍後再試')
    } finally {
      setIsSaving(false)
    }
  }

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">個人資料</h1>
          <p className="text-base-content/70 mt-2">管理您的個人資訊</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">個人資料</h1>
          <p className="text-base-content/70 mt-2">管理您的個人資訊</p>
        </div>
        <div className="alert alert-error">
          <span>{error}</span>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => window.location.reload()}
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">個人資料</h1>
        <p className="text-base-content/70 mt-2">管理您的個人資訊</p>
      </div>

      {/* 調試資訊 */}
      {debugInfo && (
        <div className="mb-6">
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              🔍 調試資訊 (F5 重新整理檢查)
            </div>
            <div className="collapse-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold mb-2">useAuth 狀態:</h4>
                  <div className="bg-base-300 p-3 rounded text-sm">
                    <div>isAuthenticated: <span className={debugInfo.useAuth.isAuthenticated ? 'text-success' : 'text-error'}>{debugInfo.useAuth.isAuthenticated ? '✅ true' : '❌ false'}</span></div>
                    <div>authLoading: <span className={debugInfo.useAuth.authLoading ? 'text-warning' : 'text-success'}>{debugInfo.useAuth.authLoading ? '⏳ true' : '✅ false'}</span></div>
                    <div>user: {debugInfo.useAuth.user ? '✅ 存在' : '❌ null'}</div>
                    <div>token: {debugInfo.useAuth.token ? '✅ 存在' : '❌ null'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2">localStorage:</h4>
                  <div className="bg-base-300 p-3 rounded text-sm">
                    <div>auth_token: {debugInfo.localStorage.auth_token ? '✅ 存在' : '❌ 無'}</div>
                    <div>user_data: {debugInfo.localStorage.user_data ? '✅ 存在' : '❌ 無'}</div>
                    <div>auth: {debugInfo.localStorage.auth || '❌ 無'}</div>
                    <div>last_auth_check: {debugInfo.localStorage.last_auth_check ? new Date(parseInt(debugInfo.localStorage.last_auth_check)).toLocaleString() : '❌ 無'}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-base-content/50">檢查時間: {debugInfo.timestamp}</div>
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn btn-sm btn-error"
                    onClick={async () => {
                      console.log('🧪 手動清除認證資料進行測試...')
                      await logout()
                    }}
                  >
                    🧪 清除認證測試跳轉
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => {
                      localStorage.clear()
                      window.location.reload()
                    }}
                  >
                    🗑️ 清空 localStorage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 個人資料卡片 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <h2 className="card-title">基本資料</h2>
                {!isEditing ? (
                  <button
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    編輯
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsEditing(false)}
                    >
                      取消
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving && <span className="loading loading-spinner loading-xs"></span>}
                      儲存
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">姓名</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.name}</div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">公開名稱</span>
                    <span className="label-text-alt text-base-content/50">其他用戶看到的名稱</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="display_name"
                      className="input input-bordered"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      placeholder="輸入公開顯示的名稱"
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">
                      {formData.display_name || '未設定'}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">手機號碼</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="mobile"
                      className="input input-bordered"
                      value={formData.mobile}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.mobile}</div>
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">電子郵件</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      className="input input-bordered"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.email}</div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">部門</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      className="input input-bordered"
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.department}</div>
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">職位</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="position"
                      className="input input-bordered"
                      value={formData.position}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.position}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 密碼變更 */}
        <div>
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h3 className="card-title text-lg">安全設定</h3>
              <div className="space-y-3">
                <button
                  className="btn btn-outline w-full"
                  onClick={() => navigate('/change-password')}
                >
                  🔒 變更密碼
                </button>
                <button className="btn btn-outline w-full">
                  📱 雙因子驗證
                </button>
                <button className="btn btn-outline w-full">
                  🔑 API 金鑰
                </button>
              </div>
            </div>
          </div>

          {/* 帳戶狀態 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">帳戶狀態</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>帳戶狀態</span>
                  <div className="badge badge-success">正常</div>
                </div>
                <div className="flex justify-between items-center">
                  <span>最後登入</span>
                  <span className="text-sm text-base-content/70">2 小時前</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>建立時間</span>
                  <span className="text-sm text-base-content/70">2023-01-15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}