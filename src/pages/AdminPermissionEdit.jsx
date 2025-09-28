import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getAdminPermissionAPI,
  createAdminPermissionAPI,
  updateAdminPermissionAPI
} from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function AdminPermissionEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const [permission, setPermission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const isEditing = id && id !== 'create'
  const pageTitle = isEditing ? '編輯權限' : '新增權限'

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
    if (searchParams.get('filter_group')) {
      returnParams.set('filter_group', searchParams.get('filter_group'))
    }

    const queryString = returnParams.toString()
    return queryString ? `/admin/permissions?${queryString}` : '/admin/permissions'
  }

  // 表單資料
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    group: ''
  })

  const loadPermission = async () => {
    if (!isEditing) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await getAdminPermissionAPI(id)

      if (response.success) {
        const permissionData = response.data
        setPermission(permissionData)
        setFormData({
          name: permissionData.name || '',
          display_name: permissionData.display_name || '',
          description: permissionData.description || '',
          group: permissionData.group || ''
        })
      }
    } catch (err) {
      setError(err.message || '載入權限資料失敗')
      console.error('Load permission error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermission()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

      const response = isEditing
        ? await updateAdminPermissionAPI(id, formData)
        : await createAdminPermissionAPI(formData)

      if (response.success) {
        setSuccess(isEditing ? '權限更新成功' : '權限建立成功')
        setTimeout(() => {
          navigate(getReturnUrl())
        }, 1500)
      }
    } catch (err) {
      setError(err.message || '儲存失敗')
      console.error('Save permission error:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-TW')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-96">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (isEditing && error && !permission) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <button className="btn btn-primary mt-4" onClick={() => navigate(getReturnUrl())}>
          回到權限列表
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
          {isEditing ? '修改權限設定' : '建立新的系統權限'}
        </p>

        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs mt-4">
          <ul>
            <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
            <li>進階管理</li>
            <li><a onClick={() => navigate(getReturnUrl())} className="cursor-pointer">權限管理</a></li>
            <li>{isEditing ? '編輯權限' : '新增權限'}</li>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 權限表單 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">權限資料</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 權限代碼 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 權限代碼</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered w-full"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="例如: users.create"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">用於程式中的權限識別碼，建議使用英文和點號</div>
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
                      placeholder="例如: 建立使用者"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">在介面上顯示的權限名稱</div>
                  </div>
                </div>

                {/* 權限分類 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 權限分類</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="group"
                      className="input input-bordered w-full"
                      value={formData.group}
                      onChange={handleInputChange}
                      required
                      placeholder="例如: 使用者管理"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">權限所屬的功能分類</div>
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
                      placeholder="詳細說明此權限的用途和影響範圍"
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                {/* 提交按鈕 */}
                <div className="card-actions justify-end pt-4">
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
                      {saving ? '儲存中...' : (isEditing ? '更新權限' : '建立權限')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 側邊欄資訊 */}
        <div className="space-y-6">
          {/* 權限摘要 */}
          {isEditing && permission && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">權限摘要</h3>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-base-content/70">權限 ID</div>
                    <div className="font-mono text-xs">{permission.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-base-content/70">建立時間</div>
                    <div className="text-sm">{formatDate(permission.created_at)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-base-content/70">最後更新</div>
                    <div className="text-sm">{formatDate(permission.updated_at)}</div>
                  </div>

                  {permission.roles && permission.roles.length > 0 && (
                    <div>
                      <div className="text-sm text-base-content/70">使用此權限的角色</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {permission.roles.map(role => (
                          <span key={role.id} className="badge badge-outline badge-xs">
                            {role.display_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 操作提示 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">操作提示</h3>
              <div className="text-sm space-y-2">
                <p>• 權限代碼應該使用英文，建議格式為 「模組.動作」</p>
                <p>• 顯示名稱用於在界面上顯示給管理員</p>
                <p>• 權限分類幫助組織和管理相關權限</p>
                <p>• 刪除權限前請確認沒有角色正在使用</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}