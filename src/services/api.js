// API 基礎配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://account.huabing.test/api'
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

    const data = await response.json()

    if (DEBUG_MODE) {
      console.log(`API Response: ${response.status}`, data)
    }

    if (!response.ok) {
      throw new Error(data.message || '請求失敗')
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      console.error('API Request Timeout:', url)
      throw new Error('請求超時')
    }

    console.error('API Request Error:', error)
    throw error
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