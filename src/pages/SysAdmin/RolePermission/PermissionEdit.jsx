import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getAdminPermissionAPI,
  createAdminPermissionAPI,
  updateAdminPermissionAPI
} from '../../../services/api'
import { useAuth } from '../../../hooks/useAuth'
import { useFormHandler } from '../../../utils/formHandler'

export default function AdminPermissionEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const formRef = useRef(null)
  const formHandler = useFormHandler({
    stayOnPage: true,
    autoNotify: true
  })
  const [permission, setPermission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentId, setCurrentId] = useState(id) // 追蹤當前 ID 狀態

  const isEditing = currentId && currentId !== 'create'
  const pageTitle = '權限定義'

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

  const loadPermission = async (permissionId = currentId) => {
    if (!permissionId || permissionId === 'create') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const response = await getAdminPermissionAPI(permissionId)

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
      window.notifications.error(err.message || '載入權限資料失敗')
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
      window.notifications.error('您沒有權限執行此操作')
      return
    }

    try {
      // 使用 OpenCart 風格的表單提交
      const submitUrl = isEditing
        ? `/sys-admin/role-permission/permissions/${currentId}`
        : '/sys-admin/role-permission/permissions'

      const method = isEditing ? 'PUT' : 'POST'

      await formHandler.submitForm(formRef.current, {
        url: submitUrl,
        method: method,
        onSuccess: async (response, form) => {
          // 如果是新增成功，更新當前狀態和 URL
          if (!isEditing && response.data && response.data.id) {
            const newId = response.data.id.toString()
            setCurrentId(newId)

            // 重新載入完整的權限資料
            await loadPermission(newId)
          } else if (isEditing) {
            // 編輯模式下重新載入資料以確保顯示最新狀態
            await loadPermission(currentId)
          }
        }
      })
    } catch (err) {
      console.error('Save permission error:', err)
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

  if (isEditing && !permission && !loading) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>權限不存在或載入失敗</span>
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

      </div>

      {/* 通知訊息由 formHandler 自動管理 */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 權限表單 */}
        <div className="lg:col-span-2">
          {/* Breadcrumb 與按鈕 */}
          <div className="flex items-center justify-between text-sm breadcrumbs mb-4">
            <ul>
              <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
              <li>進階管理</li>
              <li><a onClick={() => navigate(getReturnUrl())} className="cursor-pointer">權限定義</a></li>
              <li>編輯</li>
            </ul>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(getReturnUrl())}
              >
                取消
              </button>
              {canEdit && (
                <button
                  type="submit"
                  form="permissionForm"
                  className="btn btn-primary btn-sm"
                >
                  儲存
                </button>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">權限資料</h2>

              <form id="permissionForm" ref={formRef} onSubmit={handleSubmit} className="space-y-6" action={isEditing ? `/api/sys-admin/role-permission/permissions/${currentId}` : '/api/sys-admin/role-permission/permissions'} method={isEditing ? 'PUT' : 'POST'}>
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

              </form>
            </div>
          </div>
        </div>

        {/* 側邊欄資訊 */}
        <div className="space-y-6">
          {/* 摘要 */}
          {isEditing && permission && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">摘要</h3>

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