'use client'

import { useState } from 'react'
import { 
  Trash2, 
  Archive, 
  Tag, 
  Percent, 
  Box, 
  ChevronDown,
  Loader2,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BulkActionsProps {
  selectedIds: number[]
  totalItems: number
  onSelectAll: () => void
  onClearSelection: () => void
  onAction: (action: string, params?: Record<string, any>) => Promise<void>
  categories?: { id: string; name: string }[]
}

export default function BulkActions({
  selectedIds,
  totalItems,
  onSelectAll,
  onClearSelection,
  onAction,
  categories = []
}: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [actionParams, setActionParams] = useState<Record<string, any>>({})

  const selectedCount = selectedIds.length
  const isAllSelected = selectedCount === totalItems && totalItems > 0
  const isSomeSelected = selectedCount > 0 && selectedCount < totalItems

  const handleAction = async (action: string, params?: Record<string, any>) => {
    if (action === 'delete' || action === 'archive') {
      setConfirmAction(action)
      setActionParams(params || {})
      return
    }

    await executeAction(action, params)
  }

  const executeAction = async (action: string, params?: Record<string, any>) => {
    setIsLoading(true)
    try {
      await onAction(action, params)
      setConfirmAction(null)
      setActionParams({})
      setIsOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Hiba történt a művelet végrehajtása közben')
    } finally {
      setIsLoading(false)
    }
  }

  const actions = [
    {
      id: 'set_category',
      label: 'Kategória módosítása',
      icon: Tag,
      color: 'text-blue-400',
      hasSubmenu: true,
      submenu: categories.map(cat => ({
        id: cat.id,
        label: cat.name,
        onClick: () => handleAction('set_category', { categoryId: cat.id, categoryName: cat.name })
      }))
    },
    {
      id: 'set_discount',
      label: 'Akció beállítása',
      icon: Percent,
      color: 'text-green-400',
      hasSubmenu: true,
      submenu: [
        { id: '10', label: '10% kedvezmény', onClick: () => handleAction('set_discount', { percentage: 10 }) },
        { id: '20', label: '20% kedvezmény', onClick: () => handleAction('set_discount', { percentage: 20 }) },
        { id: '30', label: '30% kedvezmény', onClick: () => handleAction('set_discount', { percentage: 30 }) },
        { id: '50', label: '50% kedvezmény', onClick: () => handleAction('set_discount', { percentage: 50 }) },
        { id: 'remove', label: 'Akció eltávolítása', onClick: () => handleAction('remove_discount') }
      ]
    },
    {
      id: 'update_stock',
      label: 'Készlet módosítása',
      icon: Box,
      color: 'text-orange-400',
      hasSubmenu: true,
      submenu: [
        { id: 'in_stock', label: 'Készleten (10 db)', onClick: () => handleAction('update_stock', { stock: 10 }) },
        { id: 'low_stock', label: 'Alacsony (3 db)', onClick: () => handleAction('update_stock', { stock: 3 }) },
        { id: 'out_of_stock', label: 'Elfogyott (0 db)', onClick: () => handleAction('update_stock', { stock: 0 }) }
      ]
    },
    {
      id: 'archive',
      label: 'Archiválás',
      icon: Archive,
      color: 'text-yellow-400',
      onClick: () => handleAction('archive')
    },
    {
      id: 'delete',
      label: 'Törlés',
      icon: Trash2,
      color: 'text-red-400',
      onClick: () => handleAction('delete')
    }
  ]

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      {/* Bulk actions bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-3 flex items-center gap-3"
      >
        {/* Selection info */}
        <div className="flex items-center gap-3 pl-2 border-r border-white/10 pr-4">
          <button
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare size={20} className="text-purple-400" />
            ) : isSomeSelected ? (
              <MinusSquare size={20} className="text-purple-400" />
            ) : (
              <Square size={20} />
            )}
          </button>
          <span className="text-sm text-white font-medium whitespace-nowrap">
            {selectedCount} kiválasztva
          </span>
          {selectedCount > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Törlés
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {actions.map((action) => {
            if (action.hasSubmenu) {
              return (
                <ActionDropdown
                  key={action.id}
                  action={action}
                  disabled={isLoading}
                />
              )
            }

            return (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
                  action.id === 'delete' 
                    ? 'hover:bg-red-500/20 text-red-400' 
                    : 'hover:bg-white/10 text-gray-300'
                )}
              >
                <action.icon size={16} />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            )
          })}
        </div>

        {isLoading && (
          <Loader2 size={18} className="animate-spin text-purple-400 ml-2" />
        )}
      </motion.div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <AlertTriangle className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {confirmAction === 'delete' ? 'Törlés megerősítése' : 'Archiválás megerősítése'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedCount} elem kiválasztva
                  </p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                {confirmAction === 'delete' 
                  ? `Biztosan törölni szeretnéd a kiválasztott ${selectedCount} terméket? Ez a művelet nem vonható vissza.`
                  : `Biztosan archiválni szeretnéd a kiválasztott ${selectedCount} terméket?`
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Mégse
                </button>
                <button
                  onClick={() => executeAction(confirmAction, actionParams)}
                  disabled={isLoading}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                    confirmAction === 'delete'
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                  )}
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {confirmAction === 'delete' ? 'Törlés' : 'Archiválás'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Dropdown component for actions with submenus
function ActionDropdown({ 
  action, 
  disabled 
}: { 
  action: {
    id: string
    label: string
    icon: React.ElementType
    color: string
    submenu?: { id: string; label: string; onClick: () => void }[]
  }
  disabled: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 hover:bg-white/10 text-gray-300',
          isOpen && 'bg-white/10'
        )}
      >
        <action.icon size={16} className={action.color} />
        <span className="hidden sm:inline">{action.label}</span>
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 min-w-[180px]"
            >
              {action.submenu?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick()
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
