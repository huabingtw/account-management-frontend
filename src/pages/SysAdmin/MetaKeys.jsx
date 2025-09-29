import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  getMetaKeysAPI,
  deleteMetaKeyAPI,
  getMetaKeyEntitiesAPI,
  getMetaKeyDataTypesAPI
} from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function AdminMetaKeys() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [metaKeys, setMetaKeys] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [perPage, setPerPage] = useState(parseInt(searchParams.get('limit')) || 10)

  // Filter 狀態 - 從 URL 參數初始化
  const [filters, setFilters] = useState({
    filter_entity: searchParams.get('filter_entity') || '',
    filter_key_name: searchParams.get('filter_key_name') || '',
    filter_data_type: searchParams.get('filter_data_type') || ''
  })

  // 響應式 filter 面板顯示狀態
  const [showFilter, setShowFilter] = useState(false)

  // 實體和資料類型選項
  const [entities, setEntities] = useState([])
  const [dataTypes, setDataTypes] = useState({})

  // 檢查用戶是否有編輯權限（只有 super_admin 可以編輯）
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

  const loadMetaKeys = async (page = 1, filterParams = filters, pageSize = perPage) => {
    try {
      setLoading(true)
      setError(null)

      // 參考 OpenCart 的做法，建構 filter 查詢字串
      let filterQueryString = ''
      if (filterParams.filter_entity) {
        filterQueryString += '&entity=' + encodeURIComponent(filterParams.filter_entity)
      }
      if (filterParams.filter_key_name) {
        filterQueryString += '&search=' + encodeURIComponent(filterParams.filter_key_name)
      }

      const response = await getMetaKeysAPI(page, pageSize, filterParams.filter_key_name, filterParams.filter_entity)

      if (response.success) {
        setMetaKeys(response.data.data || [])
        setPagination({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || pageSize,
          total: response.data.total || 0,
          from: response.data.from || 0,
          to: response.data.to || 0
        })

        // 更新 URL 參數
        const newSearchParams = new URLSearchParams()
        newSearchParams.set('page', page.toString())
        newSearchParams.set('limit', pageSize.toString())

        Object.keys(filterParams).forEach(key => {
          if (filterParams[key] && filterParams[key] !== '') {
            newSearchParams.set(key, filterParams[key])
          }
        })

        setSearchParams(newSearchParams.toString())
      } else {
        setError(response.message || '載入擴充欄位失敗')
      }
    } catch (err) {
      console.error('載入擴充欄位失敗:', err)
      setError(err.message || '載入擴充欄位失敗')
    } finally {
      setLoading(false)
    }
  }

  // 載入實體和資料類型選項
  const loadOptions = async () => {
    try {
      const [entitiesResponse, dataTypesResponse] = await Promise.all([
        getMetaKeyEntitiesAPI(),
        getMetaKeyDataTypesAPI()
      ])

      if (entitiesResponse.success) {
        setEntities(entitiesResponse.data || [])
      }

      if (dataTypesResponse.success) {
        setDataTypes(dataTypesResponse.data || {})
      }
    } catch (err) {
      console.error('載入選項失敗:', err)
    }
  }

  useEffect(() => {
    loadMetaKeys(currentPage, filters, perPage)
    loadOptions()
  }, [currentPage, perPage])

  // Filter 改變處理
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
  }

  // 應用 Filter
  const applyFilter = () => {
    setCurrentPage(1)
    loadMetaKeys(1, filters, perPage)
  }

  // 重置 Filter
  const resetFilter = () => {
    const resetFilters = {
      filter_entity: '',
      filter_key_name: '',
      filter_data_type: ''
    }
    setFilters(resetFilters)
    setCurrentPage(1)
    setSearchParams('page=1&limit=' + perPage)
    loadMetaKeys(1, resetFilters, perPage)
  }

  // 刪除擴充欄位
  const handleDelete = async (id, name) => {
    if (!confirm(`確定要刪除擴充欄位「${name}」嗎？`)) {
      return
    }

    try {
      const response = await deleteMetaKeyAPI(id)
      if (response.success) {
        alert('刪除成功')
        loadMetaKeys(currentPage, filters, perPage) // 重新載入當前頁面
      } else {
        alert(response.message || '刪除失敗')
      }
    } catch (err) {
      console.error('刪除失敗:', err)
      alert(err.message || '刪除失敗')
    }
  }

  // 分頁處理
  const handlePageChange = (page) => {
    setCurrentPage(page)
    loadMetaKeys(page, filters, perPage)
  }

  // 每頁數量改變處理
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
    loadMetaKeys(1, filters, newPerPage)
  }

  // 生成分頁號碼
  const generatePageNumbers = () => {
    const pages = []
    const maxPages = pagination.last_page || 1
    const current = pagination.current_page || 1

    // 顯示邏輯：最多顯示 7 個頁碼
    let start = Math.max(1, current - 3)
    let end = Math.min(maxPages, start + 6)

    if (end - start < 6) {
      start = Math.max(1, end - 6)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">擴充欄位</h1>
          <p className="text-gray-600 mt-2">管理系統的自訂擴充欄位</p>
        </div>
        {canEdit && (
          <Link
            to="/sys-admin/meta-keys/new"
            className="btn btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新增擴充欄位
          </Link>
        )}
      </div>

      {/* 行動版篩選按鈕 */}
      <div className="lg:hidden mb-4">
        <button
          className="btn btn-outline w-full"
          onClick={() => setShowFilter(!showFilter)}
        >
          篩選條件
          <svg className={`w-4 h-4 ml-2 transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
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
              <h2 className="card-title text-lg font-semibold p-6 pb-0">篩選條件</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">實體類型</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={filters.filter_entity}
                  onChange={(e) => handleFilterChange('filter_entity', e.target.value)}
                >
                  <option value="">全部實體</option>
                  {entities.map(entity => (
                    <option key={entity} value={entity}>{entity}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">欄位名稱</span>
                </label>
                <input
                  type="text"
                  placeholder="搜尋欄位名稱..."
                  className="input input-bordered input-sm w-full"
                  value={filters.filter_key_name}
                  onChange={(e) => handleFilterChange('filter_key_name', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilter()}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">資料類型</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={filters.filter_data_type}
                  onChange={(e) => handleFilterChange('filter_data_type', e.target.value)}
                >
                  <option value="">全部類型</option>
                  {Object.entries(dataTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button
                  className="btn btn-primary btn-sm w-full"
                  onClick={applyFilter}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  篩選
                </button>
                <button
                  className="btn btn-outline btn-sm w-full"
                  onClick={resetFilter}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  重置
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主要內容區 - 左側面板 */}
        <div className="lg:w-3/4 lg:order-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                  <span className="ml-2">載入中...</span>
                </div>
              )}

              {error && (
                <div className="alert alert-error mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {!loading && !error && (
                <>
                  {/* Results Info */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-base-content/70">
                      {pagination.total > 0 ? (
                        <>第 {pagination.from} - {pagination.to} 筆，共 {pagination.total} 筆</>
                      ) : (
                        '沒有找到任何記錄'
                      )}
                    </div>
                  </div>

                  {/* Table */}
                  {metaKeys.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table table-zebra w-full">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>實體</th>
                            <th>欄位名稱</th>
                            <th>資料類型</th>
                            <th>描述</th>
                            <th>建立時間</th>
                            {canEdit && <th className="text-center">操作</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {metaKeys.map((metaKey) => (
                            <tr key={metaKey.id}>
                              <td className="font-mono text-sm">{metaKey.id}</td>
                              <td>
                                <span className="badge badge-outline">{metaKey.entity}</span>
                              </td>
                              <td className="font-medium">{metaKey.key_name}</td>
                              <td>
                                <span className="badge badge-secondary">
                                  {dataTypes[metaKey.data_type] || metaKey.data_type}
                                </span>
                              </td>
                              <td className="text-sm text-base-content/70">
                                <div className="max-w-xs truncate" title={metaKey.description}>
                                  {metaKey.description || '-'}
                                </div>
                              </td>
                              <td className="text-sm text-base-content/70">
                                {new Date(metaKey.created_at).toLocaleDateString('zh-TW')}
                              </td>
                              {canEdit && (
                                <td className="text-center">
                                  <div className="flex justify-center gap-2">
                                    <Link
                                      to={`/sys-admin/meta-keys/${metaKey.id}?${getCurrentQueryString()}`}
                                      className="btn btn-ghost btn-xs"
                                      title="編輯"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </Link>
                                    <button
                                      className="btn btn-ghost btn-xs text-error"
                                      onClick={() => handleDelete(metaKey.id, metaKey.key_name)}
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
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-base-content/50">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p>沒有找到任何擴充欄位</p>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.last_page > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="join">
                        <button
                          className="join-item btn"
                          disabled={pagination.current_page <= 1}
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {generatePageNumbers().map((page) => (
                          <button
                            key={page}
                            className={`join-item btn ${
                              page === pagination.current_page ? 'btn-active' : ''
                            }`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          className="join-item btn"
                          disabled={pagination.current_page >= pagination.last_page}
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
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