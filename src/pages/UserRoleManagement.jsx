import React, { useState } from 'react'

export default function UserRoleManagement() {
  const [roles] = useState([
    { id: 1, name: 'sys_admin', displayName: '系統管理者' },
    { id: 2, name: 'sys_viewer', displayName: '系統讀取者' },
    { id: 3, name: 'user', displayName: '一般使用者' }
  ])

  const [users, setUsers] = useState([
    {
      id: 1,
      name: '張三',
      email: 'zhang.san@example.com',
      department: '資訊部',
      status: 'active',
      roles: [1], // sys_admin
      createdAt: '2024-01-15',
      lastLogin: '2 小時前'
    },
    {
      id: 2,
      name: '李四',
      email: 'li.si@example.com',
      department: '人資部',
      status: 'active',
      roles: [2], // sys_viewer
      createdAt: '2024-01-20',
      lastLogin: '昨天'
    },
    {
      id: 3,
      name: '王五',
      email: 'wang.wu@example.com',
      department: '業務部',
      status: 'active',
      roles: [3], // user
      createdAt: '2024-01-25',
      lastLogin: '3 天前'
    },
    {
      id: 4,
      name: '趙六',
      email: 'zhao.liu@example.com',
      department: '財務部',
      status: 'inactive',
      roles: [3], // user
      createdAt: '2024-02-01',
      lastLogin: '1 個月前'
    },
    {
      id: 5,
      name: '陳七',
      email: 'chen.qi@example.com',
      department: '資訊部',
      status: 'active',
      roles: [2, 3], // sys_viewer + user
      createdAt: '2024-02-10',
      lastLogin: '1 週前'
    }
  ])

  const [selectedUser, setSelectedUser] = useState(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setIsAssigning(true)
  }

  const handleRoleToggle = (roleId) => {
    if (!selectedUser) return

    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        const newRoles = user.roles.includes(roleId)
          ? user.roles.filter(id => id !== roleId)
          : [...user.roles, roleId]
        return { ...user, roles: newRoles }
      }
      return user
    })

    setUsers(updatedUsers)
    setSelectedUser({ ...selectedUser, roles: updatedUsers.find(u => u.id === selectedUser.id).roles })
  }

  const handleSaveRoles = () => {
    setIsAssigning(false)
    setSelectedUser(null)
  }

  const handleCancel = () => {
    setIsAssigning(false)
    setSelectedUser(null)
  }

  const getRoleName = (roleId) => {
    return roles.find(r => r.id === roleId)?.displayName || '未知角色'
  }

  const getStatusBadge = (status) => {
    return status === 'active'
      ? <div className="badge badge-success">啟用</div>
      : <div className="badge badge-error">停用</div>
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === 'all' || user.roles.includes(parseInt(filterRole))

    return matchesSearch && matchesRole
  })

  const getUserRoleStats = () => {
    const stats = {}
    roles.forEach(role => {
      stats[role.id] = users.filter(user => user.roles.includes(role.id)).length
    })
    return stats
  }

  const roleStats = getUserRoleStats()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">使用者角色管理</h1>
        <p className="text-base-content/70 mt-2">管理使用者與角色的對應關係</p>
      </div>

      {/* 統計資料 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary text-2xl">👥</div>
          <div className="stat-title">總使用者數</div>
          <div className="stat-value text-primary">{users.length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success text-2xl">✅</div>
          <div className="stat-title">啟用用戶</div>
          <div className="stat-value text-success">{users.filter(u => u.status === 'active').length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning text-2xl">👑</div>
          <div className="stat-title">管理者</div>
          <div className="stat-value text-warning">{roleStats[1] || 0}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info text-2xl">👀</div>
          <div className="stat-title">讀取者</div>
          <div className="stat-value text-info">{roleStats[2] || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 使用者清單 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">使用者清單</h2>

                {/* 搜尋和篩選 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="搜尋使用者..."
                    className="input input-bordered input-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="select select-bordered select-sm"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">所有角色</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>使用者</th>
                      <th>狀態</th>
                      <th>角色</th>
                      <th>最後登入</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary text-primary-content rounded-full w-8">
                                <span className="text-xs">{user.name.charAt(0)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{user.name}</div>
                              <div className="text-sm text-base-content/70">{user.email}</div>
                              <div className="text-xs text-base-content/60">{user.department}</div>
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(roleId => (
                              <div key={roleId} className="badge badge-outline badge-sm">
                                {getRoleName(roleId)}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="text-sm text-base-content/70">
                          {user.lastLogin}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleUserSelect(user)}
                          >
                            編輯角色
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 角色分配面板 */}
        <div>
          {isAssigning && selectedUser && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">編輯使用者角色</h3>

                {/* 使用者資訊 */}
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-12">
                        <span className="text-sm">{selectedUser.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{selectedUser.name}</div>
                      <div className="text-sm text-base-content/70">{selectedUser.email}</div>
                      <div className="text-xs text-base-content/60">{selectedUser.department}</div>
                    </div>
                  </div>
                </div>

                {/* 角色選擇 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">角色設定</span>
                  </label>
                  <div className="space-y-3">
                    {roles.map(role => (
                      <label key={role.id} className="cursor-pointer label justify-start gap-3 p-3 bg-base-200 rounded-lg">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedUser.roles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                        />
                        <div>
                          <div className="label-text font-medium">{role.displayName}</div>
                          <div className="text-xs text-base-content/60">{role.name}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="card-actions justify-end mt-6">
                  <button className="btn btn-outline" onClick={handleCancel}>
                    取消
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveRoles}>
                    儲存
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 角色統計 */}
          {!isAssigning && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">角色分佈</h3>
                <div className="space-y-3">
                  {roles.map(role => (
                    <div key={role.id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                      <div>
                        <div className="font-medium">{role.displayName}</div>
                        <div className="text-sm text-base-content/70">{role.name}</div>
                      </div>
                      <div className="badge badge-primary">
                        {roleStats[role.id] || 0} 人
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}