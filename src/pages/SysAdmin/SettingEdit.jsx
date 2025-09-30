import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getSettingAPI,
  createSettingAPI,
  updateSettingAPI,
  getSettingsGroupsAPI
} from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useFormHandler } from '../../utils/formHandler'

export default function SettingEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const formRef = useRef(null)
  const formHandler = useFormHandler({
    stayOnPage: true,
    autoNotify: true
  })
  const [setting, setSetting] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentId, setCurrentId] = useState(id) // 追蹤當前 ID 狀態

  const isEditing = currentId && currentId !== 'create'
  const pageTitle = isEditing ? '編輯設定' : '新增設定'

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
    if (searchParams.get('filter_group')) {
      returnParams.set('filter_group', searchParams.get('filter_group'))
    }
    if (searchParams.get('filter_key')) {
      returnParams.set('filter_key', searchParams.get('filter_key'))
    }
    if (searchParams.get('filter_name')) {
      returnParams.set('filter_name', searchParams.get('filter_name'))
    }

    const queryString = returnParams.toString()
    return queryString ? `/sys-admin/settings?${queryString}` : '/sys-admin/settings'
  }

  // 表單資料
  const [formData, setFormData] = useState({
    group: '',
    setting_key: '',
    setting_value: '',
    name: '',
    comment: '',
    is_autoload: false,
    is_json: false
  })

  const loadSetting = async (settingId = currentId) => {
    if (!settingId || settingId === 'create') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const response = await getSettingAPI(settingId)

      if (response.success) {
        const settingData = response.data
        setSetting(settingData)
        setFormData({
          group: settingData.group || '',
          setting_key: settingData.setting_key || '',
          setting_value: settingData.setting_value || '',
          name: settingData.name || '',
          comment: settingData.comment || '',
          is_autoload: settingData.is_autoload || false,
          is_json: settingData.is_json || false
        })
      }
    } catch (err) {
      window.notifications.error(err.message || '載入設定資料失敗')
      console.error('Load setting error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const response = await getSettingsGroupsAPI()
      if (response.success) {
        setGroups(response.data || [])
      }
    } catch (err) {
      console.error('Load groups error:', err)
    }
  }

  useEffect(() => {
    loadGroups()
    loadSetting()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateJson = (value) => {
    if (!formData.is_json) return true
    if (!value.trim()) return true

    try {
      JSON.parse(value)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canEdit) {
      window.notifications.error('您沒有權限執行此操作')
      return
    }

    // 驗證 JSON 格式
    if (formData.is_json && formData.setting_value && !validateJson(formData.setting_value)) {
      window.notifications.error('JSON 格式不正確，請檢查語法')
      return
    }

    try {
      // 使用 OpenCart 風格的表單提交
      const submitUrl = isEditing
        ? `/sys-admin/settings/${currentId}`
        : '/sys-admin/settings'

      const method = isEditing ? 'PUT' : 'POST'

      await formHandler.submitForm(formRef.current, {
        url: submitUrl,
        method: method,
        onSuccess: async (response, form) => {
          // 如果是新增成功，更新當前狀態和 URL
          if (!isEditing && response.data && response.data.id) {
            const newId = response.data.id.toString()
            setCurrentId(newId)

            // 重新載入完整的設定資料
            await loadSetting(newId)
          } else if (isEditing) {
            // 編輯模式下重新載入資料以確保顯示最新狀態
            await loadSetting(currentId)
          }
        }
      })
    } catch (err) {
      console.error('Save setting error:', err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-TW')
  }

  const formatJsonValue = () => {
    if (!formData.is_json || !formData.setting_value) return formData.setting_value
    try {
      const parsed = JSON.parse(formData.setting_value)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return formData.setting_value
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

  if (isEditing && !setting && !loading) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>設定不存在或載入失敗</span>
        </div>
        <button className="btn btn-primary mt-4" onClick={() => navigate(getReturnUrl())}>
          回到設定列表
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
          {isEditing ? '修改系統設定參數' : '建立新的系統設定參數'}
        </p>

      </div>

      {/* 通知訊息由 formHandler 自動管理 */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 設定表單 */}
        <div className="lg:col-span-2">
          {/* Breadcrumb 與按鈕 */}
          <div className="flex items-center justify-between text-sm breadcrumbs mb-4">
            <ul>
              <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
              <li>系統管理</li>
              <li><a onClick={() => navigate(getReturnUrl())} className="cursor-pointer">參數設定</a></li>
              <li>{isEditing ? '編輯設定' : '新增設定'}</li>
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
                  form="settingForm"
                  className="btn btn-primary btn-sm"
                  disabled={formData.is_json && formData.setting_value && !validateJson(formData.setting_value)}
                >
                  儲存
                </button>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">設定資料</h2>

              <form id="settingForm" ref={formRef} onSubmit={handleSubmit} className="space-y-6" action={isEditing ? `/api/sys-admin/settings/${currentId}` : '/api/sys-admin/settings'} method={isEditing ? 'PUT' : 'POST'}>
                {/* 隱藏欄位用於 locale */}
                <input type="hidden" name="locale" value="" />
                {/* 群組 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 群組</span>
                  </div>
                  <div className="col-span-9">
                    <div className="flex gap-2">
                      <select
                        name="group"
                        className="select select-bordered flex-1"
                        value={formData.group}
                        onChange={handleInputChange}
                        required
                        disabled={!canEdit}
                      >
                        <option value="">選擇群組</option>
                        {groups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="group"
                        className="input input-bordered flex-1"
                        placeholder="或輸入新群組名稱"
                        value={formData.group}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                      />
                    </div>
                    <div className="text-xs text-base-content/70 mt-1">選擇現有群組或輸入新群組名稱</div>
                  </div>
                </div>

                {/* 設定鍵 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text"><span className="text-red-600">*</span> 設定鍵</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="setting_key"
                      className="input input-bordered w-full font-mono"
                      value={formData.setting_key}
                      onChange={handleInputChange}
                      required
                      placeholder="例如: app_name"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">用於程式中的設定識別碼，建議使用英文和底線</div>
                  </div>
                </div>

                {/* 名稱 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 text-right">
                    <span className="label-text">名稱</span>
                  </div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered w-full"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="例如: 應用程式名稱"
                      disabled={!canEdit}
                    />
                    <div className="text-xs text-base-content/70 mt-1">在介面上顯示的設定名稱</div>
                  </div>
                </div>

                {/* 類型選項 */}
                <div className="grid grid-cols-12 items-start gap-4">
                  <div className="col-span-3 text-right pt-3">
                    <span className="label-text">類型</span>
                  </div>
                  <div className="col-span-9">
                    <div className="flex gap-4">
                      <label className="cursor-pointer label">
                        <input
                          type="checkbox"
                          name="is_json"
                          className="checkbox"
                          checked={formData.is_json}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                        <span className="label-text ml-2">JSON 格式</span>
                      </label>
                      <label className="cursor-pointer label">
                        <input
                          type="checkbox"
                          name="is_autoload"
                          className="checkbox"
                          checked={formData.is_autoload}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                        <span className="label-text ml-2">自動載入</span>
                      </label>
                    </div>
                    <div className="text-xs text-base-content/70 mt-1">
                      JSON 格式用於儲存複雜資料結構，自動載入會在系統啟動時載入
                    </div>
                  </div>
                </div>

                {/* 設定值 */}
                <div className="grid grid-cols-12 items-start gap-4">
                  <div className="col-span-3 text-right pt-3">
                    <span className="label-text">設定值</span>
                  </div>
                  <div className="col-span-9">
                    {formData.is_json ? (
                      <textarea
                        name="setting_value"
                        className="textarea textarea-bordered w-full font-mono"
                        rows="8"
                        value={formData.setting_value}
                        onChange={handleInputChange}
                        placeholder='{"key": "value"}'
                        disabled={!canEdit}
                      />
                    ) : (
                      <textarea
                        name="setting_value"
                        className="textarea textarea-bordered w-full"
                        rows="4"
                        value={formData.setting_value}
                        onChange={handleInputChange}
                        placeholder="輸入設定值"
                        disabled={!canEdit}
                      />
                    )}
                    {formData.is_json && (
                      <div className="text-xs text-base-content/70 mt-1">
                        請輸入有效的 JSON 格式資料
                        {formData.setting_value && !validateJson(formData.setting_value) && (
                          <span className="text-error ml-2">⚠ JSON 格式不正確</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 備註 */}
                <div className="grid grid-cols-12 items-start gap-4">
                  <div className="col-span-3 text-right pt-3">
                    <span className="label-text">備註</span>
                  </div>
                  <div className="col-span-9">
                    <textarea
                      name="comment"
                      className="textarea textarea-bordered w-full"
                      rows="3"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder="詳細說明此設定的用途和注意事項"
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
          {isEditing && setting && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">摘要</h3>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-base-content/70">設定 ID</div>
                    <div className="font-mono text-xs">{setting.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-base-content/70">建立時間</div>
                    <div className="text-sm">{formatDate(setting.created_at)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-base-content/70">最後更新</div>
                    <div className="text-sm">{formatDate(setting.updated_at)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-base-content/70">當前狀態</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className={`badge badge-xs ${setting.is_json ? 'badge-info' : 'badge-ghost'}`}>
                        {setting.is_json ? 'JSON' : 'TEXT'}
                      </span>
                      {setting.is_autoload && (
                        <span className="badge badge-success badge-xs">自動載入</span>
                      )}
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
                <p>• 設定鍵應該使用英文，建議格式為「模組_設定」</p>
                <p>• 群組用於組織相關的設定參數</p>
                <p>• JSON 格式支援複雜的資料結構</p>
                <p>• 自動載入的設定會在系統啟動時載入到記憶體</p>
              </div>
            </div>
          </div>

          {/* JSON 預覽 */}
          {formData.is_json && formData.setting_value && validateJson(formData.setting_value) && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">JSON 預覽</h3>
                <pre className="text-xs bg-base-200 p-2 rounded overflow-x-auto">
                  {formatJsonValue()}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}