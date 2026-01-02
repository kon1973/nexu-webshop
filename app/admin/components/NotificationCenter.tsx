'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck,
  ShoppingCart, 
  AlertTriangle, 
  Star, 
  User,
  Package,
  ChevronRight,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type NotificationType = 'order' | 'stock' | 'review' | 'user' | 'system'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date | string
  read: boolean
  href?: string
  priority?: 'low' | 'medium' | 'high'
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  order: { icon: ShoppingCart, color: 'bg-blue-500/20 text-blue-400' },
  stock: { icon: Package, color: 'bg-red-500/20 text-red-400' },
  review: { icon: Star, color: 'bg-yellow-500/20 text-yellow-400' },
  user: { icon: User, color: 'bg-green-500/20 text-green-400' },
  system: { icon: AlertTriangle, color: 'bg-orange-500/20 text-orange-400' }
}

interface NotificationCenterProps {
  notifications?: Notification[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onDismiss?: (id: string) => void
}

export default function NotificationCenter({
  notifications: initialNotifications = [],
  onMarkRead,
  onMarkAllRead,
  onDismiss
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read)

  // Play notification sound
  const playSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch {}
  }, [soundEnabled])

  // Handle new notifications
  useEffect(() => {
    if (initialNotifications.length > notifications.length) {
      playSound()
    }
    setNotifications(initialNotifications)
  }, [initialNotifications, notifications.length, playSound])

  const handleMarkRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    onMarkRead?.(id)
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onMarkAllRead?.()
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    onDismiss?.(id)
  }

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Most'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} perce`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} órája`
    return date.toLocaleDateString('hu-HU')
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-white' : 'text-gray-400'} />
        
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white">Értesítések</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title={soundEnabled ? 'Hang kikapcsolása' : 'Hang bekapcsolása'}
                    >
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                      >
                        <CheckCheck size={14} />
                        Mind olvasott
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Filter tabs */}
                <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                  <button
                    onClick={() => setFilter('all')}
                    className={cn(
                      'flex-1 px-3 py-1.5 text-xs rounded-md transition-colors',
                      filter === 'all' 
                        ? 'bg-purple-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    Összes ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={cn(
                      'flex-1 px-3 py-1.5 text-xs rounded-md transition-colors',
                      filter === 'unread' 
                        ? 'bg-purple-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    Olvasatlan ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Notifications list */}
              <div className="max-h-[400px] overflow-y-auto">
                {filteredNotifications.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {filteredNotifications.map((notification) => {
                      const config = typeConfig[notification.type]
                      const Icon = config.icon
                      
                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={cn(
                            'relative p-4 border-b border-white/5 hover:bg-white/5 transition-colors group',
                            !notification.read && 'bg-white/[0.02]'
                          )}
                        >
                          <div className="flex gap-3">
                            <div className={cn('p-2 rounded-lg flex-shrink-0', config.color)}>
                              <Icon size={16} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn(
                                  'text-sm',
                                  notification.read ? 'text-gray-300' : 'text-white font-medium'
                                )}>
                                  {notification.title}
                                </p>
                                
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] text-gray-600">
                                  {formatTime(notification.timestamp)}
                                </span>
                                
                                {notification.href && (
                                  <Link
                                    href={notification.href}
                                    onClick={() => {
                                      handleMarkRead(notification.id)
                                      setIsOpen(false)
                                    }}
                                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
                                  >
                                    Megtekintés <ChevronRight size={10} />
                                  </Link>
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkRead(notification.id)}
                                  className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-green-400 transition-colors"
                                  title="Olvasottnak jelölés"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDismiss(notification.id)}
                                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
                                title="Elvetés"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Priority indicator */}
                          {notification.priority === 'high' && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="mx-auto mb-3 text-gray-600" size={32} />
                    <p className="text-gray-500 text-sm">
                      {filter === 'unread' ? 'Nincs olvasatlan értesítés' : 'Nincsenek értesítések'}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/10 bg-white/[0.02]">
                <Link
                  href="/admin/settings#notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Settings size={14} />
                  Értesítési beállítások
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Toast-style notification popup
export function NotificationToast({
  notification,
  onDismiss,
  onAction
}: {
  notification: Notification
  onDismiss: () => void
  onAction?: () => void
}) {
  const config = typeConfig[notification.type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex gap-3">
          <div className={cn('p-2 rounded-lg flex-shrink-0', config.color)}>
            <Icon size={18} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{notification.title}</p>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
          </div>
          
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        
        {onAction && notification.href && (
          <div className="mt-3 flex justify-end">
            <Link
              href={notification.href}
              onClick={onAction}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Megtekintés →
            </Link>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
        className="h-0.5 bg-purple-500"
      />
    </motion.div>
  )
}
