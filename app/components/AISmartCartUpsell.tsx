'use client'

import { useState, useEffect, useTransition } from 'react'
import { Sparkles, ShoppingBag, Package, ArrowRight, Plus, Gift, Loader2, TrendingUp, Truck } from 'lucide-react'
import { getSmartCartSuggestions } from '@/lib/actions/user-actions'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface CartSuggestion {
  id: number
  name: string
  slug: string
  price: number
  originalPrice: number | null
  image: string
  category: string
  reason: string
}

interface CartBundle {
  name: string
  description: string
  products: { id: number; name: string; price: number }[]
  discountPercent: number
  originalTotal: number
  discountedTotal: number
}

export default function AISmartCartUpsell() {
  const { cart, addToCart } = useCart()
  const [suggestions, setSuggestions] = useState<CartSuggestion[]>([])
  const [bundles, setBundles] = useState<CartBundle[]>([])
  const [cartInsight, setCartInsight] = useState<string>('')
  const [freeShippingRemaining, setFreeShippingRemaining] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [addingId, setAddingId] = useState<number | null>(null)

  useEffect(() => {
    if (cart.length === 0) {
      setSuggestions([])
      setBundles([])
      setIsLoading(false)
      return
    }

    startTransition(async () => {
      setIsLoading(true)
      const productIds = cart.map(item => item.id)
      const result = await getSmartCartSuggestions(productIds)
      
      if (result.success) {
        setSuggestions(result.suggestions || [])
        setBundles(result.bundles || [])
        setCartInsight(result.cartInsight || '')
        setFreeShippingRemaining(result.freeShippingRemaining || 0)
      }
      setIsLoading(false)
    })
  }, [cart])

  const handleAddToCart = (product: CartSuggestion) => {
    setAddingId(product.id)
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? undefined,
      image: product.image,
      category: product.category
    })
    toast.success(`${product.name} hozzáadva a kosárhoz!`)
    setTimeout(() => setAddingId(null), 500)
  }

  if (cart.length === 0) return null

  if (isLoading || isPending) {
    return (
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          </div>
          <span className="text-gray-400">AI elemzi a kosarad...</span>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0 && bundles.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Cart Insight Banner */}
      {cartInsight && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-4 border border-purple-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{cartInsight.includes('🎉') ? '🎉' : cartInsight.includes('✨') ? '✨' : '📦'}</div>
            <p className="text-gray-200 font-medium">{cartInsight.replace(/[🎉✨📦]/g, '').trim()}</p>
          </div>
        </motion.div>
      )}

      {/* Free Shipping Progress */}
      {freeShippingRemaining > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <Truck className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">
              Még <span className="font-bold text-blue-400">{freeShippingRemaining.toLocaleString('hu-HU')} Ft</span> az ingyenes szállításig!
            </span>
          </div>
          <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((30000 - freeShippingRemaining) / 30000) * 100)}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AI Ajánlások</h3>
                <p className="text-sm text-gray-400">Tökéletes kiegészítők a kosarához</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestions.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/30 rounded-xl p-3 border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <Link href={`/shop/${product.slug}`}>
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-gray-800">
                    <Image
                      src={getImageUrl(product.image) || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                </Link>

                <Link href={`/shop/${product.slug}`}>
                  <h4 className="font-medium text-white text-sm line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
                    {product.name}
                  </h4>
                </Link>

                <p className="text-xs text-purple-400 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {product.reason}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{product.price.toLocaleString('hu-HU')} Ft</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-500 line-through ml-1">
                        {product.originalPrice.toLocaleString('hu-HU')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product.id}
                    className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all disabled:opacity-50"
                  >
                    {addingId === product.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Bundle Suggestion */}
      {bundles.length > 0 && bundles[0] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">{bundles[0].name}</h3>
              <p className="text-sm text-amber-300">{bundles[0].description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-black/20 rounded-xl p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through">
                  {bundles[0].originalTotal.toLocaleString('hu-HU')} Ft
                </span>
                <span className="px-2 py-0.5 bg-amber-500/30 text-amber-300 text-xs font-bold rounded">
                  -{bundles[0].discountPercent}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {bundles[0].discountedTotal.toLocaleString('hu-HU')} Ft
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Megtakarítás</p>
              <p className="text-lg font-bold text-green-400">
                {(bundles[0].originalTotal - bundles[0].discountedTotal).toLocaleString('hu-HU')} Ft
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Sparkles className="w-3 h-3" />
        <span>AI-alapú személyre szabott ajánlások</span>
      </div>
    </div>
  )
}
