'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Truck, CheckCircle, Clock, MapPin, 
  RefreshCw, Copy, ExternalLink, Bell, AlertCircle,
  ChevronRight, X, Phone, Mail, MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface OrderTrackerProps {
  orderId?: string
  onClose?: () => void
  minimal?: boolean
}

interface TrackingEvent {
  id: string
  status: string
  description: string
  timestamp: string
  location?: string
}

interface OrderStatus {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
  trackingNumber?: string
  carrier?: string
  shippingMethod?: string
  items: {
    id: string
    name: string
    quantity: number
    image?: string
  }[]
  events: TrackingEvent[]
  address: {
    name: string
    city: string
    zipCode: string
  }
}

const statusInfo: Record<string, { icon: React.ReactNode; color: string; label: string; description: string }> = {
  PENDING: {
    icon: <Clock size={20} />,
    color: 'yellow',
    label: 'Feldolgozás alatt',
    description: 'Rendelésed megkaptuk, hamarosan feldolgozzuk'
  },
  CONFIRMED: {
    icon: <CheckCircle size={20} />,
    color: 'blue',
    label: 'Visszaigazolva',
    description: 'Rendelésed visszaigazolva, hamarosan csomagoljuk'
  },
  PROCESSING: {
    icon: <Package size={20} />,
    color: 'indigo',
    label: 'Csomagolás alatt',
    description: 'A termékeket csomagoljuk'
  },
  SHIPPED: {
    icon: <Truck size={20} />,
    color: 'purple',
    label: 'Elküldve',
    description: 'A csomag útnak indult'
  },
  OUT_FOR_DELIVERY: {
    icon: <MapPin size={20} />,
    color: 'cyan',
    label: 'Kiszállítás alatt',
    description: 'A futár úton van hozzád'
  },
  DELIVERED: {
    icon: <CheckCircle size={20} />,
    color: 'green',
    label: 'Kézbesítve',
    description: 'A csomag megérkezett'
  },
  CANCELLED: {
    icon: <AlertCircle size={20} />,
    color: 'red',
    label: 'Törölve',
    description: 'A rendelés törölve lett'
  }
}

const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

