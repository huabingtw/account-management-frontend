import React, { useState } from 'react'

export default function PermissionManagement() {
  const [permissions, setPermissions] = useState([
    {
      id: 1,
      name: 'system.view',
      displayName: '查看系統設定',
      description: '可以查看系統基本設定和資訊',
      category: 'system',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'system.manage',
      displayName: '管理系統設定',
      description: '可以修改系統設定和配置',
      category: 'system',
      createdAt: '2024-01-15'
    },
    {
      id: 3,
      name: 'users.view',
      displayName: '查看使用者',
      description: '可以查看使用者清單和基本資訊',
      category: 'users',
      createdAt: '2024-01-15'
    },
    {
      id: 4,
      name: 'users.manage',
      displayName: '管理使用者',
      description: '可以新增、編輯、刪除使用者',
      category: 'users',
      createdAt: '2024-01-15'
    },
    {
      id: 5,
      name: 'roles.view',
      displayName: '查看角色',
      description: '可以查看角色清單和權限配置',
      category: 'roles',
      createdAt: '2024-01-15'
    },
    {
      id: 6,
      name: 'roles.manage',
      displayName: '管理角色',
      description: '可以新增、編輯、刪除角色和權限',
      category: 'roles',
      createdAt: '2024-01-15'
    },
    {
      id: 7,
      name: 'systems.assign',
      displayName: '分配系統權限',
      description: '可以為使用者分配外部系統使用權限',
      category: 'systems',
      createdAt: '2024-01-15'
    }
  ])

  const [editingPermission, setEditingPermission] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'system'
  })

  const categories = [
    { value: 'system', label: '系統管理' },
    { value: 'users', label: '使用者管理' },
    { value: 'roles', label: '角色管理' },
    { value: 'systems', label: '外部系統管理' }
  ]

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingPermission(null)
    setFormData({
      name: '',
      displayName: '',
      description: '',
      category: 'system'
    })
  }

  const handleEdit = (permission) => {
    setEditingPermission(permission.id)
    setIsCreating(false)
    setFormData({
      name: permission.name,
      displayName: permission.displayName,
      description: permission.description,
      category: permission.category
    })
  }

  const handleSave = () => {
    if (isCreating) {
      const newPermission = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setPermissions([...permissions, newPermission])
    } else {
      setPermissions(permissions.map(p =>
        p.id === editingPermission ? { ...p, ...formData } : p
      ))
    }
    handleCancel()
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingPermission(null)
    setFormData({
      name: '',
      displayName: '',
      description: '',
      category: 'system'
    })
  }

  const handleDelete = (permissionId) => {
    setPermissions(permissions.filter(p => p.id !== permissionId))
  }

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      system: { class: 'badge-primary', text: '系統' },
      users: { class: 'badge-secondary', text: '使用者' },
      roles: { class: 'badge-accent', text: '角色' },
      systems: { class: 'badge-info', text: '外部系統' }
    }
    const config = categoryConfig[category] || { class: 'badge-neutral', text: '未知' }
    return <div className={`badge ${config.class}`}>{config.text}</div>
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-base-content">權限管理</h1>
            <p className="text-base-content/70 mt-2">管理系統權限定義</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
          >
            ➕ 新增權限
          </button>
        </div>
      </div>

      {/* 統計資料 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary text-2xl">🔑</div>
          <div className="stat-title">總權限數</div>
          <div className="stat-value text-primary">{permissions.length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-secondary text-2xl">⚙️</div>
          <div className="stat-title">系統權限</div>
          <div className="stat-value text-secondary">{permissions.filter(p => p.category === 'system').length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-accent text-2xl">👥</div>
          <div className="stat-title">使用者權限</div>
          <div className="stat-value text-accent">{permissions.filter(p => p.category === 'users').length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info text-2xl">🏢</div>
          <div className="stat-title">外部系統權限</div>
          <div className="stat-value text-info">{permissions.filter(p => p.category === 'systems').length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 權限清單 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">權限清單</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>權限代碼</th>
                      <th>顯示名稱</th>
                      <th>分類</th>
                      <th>說明</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission) => (
                      <tr key={permission.id} className="hover">
                        <td>
                          <code className="text-sm bg-base-200 px-2 py-1 rounded">
                            {permission.name}
                          </code>
                        </td>
                        <td className="font-medium">{permission.displayName}</td>
                        <td>{getCategoryBadge(permission.category)}</td>
                        <td>
                          <div className="max-w-xs truncate" title={permission.description}>
                            {permission.description}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEdit(permission)}
                            >
                              編輯
                            </button>
                            <button
                              className="btn btn-sm btn-error"
                              onClick={() => handleDelete(permission.id)}
                            >
                              刪除
                            </button>
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
          {(isCreating || editingPermission) && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">
                  {isCreating ? '新增權限' : '編輯權限'}
                </h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">權限代碼</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="例: users.view"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <label className="label">
                    <span className="label-text-alt">英文代碼，用點分隔層級</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">顯示名稱</span>
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    placeholder="例: 查看使用者"
                    className="input input-bordered"
                    value={formData.displayName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">分類</span>
                  </label>
                  <select
                    name="category"
                    className="select select-bordered"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">說明</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="權限的詳細說明"
                    className="textarea textarea-bordered"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <div className="card-actions justify-end mt-6">
                  <button className="btn btn-outline" onClick={handleCancel}>
                    取消
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    {isCreating ? '新增' : '儲存'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}