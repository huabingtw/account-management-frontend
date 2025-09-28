import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { PermissionGuard } from '../components/ProtectedRoute'

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      path: '/dashboard',
      label: '儀表板',
      icon: '📊'
    },
    {
      path: '/profile',
      label: '個人資料',
      icon: '👤'
    },
    {
      path: '/device-security',
      label: '裝置安全',
      icon: '📱'
    },
    {
      label: '進階管理',
      icon: '🔧',
      isGroup: true,
      requireRole: ['super_admin', 'admin', 'inspector'],
      children: [
        {
          path: '/admin/users',
          label: '使用者管理',
          icon: '👥',
          requireRole: ['super_admin', 'admin', 'inspector']
        }
      ]
    },
    {
      label: '系統管理',
      icon: '⚙️',
      isGroup: true,
      requireRole: ['super_admin'],
      children: [
        {
          path: '/system-access',
          label: '系統授權',
          icon: '🏢',
          requireRole: ['super_admin']
        },
        {
          path: '/admin/permissions',
          label: '權限定義',
          icon: '🔑',
          requireRole: ['super_admin', 'admin', 'inspector']
        },
        {
          path: '/roles',
          label: '角色管理',
          icon: '👑',
          requireRole: ['super_admin']
        },
        {
          path: '/user-roles',
          label: '使用者角色',
          icon: '👥',
          requireRole: ['super_admin']
        },
        {
          path: '/admin/systems',
          label: '系統設定',
          icon: '🖥️',
          requireRole: ['super_admin']
        },
        {
          path: '/admin/oauth-clients',
          label: 'OAuth 客戶端',
          icon: '🔐',
          requireRole: ['super_admin']
        }
      ]
    }
  ]

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="drawer-toggle"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={(e) => setSidebarOpen(e.target.checked)}
      />

      {/* 側邊欄 */}
      <div className="drawer-side">
        <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
        <aside className="w-64 min-h-full bg-base-200 text-base-content">
          {/* Logo */}
          <div className="p-4 border-b border-base-300">
            <h1 className="text-xl font-bold text-primary">帳號管理中心</h1>
            <p className="text-sm text-base-content/70">Account Management</p>
          </div>

          {/* 用戶資訊 */}
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-sm">{user?.name?.charAt(0) || 'U'}</span>
                </div>
              </div>
              <div>
                <div className="font-medium">{user?.name || '未知用戶'}</div>
                <div className="text-xs text-base-content/70">{user?.email || ''}</div>
              </div>
            </div>
          </div>

          {/* 導航選單 */}
          <ul className="menu p-4 space-y-2">
            {menuItems.map((item, index) => {
              if (item.isGroup) {
                return (
                  <PermissionGuard
                    key={index}
                    permission={item.requirePermission}
                    anyRole={item.requireRole}
                  >
                    <li>
                      <details open>
                        <summary className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300">
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.label}</span>
                        </summary>
                        <ul className="ml-4 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <PermissionGuard
                              key={child.path}
                              permission={child.requirePermission}
                              anyRole={child.requireRole}
                            >
                              <li>
                                <button
                                  onClick={() => navigate(child.path)}
                                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors text-sm ${
                                    location.pathname === child.path
                                      ? 'bg-primary text-primary-content'
                                      : 'hover:bg-base-300'
                                  }`}
                                >
                                  <span>{child.icon}</span>
                                  <span>{child.label}</span>
                                </button>
                              </li>
                            </PermissionGuard>
                          ))}
                        </ul>
                      </details>
                    </li>
                  </PermissionGuard>
                )
              }

              return (
                <PermissionGuard
                  key={item.path}
                  permission={item.requirePermission}
                  anyRole={item.requireRole}
                >
                  <li>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary text-primary-content'
                          : 'hover:bg-base-300'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                </PermissionGuard>
              )
            })}
          </ul>

          {/* 底部操作 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-base-300">
            <div className="space-y-2">
              <button
                className="btn btn-outline btn-sm w-full"
                onClick={toggleTheme}
              >
                {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? '深色模式' : '淺色模式'}
              </button>
              <button
                className="btn btn-error btn-sm w-full"
                onClick={handleLogout}
              >
                🚪 登出
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* 主內容區 */}
      <div className="drawer-content">
        {/* 頂部導航 */}
        <div className="navbar bg-base-100 border-b border-base-300 lg:hidden">
          <div className="flex-none">
            <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">帳號管理中心</h1>
          </div>
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span className="text-xs">張</span>
                  </div>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><button onClick={() => navigate('/profile')}>個人資料</button></li>
                <li><button onClick={toggleTheme}>切換主題</button></li>
                <li><button onClick={handleLogout} className="text-error">登出</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* 頁面內容 */}
        <main className="min-h-screen bg-base-100">
          {children}
        </main>
      </div>
    </div>
  )
}