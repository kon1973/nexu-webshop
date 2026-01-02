'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, ShoppingCart, User, Heart, Sparkles } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { itemCount, openCart } = useCart()
  const { favorites } = useFavorites()

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null

  const navItems = [
    { name: 'Főoldal', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: Grid },
    { name: 'Kedvencek', href: '/favorites', icon: Heart, count: favorites.length },
    { name: 'Fiók', href: '/profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 pb-safe md:hidden">
      {/* Gradient line on top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="flex justify-around items-center h-16 relative">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all duration-300 ${
                active ? 'text-white' : 'text-gray-500 active:text-gray-300'
              }`}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-purple-500 animate-scale-in" />
              )}
              
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                active ? 'bg-purple-500/20' : ''
              }`}>
                <item.icon 
                  size={22} 
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`transition-all duration-300 ${active ? 'text-purple-400' : ''}`}
                />
                {item.count ? (
                  <span className={`absolute -top-1 -right-1 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 transition-all duration-300 ${
                    active ? 'bg-purple-500 scale-110' : 'bg-gray-600'
                  }`}>
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium transition-all duration-300 ${
                active ? 'text-purple-400' : ''
              }`}>{item.name}</span>
            </Link>
          )
        })}
        
        {/* Cart button - centered highlight */}
        <button
          onClick={openCart}
          className="relative flex flex-col items-center justify-center w-full h-full space-y-0.5 text-gray-500 active:text-gray-300 transition-all duration-300"
        >
          <div className="relative p-1.5 rounded-xl group">
            <ShoppingCart 
              size={22} 
              strokeWidth={1.8}
              className="group-active:scale-95 transition-transform" 
            />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 animate-scale-in">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Kosár</span>
        </button>
      </div>
    </div>
  )
}
