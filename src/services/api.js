// API 基礎配置
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  const hostname = window.location.hostname
  const protocol = window.location.protocol

  // 本機開發環境
  if (hostname === 'accounts.huabing.test') {
    // 如果 Apache 在不同端口，請修改這裡的端口號
    return 'https://accounts.huabing.test/api'  // 或者 :8443 等你 Apache 的實際端口
  }

  // 其他環境直接使用當前域名 + /api
  return `${protocol}//${hostname}/api`
}

const API_BASE_URL = getApiBaseUrl()
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true'

// API 請求基礎函數
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  }

  // 如果存在 token，加入 Authorization header
  const token = localStorage.getItem('auth_token')
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  }

  // 創建帶有超時的 AbortController
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)
  config.signal = controller.signal

  try {
    if (DEBUG_MODE) {
      console.log(`API Request: ${config.method || 'GET'} ${url}`, config)
    }

    const response = await fetch(url, config)
    clearTimeout(timeoutId)

    // 檢查是否為 CORS 錯誤
    if (response.type === 'opaque' || response.type === 'opaqueredirect') {
      throw new Error('CORS policy blocked this request')
    }

    const data = await response.json()

    if (DEBUG_MODE) {
      console.log(`API Response: ${response.status}`, data)
    }

    if (!response.ok) {
      // 處理 401 Unauthenticated 錯誤
      if (response.status === 401) {
        // 清除本地存儲的認證資料
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')

        // 如果不是在登入頁面，則重定向到登入頁面
        if (!window.location.pathname.includes('/login')) {
          console.warn('Authentication token expired, redirecting to login page')
          window.location.href = '/login'
          return // 防止繼續執行
        }
      }

      const error = new Error(data.message || '請求失敗')
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)

    console.error('API Request Error Details:', {
      url,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    })

    if (error.name === 'AbortError') {
      console.error('API Request Timeout:', url)
      const timeoutError = new Error('請求超時')
      timeoutError.status = 408
      throw timeoutError
    }

    // 如果錯誤已經有 status（來自 response.ok 檢查），直接拋出
    if (error.status) {
      throw error
    }

    // 網路錯誤或其他未知錯誤
    console.error('API Request Error:', error)

    // 分析錯誤類型
    let errorMessage = '網路連線失敗'
    if (error.name === 'TypeError') {
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'SSL 證書或網路連線問題 - 請檢查 https://accounts.huabing.test 的證書是否被瀏覽器信任'
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS 跨域請求失敗'
      } else if (error.message.includes('certificate') || error.message.includes('SSL')) {
        errorMessage = 'SSL 證書驗證失敗'
      }
    }

    const networkError = new Error(errorMessage)
    networkError.status = 0
    networkError.originalError = error
    networkError.errorType = error.name
    networkError.fullMessage = error.message
    throw networkError
  }
}

// 登入 API
export const loginAPI = async (email, password) => {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      system_code: 'account',
      client_code: 'account-frontend',
    }),
  })
}

// 登出 API
export const logoutAPI = async () => {
  return apiRequest('/logout', {
    method: 'POST',
  })
}

// 獲取用戶資訊 API
export const getUserAPI = async () => {
  return apiRequest('/user')
}

// 獲取用戶個人資料 API
export const getUserProfileAPI = async () => {
  return apiRequest('/user/profile')
}

// Google 登入 API
export const googleLoginAPI = async (googleToken) => {
  return apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      credential: googleToken,
    }),
  })
}

// 變更密碼 API (簡化版，不需要 2FA 驗證碼)
export const changePasswordAPI = async (currentPassword, newPassword, confirmPassword) => {
  return apiRequest('/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    }),
  })
}

