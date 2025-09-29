import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { getSystemsAPI, deleteSystemAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { notifications } from '../../utils/formHandler'

export default function Systems() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [systems, setSystems] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [perPage, setPerPage] = useState(parseInt(searchParams.get('limit')) || 10)

  // Filter 狀態
  const [filters, setFilters] = useState({
    filter_code: searchParams.get('filter_code') || '',
    filter_name: searchParams.get('filter_name') || '',
    filter_description: searchParams.get('filter_description') || ''
  })

  const [showFilter, setShowFilter] = useState(false)
  const canEdit = user?.roles?.some(role => ['super_admin'].includes(role)) || false

  const loadSystems = async () => {
    try {
      setLoading(true)
      console.log('Loading systems with params:', {
        currentPage,
        perPage,
        filters
      })

      const response = await getSystemsAPI(
        currentPage,
        perPage,
        filters.filter_code,
        filters.filter_name,
        filters.filter_description
      )

      console.log('API Response:', response)

      if (response.success) {
        setSystems(response.data.data)
        setPagination(response.data.pagination)
        console.log('Systems loaded successfully:', response.data.data)
      } else {
        console.error('API 回應錯誤:', response)
        notifications.error('載入失敗: ' + (response.message || '未知錯誤'))
      }
    } catch (error) {
      console.error('載入系統列表失敗:', error)
      notifications.error('載入失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSystems()
  }, [currentPage, perPage])

  const handleSearch = () => {
    setCurrentPage(1)
    updateSearchParams()
    setTimeout(() => loadSystems(), 100)
  }

  const updateSearchParams = () => {
    const params = new URLSearchParams()
    if (currentPage > 1) params.set('page', currentPage)
    if (perPage !== 10) params.set('limit', perPage)
    if (filters.filter_code) params.set('filter_code', filters.filter_code)
    if (filters.filter_name) params.set('filter_name', filters.filter_name)
    if (filters.filter_description) params.set('filter_description', filters.filter_description)
    setSearchParams(params)
  }

  const handleDelete = async (id) => {
    if (confirm('確定要刪除此系統嗎？')) {
      try {
        const response = await deleteSystemAPI(id)
        if (response.success) {
          notifications.success('系統刪除成功')
          loadSystems()
        } else {
          notifications.error('刪除失敗: ' + (response.message || '未知錯誤'))
        }
      } catch (error) {
        console.error('刪除系統失敗:', error)
        notifications.error('刪除失敗: ' + error.message)
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content mb-2">關聯系統</h1>
        <div className="text-sm breadcrumbs">
          <ul>
            <li><a onClick={() => navigate('/dashboard')} className="cursor-pointer">首頁</a></li>
            <li>系統管理</li>
            <li>關聯系統</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">系統列表</h2>
                <div className="flex gap-2 items-center">
                  <button
                    className="btn btn-ghost btn-sm lg:hidden"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                    </svg>
                    篩選
                  </button>

                  <select
                    className="select select-bordered select-sm w-auto"
                    value={perPage}
                    onChange={(e) => setPerPage(parseInt(e.target.value))}
                  >
                    <option value={10}>10 筆</option>
                    <option value={25}>25 筆</option>
                    <option value={50}>50 筆</option>
                    <option value={100}>100 筆</option>
                  </select>

                  {canEdit && (
                    <Link to="/sys-admin/systems/create" className="btn btn-primary btn-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      新增系統
                    </Link>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>系統代碼</th>
                          <th>系統名稱</th>
                          <th>描述</th>
                          <th>狀態</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {systems && systems.length > 0 ? systems.map((system) => (
                          <tr key={system.id}>
                            <td className="font-mono text-sm">{system.code}</td>
                            <td>{system.name}</td>
                            <td className="max-w-xs truncate">{system.description}</td>
                            <td>
                              <span className={`badge ${system.is_active ? 'badge-success' : 'badge-ghost'}`}>
                                {system.is_active ? '啟用' : '停用'}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <Link
                                  to={`/sys-admin/systems/${system.id}`}
                                  className="btn btn-ghost btn-xs"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </Link>
                                {canEdit && (
                                  <button
                                    onClick={() => handleDelete(system.id)}
                                    className="btn btn-ghost btn-xs text-error"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" className="text-center py-8 text-base-content/70">
                              {loading ? '載入中...' : '沒有找到任何系統'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* 分頁 */}
                  {pagination && pagination.total > 0 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-base-content/70">
                        共 {pagination.total} 筆，第 {pagination.current_page} / {pagination.last_page} 頁
                      </div>
                      <div className="join">
                        <button
                          className="join-item btn btn-sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          上一頁
                        </button>
                        <button
                          className="join-item btn btn-sm"
                          disabled={currentPage === pagination.last_page}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          下一頁
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 篩選面板 */}
        <div className={`${showFilter || window.innerWidth >= 1024 ? 'block' : 'hidden'}`}>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">篩選條件</h3>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">系統代碼</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm"
                    value={filters.filter_code}
                    onChange={(e) => setFilters({...filters, filter_code: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">系統名稱</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm"
                    value={filters.filter_name}
                    onChange={(e) => setFilters({...filters, filter_name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">描述</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm"
                    value={filters.filter_description}
                    onChange={(e) => setFilters({...filters, filter_description: e.target.value})}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary flex-1 btn-sm"
                    onClick={handleSearch}
                  >
                    查詢
                  </button>
                  <button
                    className="btn btn-ghost flex-1 btn-sm"
                    onClick={() => {
                      setFilters({
                        filter_code: '',
                        filter_name: '',
                        filter_description: ''
                      })
                      setCurrentPage(1)
                      setSearchParams(new URLSearchParams())
                      loadSystems()
                    }}
                  >
                    清除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}