import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getSystemAPI,
  createSystemAPI,
  updateSystemAPI
} from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useFormHandler } from '../../utils/formHandler'

export default function SystemEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const formRef = useRef(null)
  const formHandler = useFormHandler({
    stayOnPage: true,
    autoNotify: true
  })
  const [system, setSystem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentId, setCurrentId] = useState(id)

  const isEditing = currentId && currentId !== 'create'
  const pageTitle = isEditing ? '編輯系統' : '新增系統'
  const canEdit = currentUser?.roles?.some(role => ['super_admin'].includes(role)) || false

  const getReturnUrl = () => {
    const returnParams = new URLSearchParams()
    if (searchParams.get('page')) {
      returnParams.set('page', searchParams.get('page'))
    }
    if (searchParams.get('limit')) {
      returnParams.set('limit', searchParams.get('limit'))
    }
    if (searchParams.get('filter_code')) {
      returnParams.set('filter_code', searchParams.get('filter_code'))
    }
    if (searchParams.get('filter_name')) {
      returnParams.set('filter_name', searchParams.get('filter_name'))
    }
    if (searchParams.get('filter_description')) {
      returnParams.set('filter_description', searchParams.get('filter_description'))
    }

    const queryString = returnParams.toString()
    return queryString ? `/sys-admin/systems?${queryString}` : '/sys-admin/systems'
  }

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    url: '',
    is_active: true
  })

  const loadSystem = async (systemId = currentId) => {
    if (!systemId || systemId === 'create') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await getSystemAPI(systemId)

      if (response.success) {
        const systemData = response.data
        setSystem(systemData)
        setFormData({
          code: systemData.code || '',
          name: systemData.name || '',
          description: systemData.description || '',
          url: systemData.url || '',
          is_active: systemData.is_active || false
        })
      }
    } catch (err) {
      window.notifications.error(err.message || '載入系統資料失敗')
      console.error('Load system error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSystem()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canEdit) {
      window.notifications.error('您沒有權限執行此操作')
      return
    }

    try {
      const submitUrl = isEditing
        ? `/sys-admin/systems/${currentId}`
        : '/sys-admin/systems'

      const method = isEditing ? 'PUT' : 'POST'

      await formHandler.submitForm(formRef.current, {
        url: submitUrl,
        method: method,
        onSuccess: async (response, form) => {
          if (!isEditing && response.data && response.data.id) {
            const newId = response.data.id.toString()
            setCurrentId(newId)
            await loadSystem(newId)
          } else if (isEditing) {
            await loadSystem(currentId)
          }
        }
      })
    } catch (err) {
      console.error('Save system error:', err)
    }
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

  if (isEditing && !system && !loading) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>系統不存在或載入失敗</span>
        </div>
        <button className="btn btn-primary mt-4" onClick={() => navigate(getReturnUrl())}>
          回到系統列表
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
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
          {isEditing ? '修改系統資訊' : '建立新的系統'}
        </p>

        <div className="text-sm breadcrumbs mt-4">
          <ul>
            <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
            <li>系統管理</li>
            <li><a onClick={() => navigate(getReturnUrl())} className="cursor-pointer">關聯系統</a></li>
            <li>{isEditing ? '編輯系統' : '新增系統'}</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">系統資料</h2>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" action={isEditing ? `/api/sys-admin/systems/${currentId}` : '/api/sys-admin/systems'} method={isEditing ? 'PUT' : 'POST'}>

                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 系統代碼</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="code"
                      className="input input-bordered w-full font-mono"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="例如: pos"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">用於系統識別的唯一代碼，建議使用英文</div>
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 系統名稱</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered w-full"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="例如: POS 銷售點管理系統"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">在介面上顯示的系統名稱</div>
                  </div>
                </div>

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
                      placeholder="詳細說明此系統的功能和用途"
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text">系統網址</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="url"
                      name="url"
                      className="input input-bordered w-full font-mono"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://pos.example.com"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">系統的主要網址</div>
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text">狀態</span>
                  </div>
                  <div className="col-span-9">
                    <label className="cursor-pointer label justify-start">
                      <input
                        type="checkbox"
                        name="is_active"
                        className="checkbox"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                      />
                      <span className="label-text ml-2">啟用系統</span>
                    </label>
                    <div className="text-xs text-base-content/70 mt-1">停用的系統無法被用戶存取</div>
                  </div>
                </div>

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
                      className="btn btn-primary"
                    >
                      儲存
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isEditing && system && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">摘要</h3>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-base-content/70">系統 ID</div>
                    <div className="font-mono text-xs">{system.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-base-content/70">建立時間</div>
                    <div className="text-sm">{new Date(system.created_at).toLocaleString('zh-TW')}</div>
                  </div>

                  <div>
                    <div className="text-sm text-base-content/70">最後更新</div>
                    <div className="text-sm">{new Date(system.updated_at).toLocaleString('zh-TW')}</div>
                  </div>

                  <div>
                    <div className="text-sm text-base-content/70">當前狀態</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className={`badge badge-xs ${system.is_active ? 'badge-success' : 'badge-ghost'}`}>
                        {system.is_active ? '啟用' : '停用'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">操作提示</h3>
              <div className="text-sm space-y-2">
                <p>• 系統代碼應該使用英文，建議格式為「功能縮寫」</p>
                <p>• 系統名稱用於在介面上顯示</p>
                <p>• 停用的系統將無法被用戶存取</p>
                <p>• 系統網址用於跳轉到該系統</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}