import React from 'react'

export default function Paginator({ pagination, currentPage, onPageChange }) {
  // 不顯示分頁器的條件：
  // 1. 沒有分頁資料
  // 2. 分頁資料是空物件 (沒有任何屬性)
  // 3. 總頁數 <= 1 (只有一頁就不需要分頁器)
  if (!pagination ||
      Object.keys(pagination).length === 0 ||
      pagination.last_page <= 1) {
    return null
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page && page !== currentPage) {
      onPageChange(page)
    }
  }

  const renderPageButtons = () => {
    const totalPages = pagination.last_page
    const current = currentPage
    const pages = []

    // 如果總頁數<= 10，顯示所有頁面
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            className={`join-item btn btn-sm ${current === i ? 'btn-active' : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        )
      }
    } else {
      // 主流分頁邏輯：1,2,3,4,5,6,7,8,9,10 ... 102,103

      // 顯示前10頁
      for (let i = 1; i <= 10; i++) {
        pages.push(
          <button
            key={i}
            className={`join-item btn btn-sm ${current === i ? 'btn-active' : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        )
      }

      // 顯示省略號
      if (totalPages > 12) {
        pages.push(
          <span key="ellipsis" className="join-item btn btn-sm btn-disabled">
            ...
          </span>
        )
      }

      // 顯示最後2頁
      for (let i = totalPages - 1; i <= totalPages; i++) {
        if (i > 10) { // 避免重複顯示
          pages.push(
            <button
              key={i}
              className={`join-item btn btn-sm ${current === i ? 'btn-active' : ''}`}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </button>
          )
        }
      }
    }

    return pages
  }

  return (
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
          上一頁
        </button>
        {renderPageButtons()}
        <button
          className="join-item btn btn-sm"
          disabled={currentPage === pagination.last_page}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          下一頁
        </button>
      </div>
    </div>
  )
}