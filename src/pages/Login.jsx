import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { loginAPI, complete2FALoginAPI } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const { setAuthData } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 2FA 相關狀態
  const [requires2FA, setRequires2FA] = useState(false)
  const [verificationData, setVerificationData] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 直接調用 API 而不是使用 useAuth 的 login
      const response = await loginAPI(formData.email, formData.password)

      // 檢查是否需要 2FA
      if (response.requires_2fa) {
        setRequires2FA(true)
        setVerificationData(response.data)
      } else {
        // 直接登入成功，設置認證資料
        setAuthData(response.data.user, response.data.token)
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError(error.message || '登入失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // 完成 2FA 驗證
  const handle2FASubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await complete2FALoginAPI(verificationData.verification_id, verificationCode)

      // 2FA 驗證成功，設置認證資料
      setAuthData(response.data.user, response.data.token)
      navigate('/dashboard')
    } catch (error) {
      console.error('2FA verification failed:', error)
      setError(error.message || '驗證碼錯誤，請重新輸入')
    } finally {
      setIsLoading(false)
    }
  }

  // 重新開始登入流程
  const handleBackToLogin = () => {
    setRequires2FA(false)
    setVerificationData(null)
    setVerificationCode('')
    setError('')
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        {!requires2FA ? (
          // 一般登入表單
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold">帳號管理中心</h1>
              <p className="text-base-content/70">登入您的帳戶</p>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="請輸入 Email"
                className="input input-bordered"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">密碼</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="請輸入密碼"
                className="input input-bordered"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label className="label">
                <Link to="/forgot-password" className="label-text-alt link link-hover">忘記密碼？</Link>
              </label>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                登入
              </button>
            </div>
          </form>
        ) : (
          // 2FA 驗證表單
          <form className="card-body" onSubmit={handle2FASubmit}>
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold">🔐 雙因子驗證</h1>
              <p className="text-base-content/70">請輸入驗證碼</p>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {verificationData && (
              <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-bold">需要進行雙因子驗證</div>
                  <div className="text-sm">
                    驗證碼已發送到：{verificationData.email}
                  </div>
                  {verificationData.reasons && (
                    <div className="text-xs mt-1">
                      原因：{verificationData.reasons.join('、')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">6 位數驗證碼</span>
              </label>
              <input
                type="text"
                placeholder="例如：123456"
                className="input input-bordered text-center text-lg tracking-widest"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  驗證碼有效期限：{verificationData?.expires_at && new Date(verificationData.expires_at).toLocaleTimeString('zh-TW')}
                </span>
              </label>
            </div>

            <div className="form-control mt-6 space-y-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                驗證並登入
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleBackToLogin}
                disabled={isLoading}
              >
                返回登入
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-base-content/70">
          還沒有帳戶？
          <a href="#" className="link link-primary ml-1">立即註冊</a>
        </p>
      </div>
    </div>
  )
}