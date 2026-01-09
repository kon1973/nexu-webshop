'use client'

import { useState, useEffect, useTransition } from 'react'
import { Package, RefreshCw, ShoppingCart, Clock, Loader2, ChevronRight, Star, Check, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string | null
  slug?: string | null
  productId: number
  inStock: boolean
}

interface PastOrder {
  id: string
  orderNumber: string
  createdAt: string
  items: OrderItem[]
  total: number
}

interface QuickReorderProps {
  orders: PastOrder[]
}

export default function QuickReorder({ orders }: QuickReorderProps) {
  const { addToCart } = useCart()
  const [selectedOrder, setSelectedOrder] = useState<PastOrder | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [isAdding, setIsAdding] = useState(false)

  // Select all in-stock items by default when order is selected
  useEffect(() => {
    if (selectedOrder) {
      const inStockIds = selectedOrder.items
        .filter(item => item.inStock)
        .map(item => item.productId)
      setSelectedItems(new Set(inStockIds))
    }
  }, [selectedOrder])

  const toggleItem = (productId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleReorder = async () => {
    if (!selectedOrder || selectedItems.size === 0) return

    setIsAdding(true)
    
    const itemsToAdd = selectedOrder.items.filter(
      item => selectedItems.has(item.productId) && item.inStock
    )

    for (const item of itemsToAdd) {
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for animation
      addToCart({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        stock: 999, // Will be validated on checkout
        category: ''
      }, item.quantity)
    }

    setIsAdding(false)
    toast.success(`${itemsToAdd.length} termék hozzáadva a kosárhoz!`, {
      action: {
        label: 'Kosár',
        onClick: () => window.location.href = '/cart'
      }
    })
    setSelectedOrder(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('hu-HU') + ' Ft'
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <RefreshCw size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Gyors újrarendelés</h3>
        </div>
        <div className="text-center py-8">
          <Package size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">Még nincs korábbi rendelésed</p>
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors"
          >
            Böngéssz a termékek között
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <RefreshCw size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gyors újrarendelés</h3>
            <p className="text-gray-400 text-sm">Rendeld újra korábbi vásárlásaidat egy kattintással</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedOrder ? (
          /* Order List */
          <motion.div
            key="order-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-3 max-h-[400px] overflow-y-auto"
          >
            {orders.map((order, idx) => (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedOrder(order)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-medium">#{order.orderNumber}</span>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div 
                        key={i}
                        className="w-10 h-10 rounded-lg bg-white/10 border-2 border-[#111] overflow-hidden"
                      >
                        {item.image ? (
                          <Image
                            src={getImageUrl(item.image) || ''}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 border-2 border-[#111] flex items-center justify-center">
                        <span className="text-blue-400 text-xs font-bold">+{order.items.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{order.items.length} termék</p>
                    <p className="text-gray-400 text-xs">{formatPrice(order.total)}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          /* Order Details */
          <motion.div
            key="order-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ChevronRight size={16} className="rotate-180" />
              Vissza a rendelésekhez
            </button>

            {/* Order info */}
            <div className="flex items-center justify-between mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div>
                <p className="text-blue-400 font-medium">#{selectedOrder.orderNumber}</p>
                <p className="text-gray-400 text-sm">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <Sparkles size={20} className="text-blue-400" />
            </div>

            {/* Items list */}
            <div className="space-y-2 mb-4 max-h-[250px] overflow-y-auto">
              {selectedOrder.items.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => item.inStock && toggleItem(item.productId)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    !item.inStock
                      ? 'bg-red-500/10 border-red-500/30 opacity-60 cursor-not-allowed'
                      : selectedItems.has(item.productId)
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    !item.inStock
                      ? 'border-red-500/50 bg-red-500/10'
                      : selectedItems.has(item.productId)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-white/30'
                  }`}>
                    {selectedItems.has(item.productId) && item.inStock && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>

                  {/* Image */}
                  <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={getImageUrl(item.image) || ''}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">{item.quantity} db</span>
                      {!item.inStock && (
                        <span className="text-red-400 text-xs">Nincs készleten</span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <p className="text-white font-medium text-sm">{formatPrice(item.price)}</p>
                </motion.div>
              ))}
            </div>

            {/* Summary & Action */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Kiválasztott termékek:</span>
                <span className="text-white font-bold">
                  {formatPrice(
                    selectedOrder.items
                      .filter(item => selectedItems.has(item.productId))
                      .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  )}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReorder}
                disabled={selectedItems.size === 0 || isAdding}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {isAdding ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Hozzáadás...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Kosárba ({selectedItems.size} termék)
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
