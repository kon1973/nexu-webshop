'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Activity, 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign,
  Eye,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ElementType
  color: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'orange'
  loading?: boolean
  onClick?: () => void
  trend?: 'up' | 'down' | 'neutral'
}

const colorClasses = {
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20 hover:border-green-500/50',
    text: 'text-green-400',
    icon: 'bg-green-500/20 text-green-400'
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20 hover:border-blue-500/50',
    text: 'text-blue-400',
    icon: 'bg-blue-500/20 text-blue-400'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20 hover:border-purple-500/50',
    text: 'text-purple-400',
    icon: 'bg-purple-500/20 text-purple-400'
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20 hover:border-yellow-500/50',
    text: 'text-yellow-400',
    icon: 'bg-yellow-500/20 text-yellow-400'
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20 hover:border-red-500/50',
    text: 'text-red-400',
    icon: 'bg-red-500/20 text-red-400'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20 hover:border-orange-500/50',
    text: 'text-orange-400',
    icon: 'bg-orange-500/20 text-orange-400'
  }
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  loading = false,
  onClick,
  trend
}: StatCardProps) {
  const colors = colorClasses[color]
  const isPositive = trend === 'up' || (change && change > 0)
  const isNegative = trend === 'down' || (change && change < 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-[#121212] p-6 rounded-2xl border transition-all duration-300 cursor-pointer group',
        colors.border,
        onClick && 'hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-xl', colors.icon)}>
          <Icon size={24} />
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg',
            isPositive ? 'bg-green-500/10 text-green-400' : '',
            isNegative ? 'bg-red-500/10 text-red-400' : '',
            !isPositive && !isNegative ? 'bg-gray-500/10 text-gray-400' : ''
          )}>
            {isPositive && <TrendingUp size={14} />}
            {isNegative && <TrendingDown size={14} />}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">{title}</h3>
        {loading ? (
          <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
        ) : (
          <p className={cn('text-3xl font-bold', colors.text)}>{value}</p>
        )}
        {changeLabel && (
          <p className="text-xs text-gray-500 mt-1">{changeLabel}</p>
        )}
      </div>

      {/* Hover indicator */}
      {onClick && (
        <div className="flex items-center gap-1 mt-4 text-xs text-gray-500 group-hover:text-white transition-colors">
          <Eye size={12} />
          <span>Kattints a részletekért</span>
        </div>
      )}
    </motion.div>
  )
}

// Real-time dashboard header with auto-refresh
interface DashboardHeaderProps {
  lastUpdated: Date
  onRefresh: () => void
  isRefreshing: boolean
  autoRefresh?: boolean
  onAutoRefreshToggle?: () => void
}

export function DashboardHeader({
  lastUpdated,
  onRefresh,
  isRefreshing,
  autoRefresh = false,
  onAutoRefreshToggle
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2 text-gray-500">
        <Clock size={14} />
        <span>Frissítve: {lastUpdated.toLocaleTimeString('hu-HU')}</span>
      </div>
      
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors',
          isRefreshing && 'opacity-50 cursor-not-allowed'
        )}
      >
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        <span>Frissítés</span>
      </button>

      {onAutoRefreshToggle && (
        <button
          onClick={onAutoRefreshToggle}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
            autoRefresh 
              ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          )}
        >
          <Activity size={14} />
          <span>Auto ({autoRefresh ? 'BE' : 'KI'})</span>
        </button>
      )}
    </div>
  )
}

// Quick action card
interface QuickActionProps {
  icon: React.ElementType
  title: string
  description?: string
  href?: string
  onClick?: () => void
  badge?: number
  color: 'purple' | 'blue' | 'green' | 'yellow' | 'orange'
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  onClick,
  badge,
  color
}: QuickActionProps) {
  const Component = href ? 'a' : 'button'
  const colors = colorClasses[color]

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'block p-4 bg-[#121212] border rounded-xl transition-all hover:scale-[1.02] group text-left w-full',
        colors.border
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', colors.icon)}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors truncate">
              {title}
            </h4>
            {badge !== undefined && badge > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>}
        </div>
      </div>
    </Component>
  )
}

// Alert banner for important notifications
interface AlertBannerProps {
  variant?: 'warning' | 'error' | 'info' | 'success'
  type?: 'warning' | 'error' | 'info' | 'success' // alias for variant
  title: string
  message: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  onDismiss?: () => void
  dismissible?: boolean
  className?: string
}

export function AlertBanner({
  variant,
  type,
  title,
  message,
  action,
  onDismiss,
  dismissible,
  className
}: AlertBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const activeVariant = variant || type || 'info'
  
  const styles = {
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    success: 'bg-green-500/10 border-green-500/20 text-green-400'
  }

  const icons = {
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Activity,
    success: Package
  }

  const Icon = icons[activeVariant]

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn('p-4 rounded-xl border flex items-start gap-3', styles[activeVariant], className)}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm opacity-80 mt-0.5">{message}</p>
        {action && (
          action.href ? (
            <a
              href={action.href}
              className="mt-2 inline-block text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </a>
          ) : action.onClick ? (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          ) : null
        )}
      </div>
      {(onDismiss || dismissible) && (
        <button
          onClick={handleDismiss}
          className="text-white/50 hover:text-white transition-colors"
        >
          ×
        </button>
      )}
    </motion.div>
  )
}

// Mini sparkline chart for stat cards
interface SparklineProps {
  data: number[]
  color?: string
  className?: string
}

export function Sparkline({ data, color = 'rgb(168, 85, 247)', className }: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className={cn('w-full h-8', className)} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill="url(#sparklineGradient)"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
