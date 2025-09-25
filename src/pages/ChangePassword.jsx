import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // 清除錯誤訊息
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = '請輸入目前密碼'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '請輸入新密碼'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '新密碼至少需要 8 個字元'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認新密碼'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '新密碼與確認密碼不符'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = '新密碼不能與目前密碼相同'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 顯示成功訊息
      alert('密碼變更成功！請重新登入。')

      // 返回個人資料頁面
      navigate('/profile')
    } catch (error) {
      console.error('密碼變更失敗:', error)
      setErrors({ submit: '密碼變更失敗，請稍後再試' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/profile')}
          >
            ← 返回個人資料
          </button>
        </div>
        <h1 className="text-3xl font-bold text-base-content">變更密碼</h1>
        <p className="text-base-content/70 mt-2">為了您的帳戶安全，請定期更新密碼</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">目前密碼</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  className={`input input-bordered ${errors.currentPassword ? 'input-error' : ''}`}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="請輸入目前密碼"
                />
                {errors.currentPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.currentPassword}</span>
                  </label>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">新密碼</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  className={`input input-bordered ${errors.newPassword ? 'input-error' : ''}`}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="請輸入新密碼（至少 8 個字元）"
                />
                {errors.newPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.newPassword}</span>
                  </label>
                )}
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">確認新密碼</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`input input-bordered ${errors.confirmPassword ? 'input-error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="請再次輸入新密碼"
                />
                {errors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                  </label>
                )}
              </div>

              {errors.submit && (
                <div className="alert alert-error mb-4">
                  <span>{errors.submit}</span>
                </div>
              )}

              <div className="form-control">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <span className="loading loading-spinner loading-sm"></span>}
                  {isSubmitting ? '變更中...' : '變更密碼'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 密碼安全提示 */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h3 className="card-title text-lg">密碼安全建議</h3>
            <ul className="text-sm text-base-content/70 space-y-1">
              <li>• 使用至少 8 個字元</li>
              <li>• 包含大小寫字母、數字和特殊符號</li>
              <li>• 避免使用個人資訊或常見密碼</li>
              <li>• 定期更新密碼</li>
              <li>• 不要在多個帳戶使用相同密碼</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}