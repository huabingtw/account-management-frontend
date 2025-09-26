import React, { useEffect, useRef } from 'react'

const GoogleLogin = ({ onSuccess, onError, clientId }) => {
  const googleButtonRef = useRef(null)

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        })

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: 'full',
            text: 'signin_with',
            locale: 'zh_TW'
          }
        )
      }
    }

    const handleCredentialResponse = (response) => {
      console.log('Google Login Response:', response)
      if (response.credential) {
        onSuccess(response.credential)
      } else {
        onError('Google 登入失敗')
      }
    }

    // 檢查 Google GSI 是否已載入
    if (window.google) {
      initializeGoogleSignIn()
    } else {
      // 如果尚未載入，等待載入完成
      window.addEventListener('load', initializeGoogleSignIn)
      return () => window.removeEventListener('load', initializeGoogleSignIn)
    }
  }, [clientId, onSuccess, onError])

  return (
    <div>
      <div ref={googleButtonRef}></div>
    </div>
  )
}

export default GoogleLogin