'use client'

import { Package, AlertTriangle, CheckCircle, Clock, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockIndicatorProps {
  stock: number
  lowStockThreshold?: number
  showExact?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badge' | 'inline' | 'detailed'
  className?: string
}

export default function StockIndicator({
  stock,
  lowStockThreshold = 5,
  showExact = false,
  size = 'md',
  variant = 'inline',
  className
}: StockIndicatorProps) {
  const isOutOfStock = stock <= 0
  const isLowStock = stock > 0 && stock <= lowStockThreshold
  const isInStock = stock > lowStockThreshold

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }

  if (variant === 'badge') {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full font-medium',
          sizeClasses[size],
          isOutOfStock && 'bg-red-500/10 text-red-400 border border-red-500/20',
          isLowStock && 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          isInStock && 'bg-green-500/10 text-green-400 border border-green-500/20',
          className
        )}
      >
        {isOutOfStock ? (
          <>
            <AlertTriangle size={iconSizes[size]} />
            <span>Elfogyott</span>
          </>
        ) : isLowStock ? (
          <>
            <Flame size={iconSizes[size]} className="animate-pulse" />
            <span>Csak {stock} db maradt!</span>
          </>
        ) : (
          <>
            <CheckCircle size={iconSizes[size]} />
            <span>{showExact ? `${stock} db` : 'Készleten'}</span>
          </>
        )}
      </span>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className={cn(
          'flex items-center',
          sizeClasses[size],
          isOutOfStock && 'text-red-400',
          isLowStock && 'text-amber-400',
          isInStock && 'text-green-400'
        )}>
          {isOutOfStock ? (
            <AlertTriangle size={iconSizes[size]} />
          ) : isLowStock ? (
            <Clock size={iconSizes[size]} />
          ) : (
            <Package size={iconSizes[size]} />
          )}
          <span className="ml-1.5 font-medium">
            {isOutOfStock ? 'Jelenleg nem elérhető' : isLowStock ? `Már csak ${stock} db!` : 'Készleten'}
          </span>
        </div>
        
        {/* Stock progress bar */}
        {!isOutOfStock && (
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isLowStock ? 'bg-gradient-to-r from-red-500 to-amber-500' : 'bg-gradient-to-r from-green-500 to-emerald-400'
              )}
              style={{ 
                width: `${Math.min(100, (stock / (lowStockThreshold * 4)) * 100)}%` 
              }}
            />
          </div>
        )}
        
        {isLowStock && (
          <p className="text-xs text-amber-400/80 animate-pulse">
            ⚡ Gyorsan fogy - Rendelj most!
          </p>
        )}
      </div>
    )
  }

  // Default inline variant
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        sizeClasses[size],
        isOutOfStock && 'text-red-400',
        isLowStock && 'text-amber-400',
        isInStock && 'text-green-400',
        className
      )}
    >
      {isOutOfStock ? (
        <>
          <AlertTriangle size={iconSizes[size]} />
          <span>Elfogyott</span>
        </>
      ) : isLowStock ? (
        <>
          <Flame size={iconSizes[size]} className="animate-pulse" />
          <span>Csak {stock} db!</span>
        </>
      ) : (
        <>
          <CheckCircle size={iconSizes[size]} />
          <span>{showExact ? `${stock} db készleten` : 'Készleten'}</span>
        </>
      )}
    </span>
  )
}

// Compact stock badge for cards
export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  if (stock > 5) return null

  return (
    <div
      className={cn(
        'absolute bottom-2 left-2 z-10 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg',
        stock <= 0 
          ? 'bg-red-500/90 text-white border border-red-400/50' 
          : 'bg-amber-500/90 text-black border border-amber-400/50',
        className
      )}
    >
      {stock <= 0 ? (
        'Elfogyott'
      ) : (
        <span className="flex items-center gap-1">
          <Flame size={10} className="animate-pulse" />
          Már csak {stock} db!
        </span>
      )}
    </div>
  )
}
