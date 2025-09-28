import React, { useState, useEffect } from 'react'
import {
  check2FAStatusAPI,
  toggle2FAAPI,
  send2FACodeAPI,
  verify2FACodeAPI
} from '../services/api'

export default function TwoFactorAuth() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [isForced2FA, setIsForced2FA] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEnableModal, setShowEnableModal] = useState(false)
  const [verificationStep, setVerificationStep] = useState(1) // 1: 發送驗證碼, 2: 輸入驗證碼
  const [verificationId, setVerificationId] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // 載入 2FA 狀態
  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await check2FAStatusAPI()

        setIs2FAEnabled(response.data.user.two_factor_enabled)
        setIsForced2FA(response.data.user.force_two_factor)
      } catch (err) {
        console.error('載入 2FA 狀態失敗:', err)
        setError('無法載入雙因子驗證狀態')
      } finally {
        setIsLoading(false)
      }
    }

    load2FAStatus()
  }, [])

  // 發送驗證碼 (用於啟用 2FA)
  const handleSendVerificationCode = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      const response = await send2FACodeAPI('sensitive_operation')
      setVerificationId(response.data.verification_id)
      setVerificationStep(2)
    } catch (err) {
      console.error('發送驗證碼失敗:', err)
      setError('發送驗證碼失敗，請稍後再試')
    } finally {
      setIsProcessing(false)
    }
  }

  // 驗證驗證碼並啟用/停用 2FA
  const handleToggle2FA = async (enable) => {
    try {
      setIsProcessing(true)
      setError(null)

      if (enable && verificationStep === 2) {
        // 啟用 2FA 需要驗證碼
        const response = await toggle2FAAPI(true, verificationCode)
        setIs2FAEnabled(true)
        setShowEnableModal(false)
        setVerificationStep(1)
        setVerificationCode('')
      } else if (!enable) {
        // 停用 2FA
        const response = await toggle2FAAPI(false)
        setIs2FAEnabled(false)
      }
    } catch (err) {
      console.error('切換 2FA 狀態失敗:', err)
      setError(err.message || '操作失敗，請稍後再試')
    } finally {
      setIsProcessing(false)
    }
  }

  // 重置 Modal 狀態
  const resetModal = () => {
    setShowEnableModal(false)
    setVerificationStep(1)
    setVerificationCode('')
    setVerificationId(null)
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">雙因子驗證</h3>
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            🔐 雙因子驗證 (2FA)
            {is2FAEnabled && <div className="badge badge-success badge-sm">已啟用</div>}
            {isForced2FA && <div className="badge badge-warning badge-sm">管理員強制</div>}
          </h3>

          <p className="text-sm text-base-content/70 mb-4">
            為您的帳戶添加額外的安全保護層，即使密碼被盜用也能保護您的帳戶。
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* 2FA 狀態 */}
            <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
              <div>
                <div className="font-medium">Email 驗證</div>
                <div className="text-sm text-base-content/70">
                  登入時發送驗證碼到您的郵箱
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={is2FAEnabled}
                  disabled={isForced2FA || isProcessing}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setShowEnableModal(true)
                    } else {
                      handleToggle2FA(false)
                    }
                  }}
                />
              </div>
            </div>

            {/* 強制 2FA 提示 */}
            {isForced2FA && (
              <div className="alert alert-warning">
                <span>⚠️ 管理員已為您的帳戶強制啟用雙因子驗證，無法關閉。</span>
              </div>
            )}

            {/* 2FA 功能說明 */}
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-medium mb-2">雙因子驗證會在以下情況要求驗證：</h4>
              <ul className="text-sm space-y-1 text-base-content/70">
                <li>• 從新裝置登入</li>
                <li>• 非信任裝置登入</li>
                <li>• 異常地理位置登入</li>
                <li>• 變更密碼等敏感操作</li>
                <li>• 定期安全驗證（每 3 個月）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 啟用 2FA Modal */}
      {showEnableModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">啟用雙因子驗證</h3>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {verificationStep === 1 && (
              <div className="space-y-4">
                <p className="text-base-content/70">
                  為了確保是您本人操作，我們將發送驗證碼到您的郵箱。
                </p>
                <div className="flex justify-center">
                  <button
                    className="btn btn-primary"
                    onClick={handleSendVerificationCode}
                    disabled={isProcessing}
                  >
                    {isProcessing && <span className="loading loading-spinner loading-xs"></span>}
                    發送驗證碼
                  </button>
                </div>
              </div>
            )}

            {verificationStep === 2 && (
              <div className="space-y-4">
                <p className="text-base-content/70">
                  請輸入我們剛才發送到您郵箱的 6 位數驗證碼：
                </p>
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="例如：123456"
                    className="input input-bordered text-center text-lg tracking-widest"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    className="btn btn-outline"
                    onClick={() => setVerificationStep(1)}
                    disabled={isProcessing}
                  >
                    重新發送
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleToggle2FA(true)}
                    disabled={verificationCode.length !== 6 || isProcessing}
                  >
                    {isProcessing && <span className="loading loading-spinner loading-xs"></span>}
                    驗證並啟用
                  </button>
                </div>
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={resetModal}
                disabled={isProcessing}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}