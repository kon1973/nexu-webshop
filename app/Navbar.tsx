'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, memo } from 'react'
import { Heart, ShoppingCart, User, LogOut, Search, ChevronDown, LayoutDashboard, Package, ArrowLeftRight, Menu, X, Home, Grid3X3 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useCompare } from '@/context/CompareContext'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '@/lib/image'
import dynamic from 'next/dynamic'

// Lazy load SearchModal - only needed when user opens search
const SearchModal = dynamic(() => import('./components/SearchModal'), {
  loading: () => null,
  ssr: false,
})

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
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

  const { itemCount, openCart } = useCart()
  const { favorites } = useFavorites()
  const { compareList } = useCompare()
  const { data: session } = useSession()

  // Keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const favoriteCount = favorites.length
  const compareCount = compareList.length

  return (
    <>
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
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

            {/* Desktop Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-full pl-4 pr-3 py-1.5 text-sm text-gray-400 hover:text-white hover:border-purple-500/50 transition-all w-64 group"
            >
              <span className="flex-1 text-left">Keresés...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-white/5 rounded border border-white/10 group-hover:text-gray-400">
                <span className="text-[10px]">⌘</span>K
              </kbd>
              <Search size={16} className="lg:hidden" />
            </button>

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
    </>
  )
}
