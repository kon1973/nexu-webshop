'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Sparkles, ChevronRight, TrendingUp, Folder, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

interface SearchProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  category?: string
}

interface SearchCategory {
  id: string
  name: string
  slug: string
  productCount: number
}

interface SmartSearchResult {
  products: SearchProduct[]
  categories: SearchCategory[]
  aiSuggestions: string[]
  popularSearches: string[]
  query: string
}

export default function SmartSearchDropdown() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SmartSearchResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults(null)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/smart?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, 300)

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    debouncedSearch(value)
  }

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
    }
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const hasResults = results && (
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.aiSuggestions.length > 0
  )

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl">
      {/* Search Input */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Keresés... (Ctrl+K)"
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </form>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          >
            {hasResults ? (
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Products */}
                {results.products.length > 0 && (
                  <div className="p-3 border-b border-white/5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Package size={12} />
                      Termékek
                    </p>
                    <div className="space-y-1">
                      {results.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        >
                          <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Package size={20} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate group-hover:text-purple-400 transition-colors">
                              {product.name}
                            </p>
                            {product.category && (
                              <p className="text-xs text-gray-500">{product.category}</p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-purple-400">
                            {product.price.toLocaleString('hu-HU')} Ft
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {results.categories.length > 0 && (
                  <div className="p-3 border-b border-white/5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Folder size={12} />
                      Kategóriák
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {results.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/shop?category=${category.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-purple-500/20 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                        >
                          {category.name}
                          <span className="text-xs text-gray-500">({category.productCount})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions */}
                {results.aiSuggestions.length > 0 && (
                  <div className="p-3 border-b border-white/5">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Sparkles size={12} className="text-purple-400" />
                      AI javaslatok
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {results.aiSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(suggestion)
                            debouncedSearch(suggestion)
                          }}
                          className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300 hover:text-purple-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search All */}
                <button
                  onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(query)}`)
                    setIsOpen(false)
                  }}
                  className="w-full p-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between text-gray-400 hover:text-white"
                >
                  <span className="text-sm">Összes találat megtekintése: &quot;{query}&quot;</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : query.length >= 2 && !isLoading ? (
              <div className="p-6 text-center">
                <p className="text-gray-400">Nincs találat: &quot;{query}&quot;</p>
                <p className="text-sm text-gray-500 mt-1">Próbálj más kifejezéssel keresni</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