// 忘記密碼 API
export const forgotPasswordAPI = async (email) => {
  return apiRequest('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  })
}

// 重設密碼 API
export const resetPasswordAPI = async (token, email, password, passwordConfirmation) => {
  return apiRequest('/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  })
}

// ============ 2FA 相關 API ============

// 發送 2FA 驗證碼
export const send2FACodeAPI = async (type, deviceId = null, metadata = {}) => {
  return apiRequest('/2fa/send-code', {
    method: 'POST',
    body: JSON.stringify({
      type,
      device_id: deviceId,
      metadata,
    }),
  })
}

// 驗證 2FA 驗證碼
export const verify2FACodeAPI = async (verificationId, code) => {
  return apiRequest('/2fa/verify-code', {
    method: 'POST',
    body: JSON.stringify({
      verification_id: verificationId,
      code,
    }),
  })
}

// 檢查 2FA 狀態
export const check2FAStatusAPI = async (deviceId = null) => {
  const params = deviceId ? `?device_id=${deviceId}` : ''
  return apiRequest(`/2fa/status${params}`)
}

// 啟用/停用 2FA
export const toggle2FAAPI = async (enabled, verificationCode = null) => {
  return apiRequest('/2fa/toggle', {
    method: 'POST',
    body: JSON.stringify({
      enabled,
      verification_code: verificationCode,
    }),
  })
}

// 完成 2FA 登入
export const complete2FALoginAPI = async (verificationId, code) => {
  return apiRequest('/complete-2fa-login', {
    method: 'POST',
    body: JSON.stringify({
      verification_id: verificationId,
      code,
    }),
  })
}

// ============ 裝置管理 API ============

// 取得裝置列表
export const getDevicesAPI = async () => {
  return apiRequest('/devices')
}

// 設為信任裝置
export const trustDeviceAPI = async (deviceId) => {
  return apiRequest(`/devices/${deviceId}/trust`, {
    method: 'POST',
  })
}

// 移除信任狀態
export const removeTrustDeviceAPI = async (deviceId) => {
  return apiRequest(`/devices/${deviceId}/trust`, {
    method: 'DELETE',
  })
}

// 撤銷裝置
export const revokeDeviceAPI = async (deviceId) => {
  return apiRequest(`/devices/${deviceId}`, {
    method: 'DELETE',
  })
}

// 撤銷其他裝置
export const revokeOtherDevicesAPI = async () => {
  return apiRequest('/devices/revoke-others', {
    method: 'POST',
  })
}

// 更新裝置名稱
export const updateDeviceNameAPI = async (deviceId, deviceName) => {
  return apiRequest(`/devices/${deviceId}/name`, {
    method: 'PUT',
    body: JSON.stringify({
      device_name: deviceName,
    }),
  })
}

// ============ 管理員功能 API ============

// 取得使用者列表 (分頁)
export const getAdminUsersAPI = async (page = 1, perPage = 15, search = '', filterParams = '') => {
  // 參考 OpenCart 的做法，建構基本查詢字串
  let url = `page=${page}&per_page=${perPage}`

  // 舊式搜尋參數（向下相容）
  if (search) {
    url += '&search=' + encodeURIComponent(search)
  }

  // 添加 filter 參數（以 & 開頭的字串）
  if (filterParams) {
    url += filterParams
  }

  return apiRequest(`/admin/users?${url}`)
}

// 取得指定使用者詳細資料
export const getAdminUserAPI = async (id) => {
  return apiRequest(`/admin/users/${id}`)
}

// 更新指定使用者資料
export const updateAdminUserAPI = async (id, userData) => {
  return apiRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  })
}

// 刪除指定使用者
export const deleteAdminUserAPI = async (id) => {
  return apiRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  })
}

// 重設指定使用者密碼
export const resetAdminUserPasswordAPI = async (id, newPassword, confirmPassword) => {
  return apiRequest(`/admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    }),
  })
}

// 分配角色給使用者 (單一角色)
export const assignRoleToUserAPI = async (id, roleId) => {
  return apiRequest(`/admin/users/${id}/assign-role`, {
    method: 'POST',
    body: JSON.stringify({
      role_id: roleId,
    }),
  })
}

// 管理使用者系統權限
export const manageUserSystemsAPI = async (id, systemIds) => {
  return apiRequest(`/admin/users/${id}/manage-systems`, {
    method: 'POST',
    body: JSON.stringify({
      systems: systemIds,
    }),
  })
}

// 管理使用者 2FA 設定
export const manageUser2FAAPI = async (id, enabled, resetTrustedDevices = false) => {
  return apiRequest(`/admin/users/${id}/manage-2fa`, {
    method: 'POST',
    body: JSON.stringify({
      two_factor_enabled: enabled,
      reset_trusted_devices: resetTrustedDevices,
    }),
  })
}

// 取得系統列表
export const getAdminSystemsAPI = async () => {
  return apiRequest('/admin/systems')
}

// ============ 角色管理 API ============

// 取得角色列表 (分頁)
export const getAdminRolesAPI = async (page = 1, perPage = 10, search = '', filterParams = '') => {
  // 參考 OpenCart 的做法，建構基本查詢字串
  let url = `page=${page}&limit=${perPage}`

  // 舊式搜尋參數（向下相容）
  if (search) {
    url += '&search=' + encodeURIComponent(search)
  }

  // 添加 filter 參數（以 & 開頭的字串）
  if (filterParams) {
    url += filterParams
  }

  return apiRequest(`/sys-admin/role-permission/roles?${url}`)
}

// 取得指定角色詳細資料
export const getAdminRoleAPI = async (id) => {
  return apiRequest(`/sys-admin/role-permission/roles/${id}`)
}

// 建立新角色
export const createAdminRoleAPI = async (roleData) => {
  return apiRequest('/sys-admin/role-permission/roles', {
    method: 'POST',
    body: JSON.stringify(roleData),
  })
}

// 更新指定角色資料
export const updateAdminRoleAPI = async (id, roleData) => {
  return apiRequest(`/sys-admin/role-permission/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(roleData),
  })
}

