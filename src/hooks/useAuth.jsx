import { useState, useEffect, createContext, useContext } from 'react'
import { loginAPI, logoutAPI, getUserAPI, googleLoginAPI } from '../services/api.js'

// 建立 Auth Context
const AuthContext = createContext()

// 模擬不同角色的使用者資料（實際應用中應該從 API 獲取）
const mockUsers = {
  admin: {
    id: 1,
    name: '張三 (系統管理者)',
    email: 'zhang.san@example.com',
    roles: [
      {
        id: 1,
        name: 'sys_admin',
        permissions: [
          'system.view', 'system.manage',
          'users.view', 'users.manage',
          'roles.view', 'roles.manage',
          'systems.assign'
        ]
      }
    ]
  },
  viewer: {
    id: 2,
    name: '李四 (系統讀取者)',
    email: 'li.si@example.com',
    roles: [
      {
        id: 2,
        name: 'sys_viewer',
        permissions: [
          'system.view',
          'users.view',
          'roles.view'
        ]
      }
    ]
  },
  user: {
    id: 3,
    name: '王五 (一般使用者)',
    email: 'wang.wu@example.com',
    roles: [
      {
        id: 3,
        name: 'user',
        permissions: []
      }
    ]
  }
}

// 預設使用管理者帳號進行測試
const defaultUser = mockUsers.admin

