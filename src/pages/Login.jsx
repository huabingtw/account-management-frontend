import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    account: 'demo',
    password: 'demo'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 使用 useAuth 的 login 函數
      await login({ account: formData.account, password: formData.password })

      setTimeout(() => {
        setIsLoading(false)
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit}>
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold">帳號管理中心</h1>
            <p className="text-base-content/70">登入您的帳戶</p>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">帳號</span>
            </label>
            <input
              type="text"
              name="account"
              placeholder="請輸入 Email 或手機號碼"
              className="input input-bordered"
              value={formData.account}
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

          <div className="text-center">
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