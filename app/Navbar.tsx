'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Heart, Menu, ShoppingCart, User, X, LogOut, Search, ChevronDown, LayoutDashboard, Package, ArrowLeftRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useCompare } from '@/context/CompareContext'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'

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

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const { itemCount, openCart } = useCart()
  const { favorites } = useFavorites()
  const { compareList } = useCompare()
  const { data: session } = useSession()

  const closeMenu = () => setIsOpen(false)
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className="bg-[#0a0a0a]/80 backdrop-blur-md border-b border-purple-500/20"
        aria-label="Fő navigáció"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
            onClick={closeMenu}
          >
            NEXU
          </Link>

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
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Keresés..."
                  className="bg-[#1a1a1a] border border-white/10 rounded-full pl-4 pr-10 py-1.5 text-sm text-white w-64 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <Search size={16} />
                </button>
              </form>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        onClick={() => {
                          setShowSuggestions(false)
                          setSearchQuery('')
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-lg relative overflow-hidden">
                          {product.image.startsWith('http') || product.image.startsWith('/') ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            product.image
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

            <div className="md:hidden">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-1 absolute top-4 left-4 right-16 z-50">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Keresés..."
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Keresés"
                >
                  <Search size={20} />
                </button>
              )}
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

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={isOpen ? 'Men\u00FC bez\u00E1r\u00E1sa' : 'Men\u00FC megnyit\u00E1sa'}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              aria-label={'Háttér'}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden -z-10"
            />

            <motion.div
              id="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden absolute left-0 right-0 top-full bg-[#0a0a0a] border-t border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6 flex flex-col gap-5">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className={`text-base font-semibold ${
                    isActivePath(pathname, '/') ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {'Kezdőlap'}
                </Link>

                <Link
                  href="/shop"
                  onClick={closeMenu}
                  className={`text-base font-semibold ${
                    isActivePath(pathname, '/shop') ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {'Termékek'}
                </Link>

                <Link
                  href="/favorites"
                  onClick={closeMenu}
                  className={`flex items-center justify-between gap-3 text-base font-semibold ${
                    isActivePath(pathname, '/favorites') ? 'text-red-400' : 'text-gray-300 hover:text-red-400'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Heart size={20} /> {'Kedvencek'}
                  </span>
                  <span className="text-sm text-gray-400">{favoriteCount}</span>
                </Link>

                {session ? (
                  <>
                    {session.user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={closeMenu}
                        className={`flex items-center gap-3 text-base font-semibold ${
                          isActivePath(pathname, '/admin') ? 'text-white' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <User size={20} /> Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        closeMenu()
                        signOut()
                      }}
                      className="flex items-center gap-3 text-base font-semibold text-gray-300 hover:text-white"
                    >
                      <LogOut size={20} /> Kijelentkezés
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className={`flex items-center gap-3 text-base font-semibold ${
                      isActivePath(pathname, '/login') ? 'text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <User size={20} /> Bejelentkezés
                  </Link>
                )}

                <hr className="border-white/10" />

                <button
                  type="button"
                  onClick={() => {
                    closeMenu()
                    openCart()
                  }}
                  className="flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors"
                >
                  <span className="flex items-center gap-3 text-purple-300 font-bold">
                    <ShoppingCart size={20} /> {'Kosár'}
                  </span>
                  <span className="text-sm text-gray-300">{itemCount} db</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

