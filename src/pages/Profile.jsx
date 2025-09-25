import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '張三',
    email: 'zhang.san@example.com',
    phone: '+886 912 345 678',
    department: '資訊部',
    position: '系統工程師'
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    // 模擬 API 呼叫
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      console.log('Profile updated:', formData)
    }, 1000)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">個人資料</h1>
        <p className="text-base-content/70 mt-2">管理您的個人資訊</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 個人資料卡片 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <h2 className="card-title">基本資料</h2>
                {!isEditing ? (
                  <button
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    編輯
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsEditing(false)}
                    >
                      取消
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving && <span className="loading loading-spinner loading-xs"></span>}
                      儲存
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">姓名</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.name}</div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">電子郵件</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      className="input input-bordered"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.email}</div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">手機號碼</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      className="input input-bordered"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.phone}</div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">部門</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      className="input input-bordered"
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.department}</div>
                  )}
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">職位</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="position"
                      className="input input-bordered"
                      value={formData.position}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">{formData.position}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 密碼變更 */}
        <div>
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h3 className="card-title text-lg">安全設定</h3>
              <div className="space-y-3">
                <button
                  className="btn btn-outline w-full"
                  onClick={() => navigate('/change-password')}
                >
                  🔒 變更密碼
                </button>
                <button className="btn btn-outline w-full">
                  📱 雙因子驗證
                </button>
                <button className="btn btn-outline w-full">
                  🔑 API 金鑰
                </button>
              </div>
            </div>
          </div>

          {/* 帳戶狀態 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">帳戶狀態</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>帳戶狀態</span>
                  <div className="badge badge-success">正常</div>
                </div>
                <div className="flex justify-between items-center">
                  <span>最後登入</span>
                  <span className="text-sm text-base-content/70">2 小時前</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>建立時間</span>
                  <span className="text-sm text-base-content/70">2023-01-15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}