// 刪除指定角色
export const deleteAdminRoleAPI = async (id) => {
  return apiRequest(`/sys-admin/role-permission/roles/${id}`, {
    method: 'DELETE',
  })
}

// 為角色分配權限
export const assignPermissionsToRoleAPI = async (roleId, permissionIds) => {
  return apiRequest(`/sys-admin/role-permission/roles/${roleId}/permissions`, {
    method: 'POST',
    body: JSON.stringify({
      permissions: permissionIds,
    }),
  })
}

// 取得所有權限供分配使用
export const getAllPermissionsForRoleAPI = async () => {
  return apiRequest('/sys-admin/role-permission/roles-permissions')
}

// ============ 權限管理 API ============

// 取得權限列表 (分頁)
export const getAdminPermissionsAPI = async (page = 1, perPage = 10, search = '', filterParams = '') => {
  // 參考 OpenCart 的做法，建構基本查詢字串
  let url = `page=${page}&limit=${perPage}`

  // 舊式搜尋參數（向下相容）
  if (search) {
    url += '&search=' + encodeURIComponent(search)
  }

  // 添加 filter 參數（以 & 開頭的字串）
  if (filterParams) {
    url += filterParams
  }

  return apiRequest(`/sys-admin/role-permission/permissions?${url}`)
}

// 取得指定權限詳細資料
export const getAdminPermissionAPI = async (id) => {
  return apiRequest(`/sys-admin/role-permission/permissions/${id}`)
}

// 建立新權限
export const createAdminPermissionAPI = async (permissionData) => {
  return apiRequest('/sys-admin/role-permission/permissions', {
    method: 'POST',
    body: JSON.stringify(permissionData),
  })
}

