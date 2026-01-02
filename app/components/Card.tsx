'use client'

import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({
  children,
  className,
  hover = false,
  glow = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={cn(
        'group relative bg-[#121212] border border-white/5 rounded-2xl overflow-hidden',
        'transition-all duration-300',
        hover && 'hover:border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20',
        glow && 'hover:border-purple-500/30 hover:shadow-purple-500/10',
        paddings[padding],
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      {(hover || glow) && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

// Card header component
export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-4 pb-4 border-b border-white/5', className)}>
      {children}
    </div>
  )
}

// Card title component
export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={cn('text-lg font-bold text-white', className)}>
      {children}
    </h3>
  )
}

// Card description component
export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-sm text-gray-400 mt-1', className)}>
      {children}
    </p>
  )
}

// Card content component
export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('', className)}>{children}</div>
}

// Card footer component
export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-white/5 flex items-center gap-4', className)}>
      {children}
    </div>
  )
}

// Feature card - pre-styled card for features/benefits
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color?: 'blue' | 'purple' | 'pink' | 'green' | 'orange'
}

const colors = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    hover: 'hover:border-blue-500/30',
    shadow: 'shadow-blue-500/10',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    hover: 'hover:border-purple-500/30',
    shadow: 'shadow-purple-500/10',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    hover: 'hover:border-pink-500/30',
    shadow: 'shadow-pink-500/10',
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    hover: 'hover:border-green-500/30',
    shadow: 'shadow-green-500/10',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    hover: 'hover:border-orange-500/30',
    shadow: 'shadow-orange-500/10',
  },
}

export function FeatureCard({ icon, title, description, color = 'purple' }: FeatureCardProps) {
  const colorConfig = colors[color]
  
  return (
    <Card 
      hover 
      className={cn(
        'group', 
        colorConfig.hover, 
        `hover:shadow-lg ${colorConfig.shadow}`
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          'transition-all duration-300',
          colorConfig.bg,
          colorConfig.text,
          'group-hover:scale-110'
        )}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  )
}

// Stats card - for displaying metrics
interface StatsCardProps {
  label: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
}

export function StatsCard({ label, value, change, icon }: StatsCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {change && (
        <div className={cn(
          'text-sm font-medium',
          change.type === 'increase' ? 'text-green-400' : 'text-red-400'
        )}>
          {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
        </div>
      )}
    </Card>
  )
}
