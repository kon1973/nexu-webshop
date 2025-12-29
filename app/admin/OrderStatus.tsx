'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type StatusOption = {
  value: string
  label: string
  color: string
}

const statuses: StatusOption[] = [
  { value: 'pending', label: 'Függőben', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  { value: 'paid', label: 'Fizetve', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  {
    value: 'shipped',
    label: 'Szállítás alatt',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  { value: 'delivered', label: 'Kézbesítve', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'cancelled', label: 'Törölve', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
]

export default function OrderStatus({ orderId, initialStatus }: { orderId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = async (newStatus: string) => {
    setLoading(true)
    setIsOpen(false)

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (res.ok) {
        setStatus(newStatus)
        const label = statuses.find((s) => s.value === newStatus)?.label ?? newStatus
        toast.success(`Státusz frissítve: ${label}`)
        router.refresh()
      } else {
        toast.error('Hiba a státusz mentésekor.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Hálózati hiba.')
    } finally {
      setLoading(false)
    }
  }

  const currentStatus = statuses.find((s) => s.value === status)
  const currentStyle = currentStatus?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center justify-between gap-2 text-sm font-bold px-4 py-2 rounded-lg border transition-all w-full md:w-48 ${currentStyle} ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-80'}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Frissítés...</span>
          </div>
        ) : (
          <>
            <span>{currentStatus?.label || status}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-1">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleChange(s.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                    status === s.value ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {s.label}
                  {status === s.value && <Check size={14} className="text-purple-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

