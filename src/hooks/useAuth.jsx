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

  useEffect(() => {
    // 檢查 localStorage 是否有登入 token
    const savedToken = localStorage.getItem('auth_token')
    const savedAuth = localStorage.getItem('auth')

    setTimeout(() => {
      if (savedToken) {
        setToken(savedToken)
        // 嘗試從 API 獲取用戶資訊
        checkAuth(savedToken)
      } else if (savedAuth === 'true') {
        // 備用方案：使用舊的 demo 模式
        setUser(defaultUser)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    }, 100)
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
      } else {
        // Token 無效，清除本地存儲
        clearAuth()
      }
    } catch (error) {
      console.error('檢查認證失敗:', error)
      clearAuth()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials) => {
    // 檢查是否是 demo 帳號
    if (credentials.account === 'demo' && credentials.password === 'demo') {
      // 使用原本的 demo 模式
      setUser(defaultUser)
      localStorage.setItem('auth', 'true')
      return defaultUser
    }

    try {
      // 嘗試使用 API 登入
      const response = await loginAPI(credentials.account, credentials.password)
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
    return user.roles.some(role =>
      role.permissions && role.permissions.includes(permission)
    )
  }

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false

    return user.roles.some(role => role.name === roleName)
  }

  const hasAnyRole = (roleNames) => {
    if (!user || !user.roles) return false

    return roleNames.some(roleName => hasRole(roleName))
  }

  const getUserPermissions = () => {
    if (!user || !user.roles) return []

    // 合併所有角色的權限
    const allPermissions = user.roles.reduce((acc, role) => {
      return [...acc, ...(role.permissions || [])]
    }, [])

    // 去除重複權限
    return [...new Set(allPermissions)]
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && (!!token || localStorage.getItem('auth') === 'true'),
    login,
    googleLogin,
    logout,
    switchUser,
    hasPermission,
    hasRole,
    hasAnyRole,
    getUserPermissions,
    isAdmin: hasRole('sys_admin'),
    isViewer: hasRole('sys_viewer'),
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