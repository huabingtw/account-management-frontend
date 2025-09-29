/**
 * 表單處理工具 - 參考 OpenCart 設計模式
 * 提供統一的 AJAX 表單提交、錯誤處理、通知管理
 */
import React from 'react'

// 全域通知管理器 (Toast)
class NotificationManager {
  constructor() {
    this.notifications = []
    this.container = null
    this.setupContainer()
  }

  setupContainer() {
    // 確保有通知容器 (使用 DaisyUI Toast)
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div')
      container.id = 'notification-container'
      container.className = 'toast toast-top toast-end z-50'
      document.body.appendChild(container)
    }
    this.container = document.getElementById('notification-container')
  }

  show(type, message, duration = 3000) {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      message,
      duration
    }

    this.notifications.push(notification)
    this.render(notification)

    // 自動移除
    if (duration > 0) {
      setTimeout(() => {
        this.hide(notification.id)
      }, duration)
    }

    return notification.id
  }

  success(message, duration = 3000) {
    return this.show('success', message, duration)
  }

  error(message, duration = 5000) {
    return this.show('error', message, duration)
  }

  warning(message, duration = 4000) {
    return this.show('warning', message, duration)
  }

  info(message, duration = 4000) {
    return this.show('info', message, duration)
  }

  hide(id) {
    this.notifications = this.notifications.filter(n => n.id !== id)
    const element = document.getElementById(`notification-${id}`)
    if (element) {
      element.style.opacity = '0'
      element.style.transform = 'translateX(100%)'
      setTimeout(() => {
        element.remove()
      }, 300)
    }
  }

  render(notification) {
    const alertTypes = {
      success: 'alert-success',
      error: 'alert-error',
      warning: 'alert-warning',
      info: 'alert-info'
    }

    const icons = {
      success: `<svg class="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>`,
      error: `<svg class="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>`,
      warning: `<svg class="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>`,
      info: `<svg class="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>`
    }

    const alertElement = document.createElement('div')
    alertElement.id = `notification-${notification.id}`
    alertElement.className = `alert ${alertTypes[notification.type]} mb-2 transition-all duration-300 transform translate-x-0 opacity-100`
    alertElement.style.cssText = 'min-width: 300px; max-width: 500px;'
    alertElement.innerHTML = `
      ${icons[notification.type]}
      <span class="text-sm">${notification.message}</span>
      <button class="btn btn-sm btn-ghost hover:bg-transparent" onclick="window.notifications.hide('${notification.id}')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `

    this.container.appendChild(alertElement)

    // 入場動畫
    setTimeout(() => {
      alertElement.style.transform = 'translateX(0)'
      alertElement.style.opacity = '1'
    }, 10)
  }

  clear() {
    this.notifications = []
    this.container.innerHTML = ''
  }
}

// API 基礎配置 (與 api.js 保持一致)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  const hostname = window.location.hostname
  const protocol = window.location.protocol

  // 本機開發環境
  if (hostname === 'accounts.huabing.test') {
    return 'https://accounts.huabing.test/api'
  }

  // 其他環境直接使用當前域名 + /api
  return `${protocol}//${hostname}/api`
}

// AJAX 表單處理器 (參考 OpenCart common.js)
export class FormHandler {
  constructor(options = {}) {
    this.options = {
      baseURL: options.baseURL || getApiBaseUrl(),
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      onSuccess: options.onSuccess || null,
      onError: options.onError || null,
      stayOnPage: options.stayOnPage !== false, // 預設留在頁面 (OpenCart 模式)
      autoNotify: options.autoNotify !== false, // 預設自動顯示通知
      ...options
    }
  }

  // 設定認證 token
  setAuthToken(token) {
    this.options.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // API 請求方法
  async apiRequest(url, options = {}) {
    const token = localStorage.getItem('auth_token')
    const headers = {
      ...this.options.defaultHeaders,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }

    const config = {
      method: 'GET',
      ...options,
      headers
    }

    // 處理 JSON 資料
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body)
    }

