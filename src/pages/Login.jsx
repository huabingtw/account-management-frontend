import React, { useState } from 'react'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    // 模擬 API 呼叫
    setTimeout(() => {
      setIsLoading(false)
      console.log('Login attempt:', formData)
    }, 1000)
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
              <span className="label-text">電子郵件</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="請輸入電子郵件"
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