'use client'

import { useState, useEffect, useCallback } from 'react'
import { History, X, TrendingUp, Clock, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const STORAGE_KEY = 'nexu-search-history'
const MAX_HISTORY_ITEMS = 10

interface SearchHistoryItem {
  query: string
  timestamp: number
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {
        setHistory([])
      }
    }
  }, [])

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return

    setHistory(prev => {
      const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase())
      const newHistory = [
        { query: query.trim(), timestamp: Date.now() },
        ...filtered
      ].slice(0, MAX_HISTORY_ITEMS)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.query !== query)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return filtered
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { history, addToHistory, removeFromHistory, clearHistory }
}

// Frequently searched terms (could be fetched from API in production)
const TRENDING_SEARCHES = [
  'iPhone',
  'Samsung Galaxy',
  'PlayStation',
  'Xbox',
  'Nintendo',
  'AirPods',
  'Laptop',
  'Monitor'
]

interface SearchHistoryPanelProps {
  onSelect: (query: string) => void
  onClose: () => void
  isVisible: boolean
}

export default function SearchHistoryPanel({
  onSelect,
  onClose,
  isVisible
}: SearchHistoryPanelProps) {
  const { history, removeFromHistory, clearHistory } = useSearchHistory()

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Most'
    if (minutes < 60) return `${minutes} perce`
    if (hours < 24) return `${hours} órája`
    if (days < 7) return `${days} napja`
    return new Date(timestamp).toLocaleDateString('hu-HU')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
        >
          <div className="max-h-[400px] overflow-y-auto">
            {/* Recent searches */}
            {history.length > 0 && (
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                    <History size={12} />
                    Legutóbbi keresések
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={10} />
                    Törlés
                  </button>
                </div>
                <div className="space-y-1">
                  {history.map((item) => (
                    <div
                      key={item.query}
                      className="flex items-center gap-2 group"
                    >
                      <button
                        onClick={() => onSelect(item.query)}
                        className="flex-1 flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <Clock size={14} className="text-gray-500" />
                        <span className="text-sm text-white truncate">{item.query}</span>
                        <span className="text-[10px] text-gray-600 ml-auto">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </button>
                      <button
                        onClick={() => removeFromHistory(item.query)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending searches */}
            <div className="p-3">
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5 mb-2">
                <TrendingUp size={12} />
                Népszerű keresések
              </span>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => onSelect(term)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 rounded-full text-xs text-gray-300 hover:text-white transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="p-3 border-t border-white/5 bg-white/[0.02]">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Link
                  href="/shop?sort=newest"
                  onClick={onClose}
                  className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 rounded-full text-xs text-purple-300 hover:text-white transition-colors"
                >
                  🆕 Új termékek
                </Link>
                <Link
                  href="/shop?sale=true"
                  onClick={onClose}
                  className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/20 rounded-full text-xs text-red-300 hover:text-white transition-colors"
                >
                  🔥 Akciók
                </Link>
                <Link
                  href="/shop?sort=popular"
                  onClick={onClose}
                  className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-full text-xs text-green-300 hover:text-white transition-colors"
                >
                  ⭐ Legnépszerűbb
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
