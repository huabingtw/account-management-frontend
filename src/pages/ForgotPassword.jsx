import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { forgotPasswordAPI } from '../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setError('請輸入 Email 地址')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await forgotPasswordAPI(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('忘記密碼請求失敗:', error)

      let errorMessage = '發送重設密碼郵件失敗，請稍後再試'
      if (error.status === 404) {
        errorMessage = '找不到該 Email 地址的帳戶'
      } else if (error.status === 429) {
        errorMessage = '請求過於頻繁，請稍後再試'
      } else if (error.status === 0) {
        errorMessage = error.message || '網路連線失敗'
      }

      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
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
              <h1 className="text-2xl font-bold text-base-content">郵件已發送</h1>
              <p className="text-base-content/70 mt-2">
                我們已將重設密碼的說明發送到您的 Email 地址
              </p>
              <p className="text-sm text-base-content/60 mt-2">
                <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <div>請檢查您的 Email 信箱（包括垃圾郵件夾）</div>
                  <div>如果沒有收到郵件，請稍後再試一次</div>
                </div>
              </div>

              <Link to="/login" className="btn btn-primary btn-block">
                返回登入頁面
              </Link>

              <button
                className="btn btn-outline btn-block"
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                  setError('')
                }}
              >
                重新發送
              </button>
            </div>
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
            <h1 className="text-3xl font-bold text-base-content">忘記密碼</h1>
            <p className="text-base-content/70 mt-2">
              輸入您的 Email 地址，我們將發送重設密碼的說明
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Email 地址</span>
            </label>
            <input
              type="email"
              placeholder="請輸入您的 Email 地址"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-control mb-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="loading loading-spinner loading-sm"></span>}
              {isSubmitting ? '發送中...' : '發送重設密碼郵件'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="link link-primary text-sm">
              ← 返回登入頁面
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}