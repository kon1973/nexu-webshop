'use client'

import { useState, useEffect, useRef, useTransition, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2, Package, Tag, Sparkles, Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSearchSuggestions, getPopularSearches, type SearchSuggestion, type PopularSearch } from '@/app/search/actions'
import { getImageUrl } from '@/lib/image'
import { searchWithAI } from '@/lib/actions/user-actions'

type SearchMode = 'standard' | 'ai'

interface AISearchResult {
  success: boolean
  error?: string
  products?: Array<{
    id: number
    name: string
    slug: string | null
    price: number
    salePrice?: number | null
    image: string | null
    category?: string | null
  }>
  intent?: string
  aiSummary?: string | null
  appliedFilters?: {
    category?: string | null
    priceRange?: { min?: number | null; max?: number | null }
    sortBy?: string | null
  }
}

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
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
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
  const [searchMode, setSearchMode] = useState<SearchMode>('standard')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [aiResults, setAiResults] = useState<AISearchResult | null>(null)
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPending, startTransition] = useTransition()
  const [isAILoading, setIsAILoading] = useState(false)
  const [isLoadingPopular, setIsLoadingPopular] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

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

      // Initialize speech recognition for AI mode
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.lang = 'hu-HU'
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setQuery(transcript)
          setIsListening(false)
          if (searchMode === 'ai') {
            handleAISearch(transcript)
          }
        }
        
        recognitionRef.current.onerror = () => setIsListening(false)
        recognitionRef.current.onend = () => setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
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
      setAiResults(null)
      setActiveIndex(-1)
      setIsListening(false)
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

  // AI Search handler
  const handleAISearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setIsAILoading(true)
    saveRecentSearch(searchQuery.trim())
    
    try {
      const result = await searchWithAI(searchQuery)
      setAiResults(result)
    } catch (error) {
      console.error('AI Search error:', error)
      setAiResults({ success: false })
    } finally {
      setIsAILoading(false)
    }
  }, [saveRecentSearch])

  // Toggle voice recognition
  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.abort()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }, [isListening])

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
    const totalItems = searchMode === 'ai' ? (aiResults?.products?.length || 0) : suggestions.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (searchMode === 'ai') {
        if (activeIndex >= 0 && aiResults?.products?.[activeIndex]) {
          const product = aiResults.products[activeIndex]
          router.push(`/shop/${product.slug || product.id}`)
          onClose()
        } else {
          handleAISearch(query)
        }
      } else {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleProductClick(suggestions[activeIndex].id)
        } else {
          handleSearch(query)
        }
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [searchMode, suggestions, aiResults, activeIndex, query, handleProductClick, handleSearch, handleAISearch, onClose, router])

  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem('nexu-recent-searches')
    setRecentSearches([])
  }, [])

  if (!isOpen) return null

  const showSuggestions = searchMode === 'standard' && query.length >= 2 && suggestions.length > 0
  const showEmptyState = searchMode === 'standard' && query.length >= 2 && suggestions.length === 0 && !isPending
  const showDefaultState = query.length < 2 && !aiResults
  const showAIResults = searchMode === 'ai' && aiResults?.success && aiResults.products

  const aiExampleQueries = [
    'Olcsó telefon 100 ezer alatt',
    'Gaming laptop nagy teljesítménnyel',
    'Vezeték nélküli fülhallgató sportoláshoz',
    'Samsung telefon jó kamerával'
  ]

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
              {/* Search Mode Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => { setSearchMode('standard'); setAiResults(null); setActiveIndex(-1) }}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    searchMode === 'standard'
                      ? 'text-white bg-white/5 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Search size={16} />
                  Hagyományos
                </button>
                <button
                  onClick={() => { setSearchMode('ai'); setSuggestions([]); setActiveIndex(-1) }}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    searchMode === 'ai'
                      ? 'text-white bg-purple-500/10 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Sparkles size={16} />
                  AI Keresés
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b border-white/10">
                <div className="relative flex items-center">
                  {searchMode === 'ai' ? (
                    <Sparkles size={20} className="absolute left-4 text-purple-400" />
                  ) : (
                    <Search size={20} className="absolute left-4 text-gray-500" />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={searchMode === 'ai' 
                      ? 'Írd le mit keresel természetes nyelven...' 
                      : 'Keresés termékek között...'
                    }
                    className={`w-full border rounded-xl pl-12 pr-20 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      searchMode === 'ai'
                        ? 'bg-purple-500/5 border-purple-500/30 focus:border-purple-500/50'
                        : 'bg-[#1a1a1a] border-white/10 focus:border-purple-500/50'
                    }`}
                    autoComplete="off"
                  />
                  {(isPending || isAILoading) && (
                    <Loader2 size={18} className="absolute right-16 text-purple-500 animate-spin" />
                  )}
                  {searchMode === 'ai' && recognitionRef.current && (
                    <button
                      onClick={toggleVoice}
                      className={`absolute right-12 p-1.5 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'hover:bg-white/10 text-gray-500'
                      }`}
                      title={isListening ? 'Hallgatás leállítása' : 'Hangalapú keresés'}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
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
                  {searchMode === 'ai' && (
                    <>
                      <span className="ml-2 text-purple-400">•</span>
                      <span className="text-purple-400">AI értelmezi a kérésedet</span>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* AI Search Results */}
                {showAIResults && (
                  <div className="space-y-4">
                    {/* AI Summary */}
                    {aiResults.aiSummary && (
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Sparkles className="text-purple-400 mt-0.5 flex-shrink-0" size={18} />
                          <div>
                            <p className="text-sm text-gray-300">{aiResults.aiSummary}</p>
                            {aiResults.appliedFilters && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {aiResults.appliedFilters.category && (
                                  <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                                    {aiResults.appliedFilters.category}
                                  </span>
                                )}
                                {aiResults.appliedFilters.priceRange?.max && (
                                  <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                                    max {aiResults.appliedFilters.priceRange.max.toLocaleString('hu-HU')} Ft
                                  </span>
                                )}
                                {aiResults.appliedFilters.sortBy && (
                                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">
                                    {aiResults.appliedFilters.sortBy === 'price_asc' ? 'Ár növekvő' : 
                                     aiResults.appliedFilters.sortBy === 'price_desc' ? 'Ár csökkenő' :
                                     aiResults.appliedFilters.sortBy === 'rating' ? 'Legjobb értékelés' : 
                                     aiResults.appliedFilters.sortBy}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Product Results */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Package size={12} />
                        Találatok ({aiResults.products?.length || 0})
                      </p>
                      {aiResults.products?.map((product, index) => {
                        const imageUrl = getImageUrl(product.image)
                        const hasDiscount = product.salePrice && product.salePrice < product.price
                        const displayPrice = product.salePrice || product.price
                        return (
                          <button
                            key={product.id}
                            onClick={() => {
                              router.push(`/shop/${product.slug || product.id}`)
                              onClose()
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                              index === activeIndex 
                                ? 'bg-purple-500/20 border border-purple-500/30' 
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="w-14 h-14 bg-[#1a1a1a] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {imageUrl ? (
                                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={20} className="text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-medium truncate text-white">{product.name}</p>
                              {product.category && (
                                <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-purple-400 font-semibold">
                                  {displayPrice.toLocaleString('hu-HU')} Ft
                                </span>
                                {hasDiscount && (
                                  <span className="text-xs text-gray-500 line-through">
                                    {product.price.toLocaleString('hu-HU')} Ft
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={16} className="flex-shrink-0 text-gray-600" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* AI Loading state */}
                {searchMode === 'ai' && isAILoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <Loader2 className="animate-spin text-purple-500" size={32} />
                      <Sparkles className="absolute -top-1 -right-1 text-purple-400 animate-pulse" size={14} />
                    </div>
                    <p className="text-gray-400 mt-4">AI elemzi a kérésedet...</p>
                  </div>
                )}

                {/* AI Empty/Initial state */}
                {searchMode === 'ai' && !isAILoading && !aiResults && (
                  <div className="space-y-6">
                    <div className="text-center py-6">
                      <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Sparkles className="text-purple-400" size={28} />
                      </div>
                      <h3 className="font-semibold text-white mb-2">AI Keresés</h3>
                      <p className="text-sm text-gray-400 max-w-sm mx-auto">
                        Írd le természetes nyelven, mit keresel. Az AI megérti és megtalálja a legjobb termékeket.
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Próbáld ki ezeket
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {aiExampleQueries.map((example) => (
                          <button
                            key={example}
                            onClick={() => {
                              setQuery(example)
                              handleAISearch(example)
                            }}
                            className="px-4 py-3 bg-white/5 hover:bg-purple-500/10 text-gray-300 hover:text-white text-sm rounded-xl border border-white/5 hover:border-purple-500/20 transition-all text-left flex items-center gap-3"
                          >
                            <Sparkles size={14} className="text-purple-400" />
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI No results */}
                {searchMode === 'ai' && aiResults && !aiResults.success && (
                  <div className="text-center py-8">
                    <Package size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Nem találtam megfelelő terméket</p>
                    <p className="text-sm text-gray-600 mt-1">Próbálj más leírást használni</p>
                  </div>
                )}

                {/* Standard Search Suggestions */}
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

                {/* Standard Loading state */}
                {searchMode === 'standard' && isPending && query.length >= 2 && suggestions.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-purple-500" size={24} />
                  </div>
                )}

                {/* Standard No results */}
                {showEmptyState && (
                  <div className="text-center py-8">
                    <Package size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Nincs találat: "{query}"</p>
                    <p className="text-sm text-gray-600 mt-1">Próbálj más keresőszavakat</p>
                    <button
                      onClick={() => { setSearchMode('ai'); handleAISearch(query) }}
                      className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors inline-flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      Próbáld AI kereséssel
                    </button>
                  </div>
                )}

                {/* Default state - Recent & Popular (standard mode only) */}
                {showDefaultState && searchMode === 'standard' && (
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
