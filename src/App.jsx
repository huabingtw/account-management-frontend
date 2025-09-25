import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ProtectedRoute } from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
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
          {/* 登入頁面 */}
          <Route path="/login" element={<Login />} />

          {/* 主要應用頁面 - 使用 MainLayout 和 ProtectedRoute */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-access"
            element={
              <ProtectedRoute permission="systems.assign">
                <MainLayout><SystemAccess /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/device-security"
            element={
              <ProtectedRoute>
                <MainLayout><DeviceSecurity /></MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 權限管理頁面 - 需要相應權限 */}
          <Route
            path="/permissions"
            element={
              <ProtectedRoute permission="roles.manage">
                <MainLayout><PermissionManagement /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute permission="roles.manage">
                <MainLayout><RoleManagement /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-roles"
            element={
              <ProtectedRoute permission="users.manage">
                <MainLayout><UserRoleManagement /></MainLayout>
              </ProtectedRoute>
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