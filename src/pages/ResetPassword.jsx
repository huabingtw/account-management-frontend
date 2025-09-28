import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPasswordAPI } from '../services/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirmation: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  // 從 URL 參數獲取 token 和 email
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    // 檢查必要參數是否存在
    if (!token || !email) {
      setErrors({ submit: '無效的重設密碼連結，請重新申請忘記密碼' })
    }
  }, [token, email])

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

    if (!formData.password) {
      newErrors.password = '請輸入新密碼'
    } else if (formData.password.length < 8) {
      newErrors.password = '密碼至少需要 8 個字元'
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = '請確認新密碼'
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = '密碼與確認密碼不符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token || !email) {
      setErrors({ submit: '無效的重設密碼連結' })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await resetPasswordAPI(token, email, formData.password, formData.passwordConfirmation)
      setIsSuccess(true)
    } catch (error) {
      console.error('重設密碼失敗:', error)

      let errorMessage = '重設密碼失敗，請稍後再試'
      if (error.status === 400) {
        errorMessage = '密碼格式不正確'
      } else if (error.status === 401 || error.status === 422) {
        errorMessage = '重設密碼連結已過期或無效，請重新申請忘記密碼'
      } else if (error.status === 0) {
        errorMessage = error.message || '網路連線失敗'
      }

      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md shadow-2xl bg-base-100">
          <div className="card-body text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-base-content">密碼重設成功</h1>
              <p className="text-base-content/70 mt-2">
                您的密碼已成功重設，請使用新密碼登入
              </p>
            </div>

            <Link to="/login" className="btn btn-primary btn-block">
              前往登入頁面
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit}>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-base-content">重設密碼</h1>
            <p className="text-base-content/70 mt-2">
              請設定您的新密碼
            </p>
            {email && (
              <p className="text-sm text-base-content/60 mt-1">
                帳戶：{email}
              </p>
            )}
          </div>

          {errors.submit && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">新密碼</span>
            </label>
            <input
              type="password"
              name="password"
              className={`input input-bordered ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="請輸入新密碼（至少 8 個字元）"
              disabled={!token || !email}
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.password}</span>
              </label>
            )}
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">確認新密碼</span>
            </label>
            <input
              type="password"
              name="passwordConfirmation"
              className={`input input-bordered ${errors.passwordConfirmation ? 'input-error' : ''}`}
              value={formData.passwordConfirmation}
              onChange={handleInputChange}
              placeholder="請再次輸入新密碼"
              disabled={!token || !email}
            />
            {errors.passwordConfirmation && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.passwordConfirmation}</span>
              </label>
            )}
          </div>

          <div className="form-control mb-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !token || !email}
            >
              {isSubmitting && <span className="loading loading-spinner loading-sm"></span>}
              {isSubmitting ? '重設中...' : '重設密碼'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link to="/login" className="link link-primary text-sm block">
              ← 返回登入頁面
            </Link>
            <Link to="/forgot-password" className="link link-secondary text-sm block">
              重新申請忘記密碼
            </Link>
          </div>

          {/* 密碼安全提示 */}
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">密碼安全建議</h4>
            <ul className="text-xs text-base-content/70 space-y-1">
              <li>• 使用至少 8 個字元</li>
              <li>• 包含大小寫字母、數字和特殊符號</li>
              <li>• 避免使用個人資訊或常見密碼</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}