    // 處理 FormData
    if (config.body instanceof FormData) {
      delete headers['Content-Type']
    }

    try {
      const response = await fetch(`${this.options.baseURL}${url}`, config)

      if (response.status === 401) {
        // 未授權，跳轉登入 (仿 OpenCart)
        window.location.href = '/login'
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  // 表單提交處理 (仿 OpenCart 的 data-oc-toggle="ajax")
  async submitForm(formElement, options = {}) {
    const formOptions = { ...this.options, ...options }
    const formId = formElement.id || 'form-' + Date.now()
    const url = formOptions.url || formElement.action.replace(window.location.origin, '')
    const method = (formOptions.method || formElement.method || 'POST').toUpperCase()

    try {
      // 設定載入狀態 (仿 OpenCart button loading)
      this.setButtonLoading(formElement, true)
      this.clearFormErrors(formElement)

      // 準備資料
      const formData = new FormData(formElement)
      let requestBody = {}

      // 轉換 FormData 為 JSON (適應我們的 API)
      for (const [key, value] of formData.entries()) {
        // 處理 checkbox
        const field = formElement.querySelector(`[name="${key}"]`)
        if (field && field.type === 'checkbox') {
          requestBody[key] = field.checked
        } else if (field && field.type === 'file') {
          // 檔案上傳保持 FormData 格式
          requestBody = formData
          break
        } else {
          requestBody[key] = value
        }
      }

      // 發送請求
      const response = await this.apiRequest(url, {
        method,
        body: requestBody
      })

      // 處理成功回應 (仿 OpenCart success 處理)
      if (response.success) {
        if (formOptions.autoNotify) {
          window.notifications.success(response.message || '操作成功！')
        }

        // 更新表單欄位值 (仿 OpenCart 的欄位更新)
        if (response.data && typeof response.data === 'object') {
          this.updateFormFields(formElement, response.data)
        }

        // 處理 URL 更新 (新增轉編輯模式)
        if (response.data && response.data.id && url.includes('/create')) {
          const newUrl = url.replace('/create', `/${response.data.id}`)
          window.history.replaceState(null, '', newUrl + window.location.search)
        }

        // 重新載入列表 (仿 OpenCart 的 data-oc-load)
        const loadUrl = formElement.getAttribute('data-oc-load')
        const target = formElement.getAttribute('data-oc-target')
        if (loadUrl && target) {
          await this.reloadList(target, loadUrl)
        }

        // 成功回調
        if (formOptions.onSuccess) {
          await formOptions.onSuccess(response, formElement)
        }

        // 處理跳轉 (仿 OpenCart redirect)
        if (response.redirect && !formOptions.stayOnPage) {
          window.location.href = response.redirect
        }
      }

      return response

    } catch (error) {
      // 處理錯誤 (仿 OpenCart error 處理)
      let errorMessage = error.message || '操作失敗'

      if (formOptions.autoNotify) {
        window.notifications.error(errorMessage)
      }

      if (formOptions.onError) {
        await formOptions.onError(error, formElement)
      }

      throw error

    } finally {
      // 清除載入狀態
      this.setButtonLoading(formElement, false)
    }
  }

  // 按鈕載入狀態 (仿 OpenCart button loading)
  setButtonLoading(formElement, loading = true) {
    const submitButtons = formElement.querySelectorAll('button[type="submit"]')
    submitButtons.forEach(button => {
      if (loading) {
        button.disabled = true
        if (!button.dataset.originalHtml) {
          button.dataset.originalHtml = button.innerHTML
        }
        button.innerHTML = '<span class="loading loading-spinner loading-sm mr-2"></span>處理中...'
        button.classList.add('btn-disabled')
      } else {
        button.disabled = false
        if (button.dataset.originalHtml) {
          button.innerHTML = button.dataset.originalHtml
        }
        button.classList.remove('btn-disabled')
      }
    })
  }

  // 清除表單錯誤
  clearFormErrors(formElement) {
    // 清除 input 錯誤狀態
    formElement.querySelectorAll('.input-error, .select-error, .textarea-error').forEach(el => {
      el.classList.remove('input-error', 'select-error', 'textarea-error')
    })
    // 清除錯誤訊息
    formElement.querySelectorAll('.error-message').forEach(el => {
      el.textContent = ''
      el.classList.remove('error-message')
    })
  }

  // 顯示欄位錯誤 (仿 OpenCart 的 invalid-feedback)
  showFieldErrors(formElement, errors) {
    if (!errors) return

    Object.keys(errors).forEach(fieldName => {
      const field = formElement.querySelector(`[name="${fieldName}"]`)
      const errorContainer = formElement.querySelector(`[data-error="${fieldName}"]`) ||
                           formElement.querySelector(`#error-${fieldName}`)

      if (field) {
        // 添加錯誤樣式
        if (field.tagName === 'INPUT') {
          field.classList.add('input-error')
        } else if (field.tagName === 'SELECT') {
          field.classList.add('select-error')
        } else if (field.tagName === 'TEXTAREA') {
          field.classList.add('textarea-error')
        }
      }

      if (errorContainer) {
        const errorMessage = Array.isArray(errors[fieldName])
          ? errors[fieldName][0]
          : errors[fieldName]
        errorContainer.textContent = errorMessage
        errorContainer.classList.add('error-message', 'text-error', 'text-sm', 'mt-1')
      }
    })
  }

  // 更新表單欄位值 (仿 OpenCart 的欄位更新)
  updateFormFields(formElement, data) {
    Object.keys(data).forEach(key => {
      const field = formElement.querySelector(`[name="${key}"]`)
      if (field && field.type !== 'file') {
        if (field.type === 'checkbox') {
          field.checked = Boolean(data[key])
        } else {
          field.value = data[key] || ''
        }
      }
    })
  }

  // 列表重新載入 (仿 OpenCart 的 $(target).load(url))
  async reloadList(targetSelector, url, params = {}) {
    const target = document.querySelector(targetSelector)
    if (!target) return

    try {
      const queryString = new URLSearchParams(params).toString()
      const fullUrl = queryString ? `${url}?${queryString}` : url

      const response = await this.apiRequest(fullUrl.replace(this.options.baseURL, ''))

      if (response.success && response.data) {
        // 觸發自定義事件，讓 React 組件處理更新
        const event = new CustomEvent('list-reload', {
          detail: {
            data: response.data,
            url: fullUrl,
            target: targetSelector
          }
        })
        target.dispatchEvent(event)
        window.dispatchEvent(event) // 也在 window 上觸發
      }
    } catch (error) {
      console.error('List reload error:', error)
      if (this.options.autoNotify) {
        window.notifications.error('列表重新載入失敗')
      }
    }
  }
}

// React Hook 整合
export const useFormHandler = (options = {}) => {
  const [handler] = React.useState(() => new FormHandler(options))

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      handler.setAuthToken(token)
    }
  }, [handler])

  return handler
}

// 工具函數
export const utils = {
  // 從 URL 獲取參數（仿 OpenCart getURLVar）
  getURLParam(key) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(key) || ''
  },

  // 更新 URL 參數（仿 OpenCart 的 URL 更新）
  updateURLParams(params, replace = false) {
    const url = new URL(window.location)
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        url.searchParams.set(key, params[key])
      } else {
        url.searchParams.delete(key)
      }
    })

    if (replace) {
      window.history.replaceState({}, '', url)
    } else {
      window.history.pushState({}, '', url)
    }
  },

  // 格式化日期
  formatDate(dateString, locale = 'zh-TW') {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString(locale)
  },

  // 防抖函數 (仿 OpenCart 的 timer 機制)
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // 格式化檔案大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // 產生唯一 ID
  generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// 建立全域實例
window.notifications = new NotificationManager()
window.formHandler = new FormHandler()

export const notifications = window.notifications
export const formHandler = window.formHandler

export default {
  FormHandler,
  useFormHandler,
  utils,
  notifications,
  formHandler
}