import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getSettingsAPI, deleteSettingAPI, getSettingsGroupsAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [settings, setSettings] = useState([])
  const [groups, setGroups] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [perPage, setPerPage] = useState(parseInt(searchParams.get('limit')) || 10)

  // Filter 狀態 - 從 URL 參數初始化
  const [filters, setFilters] = useState({
    filter_group: searchParams.get('filter_group') || '',
    filter_key: searchParams.get('filter_key') || '',
    filter_name: searchParams.get('filter_name') || ''
  })

  // 響應式 filter 面板顯示狀態
  const [showFilter, setShowFilter] = useState(false)

  // 檢查用戶是否有編輯權限
  const canEdit = user?.roles?.some(role => ['super_admin'].includes(role)) || false

  const loadSettings = async (page = 1, filterParams = filters, pageSize = perPage) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getSettingsAPI(
        page,
        pageSize,
        filterParams.filter_group,
        filterParams.filter_key,
        filterParams.filter_name
      )

      if (response.success) {
        setSettings(response.data.data || [])
        setPagination(response.data.pagination || {})
        setCurrentPage(response.data.pagination?.current_page || page)
      }
    } catch (err) {
      setError(err.message || '載入設定失敗')
      console.error('Load settings error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const response = await getSettingsGroupsAPI()
      if (response.success) {
        setGroups(response.data || [])
      }
    } catch (err) {
      console.error('Load groups error:', err)
    }
  }

  useEffect(() => {
    loadGroups()
    loadSettings()
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    loadSettings(1, filters)
    updateUrlParams(1)
  }

  const handleClearFilters = () => {
    const newFilters = {
      filter_group: '',
      filter_key: '',
      filter_name: ''
    }
    setFilters(newFilters)
    setCurrentPage(1)
    loadSettings(1, newFilters)
    updateUrlParams(1, newFilters)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    loadSettings(page, filters)
    updateUrlParams(page)
  }

  const updateUrlParams = (page, filterParams = filters) => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', perPage.toString())
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] && filterParams[key] !== '') {
        params.set(key, filterParams[key])
      }
    })
    setSearchParams(params)
  }

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
    loadSettings(1, filters, newPerPage)
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', newPerPage.toString())
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.set(key, filters[key])
      }
    })
    setSearchParams(params)
  }

  const handleDelete = async (settingId, settingKey) => {
    if (!window.confirm(`確定要刪除設定「${settingKey}」嗎？此動作無法復原。`)) {
      return
    }

    try {
      const response = await deleteSettingAPI(settingId)
      if (response.success) {
        loadSettings(currentPage, filters)
      }
    } catch (err) {
      setError(err.message || '刪除設定失敗')
      console.error('Delete setting error:', err)
    }
  }

  const formatValue = (setting) => {
    if (!setting.setting_value) return '-'
    if (setting.is_json) {
      try {
        const parsed = JSON.parse(setting.setting_value)
        return typeof parsed === 'object' ? JSON.stringify(parsed) : parsed
      } catch (e) {
        return setting.setting_value
      }
    }
    return setting.setting_value
  }

  const renderPagination = () => {
    if (!pagination.last_page || pagination.last_page <= 1) return null

    const pages = []
    const maxPages = 5
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxPages / 2))
    let endPage = Math.min(pagination.last_page, startPage + maxPages - 1)

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex justify-center mt-6">
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          {pages.map(page => (
            <button
              key={page}
              className={`join-item btn btn-sm ${page === pagination.current_page ? 'btn-active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="join-item btn btn-sm"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page >= pagination.last_page}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  if (loading && !settings.length) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-96">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* 頁面標題和工具列 */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">參數設定</h1>
            <p className="text-base-content/70">管理系統參數設定</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* 每頁筆數選擇 - 小螢幕時顯示 */}
            <div className="lg:hidden">
              <select
                className="select select-bordered select-sm"
                value={perPage}
                onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
              >
                <option value={10}>10 筆/頁</option>
                <option value={25}>25 筆/頁</option>
                <option value={50}>50 筆/頁</option>
                <option value={100}>100 筆/頁</option>
              </select>
            </div>
            {/* 響應式 Filter 按鈕 */}
            <button
              className="btn btn-outline btn-sm lg:hidden"
              onClick={() => setShowFilter(!showFilter)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              篩選
            </button>
            {canEdit && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/sys-admin/settings/create')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新增設定
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs">
          <ul>
            <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
            <li>系統管理</li>
            <li>參數設定</li>
          </ul>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Panel - 右側面板 */}
        <div className={`lg:w-1/4 lg:order-2 ${showFilter ? 'block' : 'hidden lg:block'}`}>
          {/* 每頁筆數選擇 */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">每頁顯示</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={perPage}
                  onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                >
                  <option value={10}>10 筆</option>
                  <option value={25}>25 筆</option>
                  <option value={50}>50 筆</option>
                  <option value={100}>100 筆</option>
                </select>
              </div>
            </div>
          </div>

          {/* 篩選條件 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-header">
              <h2 className="card-title text-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                篩選條件
              </h2>
            </div>
            <div className="card-body">
              <form className="space-y-4">
                {/* 群組搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">群組</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filters.filter_group}
                    onChange={(e) => handleFilterChange('filter_group', e.target.value)}
                  >
                    <option value="">所有群組</option>
                    {groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* 設定鍵搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">設定鍵</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入設定鍵"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_key}
                    onChange={(e) => handleFilterChange('filter_key', e.target.value)}
                  />
                </div>

                {/* 名稱搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">名稱</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入名稱"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_name}
                    onChange={(e) => handleFilterChange('filter_name', e.target.value)}
                  />
                </div>

                {/* 篩選按鈕 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleApplyFilters}
                  >
                    查詢
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm flex-1"
                    onClick={handleClearFilters}
                  >
                    清除
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Main Table - 左側主要內容 */}
        <div className="flex-1 lg:order-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>群組</th>
                      <th>設定鍵</th>
                      <th>名稱</th>
                      <th>值</th>
                      <th>類型</th>
                      <th className="text-center">自動載入</th>
                      {canEdit && <th className="text-center">操作</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((setting) => (
                      <tr key={setting.id} className="hover">
                        <td>
                          <span className="badge badge-outline">{setting.group}</span>
                        </td>
                        <td>
                          <code className="text-sm">{setting.setting_key}</code>
                        </td>
                        <td>{setting.name || '-'}</td>
                        <td>
                          <div className="max-w-xs truncate" title={formatValue(setting)}>
                            {setting.is_json ? (
                              <span className="badge badge-info badge-sm">JSON</span>
                            ) : (
                              formatValue(setting)
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${setting.is_json ? 'badge-info' : 'badge-ghost'}`}>
                            {setting.is_json ? 'JSON' : 'TEXT'}
                          </span>
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={setting.is_autoload}
                            disabled
                          />
                        </td>
                        {canEdit && (
                          <td className="text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => navigate(`/sys-admin/settings/${setting.id}`)}
                                title="編輯"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              <button
                                className="btn btn-ghost btn-sm text-error"
                                onClick={() => handleDelete(setting.id, setting.setting_key)}
                                title="刪除"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {settings.length === 0 && (
                      <tr>
                        <td colSpan={canEdit ? 7 : 6} className="text-center py-8">
                          <div className="text-base-content/60">
                            {loading ? '載入中...' : '沒有找到任何設定'}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {renderPagination()}

              {/* 統計資訊 */}
              {pagination.total > 0 && (
                <div className="text-sm text-base-content/70 text-center mt-4">
                  顯示第 {pagination.from || 1} 到 {pagination.to || settings.length} 筆，共 {pagination.total} 筆設定
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}