// 更新指定權限資料
export const updateAdminPermissionAPI = async (id, permissionData) => {
  return apiRequest(`/sys-admin/role-permission/permissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(permissionData),
  })
}

// 刪除指定權限
export const deleteAdminPermissionAPI = async (id) => {
  return apiRequest(`/sys-admin/role-permission/permissions/${id}`, {
    method: 'DELETE',
  })
}

// ============ MetaKey 管理 API ============

// 取得 MetaKey 列表 (分頁)
export const getMetaKeysAPI = async (page = 1, perPage = 15, search = '', entity = '') => {
  let url = `page=${page}&per_page=${perPage}`

  if (search) {
    url += '&search=' + encodeURIComponent(search)
  }

  if (entity) {
    url += '&entity=' + encodeURIComponent(entity)
  }

  return apiRequest(`/sys-admin/meta-key?${url}`)
}

// 取得指定 MetaKey 詳細資料
export const getMetaKeyAPI = async (id) => {
  return apiRequest(`/sys-admin/meta-key/${id}`)
}

// 建立新 MetaKey
export const createMetaKeyAPI = async (metaKeyData) => {
  return apiRequest('/sys-admin/meta-key', {
    method: 'POST',
    body: JSON.stringify(metaKeyData),
  })
}

// 更新指定 MetaKey 資料
export const updateMetaKeyAPI = async (id, metaKeyData) => {
  return apiRequest(`/sys-admin/meta-key/${id}`, {
    method: 'PUT',
    body: JSON.stringify(metaKeyData),
  })
}

// 刪除指定 MetaKey
export const deleteMetaKeyAPI = async (id) => {
  return apiRequest(`/sys-admin/meta-key/${id}`, {
    method: 'DELETE',
  })
}

// 取得特定實體的 MetaKey 列表
export const getMetaKeysByEntityAPI = async (entity) => {
  return apiRequest(`/sys-admin/meta-key/entity/${entity}`)
}

// 取得所有實體列表
export const getMetaKeyEntitiesAPI = async () => {
  return apiRequest('/sys-admin/meta-key-entities')
}

// 取得所有資料類型
export const getMetaKeyDataTypesAPI = async () => {
  return apiRequest('/sys-admin/meta-key-data-types')
}

// ==================== Systems API ====================

// 取得系統列表 (分頁)
export const getSystemsAPI = async (page = 1, limit = 10, filterCode = '', filterName = '', filterDescription = '') => {
  let url = `page=${page}&limit=${limit}`

  if (filterCode) {
    url += '&filter_code=' + encodeURIComponent(filterCode)
  }
  if (filterName) {
    url += '&filter_name=' + encodeURIComponent(filterName)
  }
  if (filterDescription) {
    url += '&filter_description=' + encodeURIComponent(filterDescription)
  }

  return apiRequest(`/sys-admin/systems?${url}`)
}

// 取得指定系統詳細資料
export const getSystemAPI = async (id) => {
  return apiRequest(`/sys-admin/systems/${id}`)
}

// 建立新系統
export const createSystemAPI = async (systemData) => {
  return apiRequest('/sys-admin/systems', {
    method: 'POST',
    body: JSON.stringify(systemData),
  })
}

// 更新指定系統資料
export const updateSystemAPI = async (id, systemData) => {
  return apiRequest(`/sys-admin/systems/${id}`, {
    method: 'PUT',
    body: JSON.stringify(systemData),
  })
}

// 刪除指定系統
export const deleteSystemAPI = async (id) => {
  return apiRequest(`/sys-admin/systems/${id}`, {
    method: 'DELETE',
  })
}

// ==================== Settings API ====================

// 取得 Settings 列表 (分頁)
export const getSettingsAPI = async (page = 1, limit = 10, filterGroup = '', filterKey = '', filterName = '') => {
  let url = `page=${page}&limit=${limit}`
  if (filterGroup) {
    url += '&filter_group=' + encodeURIComponent(filterGroup)
  }
  if (filterKey) {
    url += '&filter_key=' + encodeURIComponent(filterKey)
  }
  if (filterName) {
    url += '&filter_name=' + encodeURIComponent(filterName)
  }
  return apiRequest(`/sys-admin/settings?${url}`)
}

// 取得單一 Setting
export const getSettingAPI = async (id) => {
  return apiRequest(`/sys-admin/settings/${id}`)
}

// 建立新 Setting
export const createSettingAPI = async (settingData) => {
  return apiRequest('/sys-admin/settings', {
    method: 'POST',
    body: JSON.stringify(settingData),
  })
}

// 更新 Setting
export const updateSettingAPI = async (id, settingData) => {
  return apiRequest(`/sys-admin/settings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(settingData),
  })
}

// 刪除 Setting
export const deleteSettingAPI = async (id) => {
  return apiRequest(`/sys-admin/settings/${id}`, {
    method: 'DELETE',
  })
}

// 取得所有群組列表
export const getSettingsGroupsAPI = async () => {
  return apiRequest('/sys-admin/settings-groups')
}

// ==================== OAuth Clients API ====================

// 取得 OAuth Clients 列表 (分頁)
export const getOAuthClientsAPI = async (page = 1, limit = 10, filterCode = '', filterName = '', filterSystemCode = '') => {
  let url = `page=${page}&limit=${limit}`
  if (filterCode) {
    url += '&filter_code=' + encodeURIComponent(filterCode)
  }
  if (filterName) {
    url += '&filter_name=' + encodeURIComponent(filterName)
  }
  if (filterSystemCode) {
    url += '&filter_system_code=' + encodeURIComponent(filterSystemCode)
  }
  return apiRequest(`/sys-admin/oauth-clients?${url}`)
}

// 取得單一 OAuth Client
export const getOAuthClientAPI = async (id) => {
  return apiRequest(`/sys-admin/oauth-clients/${id}`)
}

