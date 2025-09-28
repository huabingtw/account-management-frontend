import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { getAdminUsersAPI, deleteAdminUserAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function AdminUsers() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [perPage, setPerPage] = useState(parseInt(searchParams.get('per_page')) || 10)

  // Filter 狀態
  const [filters, setFilters] = useState({
    filter_name: searchParams.get('filter_name') || '',
    filter_email: searchParams.get('filter_email') || '',
    filter_mobile: searchParams.get('filter_mobile') || '',
    role: searchParams.get('role') || '',
    two_factor_enabled: searchParams.get('two_factor_enabled') || ''
  })

  // 響應式 filter 面板顯示狀態
  const [showFilter, setShowFilter] = useState(false)

  // 檢查用戶是否有編輯權限（super_admin 和 admin 可以編輯）
  const canEdit = user?.roles?.some(role => ['super_admin', 'admin'].includes(role)) || false

  const loadUsers = async (page = 1, filterParams = filters, pageSize = perPage) => {
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

      const response = await getAdminUsersAPI(page, pageSize, '', filterUrl)

      if (response.success) {
        setUsers(response.data.data)
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to
        })
        setCurrentPage(response.data.current_page)
      }
    } catch (err) {
      setError(err.message || '載入使用者列表失敗')
      console.error('Load users error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(1)
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleFilter = () => {
    setCurrentPage(1)
    loadUsers(1, filters)
    // 更新 URL 參數
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('per_page', perPage.toString())
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.set(key, filters[key])
      }
    })
    setSearchParams(params)
  }

  const handleFilterReset = () => {
    const resetFilters = {
      filter_name: '',
      filter_email: '',
      filter_mobile: '',
      role: '',
      two_factor_enabled: ''
    }
    setFilters(resetFilters)
    setCurrentPage(1)
    loadUsers(1, resetFilters)
    // 清除 URL 參數，只保留基本分頁
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('per_page', perPage.toString())
    setSearchParams(params)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    loadUsers(page, filters)
    // 更新 URL 中的頁碼
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('per_page', perPage.toString())
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.set(key, filters[key])
      }
    })
    setSearchParams(params)
  }

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage)
    setCurrentPage(1) // 重置到第一頁
    loadUsers(1, filters, newPerPage)
    // 更新 URL 中的每頁筆數
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('per_page', newPerPage.toString())
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.set(key, filters[key])
      }
    })
    setSearchParams(params)
  }

  const handleDelete = async (userUuid) => {
    if (window.confirm('確定要刪除這個使用者嗎？')) {
      try {
        const response = await deleteAdminUserAPI(userUuid)
        if (response.success) {
          loadUsers(currentPage, filters) // 重新載入當前頁面
        }
      } catch (err) {
        setError(err.message || '刪除使用者失敗')
      }
    }
  }

  const toggleFilter = () => {
    setShowFilter(!showFilter)
  }

  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">使用者管理</h1>
            <p className="text-base-content/70">管理系統使用者帳號和權限</p>
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

            {/* 響應式 Filter 按鈕 - 只在小螢幕顯示 */}
            <button
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              className="btn btn-outline btn-sm lg:hidden"
              title="篩選"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              篩選
            </button>
            {canEdit && (
              <button
                onClick={() => navigate('/admin/users/new')}
                className="btn btn-primary btn-sm"
                title="新增使用者"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新增
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs">
          <ul>
            <li><a href="/dashboard">首頁</a></li>
            <li>進階管理</li>
            <li>使用者管理</li>
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
                {/* 姓名搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">姓名</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入姓名"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_name}
                    onChange={(e) => handleFilterChange('filter_name', e.target.value)}
                  />
                </div>

                {/* Email 搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入 Email"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_email}
                    onChange={(e) => handleFilterChange('filter_email', e.target.value)}
                  />
                </div>

                {/* 手機號碼搜尋 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">手機號碼</span>
                  </label>
                  <input
                    type="text"
                    placeholder="輸入手機號碼"
                    className="input input-bordered input-sm w-full"
                    value={filters.filter_mobile}
                    onChange={(e) => handleFilterChange('filter_mobile', e.target.value)}
                  />
                </div>

                {/* 角色篩選 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">角色</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  >
                    <option value="">所有角色</option>
                    <option value="super_admin">超級管理員</option>
                    <option value="admin">管理員</option>
                    <option value="inspector">查看者</option>
                    <option value="user">一般用戶</option>
                  </select>
                </div>

                {/* 2FA 狀態篩選 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">2FA 狀態</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filters.two_factor_enabled}
                    onChange={(e) => handleFilterChange('two_factor_enabled', e.target.value)}
                  >
                    <option value="">所有狀態</option>
                    <option value="1">已啟用</option>
                    <option value="0">未啟用</option>
                  </select>
                </div>

                {/* 操作按鈕 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleFilter}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    篩選
                  </button>
                  <button
                    type="button"
                    onClick={handleFilterReset}
                    className="btn btn-outline btn-sm"
                    title="重置"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Content Panel - 左側內容 */}
        <div className="lg:w-3/4 lg:order-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-header">
              <h2 className="card-title text-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                使用者列表
              </h2>
            </div>
            <div className="card-body p-0">
              {error && (
                <div className="alert alert-error mx-6 mt-6">
                  <span>{error}</span>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="table table-hover w-full">
                      <thead>
                        <tr>
                          <th className="w-12">
                            <input type="checkbox" className="checkbox checkbox-sm" />
                          </th>
                          <th>姓名</th>
                          <th className="hidden lg:table-cell">Email</th>
                          <th className="hidden lg:table-cell">手機號碼</th>
                          <th className="hidden lg:table-cell">角色</th>
                          <th className="text-center">2FA</th>
                          <th className="text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((userItem) => (
                          <tr key={userItem.uuid} className="hover">
                            <td>
                              <input type="checkbox" className="checkbox checkbox-sm" />
                            </td>
                            <td>
                              <div className="font-semibold">{userItem.name}</div>
                              <div className="text-sm text-gray-500 lg:hidden">{userItem.email}</div>
                            </td>
                            <td className="hidden lg:table-cell">{userItem.email}</td>
                            <td className="hidden lg:table-cell">{userItem.mobile || '-'}</td>
                            <td className="hidden lg:table-cell">
                              {userItem.roles && userItem.roles.length > 0 ? (
                                <span className="badge badge-outline badge-sm">
                                  {userItem.roles[0] === 'super_admin' ? '超級管理員' :
                                   userItem.roles[0] === 'admin' ? '管理員' :
                                   userItem.roles[0] === 'inspector' ? '查看者' : '一般用戶'}
                                </span>
                              ) : (
                                <span className="badge badge-ghost badge-sm">一般用戶</span>
                              )}
                            </td>
                            <td className="text-center">
                              <span className={`badge badge-sm ${userItem.two_factor_enabled ? 'badge-success' : 'badge-error'}`}>
                                {userItem.two_factor_enabled ? '已啟用' : '未啟用'}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => navigate(`/admin/users/${userItem.uuid}`)}
                                  className="btn btn-ghost btn-xs"
                                  title="查看"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                {canEdit && (
                                  <>
                                    <Link
                                      to={`/admin/users/${userItem.id}/edit`}
                                      className="btn btn-ghost btn-xs"
                                      title="編輯"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(userItem.id)}
                                      className="btn btn-ghost btn-xs text-error"
                                      title="刪除"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.last_page > 1 && (
                    <div className="flex justify-between items-center p-6 border-t">
                      <div className="text-sm text-gray-600">
                        顯示 {pagination.from} 至 {pagination.to} 項，共 {pagination.total} 項
                      </div>
                      <div className="join">
                        <button
                          className="join-item btn btn-sm"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          «
                        </button>
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          className="join-item btn btn-sm"
                          disabled={currentPage === pagination.last_page}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}