'use client'

import { useState, useEffect, useRef, useTransition, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2, Package, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSearchSuggestions, getPopularSearches, type SearchSuggestion, type PopularSearch } from '@/app/search/actions'
import { getImageUrl } from '@/lib/image'

type Props = {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

// Memoized suggestion item for performance
const SuggestionItem = memo(function SuggestionItem({
  product,
  isActive,
  onClick
}: {
  product: SearchSuggestion
  isActive: boolean
  onClick: () => void
}) {
  const imageUrl = getImageUrl(product.image)
  const hasDiscount = product.salePrice && product.salePrice < product.price

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-purple-500/20 border border-purple-500/30' 
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Package size={20} className="text-gray-500" />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{product.category}</span>
          <span className="text-xs text-purple-400 font-semibold">
            {(hasDiscount ? product.salePrice : product.price)?.toLocaleString('hu-HU')} Ft
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-500 line-through">
              {product.price.toLocaleString('hu-HU')} Ft
            </span>
          )}
        </div>
      </div>
      <ArrowRight size={16} className={`flex-shrink-0 ${isActive ? 'text-purple-400' : 'text-gray-600'}`} />
    </button>
  )
})

export default function SearchModal({ isOpen, onClose, isMobile = false }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPending, startTransition] = useTransition()
  const [isLoadingPopular, setIsLoadingPopular] = useState(true)

  // Load popular searches on mount
  useEffect(() => {
    if (isOpen) {
      getPopularSearches().then(searches => {
        setPopularSearches(searches)
        setIsLoadingPopular(false)
      })
      
      // Load recent searches from localStorage
      const recent = localStorage.getItem('nexu-recent-searches')
      if (recent) {
        try {
          setRecentSearches(JSON.parse(recent).slice(0, 5))
        } catch {}
      }
    }
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSuggestions([])
      setActiveIndex(-1)
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await getSearchSuggestions(query)
        setSuggestions(results)
      })
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Save to recent searches
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const recent = localStorage.getItem('nexu-recent-searches')
    let searches: string[] = []
    try {
      searches = recent ? JSON.parse(recent) : []
    } catch {}
    
    // Remove if exists, add to front
    searches = [searchQuery, ...searches.filter(s => s !== searchQuery)].slice(0, 10)
    localStorage.setItem('nexu-recent-searches', JSON.stringify(searches))
  }, [])

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    saveRecentSearch(searchQuery.trim())
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    onClose()
  }, [router, onClose, saveRecentSearch])

  const handleProductClick = useCallback((productId: number) => {
    router.push(`/shop/${productId}`)
    onClose()
  }, [router, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = suggestions.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleProductClick(suggestions[activeIndex].id)
      } else {
        handleSearch(query)
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [suggestions, activeIndex, query, handleProductClick, handleSearch, onClose])

  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem('nexu-recent-searches')
    setRecentSearches([])
  }, [])

  if (!isOpen) return null

  const showSuggestions = query.length >= 2 && suggestions.length > 0
  const showEmptyState = query.length >= 2 && suggestions.length === 0 && !isPending
  const showDefaultState = query.length < 2

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-[70] ${
              isMobile 
                ? 'inset-x-0 top-0 bottom-0' 
                : 'left-1/2 top-24 -translate-x-1/2 w-full max-w-2xl'
            }`}
          >
            <div className={`bg-[#0d0d0d] border border-white/10 shadow-2xl shadow-purple-500/10 ${
              isMobile ? 'h-full' : 'rounded-2xl max-h-[70vh]'
            } flex flex-col overflow-hidden`}>
              {/* Search Input */}
              <div className="p-4 border-b border-white/10">
                <div className="relative flex items-center">
                  <Search size={20} className="absolute left-4 text-gray-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Keresés termékek között..."
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    autoComplete="off"
                  />
                  {isPending && (
                    <Loader2 size={18} className="absolute right-12 text-purple-500 animate-spin" />
                  )}
                  <button
                    onClick={onClose}
                    className="absolute right-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Quick search hint */}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">↵</kbd>
                  <span>keresés</span>
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 ml-2">↑↓</kbd>
                  <span>navigáció</span>
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 ml-2">esc</kbd>
                  <span>bezárás</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Suggestions */}
                {showSuggestions && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Package size={12} />
                      Termékek
                    </p>
                    {suggestions.map((product, index) => (
                      <SuggestionItem
                        key={product.id}
                        product={product}
                        isActive={index === activeIndex}
                        onClick={() => handleProductClick(product.id)}
                      />
                    ))}
                    
                    {/* Search all results button */}
                    <button
                      onClick={() => handleSearch(query)}
                      className="w-full mt-3 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Search size={16} />
                      Összes találat "{query}"
                    </button>
                  </div>
                )}

                {/* Loading state */}
                {isPending && query.length >= 2 && suggestions.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-purple-500" size={24} />
                  </div>
                )}

                {/* No results */}
                {showEmptyState && (
                  <div className="text-center py-8">
                    <Package size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Nincs találat: "{query}"</p>
                    <p className="text-sm text-gray-600 mt-1">Próbálj más keresőszavakat</p>
                  </div>
                )}

                {/* Default state - Recent & Popular */}
                {showDefaultState && (
                  <div className="space-y-6">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={12} />
                            Legutóbbi keresések
                          </p>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                          >
                            Törlés
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search) => (
                            <button
                              key={search}
                              onClick={() => {
                                setQuery(search)
                                handleSearch(search)
                              }}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-full border border-white/5 transition-colors flex items-center gap-1.5"
                            >
                              <Clock size={12} className="text-gray-500" />
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <TrendingUp size={12} />
                        Népszerű keresések
                      </p>
                      {isLoadingPopular ? (
                        <div className="flex gap-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-8 w-24 bg-white/5 rounded-full animate-pulse" />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((search) => (
                            <button
                              key={search.query}
                              onClick={() => {
                                setQuery(search.query)
                                handleSearch(search.query)
                              }}
                              className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/20 transition-colors flex items-center gap-1.5"
                            >
                              <TrendingUp size={12} />
                              {search.query}
                              <span className="text-xs text-purple-500">({search.count})</span>
                            </button>
                          ))}
                          {popularSearches.length === 0 && (
                            <p className="text-sm text-gray-600">Még nincsenek népszerű keresések</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Category Links */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Tag size={12} />
                        Kategóriák
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {['Okostelefonok', 'Laptopok', 'Fülhallgatók', 'Okosórák'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              router.push(`/shop?category=${encodeURIComponent(cat)}`)
                              onClose()
                            }}
                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl border border-white/5 transition-colors text-left"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
