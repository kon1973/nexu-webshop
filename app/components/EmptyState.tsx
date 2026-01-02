'use client'

import { LucideIcon, Package, Search, Heart, ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  variant?: 'default' | 'cart' | 'favorites' | 'search' | 'orders'
}

const variants = {
  default: {
    icon: Package,
    gradient: 'from-gray-500/20 to-gray-600/20',
    iconColor: 'text-gray-400',
  },
  cart: {
    icon: ShoppingCart,
    gradient: 'from-purple-500/20 to-blue-500/20',
    iconColor: 'text-purple-400',
  },
  favorites: {
    icon: Heart,
    gradient: 'from-red-500/20 to-pink-500/20',
    iconColor: 'text-red-400',
  },
  search: {
    icon: Search,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  orders: {
    icon: Package,
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-400',
  },
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const config = variants[variant]
  const Icon = icon || config.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {/* Icon container with glow */}
      <div className="relative mb-8">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-full blur-2xl opacity-50`} />
        <div className={`relative w-24 h-24 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center ${config.iconColor}`}>
          <Icon size={40} strokeWidth={1.5} />
        </div>
        
        {/* Decorative rings */}
        <div className="absolute inset-0 w-24 h-24 border border-white/5 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 max-w-md mb-8 leading-relaxed">{description}</p>

      {/* Action button */}
      {(actionLabel && actionHref) && (
        <Link
          href={actionHref}
          className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          {actionLabel}
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {(actionLabel && onAction && !actionHref) && (
        <button
          onClick={onAction}
          className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          {actionLabel}
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  )
}

// Pre-configured empty states for common use cases
export function EmptyCart({ onContinue }: { onContinue?: () => void }) {
  return (
    <EmptyState
      variant="cart"
      title="A kosarad üres"
      description="Még nem adtál hozzá terméket a kosaradhoz. Fedezd fel kínálatunkat és találd meg a tökéletes terméket!"
      actionLabel="Vásárlás folytatása"
      actionHref={onContinue ? undefined : "/shop"}
      onAction={onContinue}
    />
  )
}

export function EmptyFavorites() {
  return (
    <EmptyState
      variant="favorites"
      title="Nincsenek kedvenceid"
      description="Jelöld meg kedvencként a termékeket, hogy később könnyen megtaláld őket!"
      actionLabel="Termékek böngészése"
      actionHref="/shop"
    />
  )
}

export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      variant="search"
      title="Nincs találat"
      description={query 
        ? `Sajnos nem találtunk "${query}" kifejezésre illeszkedő terméket. Próbálj más kulcsszavakat!`
        : 'Sajnos nem találtunk a keresési feltételeknek megfelelő terméket.'
      }
      actionLabel="Szűrők törlése"
      actionHref="/shop"
    />
  )
}

export function EmptyOrders() {
  return (
    <EmptyState
      variant="orders"
      title="Még nincsenek rendeléseid"
      description="Úgy tűnik, még nem adtál le rendelést. Böngészd termékeinket és találd meg, amire szükséged van!"
      actionLabel="Vásárlás megkezdése"
      actionHref="/shop"
    />
  )
}
