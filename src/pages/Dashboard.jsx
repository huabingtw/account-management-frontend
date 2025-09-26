import React from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Dashboard() {
  const { user, switchUser, mockUsers } = useAuth()
  console.log('Dashboard - current user:', user)
  const stats = [
    { title: '已授權系統', value: '5', desc: '本月', icon: '🏢' },
    { title: '信任裝置', value: '3', desc: '活躍裝置', icon: '📱' },
    { title: '登入次數', value: '127', desc: '本月', icon: '🔐' },
    { title: '安全分數', value: '98%', desc: '良好', icon: '🛡️' }
  ]

  const recentActivities = [
    { action: '新裝置登入', time: '2 分鐘前', status: 'warning' },
    { action: '密碼變更成功', time: '1 小時前', status: 'success' },
    { action: 'POS系統登入', time: '3 小時前', status: 'info' },
    { action: 'HRM系統登入', time: '昨天', status: 'info' }
  ]

  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">儀表板</h1>
        <p className="text-base-content/70 mt-2">歡迎回到帳號管理中心</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stat bg-base-100 shadow-lg rounded-lg">
            <div className="stat-figure text-2xl">
              {stat.icon}
            </div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value text-primary">{stat.value}</div>
            <div className="stat-desc">{stat.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近活動 */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">最近活動</h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.status === 'success' ? 'bg-success' :
                      activity.status === 'warning' ? 'bg-warning' : 'bg-info'
                    }`}></div>
                    <span className="font-medium">{activity.action}</span>
                  </div>
                  <span className="text-sm text-base-content/70">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">快速操作</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="btn btn-outline btn-primary">
                <span>👤</span>
                編輯個人資料
              </button>
              <button className="btn btn-outline btn-secondary">
                <span>🔒</span>
                變更密碼
              </button>
              <button className="btn btn-outline btn-accent">
                <span>🏢</span>
                系統授權
              </button>
              <button className="btn btn-outline btn-info">
                <span>📱</span>
                裝置管理
              </button>
            </div>
          </div>
        </div>

        {/* 測試用戶角色切換 */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">🔧 測試功能 - 切換使用者角色</h2>
            <p className="text-sm text-base-content/70 mb-4">
              目前登入：<span className="font-bold text-primary">{user?.name}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                className="btn btn-outline btn-success"
                onClick={() => switchUser('admin')}
              >
                👑 系統管理者
              </button>
              <button
                className="btn btn-outline btn-warning"
                onClick={() => switchUser('viewer')}
              >
                👀 系統讀取者
              </button>
              <button
                className="btn btn-outline btn-info"
                onClick={() => switchUser('user')}
              >
                👤 一般使用者
              </button>
            </div>
            <div className="text-xs text-base-content/60 mt-3">
              💡 切換不同角色可以測試左側選單的權限控制效果
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}