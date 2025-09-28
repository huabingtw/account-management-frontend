import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { LoginGuard, AuthenticatedGuard } from './components/AuthGuard'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import SystemAccess from './pages/SystemAccess'
import DeviceSecurity from './pages/DeviceSecurity'
import PermissionManagement from './pages/PermissionManagement'
import UserRoleManagement from './pages/UserRoleManagement'
import AdminUsers from './pages/AdminUsers'
import AdminUserEdit from './pages/AdminUserEdit'
import AdminPermissions from './pages/AdminPermissions'
import AdminPermissionEdit from './pages/AdminPermissionEdit'
import AdminRoles from './pages/AdminRoles'
import AdminRoleEdit from './pages/AdminRoleEdit'
import AdminSystems from './pages/AdminSystems'
import AdminOAuthClients from './pages/AdminOAuthClients'

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

          {/* 忘記密碼頁面 - 已登入用戶會被重導向到 dashboard */}
          <Route
            path="/forgot-password"
            element={
              <LoginGuard>
                <ForgotPassword />
              </LoginGuard>
            }
          />

          {/* 重設密碼頁面 - 已登入用戶會被重導向到 dashboard */}
          <Route
            path="/reset-password"
            element={
              <LoginGuard>
                <ResetPassword />
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
            path="/device-security"
            element={
              <AuthenticatedGuard>
                <MainLayout><DeviceSecurity /></MainLayout>
              </AuthenticatedGuard>
            }
          />

          {/* 進階管理頁面 - super_admin, admin 或 inspector 角色 */}
          <Route
            path="/admin/users"
            element={
              <AuthenticatedGuard anyRole={['super_admin', 'admin', 'inspector']}>
                <MainLayout><AdminUsers /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <AuthenticatedGuard anyRole={['super_admin', 'admin', 'inspector']}>
                <MainLayout><AdminUserEdit /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/admin/permissions"
            element={
              <AuthenticatedGuard anyRole={['super_admin', 'admin', 'inspector']}>
                <MainLayout><AdminPermissions /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/admin/permissions/:id"
            element={
              <AuthenticatedGuard anyRole={['super_admin', 'admin']}>
                <MainLayout><AdminPermissionEdit /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <AuthenticatedGuard anyRole={['super_admin', 'admin', 'inspector']}>
                <MainLayout><AdminRoles /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/admin/roles/:id"
            element={
              <AuthenticatedGuard anyRole={['super_admin', 'admin']}>
                <MainLayout><AdminRoleEdit /></MainLayout>
              </AuthenticatedGuard>
            }
          />

          {/* 系統管理頁面 - 需要 super_admin 角色 */}
          <Route
            path="/system-access"
            element={
              <AuthenticatedGuard anyRole={['super_admin']}>
                <MainLayout><SystemAccess /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/permissions"
            element={
              <AuthenticatedGuard anyRole={['super_admin']}>
                <MainLayout><PermissionManagement /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/user-roles"
            element={
              <AuthenticatedGuard anyRole={['super_admin']}>
                <MainLayout><UserRoleManagement /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/admin/systems"
            element={
              <AuthenticatedGuard anyRole={['super_admin']}>
                <MainLayout><AdminSystems /></MainLayout>
              </AuthenticatedGuard>
            }
          />
          <Route
            path="/admin/oauth-clients"
            element={
              <AuthenticatedGuard anyRole={['super_admin']}>
                <MainLayout><AdminOAuthClients /></MainLayout>
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