import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import GoogleLogin from '../components/GoogleLogin.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login, googleLogin } = useAuth()

  // Google OAuth Client ID (需要從 Google Cloud Console 獲取)
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE" // 這裡需要替換為實際的 Google Client ID
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
      // 使用 useAuth 的 login 函數
      await login({ email: formData.email, password: formData.password })

      // 登入成功，跳轉到儀表板
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      setError(error.message || '登入失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (googleToken) => {
    setIsLoading(true)
    setError('')

    try {
      await googleLogin(googleToken)
      // 登入成功，跳轉到儀表板
      navigate('/dashboard')
    } catch (error) {
      console.error('Google login failed:', error)
      setError(error.message || 'Google 登入失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = (error) => {
    setError('Google 登入發生錯誤：' + error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
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
              <a href="#" className="label-text-alt link link-hover">忘記密碼？</a>
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

          <div className="divider">或</div>

          {/* Google 登入按鈕 */}
          <div className="form-control">
            <GoogleLogin
              clientId={GOOGLE_CLIENT_ID}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-base-content/70">
              還沒有帳戶？
              <a href="#" className="link link-primary ml-1">立即註冊</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}