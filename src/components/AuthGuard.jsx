import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

// 登入頁守衛 - 已登入用戶重導向到 dashboard
export function LoginGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  // 載入中時顯示載入畫面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="flex items-center gap-3">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="text-lg">檢查登入狀態...</span>
        </div>
      </div>
    )
  }

  // 如果已登入，重導向到 dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // 未登入，顯示登入頁
  return children
}

// 受保護路由守衛 - 未登入用戶重導向到登入頁
export function AuthenticatedGuard({ children, permission, role, anyRole, fallback = '/dashboard' }) {
  const { user, isAuthenticated, hasPermission, hasRole, hasAnyRole, isLoading } = useAuth()

  // 載入中時顯示載入畫面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="flex items-center gap-3">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="text-lg">載入中...</span>
        </div>
      </div>
    )
  }

  // 未登入時重定向到登入頁面
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 檢查權限
  if (permission && !hasPermission(permission)) {
    return <Navigate to={fallback} replace />
  }

  // 檢查角色
  if (role && !hasRole(role)) {
    return <Navigate to={fallback} replace />
  }

  // 檢查多個角色（任一符合即可）
  if (anyRole && !hasAnyRole(anyRole)) {
    return <Navigate to={fallback} replace />
  }

  return children
}