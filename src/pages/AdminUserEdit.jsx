import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getAdminUserAPI,
  updateAdminUserAPI,
  resetAdminUserPasswordAPI,
  assignRoleToUserAPI,
  manageUserSystemsAPI,
  manageUser2FAAPI,
  getAdminRolesAPI,
  getAdminSystemsAPI
} from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function AdminUserEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // 角色和系統資料
  const [roles, setRoles] = useState([])
  const [systems, setSystems] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedSystems, setSelectedSystems] = useState([])

  // 檢查用戶是否有編輯權限（super_admin 和 admin 可以編輯）
  const canEdit = currentUser?.roles?.some(role => ['super_admin', 'admin'].includes(role)) || false

  // 生成返回列表的 URL，保留查詢參數
  const getReturnUrl = () => {
    const returnParams = new URLSearchParams()

    // 保留分頁參數
    if (searchParams.get('page')) {
      returnParams.set('page', searchParams.get('page'))
    }
    if (searchParams.get('per_page')) {
      returnParams.set('per_page', searchParams.get('per_page'))
    }

    // 保留篩選參數
    if (searchParams.get('filter_name')) {
      returnParams.set('filter_name', searchParams.get('filter_name'))
    }
    if (searchParams.get('filter_email')) {
      returnParams.set('filter_email', searchParams.get('filter_email'))
    }
    if (searchParams.get('filter_mobile')) {
      returnParams.set('filter_mobile', searchParams.get('filter_mobile'))
    }
    if (searchParams.get('role')) {
      returnParams.set('role', searchParams.get('role'))
    }
    if (searchParams.get('two_factor_enabled')) {
      returnParams.set('two_factor_enabled', searchParams.get('two_factor_enabled'))
    }

    const queryString = returnParams.toString()
    return queryString ? `/admin/users?${queryString}` : '/admin/users'
  }
  const isReadOnly = !canEdit

  // 表單資料
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    display_name: '',
    mobile: '',
    two_factor_enabled: false
  })

  // 密碼重設
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    new_password_confirmation: ''
  })

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 並行載入使用者、角色和系統資料
      const [userResponse, rolesResponse, systemsResponse] = await Promise.all([
        getAdminUserAPI(id),
        getAdminRolesAPI(),
        getAdminSystemsAPI()
      ])

      if (userResponse.success) {
        const userData = userResponse.data
        setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          display_name: userData.display_name || '',
          mobile: userData.mobile || '',
          two_factor_enabled: userData.two_factor_enabled || false
        })

        // 設定使用者目前的角色 (單一角色)
        if (userData.roles && userData.roles.length > 0) {
          setSelectedRole(userData.roles[0].id.toString())
        }

        // 設定使用者目前的系統權限
        if (userData.systems && userData.systems.length > 0) {
          setSelectedSystems(userData.systems.map(system => system.id.toString()))
        }
      }

      // 載入角色列表
      if (rolesResponse.success) {
        // 處理可能的分頁資料格式
        const rolesData = rolesResponse.data.data || rolesResponse.data
        setRoles(Array.isArray(rolesData) ? rolesData : [])
      }

      // 載入系統列表
      if (systemsResponse.success) {
        // 處理可能的分頁資料格式
        const systemsData = systemsResponse.data.data || systemsResponse.data
        setSystems(Array.isArray(systemsData) ? systemsData : [])
      }
    } catch (err) {
      setError(err.message || '載入使用者資料失敗')
      console.error('Load user error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadInitialData()
    }
  }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 處理角色變更 (單一角色)
  const handleRoleChange = async (roleId) => {
    if (!canEdit) return

    try {
      setSaving(true)
      setError(null)

      const response = await assignRoleToUserAPI(id, roleId)
      if (response.success) {
        setSelectedRole(roleId)
        setSuccess('角色更新成功')
        // 重新載入用戶資料以反映變更
        setTimeout(() => loadInitialData(), 1000)
      }
    } catch (err) {
      setError(err.message || '角色更新失敗')
      console.error('Assign role error:', err)
    } finally {
      setSaving(false)
    }
  }

  // 處理系統權限變更
  const handleSystemsChange = async (systemIds) => {
    if (!canEdit) return

    try {
      setSaving(true)
      setError(null)

      const response = await manageUserSystemsAPI(id, systemIds)
      if (response.success) {
        setSelectedSystems(systemIds)
        setSuccess('系統權限更新成功')
      }
    } catch (err) {
      setError(err.message || '系統權限更新失敗')
      console.error('Manage systems error:', err)
    } finally {
      setSaving(false)
    }
  }

  // 處理 2FA 設定變更
  const handle2FAChange = async (enabled) => {
    if (!canEdit) return

    try {
      setSaving(true)
      setError(null)

      const response = await manageUser2FAAPI(id, enabled)
      if (response.success) {
        setFormData(prev => ({ ...prev, two_factor_enabled: enabled }))
        setSuccess('2FA 設定更新成功')
      }
    } catch (err) {
      setError(err.message || '2FA 設定更新失敗')
      console.error('Manage 2FA error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await updateAdminUserAPI(id, formData)

      if (response.success) {
        setSuccess('使用者資料更新成功')
        setUser(response.data)
      }
    } catch (err) {
      setError(err.message || '更新使用者資料失敗')
      console.error('Update user error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('新密碼與確認密碼不符')
      return
    }

    if (passwordData.new_password.length < 8) {
      setError('密碼長度至少需要 8 個字元')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await resetAdminUserPasswordAPI(
        id,
        passwordData.new_password,
        passwordData.new_password_confirmation
      )

      if (response.success) {
        setSuccess('密碼重設成功')
        setPasswordData({ new_password: '', new_password_confirmation: '' })
        setShowPasswordReset(false)
      }
    } catch (err) {
      setError(err.message || '密碼重設失敗')
      console.error('Reset password error:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-TW')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-96">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <button className="btn btn-primary mt-4" onClick={() => navigate(getReturnUrl())}>
          回到使用者列表
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(getReturnUrl())}
          >
            ← 返回列表
          </button>
          <h1 className="text-3xl font-bold text-base-content">
            {canEdit ? '編輯使用者' : '查看使用者'}
          </h1>
        </div>
        <p className="text-base-content/70">
          {canEdit ? '修改使用者帳號資訊與設定' : '查看使用者帳號資訊與設定'}
        </p>
      </div>

      {/* 訊息顯示 */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 使用者基本資訊 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">基本資料</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 姓名 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 姓名</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="name"
                      className={`input input-bordered w-full ${isReadOnly ? 'input-disabled' : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                {/* 信箱 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 信箱</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="email"
                      name="email"
                      className={`input input-bordered w-full ${isReadOnly ? 'input-disabled' : ''}`}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                {/* 顯示名稱 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text">顯示名稱</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="display_name"
                      className={`input input-bordered w-full ${isReadOnly ? 'input-disabled' : ''}`}
                      value={formData.display_name}
                      onChange={handleInputChange}
                      placeholder="選填，用於顯示的名稱"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                {/* 手機 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text">手機</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="tel"
                      name="mobile"
                      className={`input input-bordered w-full ${isReadOnly ? 'input-disabled' : ''}`}
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="選填"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                {/* 安全設定 */}
                <div className="divider">安全設定</div>

                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text">啟用雙因子驗證 (2FA)</span>
                  </div>
                  <div className="col-span-9">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={formData.two_factor_enabled}
                        onChange={(e) => handle2FAChange(e.target.checked)}
                        disabled={isReadOnly}
                      />
                      <div className="text-xs text-base-content/70">
                        管理員控制此使用者是否必須使用雙因子驗證
                      </div>
                    </div>
                  </div>
                </div>

                {/* 角色管理 */}
                <div className="divider">角色與權限</div>

                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 使用者角色</span>
                  </div>
                  <div className="col-span-9">
                    <select
                      className={`select select-bordered w-full ${isReadOnly ? 'select-disabled' : ''}`}
                      value={selectedRole}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      disabled={isReadOnly}
                    >
                      <option value="">請選擇角色</option>
                      {Array.isArray(roles) && roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.display_name}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-base-content/70 mt-1">
                      每個使用者只能有一個角色
                    </div>
                  </div>
                </div>

                {/* 系統權限管理 */}
                <div className="grid grid-cols-12 items-start gap-4">
                  <div className="col-span-3 text-right pt-3">
                    <span className="label-text">可存取系統</span>
                  </div>
                  <div className="col-span-9">
                    <div className="space-y-2">
                      {Array.isArray(systems) && systems.map(system => (
                        <label key={system.id} className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={selectedSystems.includes(system.id.toString())}
                            onChange={(e) => {
                              const systemId = system.id.toString()
                              const newSystems = e.target.checked
                                ? [...selectedSystems, systemId]
                                : selectedSystems.filter(id => id !== systemId)
                              handleSystemsChange(newSystems)
                            }}
                            disabled={isReadOnly}
                          />
                          <div>
                            <div className="font-medium">{system.name}</div>
                            {system.description && (
                              <div className="text-xs text-base-content/70">{system.description}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="text-xs text-base-content/70 mt-1">
                      選擇使用者可以存取的系統
                    </div>
                  </div>
                </div>

                {/* 提交按鈕 */}
                <div className="card-actions justify-end pt-4">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate('/admin/users')}
                  >
                    {canEdit ? '取消' : '返回'}
                  </button>
                  {canEdit && (
                    <button
                      type="submit"
                      className={`btn btn-primary ${saving ? 'loading' : ''}`}
                      disabled={saving}
                    >
                      {saving ? '儲存中...' : '儲存變更'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 側邊欄資訊 */}
        <div className="space-y-6">
          {/* 使用者摘要 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">使用者摘要</h3>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-base-content/70">用戶 ID</div>
                  <div className="font-mono text-xs">{user?.id}</div>
                </div>

                <div>
                  <div className="text-sm text-base-content/70">註冊時間</div>
                  <div className="text-sm">{formatDate(user?.created_at)}</div>
                </div>

                <div>
                  <div className="text-sm text-base-content/70">最後更新</div>
                  <div className="text-sm">{formatDate(user?.updated_at)}</div>
                </div>

                <div>
                  <div className="text-sm text-base-content/70">目前角色</div>
                  <div className="text-sm">
                    {user?.roles && user.roles.length > 0 ? (
                      <span className="badge badge-primary badge-sm">
                        {user.roles[0].display_name}
                      </span>
                    ) : (
                      <span className="text-base-content/50">無角色</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-base-content/70">可存取系統</div>
                  <div className="text-sm">
                    {user?.systems && user.systems.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.systems.map(system => (
                          <span key={system.id} className="badge badge-outline badge-xs">
                            {system.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-base-content/50">無系統權限</span>
                    )}
                  </div>
                </div>

                {user?.last_two_factor_at && (
                  <div>
                    <div className="text-sm text-base-content/70">最後 2FA 驗證</div>
                    <div className="text-sm">{formatDate(user.last_two_factor_at)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 密碼管理 */}
          {canEdit && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">密碼管理</h3>

                {!showPasswordReset ? (
                <div>
                  <p className="text-sm text-base-content/70 mb-4">
                    為使用者重設密碼。新密碼將立即生效。
                  </p>
                  <button
                    className="btn btn-warning btn-sm w-full"
                    onClick={() => setShowPasswordReset(true)}
                  >
                    🔑 重設密碼
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">新密碼</span>
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      className="input input-bordered input-sm"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                      placeholder="至少 8 個字元"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">確認新密碼</span>
                    </label>
                    <input
                      type="password"
                      name="new_password_confirmation"
                      className="input input-bordered input-sm"
                      value={passwordData.new_password_confirmation}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                      placeholder="再次輸入新密碼"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm flex-1"
                      onClick={() => {
                        setShowPasswordReset(false)
                        setPasswordData({ new_password: '', new_password_confirmation: '' })
                      }}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className={`btn btn-warning btn-sm flex-1 ${saving ? 'loading' : ''}`}
                      disabled={saving}
                    >
                      {saving ? '重設中...' : '確認重設'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}