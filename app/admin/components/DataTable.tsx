'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  width?: string
  render?: (item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T extends { id: string | number }> {
  data: T[]
  columns: Column<T>[]
  selectable?: boolean
  selectedIds?: (string | number)[]
  onSelectionChange?: (ids: (string | number)[]) => void
  onRowClick?: (item: T) => void
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  rowActions?: (item: T) => React.ReactNode
  stickyHeader?: boolean
}

export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  pageSize = 10,
  loading = false,
  emptyMessage = 'Nincsenek adatok',
  rowActions,
  stickyHeader = false
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return data
    
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      
      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      const comparison = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortKey, sortDirection])

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  // Handle selection
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(paginatedData.map(item => item.id))
    }
  }

  const handleSelectRow = (id: string | number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(sid => sid !== id))
    } else {
      onSelectionChange?.([...selectedIds, id])
    }
  }

  const isAllSelected = paginatedData.length > 0 && 
    paginatedData.every(item => selectedIds.includes(item.id))
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected

  return (
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full border-collapse">
          <thead className={cn(
            'bg-white/5',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            <tr>
              {selectable && (
                <th className="w-12 p-4">
                  <button
                    onClick={handleSelectAll}
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                      isAllSelected 
                        ? 'bg-purple-500 border-purple-500' 
                        : isSomeSelected
                        ? 'bg-purple-500/50 border-purple-500'
                        : 'border-white/20 hover:border-white/40'
                    )}
                  >
                    {(isAllSelected || isSomeSelected) && (
                      <Check size={12} className="text-white" />
                    )}
                  </button>
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer select-none hover:text-white transition-colors'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={cn(
                    'flex items-center gap-1',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}>
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      <span className="text-purple-400">
                        {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {rowActions && <th className="w-12 p-4" />}
            </tr>
          </thead>
          
          <tbody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className="border-t border-white/5">
                  {selectable && (
                    <td className="p-4">
                      <div className="w-5 h-5 bg-white/5 rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.key} className="p-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                  {rowActions && <td className="p-4" />}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="p-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data rows
              <AnimatePresence mode="popLayout">
                {paginatedData.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id)
                  
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'border-t border-white/5 transition-colors',
                        onRowClick && 'cursor-pointer hover:bg-white/5',
                        isSelected && 'bg-purple-500/10'
                      )}
                      onClick={() => onRowClick?.(item)}
                    >
                      {selectable && (
                        <td className="p-4" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleSelectRow(item.id)}
                            className={cn(
                              'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                              isSelected 
                                ? 'bg-purple-500 border-purple-500' 
                                : 'border-white/20 hover:border-white/40'
                            )}
                          >
                            {isSelected && <Check size={12} className="text-white" />}
                          </button>
                        </td>
                      )}
                      {columns.map(column => (
                        <td 
                          key={column.key}
                          className={cn(
                            'p-4 text-sm text-gray-300',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {column.render 
                            ? column.render(item, index)
                            : String((item as Record<string, unknown>)[column.key] ?? '-')
                          }
                        </td>
                      ))}
                      {rowActions && (
                        <td className="p-4" onClick={e => e.stopPropagation()}>
                          {rowActions(item)}
                        </td>
                      )}
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-gray-500">
            {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedData.length)} / {sortedData.length} elem
          </p>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={16} className="text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-400" />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, i, arr) => {
                  const showEllipsis = i > 0 && page - arr[i - 1] > 1
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'w-8 h-8 rounded-lg text-sm transition-colors',
                          page === currentPage
                            ? 'bg-purple-500 text-white'
                            : 'text-gray-400 hover:bg-white/5'
                        )}
                      >
                        {page}
                      </button>
                    </div>
                  )
                })
              }
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Row action dropdown menu
export function RowActions({
  actions
}: {
  actions: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'danger'
    disabled?: boolean
  }>
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute right-0 mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
            >
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    action.onClick()
                    setIsOpen(false)
                  }}
                  disabled={action.disabled}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                    action.variant === 'danger'
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-gray-300 hover:bg-white/5',
                    action.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Status badge component
export function StatusBadge({
  status,
  variant
}: {
  status: string
  variant: 'success' | 'warning' | 'error' | 'info' | 'default'
}) {
  const variants = {
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
    default: 'bg-gray-500/20 text-gray-400'
  }

  return (
    <span className={cn(
      'inline-flex px-2 py-1 rounded-full text-xs font-medium',
      variants[variant]
    )}>
      {status}
    </span>
  )
}
