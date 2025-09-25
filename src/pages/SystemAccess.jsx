import React, { useState } from 'react'

export default function SystemAccess() {
  const [systems, setSystems] = useState([
    {
      id: 1,
      name: 'POS系統',
      description: '銷售點管理系統',
      icon: '🛒',
      status: 'active',
      hasAccess: true,
      lastAccess: '2 小時前',
      permissions: ['讀取', '寫入', '管理']
    },
    {
      id: 2,
      name: 'HRM系統',
      description: '人力資源管理系統',
      icon: '👥',
      status: 'active',
      hasAccess: true,
      lastAccess: '昨天',
      permissions: ['讀取', '寫入']
    },
    {
      id: 3,
      name: 'CRM系統',
      description: '客戶關係管理系統',
      icon: '📊',
      status: 'inactive',
      hasAccess: false,
      lastAccess: '從未使用',
      permissions: []
    },
    {
      id: 4,
      name: '會計系統',
      description: '財務會計管理系統',
      icon: '💰',
      status: 'pending',
      hasAccess: false,
      lastAccess: '待審核',
      permissions: []
    },
    {
      id: 5,
      name: '庫存系統',
      description: '倉庫庫存管理系統',
      icon: '📦',
      status: 'active',
      hasAccess: true,
      lastAccess: '1 週前',
      permissions: ['讀取']
    }
  ])

  const handleAccessToggle = (systemId) => {
    setSystems(systems.map(system =>
      system.id === systemId
        ? { ...system, hasAccess: !system.hasAccess, status: system.hasAccess ? 'inactive' : 'pending' }
        : system
    ))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <div className="badge badge-success">啟用</div>
      case 'inactive':
        return <div className="badge badge-error">停用</div>
      case 'pending':
        return <div className="badge badge-warning">待審核</div>
      default:
        return <div className="badge badge-neutral">未知</div>
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">系統授權管理</h1>
        <p className="text-base-content/70 mt-2">管理您對各系統的存取權限</p>
      </div>

      {/* 統計概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary text-2xl">🔓</div>
          <div className="stat-title">可用系統</div>
          <div className="stat-value text-primary">{systems.filter(s => s.hasAccess).length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning text-2xl">⏳</div>
          <div className="stat-title">待審核</div>
          <div className="stat-value text-warning">{systems.filter(s => s.status === 'pending').length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-error text-2xl">🔒</div>
          <div className="stat-title">無權限</div>
          <div className="stat-value text-error">{systems.filter(s => !s.hasAccess && s.status !== 'pending').length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info text-2xl">📊</div>
          <div className="stat-title">總系統數</div>
          <div className="stat-value text-info">{systems.length}</div>
        </div>
      </div>

      {/* 系統清單 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">系統清單</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>系統名稱</th>
                  <th>狀態</th>
                  <th>權限</th>
                  <th>最後存取</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((system) => (
                  <tr key={system.id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{system.icon}</div>
                        <div>
                          <div className="font-bold">{system.name}</div>
                          <div className="text-sm text-base-content/70">{system.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(system.status)}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {system.permissions.length > 0 ? (
                          system.permissions.map((permission, index) => (
                            <div key={index} className="badge badge-outline badge-sm">
                              {permission}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-base-content/50">無權限</div>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-base-content/70">
                      {system.lastAccess}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className={`btn btn-sm ${system.hasAccess ? 'btn-error' : 'btn-success'}`}
                          onClick={() => handleAccessToggle(system.id)}
                        >
                          {system.hasAccess ? '撤銷權限' : '申請權限'}
                        </button>
                        {system.hasAccess && (
                          <button className="btn btn-sm btn-outline">
                            設定權限
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 申請新系統權限 */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title">申請新系統權限</h2>
          <p className="text-base-content/70 mb-4">如需存取其他系統，請聯繫系統管理員</p>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="系統名稱或說明"
              className="input input-bordered flex-1"
            />
            <button className="btn btn-primary">
              提交申請
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}