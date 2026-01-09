'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, BellOff, Package, Tag, TrendingDown, 
  ShoppingBag, Trash2, Settings, Mail, Check,
  AlertCircle, X, ChevronRight, Filter, Search
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface Notification {
  id: string
  type: 'price_drop' | 'back_in_stock' | 'sale_start' | 'new_arrival' | 'wishlist_sale'
  title: string
  message: string
  productId?: number
  productName?: string
  productImage?: string
  oldPrice?: number
  newPrice?: number
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface NotificationPreference {
  priceDrops: boolean
  backInStock: boolean
  salesStart: boolean
  newArrivals: boolean
  wishlistAlerts: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

const STORAGE_KEY = 'nexu-notification-center'
const PREFS_KEY = 'nexu-notification-prefs'

const notificationTypeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  price_drop: {
    icon: <TrendingDown size={18} />,
    color: 'green',
    label: 'Árcsökkenés'
  },
  back_in_stock: {
    icon: <Package size={18} />,
    color: 'blue',
    label: 'Újra készleten'
  },
  sale_start: {
    icon: <Tag size={18} />,
    color: 'red',
    label: 'Akció indul'
  },
  new_arrival: {
    icon: <ShoppingBag size={18} />,
    color: 'purple',
    label: 'Új termék'
  },
  wishlist_sale: {
    icon: <Bell size={18} />,
    color: 'yellow',
    label: 'Kívánságlista akció'
  }
}

export default function NotificationCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreference>({
    priceDrops: true,
    backInStock: true,
    salesStart: true,
    newArrivals: false,
    wishlistAlerts: true,
    emailNotifications: true,
    pushNotifications: false
  })
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Load notifications and preferences
  useEffect(() => {
    const savedNotifications = localStorage.getItem(STORAGE_KEY)
    const savedPrefs = localStorage.getItem(PREFS_KEY)
    
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch {}
    } else {
      // Generate demo notifications
      generateDemoNotifications()
    }
    
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs))
      } catch {}
    }
  }, [])

  // Save notifications
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  // Save preferences
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences))
  }, [preferences])

  const generateDemoNotifications = () => {
    const demo: Notification[] = [
      {
        id: '1',
        type: 'price_drop',
        title: 'Árcsökkenés!',
        message: 'A Samsung Galaxy S24 ára 15%-kal csökkent!',
        productId: 1,
        productName: 'Samsung Galaxy S24',
        productImage: '/uploads/samsung-s24.jpg',
        oldPrice: 399990,
        newPrice: 339990,
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/shop/1'
      },
      {
        id: '2',
        type: 'back_in_stock',
        title: 'Újra készleten!',
        message: 'Az iPhone 15 Pro újra elérhető!',
        productId: 2,
        productName: 'iPhone 15 Pro',
        productImage: '/uploads/iphone-15-pro.jpg',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        actionUrl: '/shop/2'
      },
      {
        id: '3',
        type: 'sale_start',
        title: 'Akció indul!',
        message: 'Holnaptól 20% kedvezmény minden laptopra!',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        actionUrl: '/shop?category=laptops&onSale=true'
      },
      {
        id: '4',
        type: 'wishlist_sale',
        title: 'Kívánságlistád egyik terméke akcióban!',
        message: 'A Sony WH-1000XM5 fejhallgató most 25% kedvezménnyel!',
        productId: 5,
        productName: 'Sony WH-1000XM5',
        oldPrice: 149990,
        newPrice: 112490,
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        actionUrl: '/shop/5'
      }
    ]
    setNotifications(demo)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('Minden értesítés olvasottnak jelölve')
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
    toast.success('Értesítések törölve')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes} perce`
    if (hours < 24) return `${hours} órája`
    if (days < 7) return `${days} napja`
    return date.toLocaleDateString('hu-HU')
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter && n.type !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.productName?.toLowerCase().includes(query)
      )
    }
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0d0d0d] border-l border-white/10 z-[70] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="text-purple-400" size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white">Értesítések</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-gray-400'
                }`}
              >
                <Settings size={18} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search and filter */}
          {!showSettings && (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keresés az értesítésekben..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setFilter(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    !filter ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Mind
                </button>
                {Object.entries(notificationTypeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      filter === type ? `bg-${config.color}-500/20 text-${config.color}-400` : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-white/10 overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <h3 className="text-white font-semibold text-sm">Értesítési beállítások</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Árcsökkenések</span>
                    <input
                      type="checkbox"
                      checked={preferences.priceDrops}
                      onChange={(e) => setPreferences(p => ({ ...p, priceDrops: e.target.checked }))}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Újra készleten</span>
                    <input
                      type="checkbox"
                      checked={preferences.backInStock}
                      onChange={(e) => setPreferences(p => ({ ...p, backInStock: e.target.checked }))}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Akciók</span>
                    <input
                      type="checkbox"
                      checked={preferences.salesStart}
                      onChange={(e) => setPreferences(p => ({ ...p, salesStart: e.target.checked }))}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Kívánságlista értesítések</span>
                    <input
                      type="checkbox"
                      checked={preferences.wishlistAlerts}
                      onChange={(e) => setPreferences(p => ({ ...p, wishlistAlerts: e.target.checked }))}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                    />
                  </label>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-3">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-300 text-sm">Email értesítések</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences(p => ({ ...p, emailNotifications: e.target.checked }))}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-gray-400" />
                      <span className="text-gray-300 text-sm">Push értesítések</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences(p => ({ ...p, pushNotifications: e.target.checked }))}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions bar */}
        {!showSettings && notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <span className="text-gray-500 text-xs">
              {filteredNotifications.length} értesítés
              {unreadCount > 0 && ` (${unreadCount} olvasatlan)`}
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Mind olvasott
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-red-400"
              >
                Mind törlése
              </button>
            </div>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <BellOff className="text-gray-500" size={28} />
              </div>
              <p className="text-gray-400 text-center">
                {searchQuery 
                  ? 'Nincs találat a keresésre' 
                  : 'Nincsenek értesítéseid'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredNotifications.map((notification) => {
                const config = notificationTypeConfig[notification.type]
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-4 hover:bg-white/5 transition-colors ${
                      !notification.read ? 'bg-purple-500/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Type icon or product image */}
                      <div className="flex-shrink-0">
                        {notification.productImage ? (
                          <img
                            src={getImageUrl(notification.productImage) || ''}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-lg bg-${config.color}-500/20 flex items-center justify-center`}>
                            {config.icon}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white font-medium text-sm">
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full" />
                              )}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-gray-500" />
                          </button>
                        </div>

                        {/* Price change */}
                        {notification.oldPrice && notification.newPrice && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-gray-500 line-through text-xs">
                              {notification.oldPrice.toLocaleString('hu-HU')} Ft
                            </span>
                            <span className="text-green-400 font-bold text-sm">
                              {notification.newPrice.toLocaleString('hu-HU')} Ft
                            </span>
                            <span className="text-green-400 text-xs bg-green-500/20 px-1.5 py-0.5 rounded">
                              -{Math.round((1 - notification.newPrice / notification.oldPrice) * 100)}%
                            </span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-600 text-xs">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              onClick={() => {
                                markAsRead(notification.id)
                                onClose()
                              }}
                              className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
                            >
                              Megnézem <ChevronRight size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <Link
            href="/profile/notifications"
            onClick={onClose}
            className="block w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg text-center transition-colors"
          >
            Összes értesítés megtekintése
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
