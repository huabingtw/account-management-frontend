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

export default {
  login: loginAPI,
  logout: logoutAPI,
  getUser: getUserAPI,
  getUserProfile: getUserProfileAPI,
  googleLogin: googleLoginAPI,
}