// AuthProvider 組件
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [lastAuthCheck, setLastAuthCheck] = useState(null)

  useEffect(() => {
    // 檢查 localStorage 是否有登入 token
    const savedToken = localStorage.getItem('auth_token')
    const savedAuth = localStorage.getItem('auth')
    const savedUserData = localStorage.getItem('user_data')

    const initAuth = async () => {
      if (savedToken) {
        setToken(savedToken)

        // 如果有保存的用戶資料，先設定它來避免載入延遲
        if (savedUserData) {
          try {
            const userData = JSON.parse(savedUserData)
            setUser(userData)
          } catch (error) {
            console.error('解析保存的用戶資料失敗:', error)
          }
        }

        // 檢查是否需要驗證（避免頻繁請求）
        const lastCheck = localStorage.getItem('last_auth_check')
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000 // 5分鐘

        if (!lastCheck || (now - parseInt(lastCheck)) > fiveMinutes) {
          // 超過5分鐘沒檢查，或第一次載入，才進行 API 驗證
          await checkAuth(savedToken)
          localStorage.setItem('last_auth_check', now.toString())
        } else {
          // 5分鐘內已檢查過，直接使用緩存資料
          setIsLoading(false)
        }
      } else if (savedAuth === 'true') {
        // 備用方案：使用舊的 demo 模式
        setUser(defaultUser)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const checkAuth = async (token) => {
    try {
      const response = await getUserAPI()
      if (response.success) {
        const user = response.data.user

        // 為 API 返回的用戶數據添加預設的 roles 結構
        const userWithRoles = {
          ...user,
          roles: user.roles || [
            {
              id: 1,
              name: 'user',
              permissions: []
            }
          ]
        }

        setUser(userWithRoles)
        // 更新保存的用戶資料
        localStorage.setItem('user_data', JSON.stringify(userWithRoles))
      } else {
        // Token 無效，清除本地存儲
        console.warn('Token 無效，清除認證資料')
        clearAuth()
      }
    } catch (error) {
      console.error('檢查認證失敗:', error)

      // 如果是認證相關錯誤（401, 403），直接清除認證狀態
      if (error.status === 401 || error.status === 403) {
        console.warn('認證失效，清除本地資料')
        clearAuth()
        return
      }

      // 如果有保存的用戶資料，暫時保持登入狀態
      const savedUserData = localStorage.getItem('user_data')
      if (savedUserData && !user) {
        try {
          const userData = JSON.parse(savedUserData)
          setUser(userData)
          console.warn('API 失敗，使用緩存的用戶資料')
        } catch (parseError) {
          console.error('解析用戶資料失敗:', parseError)
          clearAuth()
        }
      }

      // 如果沒有緩存資料或用戶已設定，則清除認證
      if (!savedUserData && !user) {
        clearAuth()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials) => {
    // 檢查是否是 demo 帳號
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo') {
      // 使用原本的 demo 模式
      setUser(defaultUser)
      localStorage.setItem('auth', 'true')
      return defaultUser
    }

    try {
      // 嘗試使用 API 登入
      const response = await loginAPI(credentials.email, credentials.password)
      console.log('API Login Response:', response)

      if (response.success) {
        const { user, token } = response.data
        console.log('User data from API:', user)
        console.log('Token from API:', token)

        // 為 API 返回的用戶數據添加預設的 roles 結構
        const userWithRoles = {
          ...user,
          roles: user.roles || [
            {
              id: 1,
              name: 'user',
              permissions: []
            }
          ]
        }

        // 儲存用戶資訊和 token
        setUser(userWithRoles)
        setToken(token)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(userWithRoles))
        localStorage.setItem('last_auth_check', Date.now().toString())
        // 清除舊的 demo 模式標記
        localStorage.removeItem('auth')

        return userWithRoles
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      // API 登入失敗時的備用方案：如果是開發環境，可以使用 demo 模式
      console.error('API 登入失敗:', error)
      throw error
    }
  }

  const googleLogin = async (googleToken) => {
    try {
      console.log('Google Token:', googleToken)

      // 使用 Google token 向後端 API 登入
      const response = await googleLoginAPI(googleToken)
      console.log('Google Login API Response:', response)

      if (response.success) {
        const { user, token } = response.data

        // 為 API 返回的用戶數據添加預設的 roles 結構
        const userWithRoles = {
          ...user,
          roles: user.roles || [
            {
              id: 1,
              name: 'user',
              permissions: []
            }
          ]
        }

        // 儲存用戶資訊和 token
        setUser(userWithRoles)
        setToken(token)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(userWithRoles))
        localStorage.setItem('last_auth_check', Date.now().toString())
        // 清除舊的 demo 模式標記
        localStorage.removeItem('auth')

        return userWithRoles
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Google 登入失敗:', error)
      throw error
    }
  }

  const clearAuth = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('auth')
    localStorage.removeItem('last_auth_check')
  }

  // 設置認證資料的函數（用於 2FA 登入完成後）
  const setAuthData = (userData, authToken) => {
    const userWithRoles = {
      ...userData,
      roles: userData.roles || [
        {
          id: 1,
          name: 'user',
          permissions: []
        }
      ]
    }

    setUser(userWithRoles)
    setToken(authToken)
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user_data', JSON.stringify(userWithRoles))
    localStorage.setItem('last_auth_check', Date.now().toString())
  }

  const switchUser = (userType) => {
    setUser(mockUsers[userType])
  }

  const logout = async () => {
    try {
      if (token) {
        await logoutAPI()
      }
    } catch (error) {
      console.error('登出 API 失敗:', error)
    } finally {
      clearAuth()
    }
  }

  const hasPermission = (permission) => {
    if (!user || !user.roles) return false

    // 檢查使用者的所有角色是否包含該權限
    return user.roles.some(role => {
      // 如果是物件格式，檢查 permissions 陣列
      if (typeof role === 'object' && role.permissions) {
        return role.permissions.includes(permission)
      }
      // 如果是字串格式，基於角色進行簡單權限檢查
      if (typeof role === 'string') {
        // super_admin 擁有所有權限
        if (role === 'super_admin') return true
        // admin 擁有大部分管理權限
        if (role === 'admin' && ['users.manage', 'roles.manage', 'systems.assign'].includes(permission)) return true
        // inspector 只有查看權限
        if (role === 'inspector' && permission.endsWith('.view')) return true
      }
      return false
    })
  }

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false

    // 支援兩種格式：字串陣列或物件陣列
    return user.roles.some(role => {
      if (typeof role === 'string') {
        return role === roleName
      } else if (typeof role === 'object' && role.name) {
        return role.name === roleName
      }
      return false
    })
  }

  const hasAnyRole = (roleNames) => {
    if (!user || !user.roles) return false

    return roleNames.some(roleName => hasRole(roleName))
  }

  const getUserPermissions = () => {
    if (!user || !user.roles) return []

    // 合併所有角色的權限
    const allPermissions = user.roles.reduce((acc, role) => {
      // 如果是物件格式，取得 permissions 陣列
      if (typeof role === 'object' && role.permissions) {
        return [...acc, ...role.permissions]
      }
      // 如果是字串格式，根據角色返回預設權限
      if (typeof role === 'string') {
        switch (role) {
          case 'super_admin':
            return [...acc, 'users.manage', 'roles.manage', 'systems.assign', 'system.manage']
          case 'admin':
            return [...acc, 'users.manage', 'roles.manage', 'systems.assign']
          case 'inspector':
            return [...acc, 'users.view', 'roles.view', 'systems.view']
          default:
            return acc
        }
      }
      return acc
    }, [])

    // 去除重複權限
    return [...new Set(allPermissions)]
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    googleLogin,
    logout,
    setAuthData,
    switchUser,
    hasPermission,
    hasRole,
    hasAnyRole,
    getUserPermissions,
    isAdmin: hasRole('super_admin') || hasRole('admin'),
    isViewer: hasRole('inspector'),
    mockUsers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}