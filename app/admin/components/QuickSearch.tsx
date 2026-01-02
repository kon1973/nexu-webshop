'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Search, 
  Command, 
  Package, 
  ShoppingCart, 
  User, 
  Tag, 
  FileText,
  Settings,
  LayoutDashboard,
  ArrowRight,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type SearchResultType = 'product' | 'order' | 'user' | 'coupon' | 'page' | 'setting'

interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  href: string
  image?: string
}

const typeConfig: Record<SearchResultType, { icon: React.ElementType; label: string }> = {
  product: { icon: Package, label: 'Termék' },
  order: { icon: ShoppingCart, label: 'Rendelés' },
  user: { icon: User, label: 'Felhasználó' },
  coupon: { icon: Tag, label: 'Kupon' },
  page: { icon: FileText, label: 'Oldal' },
  setting: { icon: Settings, label: 'Beállítás' }
}

// Admin pages for quick navigation
const adminPages: SearchResult[] = [
  { id: 'dashboard', type: 'page', title: 'Vezérlőpult', href: '/admin' },
  { id: 'products', type: 'page', title: 'Termékek', subtitle: 'Termékek kezelése', href: '/admin/products' },
  { id: 'add-product', type: 'page', title: 'Új termék', subtitle: 'Termék hozzáadása', href: '/admin/add-product' },
  { id: 'orders', type: 'page', title: 'Rendelések', subtitle: 'Rendelések kezelése', href: '/admin/orders' },
  { id: 'users', type: 'page', title: 'Felhasználók', subtitle: 'Felhasználók kezelése', href: '/admin/users' },
  { id: 'coupons', type: 'page', title: 'Kuponok', subtitle: 'Kuponok kezelése', href: '/admin/coupons' },
  { id: 'reviews', type: 'page', title: 'Értékelések', subtitle: 'Értékelések moderálása', href: '/admin/reviews' },
  { id: 'newsletter', type: 'page', title: 'Hírlevél', subtitle: 'Feliratkozók kezelése', href: '/admin/newsletter' },
  { id: 'analytics', type: 'page', title: 'Analitika', subtitle: 'Statisztikák', href: '/admin/analytics' },
  { id: 'settings', type: 'page', title: 'Beállítások', subtitle: 'Rendszerbeállítások', href: '/admin/settings' },
  { id: 'categories', type: 'page', title: 'Kategóriák', subtitle: 'Kategóriák kezelése', href: '/admin/categories' },
  { id: 'brands', type: 'page', title: 'Márkák', subtitle: 'Márkák kezelése', href: '/admin/brands' },
  { id: 'blog', type: 'page', title: 'Blog', subtitle: 'Blogbejegyzések', href: '/admin/blog' },
]

interface QuickSearchProps {
  onSearch?: (query: string) => Promise<SearchResult[]>
}

export default function QuickSearch({ onSearch }: QuickSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Search logic
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Filter admin pages
    const pageResults = adminPages.filter(page => 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Call external search if provided
    let externalResults: SearchResult[] = []
    if (onSearch) {
      try {
        externalResults = await onSearch(searchQuery)
      } catch (error) {
        console.error('Search error:', error)
      }
    }

    setResults([...pageResults.slice(0, 3), ...externalResults.slice(0, 7)])
    setIsLoading(false)
    setSelectedIndex(0)
  }, [onSearch])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      selectResult(results[selectedIndex])
    }
  }

  const selectResult = (result: SearchResult) => {
    // Save to recent searches
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('admin-recent-searches', JSON.stringify(updated))
    }
    
    router.push(result.href)
    setIsOpen(false)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('admin-recent-searches')
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
      >
        <Search size={16} className="text-gray-400 group-hover:text-white transition-colors" />
        <span className="text-sm text-gray-400 group-hover:text-gray-300 hidden sm:block">
          Gyors keresés...
        </span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-gray-500">
          <Command size={10} />K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full max-w-xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Search input */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                  <Search size={20} className="text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Keresés termékek, rendelések, felhasználók között..."
                    className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-sm"
                  />
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto">
                  {/* Recent searches */}
                  {!query && recentSearches.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          Legutóbbi keresések
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-gray-400"
                        >
                          Törlés
                        </button>
                      </div>
                      {recentSearches.map((search, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(search)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                        >
                          <Clock size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-300">{search}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick navigation when no query */}
                  {!query && recentSearches.length === 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1">
                        <span className="text-xs text-gray-500">Gyors navigáció</span>
                      </div>
                      {adminPages.slice(0, 6).map((page, i) => {
                        const config = typeConfig[page.type]
                        const Icon = config.icon
                        
                        return (
                          <Link
                            key={page.id}
                            href={page.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                              i === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                            )}
                          >
                            <div className="p-1.5 bg-white/5 rounded-lg">
                              <Icon size={14} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white">{page.title}</p>
                              {page.subtitle && (
                                <p className="text-xs text-gray-500">{page.subtitle}</p>
                              )}
                            </div>
                            <ArrowRight size={14} className="text-gray-500" />
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* Search results */}
                  {query && results.length > 0 && (
                    <div className="p-2">
                      {results.map((result, i) => {
                        const config = typeConfig[result.type]
                        const Icon = config.icon
                        
                        return (
                          <button
                            key={result.id}
                            onClick={() => selectResult(result)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                              i === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                            )}
                          >
                            {result.image ? (
                              <img 
                                src={result.image} 
                                alt="" 
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="p-1.5 bg-white/5 rounded-lg">
                                <Icon size={14} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{result.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-purple-400">{config.label}</span>
                                {result.subtitle && (
                                  <span className="text-xs text-gray-500 truncate">{result.subtitle}</span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-gray-500 flex-shrink-0" />
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* No results */}
                  {query && results.length === 0 && !isLoading && (
                    <div className="p-8 text-center">
                      <Search size={32} className="mx-auto mb-2 text-gray-600" />
                      <p className="text-gray-400 text-sm">Nincs találat: &quot;{query}&quot;</p>
                      <p className="text-gray-600 text-xs mt-1">
                        Próbálj más kulcsszavakat
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center gap-4 px-4 py-3 border-t border-white/10 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑↓</kbd>
                    Navigáció
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Enter</kbd>
                    Kiválasztás
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Esc</kbd>
                    Bezárás
                  </span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Smaller inline search for specific contexts
export function InlineSearch({
  placeholder = 'Keresés...',
  onSearch,
  className
}: {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}) {
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className={cn('relative', className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      />
    </div>
  )
}
