import React, { useState } from 'react'

export default function RoleManagement() {
  const [permissions] = useState([
    { id: 1, name: 'system.view', displayName: '查看系統設定', category: 'system' },
    { id: 2, name: 'system.manage', displayName: '管理系統設定', category: 'system' },
    { id: 3, name: 'users.view', displayName: '查看使用者', category: 'users' },
    { id: 4, name: 'users.manage', displayName: '管理使用者', category: 'users' },
    { id: 5, name: 'roles.view', displayName: '查看角色', category: 'roles' },
    { id: 6, name: 'roles.manage', displayName: '管理角色', category: 'roles' },
    { id: 7, name: 'systems.assign', displayName: '分配系統權限', category: 'systems' }
  ])

  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'sys_admin',
      displayName: '系統管理者',
      description: '擁有系統完整管理權限',
      isSystem: true,
      permissions: [1, 2, 3, 4, 5, 6, 7],
      userCount: 2,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'sys_viewer',
      displayName: '系統讀取者',
      description: '只能查看系統資訊，無修改權限',
      isSystem: true,
      permissions: [1, 3, 5],
      userCount: 5,
      createdAt: '2024-01-15'
    },
    {
      id: 3,
      name: 'user',
      displayName: '一般使用者',
      description: '基本使用者權限',
      isSystem: true,
      permissions: [],
      userCount: 15,
      createdAt: '2024-01-15'
    }
  ])

  const [editingRole, setEditingRole] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: []
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePermissionToggle = (permissionId) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter(id => id !== permissionId)
      : [...formData.permissions, permissionId]

    setFormData({
      ...formData,
      permissions: newPermissions
    })
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingRole(null)
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: []
    })
  }

  const handleEdit = (role) => {
    if (role.isSystem) {
      alert('系統預設角色無法編輯')
      return
    }
    setEditingRole(role.id)
    setIsCreating(false)
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: [...role.permissions]
    })
  }

  const handleSave = () => {
    if (isCreating) {
      const newRole = {
        id: Date.now(),
        ...formData,
        isSystem: false,
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setRoles([...roles, newRole])
    } else {
      setRoles(roles.map(r =>
        r.id === editingRole ? { ...r, ...formData } : r
      ))
    }
    handleCancel()
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingRole(null)
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: []
    })
  }

  const handleDelete = (roleId) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) {
      alert('系統預設角色無法刪除')
      return
    }
    if (role?.userCount > 0) {
      alert('此角色仍有使用者，請先移除所有使用者後再刪除')
      return
    }
    setRoles(roles.filter(r => r.id !== roleId))
  }

  const getRoleTypeBadge = (role) => {
    if (role.isSystem) {
      return <div className="badge badge-primary">系統預設</div>
    }
    return <div className="badge badge-secondary">自訂</div>
  }

  const getPermissionsByCategory = (categoryFilter = null) => {
    return permissions.filter(p => !categoryFilter || p.category === categoryFilter)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-base-content">角色管理</h1>
            <p className="text-base-content/70 mt-2">管理系統角色和權限配置</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
          >
            ➕ 新增角色
          </button>
        </div>
      </div>

      {/* 統計資料 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary text-2xl">👑</div>
          <div className="stat-title">總角色數</div>
          <div className="stat-value text-primary">{roles.length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-secondary text-2xl">⚙️</div>
          <div className="stat-title">系統預設</div>
          <div className="stat-value text-secondary">{roles.filter(r => r.isSystem).length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-accent text-2xl">🛠️</div>
          <div className="stat-title">自訂角色</div>
          <div className="stat-value text-accent">{roles.filter(r => !r.isSystem).length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info text-2xl">👥</div>
          <div className="stat-title">總使用者數</div>
          <div className="stat-value text-info">{roles.reduce((sum, r) => sum + r.userCount, 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 角色清單 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">角色清單</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>角色名稱</th>
                      <th>類型</th>
                      <th>權限數</th>
                      <th>使用者數</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="hover">
                        <td>
                          <div>
                            <div className="font-bold">{role.displayName}</div>
                            <div className="text-sm text-base-content/70">
                              <code>{role.name}</code>
                            </div>
                            <div className="text-sm text-base-content/60 mt-1">
                              {role.description}
                            </div>
                          </div>
                        </td>
                        <td>{getRoleTypeBadge(role)}</td>
                        <td>
                          <div className="badge badge-outline">
                            {role.permissions.length} 個權限
                          </div>
                        </td>
                        <td>
                          <div className="badge badge-info">
                            {role.userCount} 人
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEdit(role)}
                            >
                              {role.isSystem ? '檢視' : '編輯'}
                            </button>
                            {!role.isSystem && (
                              <button
                                className="btn btn-sm btn-error"
                                onClick={() => handleDelete(role.id)}
                                disabled={role.userCount > 0}
                              >
                                刪除
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
        </div>

        {/* 編輯表單 */}
        <div>
          {(isCreating || editingRole) && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">
                  {isCreating ? '新增角色' : '編輯角色'}
                </h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">角色代碼</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="例: hr_manager"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={editingRole && roles.find(r => r.id === editingRole)?.isSystem}
                  />
                  <label className="label">
                    <span className="label-text-alt">英文代碼，建議使用底線分隔</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">顯示名稱</span>
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    placeholder="例: 人資管理者"
                    className="input input-bordered"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={editingRole && roles.find(r => r.id === editingRole)?.isSystem}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">說明</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="角色的詳細說明"
                    className="textarea textarea-bordered"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    disabled={editingRole && roles.find(r => r.id === editingRole)?.isSystem}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">權限設定</span>
                  </label>
                  <div className="space-y-4">
                    {['system', 'users', 'roles', 'systems'].map(category => (
                      <div key={category} className="border border-base-300 rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          {category === 'system' && '🔧 系統管理'}
                          {category === 'users' && '👥 使用者管理'}
                          {category === 'roles' && '👑 角色管理'}
                          {category === 'systems' && '🏢 外部系統管理'}
                        </h4>
                        <div className="space-y-2">
                          {getPermissionsByCategory(category).map(permission => (
                            <label key={permission.id} className="cursor-pointer label justify-start gap-3">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                disabled={editingRole && roles.find(r => r.id === editingRole)?.isSystem}
                              />
                              <div>
                                <div className="label-text font-medium">{permission.displayName}</div>
                                <div className="text-xs text-base-content/60">{permission.name}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-actions justify-end mt-6">
                  <button className="btn btn-outline" onClick={handleCancel}>
                    {editingRole && roles.find(r => r.id === editingRole)?.isSystem ? '關閉' : '取消'}
                  </button>
                  {!(editingRole && roles.find(r => r.id === editingRole)?.isSystem) && (
                    <button className="btn btn-primary" onClick={handleSave}>
                      {isCreating ? '新增' : '儲存'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}