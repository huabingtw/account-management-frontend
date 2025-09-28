import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminPermissionsAPI, deleteAdminPermissionAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function AdminPermissions() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [permissions, setPermissions] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Filter 狀態
  const [filters, setFilters] = useState({
    filter_name: '',
    filter_display_name: '',
    filter_group: ''
  })

  // 響應式 filter 面板顯示狀態
  const [showFilter, setShowFilter] = useState(false)

  // 檢查用戶是否有編輯權限（super_admin 和 admin 可以編輯）
  const canEdit = user?.roles?.some(role => ['super_admin', 'admin'].includes(role)) || false

  const loadPermissions = async (page = 1, filterParams = filters, pageSize = perPage) => {
    try {
      setLoading(true)
      setError(null)

      // 參考 OpenCart 的做法，建構 filter 查詢字串
      let filterUrl = ''

      // 只添加有值的 filter 參數
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] && filterParams[key] !== '') {
          filterUrl += '&' + key + '=' + encodeURIComponent(filterParams[key])
        }
      })

      const response = await getAdminPermissionsAPI(page, pageSize, '', filterUrl)

      if (response.success) {
        // 處理分頁數據，檢查是否為 OrmHelper 格式
        if (response.data.data) {
          // 標準 Laravel 分頁格式
          setPermissions(response.data.data)
          setPagination({
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            per_page: response.data.per_page,
            total: response.data.total,
            from: response.data.from,
            to: response.data.to
          })
        } else if (Array.isArray(response.data)) {
          // OrmHelper 可能直接返回陣列
          setPermissions(response.data)
          setPagination({})
        } else {
          // 其他格式
          setPermissions(response.data)
          setPagination({})
        }
      }
    } catch (err) {
      setError(err.message || '載入權限列表失敗')
      console.error('Load permissions error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions()
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleFilterSubmit = () => {
    setCurrentPage(1)
    loadPermissions(1, filters)
  }

  const handleFilterReset = () => {
    const resetFilters = {
      filter_name: '',
      filter_display_name: '',
      filter_group: ''
    }
    setFilters(resetFilters)
    setCurrentPage(1)
    loadPermissions(1, resetFilters)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    loadPermissions(page, filters)
  }

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage)
    setCurrentPage(1) // 重置到第一頁
    loadPermissions(1, filters, newPerPage)
  }

  const handleDelete = async (permissionId, permissionName) => {
    if (!window.confirm(`確定要刪除權限「${permissionName}」嗎？此動作無法復原。`)) {
      return
    }

    try {
      const response = await deleteAdminPermissionAPI(permissionId)
      if (response.success) {
        // 重新載入權限列表
        loadPermissions(currentPage, filters)
      }
    } catch (err) {
      setError(err.message || '刪除權限失敗')
      console.error('Delete permission error:', err)
    }
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
            «
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
            »
          </button>
        </div>
      </div>
    )
  }

  if (loading && !permissions.length) {
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
            <h1 className="text-3xl font-bold text-base-content">權限管理</h1>
            <p className="text-base-content/70">管理系統權限和存取控制</p>
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
                onClick={() => navigate('/admin/permissions/create')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新增權限
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs">
          <ul>
            <li><a href="/dashboard">首頁</a></li>
            <li>進階管理</li>
            <li>權限管理</li>
          </ul>
        </div>
      </div>

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
                {/* 權限代碼搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">權限代碼</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入權限代碼"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_name}
                    onChange={(e) => handleFilterChange('filter_name', e.target.value)}
                  />
                </div>

                {/* 顯示名稱搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">顯示名稱</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入顯示名稱"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_display_name}
                    onChange={(e) => handleFilterChange('filter_display_name', e.target.value)}
                  />
                </div>

                {/* 分類搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">分類</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入分類"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_group}
                    onChange={(e) => handleFilterChange('filter_group', e.target.value)}
                  />
                </div>

                {/* 按鈕 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm flex-1"
                    onClick={handleFilterSubmit}
                  >
                    查詢
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm flex-1"
                    onClick={handleFilterReset}
                  >
                    清除
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Content Area - 左側主要內容 */}
        <div className="lg:w-3/4 lg:order-1">
          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {/* 結果統計 */}
              {pagination.total !== undefined && (
                <div className="mb-4 text-sm text-base-content/70">
                  顯示第 {pagination.from || 0} 到 {pagination.to || 0} 項，共 {pagination.total} 項結果
                </div>
              )}

              {/* 權限列表 */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : permissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-base-content/70">沒有找到符合條件的權限</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>權限代碼</th>
                        <th>顯示名稱</th>
                        <th>分類</th>
                        <th>描述</th>
                        {canEdit && <th className="text-center">操作</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((permission) => (
                        <tr key={permission.id}>
                          <td className="font-mono text-sm">{permission.name}</td>
                          <td className="font-medium">{permission.display_name}</td>
                          <td>
                            <span className="badge badge-outline badge-sm">
                              {permission.group}
                            </span>
                          </td>
                          <td className="text-sm text-base-content/70">
                            {permission.description || '-'}
                          </td>
                          {canEdit && (
                            <td className="text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => navigate(`/admin/permissions/${permission.id}/edit`)}
                                  title="編輯"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  className="btn btn-ghost btn-xs text-error"
                                  onClick={() => handleDelete(permission.id, permission.display_name)}
                                  title="刪除"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 分頁 */}
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}