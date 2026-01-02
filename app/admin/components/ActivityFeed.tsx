'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  ShoppingCart, 
  User, 
  Package, 
  Star, 
  CreditCard,
  Truck,
  TicketPercent,
  Eye,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type ActivityType = 
  | 'order_created' 
  | 'order_paid' 
  | 'order_shipped' 
  | 'order_completed'
  | 'order_cancelled'
  | 'user_registered'
  | 'review_created'
  | 'product_low_stock'
  | 'coupon_used'
  | 'product_viewed'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: Date | string
  metadata?: {
    orderId?: string
    userId?: string
    productId?: number
    amount?: number
    userName?: string
    productName?: string
    rating?: number
  }
}

const activityConfig: Record<ActivityType, { icon: React.ElementType; color: string }> = {
  order_created: { icon: ShoppingCart, color: 'text-blue-400 bg-blue-500/20' },
  order_paid: { icon: CreditCard, color: 'text-green-400 bg-green-500/20' },
  order_shipped: { icon: Truck, color: 'text-purple-400 bg-purple-500/20' },
  order_completed: { icon: Package, color: 'text-emerald-400 bg-emerald-500/20' },
  order_cancelled: { icon: ShoppingCart, color: 'text-red-400 bg-red-500/20' },
  user_registered: { icon: User, color: 'text-blue-400 bg-blue-500/20' },
  review_created: { icon: Star, color: 'text-yellow-400 bg-yellow-500/20' },
  product_low_stock: { icon: Package, color: 'text-red-400 bg-red-500/20' },
  coupon_used: { icon: TicketPercent, color: 'text-orange-400 bg-orange-500/20' },
  product_viewed: { icon: Eye, color: 'text-gray-400 bg-gray-500/20' }
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  maxItems?: number
  showFilter?: boolean
  title?: string
  emptyMessage?: string
  loading?: boolean
}

export default function ActivityFeed({
  activities,
  maxItems = 10,
  showFilter = true,
  title = 'Legutóbbi tevékenységek',
  emptyMessage = 'Még nincs tevékenység',
  loading = false
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'orders' | 'users' | 'products'>('all')
  const [isLive, setIsLive] = useState(false)

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    if (filter === 'orders') return activity.type.startsWith('order_')
    if (filter === 'users') return activity.type === 'user_registered' || activity.type === 'review_created'
    if (filter === 'products') return activity.type.includes('product')
    return true
  }).slice(0, maxItems)

  const formatRelativeTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Most'
    if (minutes < 60) return `${minutes} perce`
    if (hours < 24) return `${hours} órája`
    if (days < 7) return `${days} napja`
    return date.toLocaleDateString('hu-HU')
  }

  const getActivityLink = (activity: ActivityItem): string | undefined => {
    if (activity.metadata?.orderId) {
      return `/admin/orders/${activity.metadata.orderId}`
    }
    if (activity.metadata?.userId) {
      return `/admin/users/${activity.metadata.userId}`
    }
    if (activity.metadata?.productId) {
      return `/admin/products?search=${activity.metadata.productId}`
    }
    return undefined
  }

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-purple-400" />
            <h3 className="font-bold text-white">{title}</h3>
            {isLive && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Élő
              </span>
            )}
          </div>
          
          {showFilter && (
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
              {[
                { id: 'all', label: 'Mind' },
                { id: 'orders', label: 'Rendelések' },
                { id: 'users', label: 'Felh.' },
                { id: 'products', label: 'Termékek' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as typeof filter)}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-colors',
                    filter === tab.id 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : filteredActivities.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredActivities.map((activity, index) => {
              const config = activityConfig[activity.type]
              const Icon = config.icon
              const link = getActivityLink(activity)
              
              const content = (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'p-4 flex items-start gap-3 hover:bg-white/5 transition-colors group',
                    link && 'cursor-pointer'
                  )}
                >
                  <div className={cn('p-2 rounded-lg flex-shrink-0', config.color)}>
                    <Icon size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Clock size={10} />
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                      {activity.metadata?.amount && (
                        <span className="text-[10px] text-purple-400 font-medium">
                          {activity.metadata.amount.toLocaleString('hu-HU')} Ft
                        </span>
                      )}
                      {activity.metadata?.rating && (
                        <span className="text-[10px] text-yellow-400 flex items-center gap-0.5">
                          {activity.metadata.rating} <Star size={8} className="fill-current" />
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {link && (
                    <ChevronRight 
                      size={16} 
                      className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    />
                  )}
                </motion.div>
              )

              return link ? (
                <Link key={activity.id} href={link}>
                  {content}
                </Link>
              ) : (
                content
              )
            })}
          </AnimatePresence>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Activity className="mx-auto mb-2 opacity-50" size={24} />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {activities.length > maxItems && (
        <div className="p-3 border-t border-white/5 bg-white/[0.02]">
          <Link
            href="/admin/activity"
            className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Összes tevékenység megtekintése
            <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}

// Export helper to create activity items from database events
export function createActivityItem(
  type: ActivityType,
  title: string,
  options?: {
    description?: string
    orderId?: string
    userId?: string
    productId?: number
    amount?: number
    userName?: string
    productName?: string
    rating?: number
    timestamp?: Date
  }
): ActivityItem {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    title,
    description: options?.description,
    timestamp: options?.timestamp || new Date(),
    metadata: {
      orderId: options?.orderId,
      userId: options?.userId,
      productId: options?.productId,
      amount: options?.amount,
      userName: options?.userName,
      productName: options?.productName,
      rating: options?.rating
    }
  }
}
