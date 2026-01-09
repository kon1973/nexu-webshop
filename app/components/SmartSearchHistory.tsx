'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, Clock, TrendingUp, X, Search, Trash2, 
  ArrowRight, Sparkles, Tag, Filter, Star
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl } from '@/lib/image'

interface SearchHistoryItem {
  id: string
  query: string
  timestamp: string
  resultCount?: number
  category?: string
}

interface TrendingSearch {
  query: string
  count: number
  trend: 'up' | 'stable' | 'new'
}

interface RecentProduct {
  id: number
  name: string
  price: number
  image: string | null
  slug: string | null
  category: string
}

interface SmartSearchHistoryProps {
  onSearch?: (query: string) => void
  isOpen?: boolean
  onClose?: () => void
}

const STORAGE_KEY = 'nexu-search-history'
const MAX_HISTORY = 10

export default function SmartSearchHistory({ onSearch, isOpen = true, onClose }: SmartSearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [trending, setTrending] = useState<TrendingSearch[]>([])
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch {}
    }
    
    // Load trending searches
    loadTrending()
    // Load AI suggestions
    loadSuggestions()
  }, [])

  const loadTrending = async () => {
    try {
      const response = await fetch('/api/search/trending')
      if (response.ok) {
        const data = await response.json()
        setTrending(data.trending || [])
      }
    } catch {}
  }

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/search/ai-suggestions')
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setRecentProducts(data.recentProducts || [])
      }
    } catch {}
  }

  // Save search to history
  const addToHistory = (query: string, resultCount?: number, category?: string) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date().toISOString(),
      resultCount,
      category
    }

    const updated = [newItem, ...history.filter(h => h.query !== query)].slice(0, MAX_HISTORY)
    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  // Remove single item
  const removeFromHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  // Handle search click
  const handleSearchClick = (query: string) => {
    onSearch?.(query)
    onClose?.()
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Most'
    if (minutes < 60) return `${minutes} perce`
    if (hours < 24) return `${hours} órája`
    return `${days} napja`
  }

  // Get unique categories from history
  const categories = [...new Set(history.filter(h => h.category).map(h => h.category!))]

  const filteredHistory = activeFilter 
    ? history.filter(h => h.category === activeFilter)
    : history

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
    >
      <div className="p-4">
        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-300">AI Ajánlatok neked</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleSearchClick(suggestion)}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 hover:text-purple-200 transition-colors"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Searches */}
        {trending.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-green-400" />
              <h3 className="text-sm font-semibold text-gray-300">Trendi keresések</h3>
            </div>
            <div className="space-y-2">
              {trending.slice(0, 5).map((item, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSearchClick(item.query)}
                  className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-yellow-500 text-black' :
                      i === 1 ? 'bg-gray-400 text-black' :
                      i === 2 ? 'bg-orange-600 text-white' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{item.query}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.trend === 'up' && (
                      <span className="text-green-400 text-xs">↑ Felkapott</span>
                    )}
                    {item.trend === 'new' && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">Új</span>
                    )}
                    <ArrowRight size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-300">Keresési előzmények</h3>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                Törlés
              </button>
            )}
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  !activeFilter 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                Mind
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === cat 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <div className="text-center py-6">
              <Search size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-500 text-sm">Még nincs keresési előzmény</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredHistory.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group"
                >
                  <button
                    onClick={() => handleSearchClick(item.query)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <Clock size={14} className="text-gray-600" />
                    <div>
                      <p className="text-gray-300 group-hover:text-white transition-colors">{item.query}</p>
                      <p className="text-gray-600 text-xs">
                        {formatTimeAgo(item.timestamp)}
                        {item.resultCount !== undefined && ` • ${item.resultCount} találat`}
                        {item.category && (
                          <span className="ml-2 px-1.5 py-0.5 bg-white/5 rounded text-gray-500">
                            {item.category}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromHistory(item.id)
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
                  >
                    <X size={14} className="text-gray-500 hover:text-red-400" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Viewed Products */}
        {recentProducts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-yellow-400" />
              <h3 className="text-sm font-semibold text-gray-300">Nemrég nézett termékek</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentProducts.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug || product.id}`}
                  className="flex-shrink-0 w-24 group"
                >
                  <div className="w-24 h-24 bg-white/5 rounded-xl overflow-hidden mb-2">
                    {product.image ? (
                      <Image
                        src={getImageUrl(product.image) || ''}
                        alt={product.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Tag size={24} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 group-hover:text-white truncate transition-colors">
                    {product.name}
                  </p>
                  <p className="text-xs text-purple-400 font-bold">
                    {product.price.toLocaleString('hu-HU')} Ft
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Export helper to add search to history
export function saveSearchToHistory(query: string, resultCount?: number, category?: string) {
  const saved = localStorage.getItem(STORAGE_KEY)
  const history: SearchHistoryItem[] = saved ? JSON.parse(saved) : []
  
  const newItem: SearchHistoryItem = {
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
    resultCount,
    category
  }

  const updated = [newItem, ...history.filter(h => h.query !== query)].slice(0, MAX_HISTORY)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
