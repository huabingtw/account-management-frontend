import React, { useState } from 'react'

export default function DeviceSecurity() {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: '我的筆電 - Chrome',
      deviceType: 'laptop',
      browser: 'Chrome',
      os: 'Windows 11',
      location: '台北, 台灣',
      lastActive: '現在',
      trusted: true,
      current: true,
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      name: 'iPhone 15',
      deviceType: 'mobile',
      browser: 'Safari',
      os: 'iOS 17',
      location: '台北, 台灣',
      lastActive: '2 小時前',
      trusted: true,
      current: false,
      ipAddress: '192.168.1.101'
    },
    {
      id: 3,
      name: '辦公室電腦 - Edge',
      deviceType: 'desktop',
      browser: 'Edge',
      os: 'Windows 11',
      location: '新北, 台灣',
      lastActive: '昨天',
      trusted: false,
      current: false,
      ipAddress: '203.74.205.xxx'
    },
    {
      id: 4,
      name: '未知裝置 - Chrome',
      deviceType: 'unknown',
      browser: 'Chrome',
      os: 'Android',
      location: '高雄, 台灣',
      lastActive: '3 天前',
      trusted: false,
      current: false,
      ipAddress: '114.24.xxx.xxx'
    }
  ])

  const [showMfaModal, setShowMfaModal] = useState(false)

  const handleTrustDevice = (deviceId) => {
    setDevices(devices.map(device =>
      device.id === deviceId ? { ...device, trusted: !device.trusted } : device
    ))
  }

  const handleRemoveDevice = (deviceId) => {
    setDevices(devices.filter(device => device.id !== deviceId))
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'laptop': return '💻'
      case 'desktop': return '🖥️'
      case 'mobile': return '📱'
      default: return '❓'
    }
  }

  const getDeviceTypeText = (type) => {
    switch (type) {
      case 'laptop': return '筆記型電腦'
      case 'desktop': return '桌上型電腦'
      case 'mobile': return '行動裝置'
      default: return '未知裝置'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">裝置安全管理</h1>
        <p className="text-base-content/70 mt-2">管理您的登入裝置和安全設定</p>
      </div>

      {/* 安全概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success text-2xl">✅</div>
          <div className="stat-title">信任裝置</div>
          <div className="stat-value text-success">{devices.filter(d => d.trusted).length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning text-2xl">⚠️</div>
          <div className="stat-title">待驗證</div>
          <div className="stat-value text-warning">{devices.filter(d => !d.trusted).length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info text-2xl">🌐</div>
          <div className="stat-title">活躍裝置</div>
          <div className="stat-value text-info">{devices.filter(d => d.lastActive.includes('小時') || d.lastActive === '現在').length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary text-2xl">🔐</div>
          <div className="stat-title">雙因子驗證</div>
          <div className="stat-value text-primary">啟用</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 裝置清單 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">已登入的裝置</h2>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className={`p-4 rounded-lg border-2 ${
                    device.current ? 'border-primary bg-primary/10' :
                    device.trusted ? 'border-success bg-success/10' : 'border-warning bg-warning/10'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getDeviceIcon(device.deviceType)}</div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {device.name}
                            {device.current && <div className="badge badge-primary badge-sm">目前裝置</div>}
                            {device.trusted && !device.current && <div className="badge badge-success badge-sm">已信任</div>}
                            {!device.trusted && <div className="badge badge-warning badge-sm">待驗證</div>}
                          </div>
                          <div className="text-sm text-base-content/70 space-y-1">
                            <div>{getDeviceTypeText(device.deviceType)} • {device.browser} • {device.os}</div>
                            <div>📍 {device.location}</div>
                            <div>🌐 IP: {device.ipAddress}</div>
                            <div>🕐 最後活動: {device.lastActive}</div>
                          </div>
                        </div>
                      </div>

                      {!device.current && (
                        <div className="flex gap-2">
                          <button
                            className={`btn btn-sm ${device.trusted ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleTrustDevice(device.id)}
                          >
                            {device.trusted ? '取消信任' : '設為信任'}
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleRemoveDevice(device.id)}
                          >
                            移除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 安全設定 */}
        <div className="space-y-6">
          {/* 雙因子驗證 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">雙因子驗證</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>簡訊驗證</span>
                  <input type="checkbox" className="toggle toggle-success" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span>Email 驗證</span>
                  <input type="checkbox" className="toggle toggle-success" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span>驗證器 App</span>
                  <input type="checkbox" className="toggle" />
                </div>
                <button
                  className="btn btn-outline btn-primary btn-sm w-full"
                  onClick={() => setShowMfaModal(true)}
                >
                  設定驗證器
                </button>
              </div>
            </div>
          </div>

          {/* 安全警示 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">安全警示</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>新裝置登入</span>
                  <input type="checkbox" className="toggle toggle-warning" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span>異常位置登入</span>
                  <input type="checkbox" className="toggle toggle-warning" defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <span>密碼變更</span>
                  <input type="checkbox" className="toggle toggle-info" defaultChecked />
                </div>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">快速操作</h3>
              <div className="space-y-2">
                <button className="btn btn-outline btn-error btn-sm w-full">
                  登出所有裝置
                </button>
                <button className="btn btn-outline btn-warning btn-sm w-full">
                  清除未信任裝置
                </button>
                <button className="btn btn-outline btn-info btn-sm w-full">
                  下載登入記錄
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 設定驗證器 Modal */}
      {showMfaModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">設定雙因子驗證器</h3>
            <div className="text-center space-y-4">
              <div className="w-48 h-48 bg-base-200 rounded-lg mx-auto flex items-center justify-center">
                <div className="text-4xl">📱</div>
              </div>
              <p className="text-sm text-base-content/70">
                使用 Google Authenticator 或其他驗證器 App 掃描 QR Code
              </p>
              <div className="form-control">
                <input
                  type="text"
                  placeholder="輸入 6 位數驗證碼"
                  className="input input-bordered text-center"
                  maxLength="6"
                />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-outline" onClick={() => setShowMfaModal(false)}>
                取消
              </button>
              <button className="btn btn-primary">
                驗證並啟用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}