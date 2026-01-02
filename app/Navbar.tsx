'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Heart, ShoppingCart, User, LogOut, Search, ChevronDown, LayoutDashboard, Package, ArrowLeftRight, Menu, X, Home, Grid3X3 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useCompare } from '@/context/CompareContext'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategories } from '@/lib/cache'
import { getImageUrl } from '@/lib/image'

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

type SearchSuggestion = {
  id: number
  name: string
  category: string
  image: string
  price: number
}

type Category = {
  id: string
  name: string
  slug: string
  icon?: string | null
  color?: string | null
  description?: string | null
}

export default function Navbar({ categories = [] }: { categories?: Category[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  const { itemCount, openCart } = useCart()
  const { favorites } = useFavorites()
  const { compareList } = useCompare()
  const { data: session } = useSession()

  const favoriteCount = favorites.length
  const compareCount = compareList.length

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setActiveIndex(-1)
  }, [suggestions])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Failed to fetch suggestions', error)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      if (activeIndex > -1) {
        e.preventDefault()
        const product = suggestions[activeIndex]
        router.push(`/shop/${product.id}`)
        setShowSuggestions(false)
        setSearchQuery('')
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className="bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10"
        aria-label="Fő navigáció"
      >
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
          >
            NEXU
          </Link>

          {/* Mobile: Right side icons */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Keresés"
            >
              <Search size={20} />
            </button>
            
            <Link
              href="/favorites"
              className={`relative p-2.5 rounded-full transition-colors ${
                isActivePath(pathname, '/favorites')
                  ? 'text-red-400 bg-red-500/10'
                  : 'text-gray-300 hover:text-red-400'
              }`}
            >
              <Heart size={20} />
              {favoriteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {favoriteCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative p-2.5 rounded-full text-gray-300 hover:text-white transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                isActivePath(pathname, '/') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Kezdőlap
            </Link>
            <Link
              href="/shop"
              className={`text-sm font-medium transition ${
                isActivePath(pathname, '/shop') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Termékek
            </Link>

            <div className="hidden md:flex items-center relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative" role="search">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Keresés..."
                  className="bg-[#1a1a1a] border border-white/10 rounded-full pl-4 pr-10 py-1.5 text-sm text-white w-64 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  aria-controls="search-suggestions"
                  aria-activedescendant={activeIndex > -1 ? `suggestion-${activeIndex}` : undefined}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  aria-label="Keresés indítása"
                >
                  <Search size={16} />
                </button>
              </form>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    id="search-suggestions"
                    role="listbox"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    {suggestions.map((product, index) => (
                      <Link
                        key={product.id}
                        id={`suggestion-${index}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        href={`/shop/${product.id}`}
                        onClick={() => {
                          setShowSuggestions(false)
                          setSearchQuery('')
                        }}
                        className={`flex items-center gap-3 p-3 transition-colors border-b border-white/5 last:border-0 ${
                          index === activeIndex ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-lg relative overflow-hidden">
                          {getImageUrl(product.image) ? (
                            <Image src={getImageUrl(product.image)!} alt={product.name} fill className="object-cover" sizes="40px" />
                          ) : product.image === '\u{1f4e6}' ? (
                            product.image
                          ) : (
                            <Package size={20} className="text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category}</p>
                        </div>
                        <div className="text-sm font-bold text-purple-400">
                          {product.price.toLocaleString('hu-HU')} Ft
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={(e) => handleSearch(e as any)}
                      className="w-full p-2 text-xs text-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Összes találat megtekintése
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/compare"
              className={`relative p-2 rounded-full transition-colors ${
                isActivePath(pathname, '/compare')
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-300 hover:text-purple-400 hover:bg-white/10'
              }`}
              title={'Összehasonlítás'}
              aria-label={'Összehasonlítás'}
            >
              <ArrowLeftRight size={20} />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>

            <Link
              href="/favorites"
              className={`relative p-2 rounded-full transition-colors ${
                isActivePath(pathname, '/favorites')
                  ? 'text-red-400 bg-red-500/10'
                  : 'text-gray-300 hover:text-red-400 hover:bg-white/10'
              }`}
              title={'Kedvencek'}
              aria-label={'Kedvencek'}
            >
              <Heart size={20} />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {favoriteCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <User size={20} />
                  <span className="text-sm font-medium hidden sm:block">{session.user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsProfileOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="text-sm font-bold text-white">{session.user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                        </div>
                        <div className="p-2">
                          {session.user?.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <LayoutDashboard size={16} /> Admin vezérlőpult
                            </Link>
                          )}
                          <Link
                            href="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <User size={16} /> Profilom
                          </Link>
                          <Link
                            href="/profile?tab=orders" 
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Package size={16} /> Rendeléseim
                          </Link>
                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              signOut()
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <LogOut size={16} /> Kijelentkezés
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className={`p-2 rounded-full transition-colors ${
                  isActivePath(pathname, '/login')
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                title="Bejelentkezés"
                aria-label="Bejelentkezés"
              >
                <User size={20} />
              </Link>
            )}

            <button
              type="button"
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors group"
              title={'Kos\u00E1r megnyit\u00E1sa'}
              aria-label={'Kos\u00E1r megnyit\u00E1sa'}
            >
              <ShoppingCart className="text-white group-hover:text-purple-400 transition-colors" size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a0a0a] z-[100] flex flex-col md:hidden"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="flex-1 flex items-center bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-3">
                  <Search size={20} className="text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Keresés termékek között..."
                    className="bg-transparent border-none outline-none text-base text-white w-full placeholder-gray-500"
                    autoFocus
                  />
                </form>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                    setSuggestions([])
                  }}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Mobile Search Suggestions */}
            <div className="flex-1 overflow-y-auto p-4">
              {suggestions.length > 0 ? (
                <>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Találatok</p>
                  <div className="space-y-2">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        onClick={() => {
                          setIsSearchOpen(false)
                          setSearchQuery('')
                          setSuggestions([])
                        }}
                        className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-xl border border-white/5 active:bg-white/10"
                      >
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0">
                          {getImageUrl(product.image) ? (
                            <Image src={getImageUrl(product.image)!} alt={product.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <Package size={24} className="text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category}</p>
                        </div>
                        <div className="text-sm font-bold text-purple-400">
                          {product.price.toLocaleString('hu-HU')} Ft
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-12 text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Nincs találat</p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Kezdj el gépelni a kereséshez</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] md:hidden"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0a0a0a] border-l border-white/10 flex flex-col"
            >
              {/* Menu Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-lg font-bold text-white">Menü</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Info (if logged in) */}
              {session && (
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                      isActivePath(pathname, '/') 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Home size={22} />
                    <span className="font-medium">Kezdőlap</span>
                  </Link>

                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                      isActivePath(pathname, '/shop') 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Grid3X3 size={22} />
                    <span className="font-medium">Termékek</span>
                  </Link>

                  <Link
                    href="/compare"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                      isActivePath(pathname, '/compare') 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <ArrowLeftRight size={22} />
                    <span className="font-medium">Összehasonlítás</span>
                    {compareCount > 0 && (
                      <span className="ml-auto bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        {compareCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                      isActivePath(pathname, '/favorites') 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Heart size={22} />
                    <span className="font-medium">Kedvencek</span>
                    {favoriteCount > 0 && (
                      <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        {favoriteCount}
                      </span>
                    )}
                  </Link>

                  <hr className="my-3 border-white/10" />

                  {session ? (
                    <>
                      {session.user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                            isActivePath(pathname, '/admin') 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <LayoutDashboard size={22} />
                          <span className="font-medium">Admin vezérlőpult</span>
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                          isActivePath(pathname, '/profile') 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <User size={22} />
                        <span className="font-medium">Profilom</span>
                      </Link>

                      <Link
                        href="/profile?tab=orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Package size={22} />
                        <span className="font-medium">Rendeléseim</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          signOut()
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={22} />
                        <span className="font-medium">Kijelentkezés</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <User size={22} />
                        <span className="font-medium">Bejelentkezés</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 mx-4 mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-purple-500/30"
                      >
                        Regisztráció
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Cart Button at Bottom */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    openCart()
                  }}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
                >
                  <ShoppingCart size={20} />
                  <span>Kosár megtekintése</span>
                  {itemCount > 0 && (
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
