'use client'

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
}

const variants = {
  default: 'bg-white/10 text-white border-white/10',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  outline: 'bg-transparent text-gray-400 border-white/20',
}

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border transition-all',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  )
}

// Specialized badges
export function NewBadge({ className }: { className?: string }) {
  return (
    <Badge variant="purple" size="sm" className={className}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500" />
      </span>
      Új
    </Badge>
  )
}

export function SaleBadge({ percentage, className }: { percentage?: number; className?: string }) {
  return (
    <Badge variant="error" size="sm" className={className}>
      {percentage ? `-${percentage}%` : 'Akció'}
    </Badge>
  )
}

export function FreeShippingBadge({ className }: { className?: string }) {
  return (
    <Badge variant="success" size="sm" className={className}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Ingyenes szállítás
    </Badge>
  )
}

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  if (stock <= 0) {
    return (
      <Badge variant="error" size="sm" className={className}>
        Elfogyott
      </Badge>
    )
  }
  if (stock <= 5) {
    return (
      <Badge variant="warning" size="sm" className={className}>
        Csak {stock} db
      </Badge>
    )
  }
  return (
    <Badge variant="success" size="sm" className={className}>
      Készleten
    </Badge>
  )
}

export function StatusBadge({ 
  status 
}: { 
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' 
}) {
  const statusConfig = {
    pending: { variant: 'warning' as const, label: 'Függőben' },
    processing: { variant: 'info' as const, label: 'Feldolgozás alatt' },
    shipped: { variant: 'purple' as const, label: 'Szállítás alatt' },
    delivered: { variant: 'success' as const, label: 'Kézbesítve' },
    cancelled: { variant: 'error' as const, label: 'Visszavonva' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge variant={config.variant}>
      <span className={cn(
        'w-2 h-2 rounded-full',
        config.variant === 'success' && 'bg-green-500',
        config.variant === 'warning' && 'bg-yellow-500',
        config.variant === 'info' && 'bg-blue-500',
        config.variant === 'purple' && 'bg-purple-500',
        config.variant === 'error' && 'bg-red-500',
      )} />
      {config.label}
    </Badge>
  )
}
