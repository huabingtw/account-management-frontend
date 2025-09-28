import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getAdminRoleAPI,
  createAdminRoleAPI,
  updateAdminRoleAPI,
  getAdminPermissionsAPI,
  assignPermissionsToRoleAPI
} from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function AdminRoleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const [role, setRole] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const isEditing = id && id !== 'create'
  const pageTitle = isEditing ? '編輯角色' : '新增角色'

  // 檢查用戶是否有編輯權限（super_admin 和 admin 可以編輯）
  const canEdit = currentUser?.roles?.some(role => ['super_admin', 'admin'].includes(role)) || false

  // 生成返回列表的 URL，保留查詢參數
  const getReturnUrl = () => {
    const returnParams = new URLSearchParams()

    // 保留分頁參數
    if (searchParams.get('page')) {
      returnParams.set('page', searchParams.get('page'))
    }
    if (searchParams.get('limit')) {
      returnParams.set('limit', searchParams.get('limit'))
    }

    // 保留篩選參數
    if (searchParams.get('filter_name')) {
      returnParams.set('filter_name', searchParams.get('filter_name'))
    }
    if (searchParams.get('filter_display_name')) {
      returnParams.set('filter_display_name', searchParams.get('filter_display_name'))
    }
    if (searchParams.get('filter_description')) {
      returnParams.set('filter_description', searchParams.get('filter_description'))
    }

    const queryString = returnParams.toString()
    return queryString ? `/admin/roles?${queryString}` : '/admin/roles'
  }

  // 表單資料
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: ''
  })

  // 選中的權限 IDs
  const [selectedPermissions, setSelectedPermissions] = useState([])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 並行載入角色和權限資料
      const promises = [
        getAdminPermissionsAPI(1, 1000, '', '') // 載入所有權限
      ]

      if (isEditing) {
        promises.push(getAdminRoleAPI(id))
      }

      const results = await Promise.all(promises)
      const [permissionsResponse, roleResponse] = results

      // 載入權限列表
      if (permissionsResponse.success) {
        const permissionsData = permissionsResponse.data.data || permissionsResponse.data
        setPermissions(Array.isArray(permissionsData) ? permissionsData : [])
      }

      // 載入角色資料（編輯模式）
      if (isEditing && roleResponse && roleResponse.success) {
        const roleData = roleResponse.data
        setRole(roleData)
        setFormData({
          name: roleData.name || '',
          display_name: roleData.display_name || '',
          description: roleData.description || ''
        })

        // 設定已選中的權限
        if (roleData.permissions && roleData.permissions.length > 0) {
          setSelectedPermissions(roleData.permissions.map(p => p.id.toString()))
        }
      }
    } catch (err) {
      setError(err.message || '載入資料失敗')
      console.error('Load initial data error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId])
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId))
    }
  }

  const handleSelectAllPermissions = (group, checked) => {
    const groupPermissions = permissions
      .filter(p => p.group === group)
      .map(p => p.id.toString())

    if (checked) {
      setSelectedPermissions(prev => [...new Set([...prev, ...groupPermissions])])
    } else {
      setSelectedPermissions(prev => prev.filter(id => !groupPermissions.includes(id)))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canEdit) {
      setError('您沒有權限執行此操作')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // 儲存角色基本資料
      const response = isEditing
        ? await updateAdminRoleAPI(id, formData)
        : await createAdminRoleAPI(formData)

      if (response.success) {
        // 如果有選擇權限，則分配權限
        if (selectedPermissions.length > 0) {
          const roleId = isEditing ? id : response.data.id
          await assignPermissionsToRoleAPI(roleId, selectedPermissions.map(id => parseInt(id)))
        }

        setSuccess(isEditing ? '角色更新成功' : '角色建立成功')
        setTimeout(() => {
          navigate(getReturnUrl())
        }, 1500)
      }
    } catch (err) {
      setError(err.message || '儲存失敗')
      console.error('Save role error:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-TW')
  }

  // 按分組整理權限
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const group = permission.group || '其他'
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(permission)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-96">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (isEditing && error && !role) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <button className="btn btn-primary mt-4" onClick={() => navigate(getReturnUrl())}>
          回到角色列表
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(getReturnUrl())}
          >
            ← 返回列表
          </button>
          <h1 className="text-3xl font-bold text-base-content">
            {pageTitle}
          </h1>
        </div>
        <p className="text-base-content/70">
          {isEditing ? '修改角色設定和權限' : '建立新的系統角色'}
        </p>

        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs mt-4">
          <ul>
            <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
            <li>進階管理</li>
            <li><a onClick={() => navigate(getReturnUrl())} className="cursor-pointer">角色管理</a></li>
            <li>{isEditing ? '編輯角色' : '新增角色'}</li>
          </ul>
        </div>
      </div>

      {/* 訊息顯示 */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 角色基本資料 */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title">角色資料</h2>

                <div className="space-y-6">
                  {/* 角色代碼 */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-right">
                      <span className="label-text"><span className="text-red-600">*</span> 角色代碼</span>
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        name="name"
                        className="input input-bordered w-full"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="例如: editor"
                        disabled={!canEdit}
                      />
                      <div className="text-xs text-base-content/70 mt-1">用於程式中的角色識別碼，建議使用英文</div>
                    </div>
                  </div>

                  {/* 顯示名稱 */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-right">
                      <span className="label-text"><span className="text-red-600">*</span> 顯示名稱</span>
                    </div>
                    <div className="col-span-9">
                      <input
                        type="text"
                        name="display_name"
                        className="input input-bordered w-full"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        required
                        placeholder="例如: 編輯者"
                        disabled={!canEdit}
                      />
                      <div className="text-xs text-base-content/70 mt-1">在介面上顯示的角色名稱</div>
                    </div>
                  </div>

                  {/* 描述 */}
                  <div className="grid grid-cols-12 items-start gap-4">
                    <div className="col-span-3 text-right pt-3">
                      <span className="label-text">描述</span>
                    </div>
                    <div className="col-span-9">
                      <textarea
                        name="description"
                        className="textarea textarea-bordered w-full"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="詳細說明此角色的用途和職責範圍"
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 權限分配 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">權限配置</h2>
                <p className="text-sm text-base-content/70 mb-4">
                  選擇此角色擁有的權限。可以按分組全選或個別選擇。
                </p>

                <div className="space-y-6">
                  {Object.keys(groupedPermissions).map(group => (
                    <div key={group} className="border border-base-300 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={groupedPermissions[group].every(p =>
                            selectedPermissions.includes(p.id.toString())
                          )}
                          onChange={(e) => handleSelectAllPermissions(group, e.target.checked)}
                          disabled={!canEdit}
                        />
                        <h3 className="font-semibold text-lg">{group}</h3>
                        <span className="badge badge-outline badge-sm">
                          {groupedPermissions[group].length} 項權限
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-8">
                        {groupedPermissions[group].map(permission => (
                          <label key={permission.id} className="label cursor-pointer justify-start gap-3">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                              checked={selectedPermissions.includes(permission.id.toString())}
                              onChange={(e) => handlePermissionChange(permission.id.toString(), e.target.checked)}
                              disabled={!canEdit}
                            />
                            <div>
                              <div className="font-medium text-sm">{permission.display_name}</div>
                              <div className="text-xs text-base-content/70 font-mono">{permission.name}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 側邊欄資訊 */}
          <div className="space-y-6">
            {/* 角色摘要 */}
            {isEditing && role && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">角色摘要</h3>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-base-content/70">角色 ID</div>
                      <div className="font-mono text-xs">{role.id}</div>
                    </div>

                    <div>
                      <div className="text-sm text-base-content/70">建立時間</div>
                      <div className="text-sm">{formatDate(role.created_at)}</div>
                    </div>

                    <div>
                      <div className="text-sm text-base-content/70">最後更新</div>
                      <div className="text-sm">{formatDate(role.updated_at)}</div>
                    </div>

                    <div>
                      <div className="text-sm text-base-content/70">目前權限數量</div>
                      <div className="text-sm">
                        <span className="badge badge-primary badge-sm">
                          {selectedPermissions.length} 個權限
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 操作提示 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">操作提示</h3>
                <div className="text-sm space-y-2">
                  <p>• 角色代碼應該使用英文，建議格式簡潔明確</p>
                  <p>• 顯示名稱用於在界面上顯示給管理員</p>
                  <p>• 權限按功能分組，可以全選或個別選擇</p>
                  <p>• 刪除角色前請確認沒有用戶正在使用</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <div className="card-actions justify-end">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(getReturnUrl())}
              >
                取消
              </button>
              {canEdit && (
                <button
                  type="submit"
                  className={`btn btn-primary ${saving ? 'loading' : ''}`}
                  disabled={saving}
                >
                  {saving ? '儲存中...' : (isEditing ? '更新角色' : '建立角色')}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}