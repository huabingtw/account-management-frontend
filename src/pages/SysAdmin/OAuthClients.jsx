import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { getOAuthClientsAPI, deleteOAuthClientAPI, getOAuthClientSystemsAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import Paginator from '../../components/Paginator'

export default function OAuthClients() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [clients, setClients] = useState([])
  const [systems, setSystems] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [perPage, setPerPage] = useState(parseInt(searchParams.get('limit')) || 10)

  // Filter 狀態 - 從 URL 參數初始化
  const [filters, setFilters] = useState({
    filter_code: searchParams.get('filter_code') || '',
    filter_name: searchParams.get('filter_name') || '',
    filter_system_code: searchParams.get('filter_system_code') || ''
  })

  // 響應式 filter 面板顯示狀態
  const [showFilter, setShowFilter] = useState(false)

  // 檢查用戶是否有編輯權限
  const canEdit = user?.roles?.some(role => ['super_admin'].includes(role)) || false

  // 生成當前查詢參數字串
  const getCurrentQueryString = () => {
    const params = new URLSearchParams()
    params.set('page', currentPage.toString())
    params.set('limit', perPage.toString())

    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.set(key, filters[key])
      }
    })

    return params.toString()
  }

  const loadClients = async (page = 1, filterParams = filters, pageSize = perPage) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getOAuthClientsAPI(
        page,
        pageSize,
        filterParams.filter_code,
        filterParams.filter_name,
        filterParams.filter_system_code
      )

      if (response.success) {
        setClients(response.data.data || [])
        setPagination(response.data.pagination || {})
        setCurrentPage(response.data.pagination?.current_page || page)
      }
    } catch (err) {
      setError(err.message || '載入 OAuth 客戶端失敗')
      console.error('Load OAuth clients error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSystems = async () => {
    try {
      const response = await getOAuthClientSystemsAPI()
      if (response.success) {
        setSystems(response.data || [])
      }
    } catch (err) {
      console.error('Load systems error:', err)
    }
  }

  useEffect(() => {
    loadSystems()
    loadClients()
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    loadClients(1, filters)
    updateUrlParams(1)
  }

  const handleClearFilters = () => {
    const newFilters = {
      filter_code: '',
      filter_name: '',
      filter_system_code: ''
    }
    setFilters(newFilters)
    setCurrentPage(1)
    loadClients(1, newFilters)
    updateUrlParams(1, newFilters)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    loadClients(page, filters)
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
    loadClients(1, filters, newPerPage)
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

  const handleDelete = async (clientId, clientCode) => {
    if (!window.confirm(`確定要刪除 OAuth 客戶端「${clientCode}」嗎？此動作無法復原。`)) {
      return
    }

    try {
      const response = await deleteOAuthClientAPI(clientId)
      if (response.success) {
        loadClients(currentPage, filters)
      }
    } catch (err) {
      setError(err.message || '刪除 OAuth 客戶端失敗')
      console.error('Delete OAuth client error:', err)
    }
  }

  const getSystemName = (client) => {
    // 如果有 system_name 直接使用，否則從 systems 列表查找
    if (client.system_name) {
      return client.system_name
    }
    if (client.system_code) {
      const system = systems.find(s => s.code === client.system_code)
      return system ? system.name : client.system_code
    }
    return '未指定系統'
  }

  if (loading && !clients.length) {
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
            <h1 className="text-3xl font-bold text-base-content">OAuth 客戶端</h1>
            <p className="text-base-content/70">管理 OAuth 2.0 客戶端應用</p>
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
              <Link
                to={`/sys-admin/oauth-clients/create?${getCurrentQueryString()}`}
                className="btn btn-primary btn-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新增客戶端
              </Link>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs">
          <ul>
            <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
            <li>系統管理</li>
            <li>OAuth 客戶端</li>
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
                {/* 客戶端代碼搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">客戶端代碼</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入客戶端代碼"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_code}
                    onChange={(e) => handleFilterChange('filter_code', e.target.value)}
                  />
                </div>

                {/* 客戶端名稱搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">客戶端名稱</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入客戶端名稱"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_name}
                    onChange={(e) => handleFilterChange('filter_name', e.target.value)}
                  />
                </div>

                {/* 所屬系統搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">所屬系統</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filters.filter_system_code}
                    onChange={(e) => handleFilterChange('filter_system_code', e.target.value)}
                  >
                    <option value="">所有系統</option>
                    {systems.map(system => (
                      <option key={system.code} value={system.code}>{system.name}</option>
                    ))}
                  </select>
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
                      <th>客戶端代碼</th>
                      <th>客戶端名稱</th>
                      <th>所屬系統</th>
                      <th>授權類型</th>
                      <th className="text-center">狀態</th>
                      {canEdit && <th className="text-center">操作</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="hover">
                        <td>
                          <code className="text-sm">{client.code}</code>
                        </td>
                        <td>{client.name || '-'}</td>
                        <td>
                          <span className="badge badge-outline">{getSystemName(client)}</span>
                        </td>
                        <td>
                          <div className="max-w-xs truncate text-sm" title={Array.isArray(client.grant_types) ? client.grant_types.join(',') : client.grant_types}>
                            {Array.isArray(client.grant_types) ? client.grant_types.join(',') : (client.grant_types || 'authorization_code,refresh_token')}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`badge badge-sm ${client.revoked ? 'badge-error' : 'badge-success'}`}>
                            {client.revoked ? '已撤銷' : '正常'}
                          </span>
                        </td>
                        {canEdit && (
                          <td className="text-center">
                            <div className="flex justify-center gap-2">
                              <Link
                                to={`/sys-admin/oauth-clients/${client.id}?${getCurrentQueryString()}`}
                                className="btn btn-ghost btn-sm"
                                title="編輯"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </Link>
                              <button
                                className="btn btn-ghost btn-sm text-error"
                                onClick={() => handleDelete(client.id, client.code)}
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
                    {clients.length === 0 && (
                      <tr>
                        <td colSpan={canEdit ? 6 : 5} className="text-center py-8">
                          <div className="text-base-content/60">
                            {loading ? '載入中...' : '沒有找到任何 OAuth 客戶端'}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Paginator
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}