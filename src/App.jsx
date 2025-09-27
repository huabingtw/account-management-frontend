import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { LoginGuard, AuthenticatedGuard } from './components/AuthGuard'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import SystemAccess from './pages/SystemAccess'
import DeviceSecurity from './pages/DeviceSecurity'
import PermissionManagement from './pages/PermissionManagement'
import RoleManagement from './pages/RoleManagement'
import UserRoleManagement from './pages/UserRoleManagement'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 登入頁面 - 已登入用戶會被重導向到 dashboard */}
          <Route
            path="/login"
            element={
              <LoginGuard>
                <Login />
              </LoginGuard>
            }
          />

          {/* 主要應用頁面 - 使用 MainLayout 和 AuthenticatedGuard */}
          <Route
            path="/dashboard"
            element={
              <AuthenticatedGuard>
                <MainLayout><Dashboard /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthenticatedGuard>
                <MainLayout><Profile /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/change-password"
            element={
              <AuthenticatedGuard>
                <MainLayout><ChangePassword /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/system-access"
            element={
              <AuthenticatedGuard permission="systems.assign">
                <MainLayout><SystemAccess /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/device-security"
            element={
              <AuthenticatedGuard>
                <MainLayout><DeviceSecurity /></MainLayout>
              </AuthenticatedGuard>
            }
          />

          {/* 權限管理頁面 - 需要相應權限 */}
          <Route
            path="/permissions"
            element={
              <AuthenticatedGuard permission="roles.manage">
                <MainLayout><PermissionManagement /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/roles"
            element={
              <AuthenticatedGuard permission="roles.manage">
                <MainLayout><RoleManagement /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/user-roles"
            element={
              <AuthenticatedGuard permission="users.manage">
                <MainLayout><UserRoleManagement /></MainLayout>
              </AuthenticatedGuard>
            }
          />

          {/* 重定向根路徑到儀表板 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 重定向 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App