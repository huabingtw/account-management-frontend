import React, { useState, useEffect } from 'react'
import {
  getDevicesAPI,
  trustDeviceAPI,
  removeTrustDeviceAPI,
  revokeDeviceAPI,
  revokeOtherDevicesAPI,
  updateDeviceNameAPI,
  check2FAStatusAPI
} from '../services/api'

export default function DeviceSecurity() {
  const [devices, setDevices] = useState([])
  const [twoFactorStatus, setTwoFactorStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingDevice, setEditingDevice] = useState(null)
  const [newDeviceName, setNewDeviceName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // 載入裝置列表和 2FA 狀態
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 並行載入裝置列表和 2FA 狀態
        const [devicesResponse, statusResponse] = await Promise.all([
          getDevicesAPI(),
          check2FAStatusAPI()
        ])

        setDevices(devicesResponse.data.devices || [])
        setTwoFactorStatus(statusResponse.data)
      } catch (err) {
        console.error('載入資料失敗:', err)
        setError('無法載入裝置資料，請稍後再試')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 切換裝置信任狀態
  const handleTrustDevice = async (deviceId) => {
    try {
      setIsProcessing(true)
      const device = devices.find(d => d.id === deviceId)

      if (device.is_trusted) {
        await removeTrustDeviceAPI(deviceId)
      } else {
        await trustDeviceAPI(deviceId)
      }

      // 重新載入裝置列表
      const response = await getDevicesAPI()
      setDevices(response.data.devices || [])
    } catch (err) {
      console.error('切換信任狀態失敗:', err)
      setError('操作失敗，請稍後再試')
    } finally {
      setIsProcessing(false)
    }
  }

  // 撤銷裝置
  const handleRemoveDevice = async (deviceId) => {
    if (!confirm('確定要撤銷此裝置嗎？撤銷後該裝置將無法存取您的帳戶。')) {
      return
    }

    try {
      setIsProcessing(true)
      await revokeDeviceAPI(deviceId)

      // 重新載入裝置列表
      const response = await getDevicesAPI()
      setDevices(response.data.devices || [])
    } catch (err) {
      console.error('撤銷裝置失敗:', err)
      setError('撤銷裝置失敗，請稍後再試')
    } finally {
      setIsProcessing(false)
    }
  }

  // 撤銷其他裝置
  const handleRevokeOtherDevices = async () => {
    if (!confirm('確定要撤銷所有其他裝置嗎？只有目前使用的裝置會保留。')) {
      return
    }

    try {
      setIsProcessing(true)
      await revokeOtherDevicesAPI()

      // 重新載入裝置列表
      const response = await getDevicesAPI()
      setDevices(response.data.devices || [])
    } catch (err) {
      console.error('撤銷其他裝置失敗:', err)
      setError('撤銷其他裝置失敗，請稍後再試')
    } finally {
      setIsProcessing(false)
    }
  }

  // 更新裝置名稱
  const handleUpdateDeviceName = async (deviceId) => {
    if (!newDeviceName.trim()) {
      setEditingDevice(null)
      return
    }

    try {
      setIsProcessing(true)
      await updateDeviceNameAPI(deviceId, newDeviceName.trim())

      // 重新載入裝置列表
      const response = await getDevicesAPI()
      setDevices(response.data.devices || [])
      setEditingDevice(null)
      setNewDeviceName('')
    } catch (err) {
      console.error('更新裝置名稱失敗:', err)
      setError('更新裝置名稱失敗，請稍後再試')
    } finally {
      setIsProcessing(false)
    }
  }

  // 開始編輯裝置名稱
  const startEditingDevice = (device) => {
    setEditingDevice(device.id)
    setNewDeviceName(device.device_display_name || device.device_name || '')
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'desktop': return '💻'
      case 'mobile': return '📱'
      case 'tablet': return '📟'
      default: return '🖥️'
    }
  }

  const getDeviceTypeText = (type) => {
    switch (type) {
      case 'desktop': return '桌上型電腦'
      case 'mobile': return '行動裝置'
      case 'tablet': return '平板電腦'
      default: return '電腦裝置'
    }
  }

  // 格式化最後使用時間
  const formatLastUsedAt = (lastUsedAt) => {
    if (!lastUsedAt) return '未知'

    const date = new Date(lastUsedAt)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return '剛剛'
    if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} 小時前`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} 天前`

    return date.toLocaleDateString('zh-TW')
  }

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">裝置安全管理</h1>
          <p className="text-base-content/70 mt-2">管理您的登入裝置和安全設定</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">裝置安全管理</h1>
        <p className="text-base-content/70 mt-2">管理您的登入裝置和安全設定</p>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => window.location.reload()}
          >
            重新載入
          </button>
        </div>
      )}

      {/* 安全概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success text-2xl">✅</div>
          <div className="stat-title">信任裝置</div>
          <div className="stat-value text-success">{devices.filter(d => d.is_trusted).length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning text-2xl">⚠️</div>
          <div className="stat-title">待驗證</div>
          <div className="stat-value text-warning">{devices.filter(d => !d.is_trusted).length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info text-2xl">🌐</div>
          <div className="stat-title">總裝置數</div>
          <div className="stat-value text-info">{devices.length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary text-2xl">🔐</div>
          <div className="stat-title">雙因子驗證</div>
          <div className="stat-value text-primary">
            {twoFactorStatus?.user?.two_factor_enabled ? '已啟用' : '未啟用'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 裝置清單 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">已登入的裝置</h2>
              <div className="space-y-4">
                {devices.length === 0 && !isLoading ? (
                  <div className="text-center py-8 text-base-content/70">
                    目前沒有任何裝置記錄
                  </div>
                ) : (
                  devices.map((device) => (
                    <div key={device.id} className={`p-4 rounded-lg border-2 ${
                      device.is_current_device ? 'border-primary bg-primary/10' :
                      device.is_trusted ? 'border-success bg-success/10' : 'border-warning bg-warning/10'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{getDeviceIcon(device.device_type)}</div>
                          <div className="flex-1">
                            <div className="font-bold flex items-center gap-2 flex-wrap">
                              {editingDevice === device.id ? (
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    className="input input-sm input-bordered"
                                    value={newDeviceName}
                                    onChange={(e) => setNewDeviceName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleUpdateDeviceName(device.id)
                                      if (e.key === 'Escape') setEditingDevice(null)
                                    }}
                                    autoFocus
                                  />
                                  <button
                                    className="btn btn-xs btn-success"
                                    onClick={() => handleUpdateDeviceName(device.id)}
                                    disabled={isProcessing}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="btn btn-xs btn-error"
                                    onClick={() => setEditingDevice(null)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className="cursor-pointer hover:text-primary"
                                  onClick={() => startEditingDevice(device)}
                                  title="點擊編輯裝置名稱"
                                >
                                  {device.device_display_name || '未命名裝置'}
                                </span>
                              )}

                              {device.is_current_device && <div className="badge badge-primary badge-sm">目前裝置</div>}
                              {device.is_trusted && !device.is_current_device && <div className="badge badge-success badge-sm">已信任</div>}
                              {!device.is_trusted && <div className="badge badge-warning badge-sm">待驗證</div>}
                            </div>
                            <div className="text-sm text-base-content/70 space-y-1 mt-1">
                              <div>{getDeviceTypeText(device.device_type)} • {device.browser} • {device.platform}</div>
                              {device.city && device.country && (
                                <div>📍 {device.city}, {device.country}</div>
                              )}
                              <div>🌐 IP: {device.ip_address}</div>
                              <div>🕐 最後活動: {formatLastUsedAt(device.last_used_at)}</div>
                              {device.last_2fa_at && (
                                <div>🔐 最後 2FA: {formatLastUsedAt(device.last_2fa_at)}</div>
                              )}
                              {device.trusted_at && (
                                <div>✅ 信任時間: {formatLastUsedAt(device.trusted_at)}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {!device.is_current_device && (
                          <div className="flex gap-2 flex-wrap">
                            <button
                              className={`btn btn-sm ${device.is_trusted ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => handleTrustDevice(device.id)}
                              disabled={isProcessing}
                            >
                              {device.is_trusted ? '取消信任' : '設為信任'}
                            </button>
                            <button
                              className="btn btn-sm btn-error"
                              onClick={() => handleRemoveDevice(device.id)}
                              disabled={isProcessing}
                            >
                              移除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
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
                  <div>
                    <span>Email 驗證</span>
                    <div className="text-xs text-base-content/70">登入時發送驗證碼到您的郵箱</div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={twoFactorStatus?.user?.two_factor_enabled || false}
                    disabled
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-base-content/50">驗證器 App</span>
                    <div className="text-xs text-base-content/50">尚未開放</div>
                  </div>
                  <input type="checkbox" className="toggle" disabled />
                </div>
                <div className="text-xs text-base-content/70 bg-base-200 p-2 rounded">
                  💡 提示：請前往「個人資料」頁面管理您的雙因子驗證設定
                </div>
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
                <button
                  className="btn btn-outline btn-error btn-sm w-full"
                  onClick={handleRevokeOtherDevices}
                  disabled={isProcessing || devices.filter(d => !d.is_current_device).length === 0}
                >
                  {isProcessing && <span className="loading loading-spinner loading-xs"></span>}
                  撤銷其他裝置
                </button>
                <button
                  className="btn btn-outline btn-warning btn-sm w-full"
                  onClick={() => {
                    devices.filter(d => !d.is_trusted && !d.is_current_device).forEach(device => {
                      handleRemoveDevice(device.id)
                    })
                  }}
                  disabled={isProcessing || devices.filter(d => !d.is_trusted && !d.is_current_device).length === 0}
                >
                  清除未信任裝置
                </button>
                <button
                  className="btn btn-outline btn-info btn-sm w-full"
                  onClick={() => window.location.reload()}
                >
                  重新整理列表
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}