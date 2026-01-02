'use client'

import { Truck, Package, Clock, Calendar, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeliveryEstimateProps {
  inStock: boolean
  stock?: number
  className?: string
  variant?: 'compact' | 'detailed' | 'inline'
}

function getDeliveryDate(daysToAdd: number): Date {
  const date = new Date()
  let addedDays = 0
  
  while (addedDays < daysToAdd) {
    date.setDate(date.getDate() + 1)
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      addedDays++
    }
  }
  
  return date
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('hu-HU', options)
}

function formatShortDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('hu-HU', options)
}

export default function DeliveryEstimate({
  inStock,
  stock = 0,
  className,
  variant = 'detailed'
}: DeliveryEstimateProps) {
  const now = new Date()
  const currentHour = now.getHours()
  
  // If ordered before 14:00 on a workday, ship same day
  const isWorkday = now.getDay() !== 0 && now.getDay() !== 6
  const canShipToday = isWorkday && currentHour < 14
  
  // Calculate estimated delivery
  const minDays = canShipToday ? 1 : 2
  const maxDays = canShipToday ? 2 : 3
  
  const minDate = getDeliveryDate(minDays)
  const maxDate = getDeliveryDate(maxDays)

  if (variant === 'inline') {
    if (!inStock) {
      return (
        <span className={cn('text-sm text-red-400 flex items-center gap-1', className)}>
          <AlertCircle size={14} />
          Nem elérhető
        </span>
      )
    }
    
    return (
      <span className={cn('text-sm text-green-400 flex items-center gap-1', className)}>
        <Truck size={14} />
        Kiszállítás: {formatShortDate(minDate)} - {formatShortDate(maxDate)}
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'bg-[#121212] border border-white/5 rounded-xl p-3',
        className
      )}>
        {inStock ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Truck size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {formatShortDate(minDate)} - {formatShortDate(maxDate)}
              </p>
              <p className="text-xs text-gray-500">
                {canShipToday ? 'Ma még feladjuk!' : 'Várható kiszállítás'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-400">Nincs készleten</p>
              <p className="text-xs text-gray-500">Értesítünk ha elérhető</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Detailed variant
  return (
    <div className={cn(
      'bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/5 rounded-2xl p-4 md:p-5',
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Truck size={18} className="text-purple-400" />
        <h3 className="font-medium text-white">Szállítási információ</h3>
      </div>

      {inStock ? (
        <>
          {/* Express delivery badge */}
          {canShipToday && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-green-400">
                <Zap size={16} className="animate-pulse" />
                <span className="text-sm font-medium">Expressz szállítás!</span>
              </div>
              <p className="text-xs text-green-400/70 mt-1">
                14:00-ig leadott rendelést még ma feladjuk
              </p>
            </div>
          )}

          {/* Delivery timeline */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Package size={14} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Csomagolás</p>
                <p className="text-xs text-gray-500">
                  {canShipToday ? 'Ma' : 'Holnap'}
                </p>
              </div>
            </div>

            <div className="ml-4 h-4 w-px bg-white/10" />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Truck size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Kiszállítás</p>
                <p className="text-xs text-gray-500">
                  {formatDate(minDate)} - {formatDate(maxDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping options */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
            <div className="p-2 bg-white/5 rounded-lg text-center">
              <p className="text-lg font-bold text-white">2 990 Ft</p>
              <p className="text-[10px] text-gray-500">GLS futárszolgálat</p>
            </div>
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <p className="text-lg font-bold text-green-400">Ingyenes</p>
              <p className="text-[10px] text-gray-500">20 000 Ft felett</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="font-medium text-red-400 mb-1">Jelenleg nem elérhető</p>
          <p className="text-sm text-gray-500 mb-4">
            Ez a termék pillanatnyilag nincs raktáron
          </p>
          <button className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors">
            Értesítést kérek
          </button>
        </div>
      )}

      {/* Low stock warning */}
      {inStock && stock > 0 && stock <= 5 && (
        <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-400 flex items-center gap-1.5">
            <Clock size={12} className="animate-pulse" />
            Sietős! Már csak {stock} db elérhető
          </p>
        </div>
      )}
    </div>
  )
}

// Order tracking progress component
interface OrderProgressProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  estimatedDelivery?: Date | string
  trackingNumber?: string
  className?: string
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Függőben', icon: Clock },
  { key: 'processing', label: 'Feldolgozás alatt', icon: Package },
  { key: 'shipped', label: 'Feladva', icon: Truck },
  { key: 'delivered', label: 'Kézbesítve', icon: CheckCircle2 }
]

export function OrderProgress({
  status,
  estimatedDelivery,
  trackingNumber,
  className
}: OrderProgressProps) {
  const currentIndex = STATUS_STEPS.findIndex(s => s.key === status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className={cn('p-4 bg-red-500/10 border border-red-500/20 rounded-2xl', className)}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="text-red-400" size={24} />
          </div>
          <div>
            <p className="font-medium text-red-400">Rendelés törölve</p>
            <p className="text-sm text-gray-500">Ez a rendelés visszavonásra került</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('p-4 md:p-6 bg-[#121212] border border-white/5 rounded-2xl', className)}>
      {/* Progress steps */}
      <div className="relative mb-6">
        {/* Progress line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex
            const isCurrent = index === currentIndex
            const Icon = step.icon

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10',
                    isCompleted
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30'
                      : 'bg-[#1a1a1a] border border-white/10',
                    isCurrent && 'ring-4 ring-purple-500/30 animate-pulse'
                  )}
                >
                  <Icon
                    size={18}
                    className={isCompleted ? 'text-white' : 'text-gray-500'}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 font-medium text-center',
                    isCompleted ? 'text-white' : 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional info */}
      <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
        {estimatedDelivery && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-gray-500" />
            <span className="text-gray-400">Várható kézbesítés:</span>
            <span className="text-white font-medium">
              {typeof estimatedDelivery === 'string'
                ? estimatedDelivery
                : formatDate(estimatedDelivery)}
            </span>
          </div>
        )}
        
        {trackingNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Package size={14} className="text-gray-500" />
            <span className="text-gray-400">Követési szám:</span>
            <a
              href={`https://gls-group.com/HU/hu/csomagkovetes?match=${trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-mono underline"
            >
              {trackingNumber}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
