'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Info, X, ChevronRight, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

// ============================================================================
// AI Loading States
// ============================================================================

interface AILoadingProps {
  message?: string
  subMessage?: string
  variant?: 'default' | 'compact' | 'fullscreen'
}

export function AILoading({ message = 'AI elemzi...', subMessage, variant = 'default' }: AILoadingProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
        <div className="relative">
          <Loader2 size={20} className="animate-spin text-purple-400" />
          <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
        </div>
        <span className="text-purple-300 text-sm">{message}</span>
      </div>
    )
  }

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <AILoadingSpinner size="lg" />
          <p className="text-white font-medium mt-4">{message}</p>
          {subMessage && <p className="text-gray-400 text-sm mt-1">{subMessage}</p>}
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <AILoadingSpinner size="md" />
      <p className="text-white font-medium mt-4">{message}</p>
      {subMessage && <p className="text-gray-400 text-sm mt-2">{subMessage}</p>}
      <AILoadingDots className="mt-3" />
    </motion.div>
  )
}

interface AILoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function AILoadingSpinner({ size = 'md', color = 'purple' }: AILoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className={`absolute inset-0 rounded-full border-2 border-${color}-500/20`} />
      <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-${color}-500 animate-spin`} />
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
        <Sparkles className={`${size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} text-purple-400 animate-pulse`} />
      </div>
    </div>
  )
}

export function AILoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-purple-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// AI Skeleton Loaders
// ============================================================================

export function AISkeletonCard() {
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-white/10 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-6 bg-white/10 rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}

export function AISkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <AISkeletonCard key={i} />
      ))}
    </div>
  )
}

export function AISkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
          <div className="aspect-square bg-white/10 rounded-lg mb-3" />
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// AI Empty States
// ============================================================================

interface AIEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'minimal'
}

export function AIEmptyState({ 
  icon: Icon = Sparkles, 
  title, 
  description, 
  action,
  variant = 'default' 
}: AIEmptyStateProps) {
  if (variant === 'minimal') {
    return (
      <div className="text-center py-8">
        <Icon size={24} className="mx-auto text-gray-500 mb-2" />
        <p className="text-gray-400 text-sm">{title}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-6"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
        <Icon size={28} className="text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm max-w-sm mx-auto mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {action.label}
          <ChevronRight size={16} />
        </button>
      )}
    </motion.div>
  )
}

// ============================================================================
// AI Alerts & Notifications
// ============================================================================

interface AIAlertProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'ai'
  title?: string
  message: string
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export function AIAlert({ type, title, message, onClose, action }: AIAlertProps) {
  const styles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    ai: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400'
  }

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
    ai: Sparkles
  }

  const Icon = icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]}`}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-white mb-0.5">{title}</p>}
        <p className="text-sm opacity-90">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={18} />
        </button>
      )}
    </motion.div>
  )
}

// ============================================================================
// AI Progress Indicators
// ============================================================================

interface AIProgressProps {
  steps: string[]
  currentStep: number
  variant?: 'default' | 'compact' | 'vertical'
}

export function AIProgress({ steps, currentStep, variant = 'default' }: AIProgressProps) {
  if (variant === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              idx < currentStep ? 'bg-green-500 text-white' :
              idx === currentStep ? 'bg-purple-500 text-white ring-4 ring-purple-500/30' :
              'bg-white/10 text-gray-500'
            }`}>
              {idx < currentStep ? <CheckCircle2 size={16} /> : idx + 1}
            </div>
            <span className={`text-sm ${idx <= currentStep ? 'text-white' : 'text-gray-500'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              idx < currentStep ? 'bg-green-500' :
              idx === currentStep ? 'bg-purple-500' :
              'bg-white/10'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              idx < currentStep ? 'bg-green-500 text-white' :
              idx === currentStep ? 'bg-purple-500 text-white ring-4 ring-purple-500/30' :
              'bg-white/10 text-gray-500'
            }`}>
              {idx < currentStep ? <CheckCircle2 size={18} /> : idx + 1}
            </div>
            <span className={`text-xs mt-2 ${idx <= currentStep ? 'text-white' : 'text-gray-500'}`}>
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-12 md:w-20 h-0.5 mx-2 ${idx < currentStep ? 'bg-green-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// AI Chips & Tags
// ============================================================================

interface AIChipProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'ai'
  icon?: LucideIcon
  onRemove?: () => void
  onClick?: () => void
  selected?: boolean
}

export function AIChip({ 
  children, 
  variant = 'default', 
  icon: Icon, 
  onRemove, 
  onClick,
  selected 
}: AIChipProps) {
  const baseStyles = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
  
  const variantStyles = {
    default: selected ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/15',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    ai: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300'
  }

  return (
    <span 
      className={`${baseStyles} ${variantStyles[variant]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {Icon && <Icon size={14} />}
      {children}
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove() }} className="ml-1 opacity-60 hover:opacity-100">
          <X size={12} />
        </button>
      )}
    </span>
  )
}

