import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getMetaKeyAPI,
  createMetaKeyAPI,
  updateMetaKeyAPI,
  getMetaKeyDataTypesAPI
} from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function AdminMetaKeyEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const [metaKey, setMetaKey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dataTypes, setDataTypes] = useState({})

  const isEditing = id && id !== 'new'
  const pageTitle = isEditing ? '編輯擴充欄位' : '新增擴充欄位'

  // 檢查用戶是否有編輯權限（只有 super_admin 可以編輯）
  const canEdit = currentUser?.roles?.some(role => ['super_admin'].includes(role)) || false

  // 表單狀態
  const [formData, setFormData] = useState({
    entity: '',
    key_name: '',
    data_type: 'string',
    description: ''
  })

  // 表單驗證錯誤
  const [validationErrors, setValidationErrors] = useState({})

  // 生成返回列表的 URL，保留查詢參數
  const getReturnUrl = () => {
    const returnParams = new URLSearchParams()

    if (searchParams.get('page')) {
      returnParams.set('page', searchParams.get('page'))
    }
    if (searchParams.get('limit')) {
      returnParams.set('limit', searchParams.get('limit'))
    }
    if (searchParams.get('filter_entity')) {
      returnParams.set('filter_entity', searchParams.get('filter_entity'))
    }
    if (searchParams.get('filter_key_name')) {
      returnParams.set('filter_key_name', searchParams.get('filter_key_name'))
    }
    if (searchParams.get('filter_data_type')) {
      returnParams.set('filter_data_type', searchParams.get('filter_data_type'))
    }

    const queryString = returnParams.toString()
    return `/sys-admin/meta-keys${queryString ? '?' + queryString : ''}`
  }

  // 載入資料類型選項
  const loadDataTypes = async () => {
    try {
      const response = await getMetaKeyDataTypesAPI()
      if (response.success) {
        setDataTypes(response.data || {})
      }
    } catch (err) {
      console.error('載入資料類型失敗:', err)
    }
  }

  // 載入擴充欄位資料
  const loadMetaKey = async () => {
    if (!isEditing) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await getMetaKeyAPI(id)
      if (response.success) {
        const data = response.data
        setMetaKey(data)
        setFormData({
          entity: data.entity || '',
          key_name: data.key_name || '',
          data_type: data.data_type || 'string',
          description: data.description || ''
        })
      } else {
        setError(response.message || '載入擴充欄位失敗')
      }
    } catch (err) {
      console.error('載入擴充欄位失敗:', err)
      setError(err.message || '載入擴充欄位失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!canEdit) {
      navigate(getReturnUrl())
      return
    }

    loadDataTypes()
    loadMetaKey()
  }, [id, canEdit])

  // 表單輸入處理
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 清除對應的驗證錯誤
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  // 表單驗證
  const validateForm = () => {
    const errors = {}

    if (!formData.entity.trim()) {
      errors.entity = '實體類型為必填'
    }

    if (!formData.key_name.trim()) {
      errors.key_name = '欄位名稱為必填'
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.key_name)) {
      errors.key_name = '欄位名稱只能包含字母、數字和底線，且不能以數字開頭'
    }

    if (!formData.data_type) {
      errors.data_type = '資料類型為必填'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const submitData = {
        entity: formData.entity.trim(),
        key_name: formData.key_name.trim(),
        data_type: formData.data_type,
        description: formData.description.trim()
      }

      let response
      if (isEditing) {
        response = await updateMetaKeyAPI(id, submitData)
      } else {
        response = await createMetaKeyAPI(submitData)
      }

      if (response.success) {
        setSuccess(isEditing ? '擴充欄位更新成功' : '擴充欄位新增成功')
        setTimeout(() => {
          navigate(getReturnUrl())
        }, 1500)
      } else {
        setError(response.message || '操作失敗')
      }
    } catch (err) {
      console.error('提交失敗:', err)
      setError(err.message || '操作失敗')
    } finally {
      setSaving(false)
    }
  }

  // 取消並返回列表
  const handleCancel = () => {
    navigate(getReturnUrl())
  }

  if (!canEdit) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={handleCancel}
          className="btn btn-ghost btn-sm mr-4"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          返回列表
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? '編輯現有的擴充欄位' : '新增系統擴充欄位'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
                <span className="ml-2">載入中...</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error mb-6">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-6">
                <i className="fas fa-check-circle"></i>
                <span>{success}</span>
              </div>
            )}

            {!loading && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">實體類型 <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="entity"
                    placeholder="例如: user, order, product"
                    className={`input input-bordered ${validationErrors.entity ? 'input-error' : ''}`}
                    value={formData.entity}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  {validationErrors.entity && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{validationErrors.entity}</span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">指定這個擴充欄位屬於哪個實體</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">欄位名稱 <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="key_name"
                    placeholder="例如: gender, phone, address"
                    className={`input input-bordered ${validationErrors.key_name ? 'input-error' : ''}`}
                    value={formData.key_name}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  {validationErrors.key_name && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{validationErrors.key_name}</span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">只能包含字母、數字和底線，且不能以數字開頭</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">資料類型 <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    name="data_type"
                    className={`select select-bordered ${validationErrors.data_type ? 'select-error' : ''}`}
                    value={formData.data_type}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    {Object.entries(dataTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  {validationErrors.data_type && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">{validationErrors.data_type}</span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt">選擇此欄位儲存的資料類型</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">描述</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="欄位的用途說明..."
                    className="textarea textarea-bordered"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={saving}
                  ></textarea>
                  <label className="label">
                    <span className="label-text-alt">選填，描述此欄位的用途</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving && <span className="loading loading-spinner loading-sm mr-2"></span>}
                    <i className="fas fa-save mr-2"></i>
                    {isEditing ? '更新' : '新增'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline"
                    disabled={saving}
                  >
                    <i className="fas fa-times mr-2"></i>
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}