export default function OrderTracker({ orderId, onClose, minimal = false }: OrderTrackerProps) {
  const [searchOrderId, setSearchOrderId] = useState(orderId || '')
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [recentOrders, setRecentOrders] = useState<{ id: string; orderNumber: string }[]>([])

  // Load recent orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexu-recent-orders')
    if (saved) {
      try {
        setRecentOrders(JSON.parse(saved))
      } catch {}
    }
  }, [])

  // Auto-load if orderId provided
  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId)
    }
  }, [orderId])

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/orders/${id.trim()}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Rendelés nem található. Ellenőrizd a rendelésszámot!')
        } else {
          setError('Hiba történt a rendelés betöltésekor')
        }
        setOrder(null)
        return
      }
      
      const data = await response.json()
      setOrder(data)
      
      // Save to recent orders
      const recent = [
        { id: data.id, orderNumber: data.orderNumber },
        ...recentOrders.filter(o => o.id !== data.id)
      ].slice(0, 5)
      setRecentOrders(recent)
      localStorage.setItem('nexu-recent-orders', JSON.stringify(recent))
      
    } catch (err) {
      setError('Kapcsolódási hiba. Próbáld újra később!')
    } finally {
      setIsLoading(false)
    }
  }

  const copyTrackingNumber = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber)
      toast.success('Nyomkövetési szám másolva!')
    }
  }

  const getStatusProgress = () => {
    if (!order) return 0
    if (order.status === 'CANCELLED') return 0
    const currentIndex = statusOrder.indexOf(order.status)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCarrierTrackingUrl = () => {
    if (!order?.trackingNumber || !order?.carrier) return null
    
    const carriers: Record<string, string> = {
      'GLS': `https://gls-group.com/HU/hu/csomagkovetes?match=${order.trackingNumber}`,
      'MPL': `https://www.posta.hu/nyomkovetes/nyitooldal?searchvalue=${order.trackingNumber}`,
      'DPD': `https://tracking.dpd.de/parcelstatus?query=${order.trackingNumber}`,
      'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`
    }
    
    return carriers[order.carrier.toUpperCase()] || null
  }

  if (minimal && order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-${statusInfo[order.status].color}-500/20`}>
              {statusInfo[order.status].icon}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{order.orderNumber}</p>
              <p className={`text-${statusInfo[order.status].color}-400 text-xs`}>
                {statusInfo[order.status].label}
              </p>
            </div>
          </div>
          <Link 
            href={`/orders/${order.id}`}
            className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
          >
            Részletek <ChevronRight size={14} />
          </Link>
        </div>
        
        {/* Mini progress bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${getStatusProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {order.estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <p className="text-gray-400 text-xs mt-2">
            Várható kézbesítés: {formatDate(order.estimatedDelivery)}
          </p>
        )}
      </motion.div>
    )
  }

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Package className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Rendelés követése</h2>
              <p className="text-gray-400 text-sm">Kövesd nyomon a csomagod útját</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X size={20} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrder(searchOrderId)}
            placeholder="Add meg a rendelésszámot (pl. NEXU-12345)"
            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={() => fetchOrder(searchOrderId)}
            disabled={isLoading || !searchOrderId.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              'Keresés'
            )}
          </button>
        </div>

        {/* Recent orders */}
        {recentOrders.length > 0 && !order && (
          <div className="mt-4">
            <p className="text-gray-500 text-xs mb-2">Korábbi keresések:</p>
            <div className="flex flex-wrap gap-2">
              {recentOrders.map((recent) => (
                <button
                  key={recent.id}
                  onClick={() => {
                    setSearchOrderId(recent.orderNumber)
                    fetchOrder(recent.id)
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  {recent.orderNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl mb-6"
            >
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {!order && !error && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-purple-400" size={28} />
              </div>
              <p className="text-gray-400">Add meg a rendelésszámot a csomag követéséhez</p>
              <p className="text-gray-600 text-sm mt-2">
                A rendelésszámot emailben küldtük el a rendelés után
              </p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <RefreshCw className="text-purple-500 animate-spin" size={32} />
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status overview */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-${statusInfo[order.status].color}-500/20`}>
                    {statusInfo[order.status].icon}
                  </div>
                  <div>
                    <p className={`text-${statusInfo[order.status].color}-400 font-bold text-lg`}>
                      {statusInfo[order.status].label}
                    </p>
                    <p className="text-gray-400 text-sm">{statusInfo[order.status].description}</p>
                  </div>
                </div>
                
                {order.estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Várható kézbesítés</p>
                    <p className="text-white font-medium">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {order.status !== 'CANCELLED' && (
                <div className="relative">
                  <div className="flex justify-between mb-2">
                    {statusOrder.map((status, index) => {
                      const currentIndex = statusOrder.indexOf(order.status)
                      const isPast = index <= currentIndex
                      const isCurrent = index === currentIndex
                      
                      return (
                        <div key={status} className="flex flex-col items-center flex-1">
                          <motion.div
                            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              isPast
                                ? `bg-${statusInfo[status].color}-500 text-white`
                                : 'bg-white/10 text-gray-500'
                            } ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-[#121212] ring-purple-500' : ''}`}
                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            {statusInfo[status].icon}
                          </motion.div>
                          <p className={`text-xs mt-2 text-center hidden sm:block ${
                            isPast ? 'text-white' : 'text-gray-500'
                          }`}>
                            {statusInfo[status].label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/10 -z-0" />
                  <motion.div
                    className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 -z-0"
                    initial={{ width: 0 }}
                    animate={{ width: `calc(${getStatusProgress()}% - 32px)` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              )}

              {/* Tracking info */}
              {order.trackingNumber && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex-1">
                    <p className="text-gray-400 text-xs mb-1">Nyomkövetési szám ({order.carrier})</p>
                    <p className="text-white font-mono text-lg">{order.trackingNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyTrackingNumber}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Másolás"
                    >
                      <Copy size={18} className="text-gray-400" />
                    </button>
                    {getCarrierTrackingUrl() && (
                      <a
                        href={getCarrierTrackingUrl()!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                        title="Követés a futárcég oldalán"
                      >
                        <ExternalLink size={18} className="text-purple-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Order details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-gray-400 text-xs mb-2">Rendelés részletei</p>
                  <p className="text-white font-bold mb-1">{order.orderNumber}</p>
                  <p className="text-gray-400 text-sm">Létrehozva: {formatDate(order.createdAt)}</p>
                  <p className="text-gray-400 text-sm">{order.items.length} termék</p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-gray-400 text-xs mb-2">Szállítási cím</p>
                  <p className="text-white font-bold mb-1">{order.address.name}</p>
                  <p className="text-gray-400 text-sm">
                    {order.address.zipCode} {order.address.city}
                  </p>
                </div>
              </div>

              {/* Items preview */}
              {order.items.length > 0 && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-gray-400 text-xs mb-3">Rendelés tartalma</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                            <Package size={14} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-white text-xs truncate max-w-[120px]">{item.name}</p>
                          <p className="text-gray-500 text-xs">{item.quantity} db</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex items-center justify-center px-4 bg-black/30 rounded-lg">
                        <p className="text-gray-400 text-xs">+{order.items.length - 4}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {order.events.length > 0 && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-gray-400 text-xs mb-3">Eseménytörténet</p>
                  <div className="space-y-4">
                    {order.events.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-purple-500' : 'bg-white/20'
                          }`} />
                          {index < order.events.length - 1 && (
                            <div className="w-0.5 h-full bg-white/10 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-white text-sm font-medium">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-500 text-xs">{formatDate(event.timestamp)}</p>
                            {event.location && (
                              <>
                                <span className="text-gray-700">•</span>
                                <p className="text-gray-500 text-xs">{event.location}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-center transition-colors"
                >
                  Teljes részletek
                </Link>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Bell size={18} />
                  Értesítések
                </button>
                <Link
                  href="/contact"
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  Segítség
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