// ============================================================================
// AI Score Badge
// ============================================================================

interface AIScoreBadgeProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AIScoreBadge({ score, label, size = 'md' }: AIScoreBadgeProps) {
  const getColor = (s: number) => {
    if (s >= 90) return 'from-green-500 to-emerald-500'
    if (s >= 70) return 'from-yellow-500 to-orange-500'
    if (s >= 50) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-red-600'
  }

  const sizeStyles = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl'
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeStyles[size]} rounded-full bg-gradient-to-br ${getColor(score)} flex items-center justify-center font-bold text-white shadow-lg`}>
        {score}
      </div>
      {label && <span className="text-xs text-gray-400">{label}</span>}
    </div>
  )
}

// ============================================================================
// AI Tooltip
// ============================================================================

interface AITooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function AITooltip({ content, children, position = 'top' }: AITooltipProps) {
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${positionStyles[position]} px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50`}>
        {content}
      </div>
    </div>
  )
}

// ============================================================================
// AI Card with hover effects
// ============================================================================

interface AICardProps {
  children: ReactNode
  variant?: 'default' | 'highlighted' | 'glass'
  hover?: boolean
  onClick?: () => void
  className?: string
}

export function AICard({ children, variant = 'default', hover = true, onClick, className = '' }: AICardProps) {
  const variantStyles = {
    default: 'bg-white/5 border-white/10',
    highlighted: 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30',
    glass: 'bg-white/5 backdrop-blur-sm border-white/10'
  }

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`rounded-xl border p-4 transition-all ${variantStyles[variant]} ${hover ? 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// AI Button
// ============================================================================

interface AIButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'ai'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function AIButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading,
  disabled,
  onClick,
  className = ''
}: AIButtonProps) {
  const variantStyles = {
    primary: 'bg-purple-500 hover:bg-purple-400 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-300',
    ai: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/25'
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {loading ? (
        <Loader2 size={size === 'lg' ? 20 : 16} className="animate-spin" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon size={size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'lg' ? 20 : 16} />}
    </motion.button>
  )
}

// ============================================================================
// AI Insight Box
// ============================================================================

interface AIInsightProps {
  icon?: LucideIcon
  title: string
  children: ReactNode
  variant?: 'default' | 'tip' | 'warning'
}

export function AIInsight({ icon: Icon = Sparkles, title, children, variant = 'default' }: AIInsightProps) {
  const variantStyles = {
    default: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
    tip: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30',
    warning: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
  }

  const iconColors = {
    default: 'text-purple-400',
    tip: 'text-blue-400',
    warning: 'text-yellow-400'
  }

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-r ${variantStyles[variant]} border`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white/10 ${iconColors[variant]}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white mb-1">{title}</h4>
          <div className="text-sm text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// AI Animated Counter
// ============================================================================

interface AICounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
}

export function AICounter({ value, suffix = '', prefix = '', duration = 1 }: AICounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={value}
      >
        {prefix}
        <motion.span
          initial={{ scale: 1.2, color: '#a855f7' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: duration * 0.5 }}
        >
          {value.toLocaleString('hu-HU')}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  )
}

// ============================================================================
// AI Confetti (for success states)
// ============================================================================

export function AIConfetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#a855f7', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6'][i % 5],
            left: `${Math.random() * 100}%`,
            top: -10
          }}
          animate={{
            y: window.innerHeight + 10,
            x: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 360,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}
