import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getOAuthClientAPI,
  createOAuthClientAPI,
  updateOAuthClientAPI,
  getOAuthClientSystemsAPI,
  regenerateOAuthClientSecretAPI
} from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useFormHandler } from '../../utils/formHandler'

export default function OAuthClientEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const formRef = useRef(null)
  const formHandler = useFormHandler({
    stayOnPage: true,
    autoNotify: true
  })
  const [client, setClient] = useState(null)
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentId, setCurrentId] = useState(id) // 追蹤當前 ID 狀態

  const isEditing = currentId && currentId !== 'create'
  const pageTitle = 'OAuth 客戶端'

  // 檢查用戶是否有編輯權限
  const canEdit = currentUser?.roles?.some(role => ['super_admin'].includes(role)) || false

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
    if (searchParams.get('filter_code')) {
      returnParams.set('filter_code', searchParams.get('filter_code'))
    }
    if (searchParams.get('filter_name')) {
      returnParams.set('filter_name', searchParams.get('filter_name'))
    }
    if (searchParams.get('filter_system_code')) {
      returnParams.set('filter_system_code', searchParams.get('filter_system_code'))
    }

    const queryString = returnParams.toString()
    return queryString ? `/sys-admin/oauth-clients?${queryString}` : '/sys-admin/oauth-clients'
  }

  // 表單資料
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    system_code: '',
    redirect_uris: '',
    grant_types: 'authorization_code,refresh_token',
    revoked: false
  })

  const loadClient = async (clientId = currentId) => {
    if (!clientId || clientId === 'create') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const response = await getOAuthClientAPI(clientId)

      if (response.success) {
        const clientData = response.data
        setClient(clientData)
        setFormData({
          code: clientData.code || '',
          name: clientData.name || '',
          system_code: clientData.system_code || '',
          redirect_uris: Array.isArray(clientData.redirect_uris) ? clientData.redirect_uris.join('\n') : (clientData.redirect_uris || ''),
          grant_types: Array.isArray(clientData.grant_types) ? clientData.grant_types.join(',') : (clientData.grant_types || 'authorization_code,refresh_token'),
          revoked: clientData.revoked || false
        })
      }
    } catch (err) {
      window.notifications.error(err.message || '載入 OAuth 客戶端資料失敗')
      console.error('Load OAuth client error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSystems = async () => {
    try {
      const response = await getOAuthClientSystemsAPI()
      if (response.success) {
        setSystems(response.data || [])
      }
    } catch (err) {
      console.error('Load systems error:', err)
    }
  }

  useEffect(() => {
    loadSystems()
    loadClient()
  }, [currentId])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await formHandler.submitForm(formRef.current, {
        url: isEditing ? `/sys-admin/oauth-clients/${currentId}` : '/sys-admin/oauth-clients',
        method: isEditing ? 'PUT' : 'POST',
        onSuccess: async (response) => {
          // 新增成功後切換到編輯模式
          if (!isEditing && response.data?.id) {
            setCurrentId(response.data.id.toString())
            await loadClient(response.data.id)
          }
        }
      })
    } catch (err) {
      console.error('Submit error:', err)
    }
  }

  const handleRegenerateSecret = async () => {
    if (!isEditing) return

    if (!window.confirm('確定要重新生成 Secret 嗎？舊的 Secret 將會失效。')) {
      return
    }

    try {
      const response = await regenerateOAuthClientSecretAPI(currentId)
      if (response.success) {
        await loadClient(currentId) // 重新載入資料以顯示新的 secret
        window.notifications.success('Secret 重新生成成功')
      }
    } catch (err) {
      window.notifications.error(err.message || '重新生成 Secret 失敗')
      console.error('Regenerate secret error:', err)
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

  if (isEditing && !client && !loading) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>OAuth 客戶端不存在或載入失敗</span>
        </div>
        <button className="btn btn-primary mt-4" onClick={() => navigate(getReturnUrl())}>
          回到客戶端列表
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
          {isEditing ? '修改 OAuth 2.0 客戶端設定' : '建立新的 OAuth 2.0 客戶端'}
        </p>
      </div>

      {/* 通知訊息由 formHandler 自動管理 */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OAuth 客戶端表單 */}
        <div className="lg:col-span-2">
          {/* Breadcrumb 與按鈕 */}
          <div className="flex items-center justify-between text-sm breadcrumbs mb-4">
            <ul>
              <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
              <li>系統管理</li>
              <li><a onClick={() => navigate(getReturnUrl())} className="cursor-pointer">OAuth 客戶端</a></li>
              <li>{isEditing ? '編輯客戶端' : '新增客戶端'}</li>
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
                  form="clientForm"
                  className="btn btn-primary btn-sm"
                >
                  儲存
                </button>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">客戶端資料</h2>

              <form id="clientForm" ref={formRef} onSubmit={handleSubmit} className="space-y-6" action={isEditing ? `/api/sys-admin/oauth-clients/${currentId}` : '/api/sys-admin/oauth-clients'} method={isEditing ? 'PUT' : 'POST'}>
                {/* 客戶端代碼 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 客戶端代碼</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="code"
                      className="input input-bordered w-full font-mono"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="例如: pos-web-app"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">用於識別 OAuth 客戶端的唯一代碼</div>
                  </div>
                </div>

                {/* 客戶端名稱 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 客戶端名稱</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered w-full"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="例如: POS 系統網頁版"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">在管理介面上顯示的客戶端名稱</div>
                  </div>
                </div>

                {/* 所屬系統 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 所屬系統</span>
                  </div>
                  <div className="col-span-9">
                    <select
                      name="system_code"
                      className="select select-bordered w-full"
                      value={formData.system_code}
                      onChange={handleInputChange}
                      required
                      disabled={!canEdit}
                    >
                      <option value="">選擇系統</option>
                      {systems.map(system => (
                        <option key={system.code} value={system.code}>{system.name}</option>
                      ))}
                    </select>
                    <div className="text-xs text-base-content/70 mt-1">選擇此客戶端所屬的業務系統</div>
                  </div>
                </div>

                {/* 重定向 URI */}
                <div className="grid grid-cols-12 items-start gap-4">
                  <div className="col-span-3 text-right pt-3">
                    <span className="label-text"><span className="text-red-600">*</span> 重定向 URI</span>
                  </div>
                  <div className="col-span-9">
                    <textarea
                      name="redirect_uris"
                      className="textarea textarea-bordered w-full"
                      rows="3"
                      value={formData.redirect_uris}
                      onChange={handleInputChange}
                      required
                      placeholder="https://example.com/callback"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">OAuth 認證完成後的回調 URL，多個 URI 請用逗號分隔</div>
                  </div>
                </div>

                {/* 授權類型 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text">授權類型</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="grant_types"
                      className="input input-bordered w-full font-mono"
                      value={formData.grant_types}
                      onChange={handleInputChange}
                      placeholder="authorization_code,refresh_token"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">支援的 OAuth 2.0 授權類型，用逗號分隔</div>
                  </div>
                </div>

                {/* 狀態 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text">狀態</span>
                  </div>
                  <div className="col-span-9">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        name="revoked"
                        className="checkbox"
                        checked={formData.revoked}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                      />
                      <span className="label-text">已撤銷 (勾選表示停用此客戶端)</span>
                    </label>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* 側邊欄資訊 */}
        <div className="lg:col-span-1">
          {/* 摘要 */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h3 className="card-title text-lg">摘要</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/70">客戶端 ID:</span>
                  <span className="font-mono">{isEditing ? currentId : '新增後產生'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">建立時間:</span>
                  <span>{formatDate(client?.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">更新時間:</span>
                  <span>{formatDate(client?.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secret 管理 */}
          {isEditing && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h3 className="card-title text-lg">Secret 管理</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">
                      <span className="label-text">Client Secret</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        className="input input-bordered input-sm flex-1 font-mono"
                        value={client?.secret || ''}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          const input = document.querySelector('input[type="password"]')
                          input.type = input.type === 'password' ? 'text' : 'password'
                        }}
                      >
                        👁
                      </button>
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      className="btn btn-warning btn-sm w-full"
                      onClick={handleRegenerateSecret}
                    >
                      重新生成 Secret
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 操作提示 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">操作說明</h3>
              <div className="text-sm space-y-2">
                <p>• 客戶端代碼必須唯一，建議使用系統代碼加用途的命名方式</p>
                <p>• 重定向 URI 必須是 HTTPS 協議（開發環境除外）</p>
                <p>• Secret 只在建立時顯示，請妥善保管</p>
                <p>• 撤銷客戶端會立即停用所有相關的 Token</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}