// 建立新 OAuth Client
export const createOAuthClientAPI = async (clientData) => {
  return apiRequest('/sys-admin/oauth-clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  })
}

// 更新 OAuth Client
export const updateOAuthClientAPI = async (id, clientData) => {
  return apiRequest(`/sys-admin/oauth-clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  })
}

// 刪除 OAuth Client
export const deleteOAuthClientAPI = async (id) => {
  return apiRequest(`/sys-admin/oauth-clients/${id}`, {
    method: 'DELETE',
  })
}

// 取得系統列表 (供 OAuth Client 選擇)
export const getOAuthClientSystemsAPI = async () => {
  return apiRequest('/sys-admin/oauth-clients-systems')
}

// 重新生成 OAuth Client Secret
export const regenerateOAuthClientSecretAPI = async (id) => {
  return apiRequest(`/sys-admin/oauth-clients/${id}/regenerate-secret`, {
    method: 'POST',
  })
}

export default {
  login: loginAPI,
  logout: logoutAPI,
  getUser: getUserAPI,
  getUserProfile: getUserProfileAPI,
  googleLogin: googleLoginAPI,
  changePassword: changePasswordAPI,
  forgotPassword: forgotPasswordAPI,
  resetPassword: resetPasswordAPI,
  // 2FA APIs
  send2FACode: send2FACodeAPI,
  verify2FACode: verify2FACodeAPI,
  check2FAStatus: check2FAStatusAPI,
  toggle2FA: toggle2FAAPI,
  complete2FALogin: complete2FALoginAPI,
  // Device APIs
  getDevices: getDevicesAPI,
  trustDevice: trustDeviceAPI,
  removeTrustDevice: removeTrustDeviceAPI,
  revokeDevice: revokeDeviceAPI,
  revokeOtherDevices: revokeOtherDevicesAPI,
  updateDeviceName: updateDeviceNameAPI,
  // Admin APIs
  getAdminUsers: getAdminUsersAPI,
  getAdminUser: getAdminUserAPI,
  updateAdminUser: updateAdminUserAPI,
  deleteAdminUser: deleteAdminUserAPI,
  resetAdminUserPassword: resetAdminUserPasswordAPI,
  assignRoleToUser: assignRoleToUserAPI,
  manageUserSystems: manageUserSystemsAPI,
  manageUser2FA: manageUser2FAAPI,
  getAdminSystems: getAdminSystemsAPI,
  // Role APIs
  getAdminRoles: getAdminRolesAPI,
  getAdminRole: getAdminRoleAPI,
  createAdminRole: createAdminRoleAPI,
  updateAdminRole: updateAdminRoleAPI,
  deleteAdminRole: deleteAdminRoleAPI,
  assignPermissionsToRole: assignPermissionsToRoleAPI,
  // Permission APIs
  getAdminPermissions: getAdminPermissionsAPI,
  getAdminPermission: getAdminPermissionAPI,
  createAdminPermission: createAdminPermissionAPI,
  updateAdminPermission: updateAdminPermissionAPI,
  deleteAdminPermission: deleteAdminPermissionAPI,
  // MetaKey APIs
  getMetaKeys: getMetaKeysAPI,
  getMetaKey: getMetaKeyAPI,
  createMetaKey: createMetaKeyAPI,
  updateMetaKey: updateMetaKeyAPI,
  deleteMetaKey: deleteMetaKeyAPI,
  getMetaKeysByEntity: getMetaKeysByEntityAPI,
  getMetaKeyEntities: getMetaKeyEntitiesAPI,
  getMetaKeyDataTypes: getMetaKeyDataTypesAPI,
  // Settings APIs
  getSettings: getSettingsAPI,
  getSetting: getSettingAPI,
  createSetting: createSettingAPI,
  updateSetting: updateSettingAPI,
  deleteSetting: deleteSettingAPI,
  getSettingsGroups: getSettingsGroupsAPI,
  // OAuth Client APIs
  getOAuthClients: getOAuthClientsAPI,
  getOAuthClient: getOAuthClientAPI,
  createOAuthClient: createOAuthClientAPI,
  updateOAuthClient: updateOAuthClientAPI,
  deleteOAuthClient: deleteOAuthClientAPI,
  getOAuthClientSystems: getOAuthClientSystemsAPI,
  regenerateOAuthClientSecret: regenerateOAuthClientSecretAPI,
}