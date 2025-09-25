import { useState, useEffect, createContext, useContext } from 'react'

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

  useEffect(() => {
    // 模擬從 localStorage 或 API 獲取使用者資訊
    setTimeout(() => {
      setUser(defaultUser)
      setIsLoading(false)
    }, 100)
  }, [])

  const login = async (credentials) => {
    // 模擬登入 API
    setUser(defaultUser)
    return defaultUser
  }

  const switchUser = (userType) => {
    setUser(mockUsers[userType])
  }

  const logout = () => {
    setUser(null)
  }

  const hasPermission = (permission) => {
    if (!user) return false

    // 檢查使用者的所有角色是否包含該權限
    return user.roles.some(role =>
      role.permissions.includes(permission)
    )
  }

  const hasRole = (roleName) => {
    if (!user) return false

    return user.roles.some(role => role.name === roleName)
  }

  const hasAnyRole = (roleNames) => {
    if (!user) return false

    return roleNames.some(roleName => hasRole(roleName))
  }

  const getUserPermissions = () => {
    if (!user) return []

    // 合併所有角色的權限
    const allPermissions = user.roles.reduce((acc, role) => {
      return [...acc, ...role.permissions]
    }, [])

    // 去除重複權限
    return [...new Set(allPermissions)]
  }

  const value = {
    user,
    isLoading,
    login,
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