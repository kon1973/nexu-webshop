'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Heart, TrendingDown, Gift, AlertCircle, ChevronRight, Loader2, RefreshCw, ShoppingCart, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getImageUrl } from '@/lib/image'
import { analyzeWishlist } from '@/lib/actions/user-actions'
import { useCart } from '@/context/CartContext'

interface WishlistProduct {
  id: number
  name: string
  price: number
  image: string | null
}

interface WishlistAnalysis {
  success: boolean
  error?: string
  insights?: {
    totalValue: number
    averagePrice: number
    categories: Array<{ name: string; count: number }>
    priceRange: { min: number; max: number }
    savingsOpportunity: number
  }
  recommendations?: Array<{
    id: number
    name: string
    slug: string
    price: number
    originalPrice?: number | null
    image: string | null
    reason: string
    category?: string | null
  }>
  priceDropAlerts?: Array<{
    productId: number
    productName: string
    currentPrice: number
    previousPrice: number
    percentageDrop: number
  }>
  bundleSuggestions?: Array<{
    products: Array<{ id: number; name: string; price: number }>
    totalPrice: number
    savings: number
    reason: string
  }>
  aiMessage?: string
}

interface AIWishlistAnalyzerProps {
  products: WishlistProduct[]
}

export default function AIWishlistAnalyzer({ products }: AIWishlistAnalyzerProps) {
  const [analysis, setAnalysis] = useState<WishlistAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations' | 'alerts' | 'bundles'>('insights')
  const { addToCart } = useCart()

  const handleAnalyze = async () => {
    if (products.length === 0) return
    
    setIsLoading(true)
    try {
      const productIds = products.map(p => p.id)
      const result = await analyzeWishlist(productIds)
      setAnalysis(result)
    } catch (error) {
      console.error('Wishlist analysis error:', error)
      setAnalysis({ success: false })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (products.length >= 2) {
      handleAnalyze()
    }
  }, [products.length])

  if (products.length < 2) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Heart className="text-purple-400" size={28} />
        </div>
        <h3 className="font-semibold text-white mb-2">AI Kedvencek Elemzés</h3>
        <p className="text-sm text-gray-400">
          Adj hozzá legalább 2 terméket a kedvencekhez az AI elemzéshez.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="animate-spin text-purple-500" size={40} />
            <Sparkles className="absolute -top-1 -right-1 text-purple-400 animate-pulse" size={16} />
          </div>
          <p className="text-gray-400 mt-4">AI elemzi a kedvenceidet...</p>
          <p className="text-xs text-gray-500 mt-1">Személyre szabott ajánlások készülnek</p>
        </div>
      </div>
    )
  }

  if (!analysis || !analysis.success) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 text-center">
        <AlertCircle className="mx-auto text-yellow-500 mb-3" size={32} />
        <p className="text-gray-400">Nem sikerült elemezni a kedvenceket</p>
        <button
          onClick={handleAnalyze}
          className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Újrapróbálás
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20 bg-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="text-purple-400" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Kedvencek Elemzés</h3>
              <p className="text-xs text-gray-400">{products.length} termék elemezve</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Újratöltés"
          >
            <RefreshCw size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* AI Message */}
      {analysis.aiMessage && (
        <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/20">
          <p className="text-sm text-purple-200">{analysis.aiMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-purple-500/20 overflow-x-auto">
        {[
          { id: 'insights' as const, label: 'Áttekintés', icon: TrendingDown },
          { id: 'recommendations' as const, label: 'Ajánlások', icon: Gift },
          { id: 'alerts' as const, label: 'Árfigyelő', icon: AlertCircle, badge: analysis.priceDropAlerts?.length },
          { id: 'bundles' as const, label: 'Csomagok', icon: Tag },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'text-purple-300 bg-purple-500/10 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Insights Tab */}
          {activeTab === 'insights' && analysis.insights && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Value Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase">Összes érték</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {analysis.insights.totalValue.toLocaleString('hu-HU')} Ft
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase">Átlag ár</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {analysis.insights.averagePrice.toLocaleString('hu-HU')} Ft
                  </p>
                </div>
              </div>

              {/* Categories */}
              {analysis.insights.categories.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase mb-3">Kategóriák</p>
                  <div className="space-y-2">
                    {analysis.insights.categories.map((cat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-gray-300">{cat.name}</span>
                        <span className="text-purple-400 font-medium">{cat.count} db</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Savings Opportunity */}
              {analysis.insights.savingsOpportunity > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <TrendingDown size={16} />
                    <span className="font-medium">Megtakarítási lehetőség</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analysis.insights.savingsOpportunity.toLocaleString('hu-HU')} Ft
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Akciós termékeinkkel és csomagajánlatokkal
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {analysis.recommendations && analysis.recommendations.length > 0 ? (
                analysis.recommendations.map((product) => {
                  const imageUrl = getImageUrl(product.image)
                  const hasDiscount = product.originalPrice && product.originalPrice > product.price
                  return (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug || product.id}`}
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                    >
                      <div className="w-14 h-14 bg-[#1a1a1a] rounded-lg overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gift size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{product.name}</p>
                        <p className="text-xs text-purple-400 mt-0.5">{product.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-white">
                            {product.price.toLocaleString('hu-HU')} Ft
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-500 line-through">
                              {product.originalPrice?.toLocaleString('hu-HU')} Ft
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                    </Link>
                  )
                })
              ) : (
                <p className="text-center text-gray-400 py-4">Nincs ajánlás</p>
              )}
            </motion.div>
          )}

          {/* Price Alerts Tab */}
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {analysis.priceDropAlerts && analysis.priceDropAlerts.length > 0 ? (
                analysis.priceDropAlerts.map((alert) => (
                  <div
                    key={alert.productId}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{alert.productName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-green-400">
                            {alert.currentPrice.toLocaleString('hu-HU')} Ft
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {alert.previousPrice.toLocaleString('hu-HU')} Ft
                          </span>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
                        -{alert.percentageDrop}%
                      </div>
                    </div>
                    <Link
                      href={`/shop/${alert.productId}`}
                      className="mt-3 w-full py-2 bg-green-500/20 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      Megnézem
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <AlertCircle size={32} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-gray-400">Nincs árcsökkenés a kedvenceid között</p>
                  <p className="text-xs text-gray-500 mt-1">Értesítünk, ha lecsökken valamelyik ára</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Bundle Suggestions Tab */}
          {activeTab === 'bundles' && (
            <motion.div
              key="bundles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {analysis.bundleSuggestions && analysis.bundleSuggestions.length > 0 ? (
                analysis.bundleSuggestions.map((bundle, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-white">Csomag ajánlat</p>
                        <p className="text-xs text-gray-400 mt-0.5">{bundle.reason}</p>
                      </div>
                      {bundle.savings > 0 && (
                        <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                          -{bundle.savings.toLocaleString('hu-HU')} Ft
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {bundle.products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{product.name}</span>
                          <span className="text-gray-400">{product.price.toLocaleString('hu-HU')} Ft</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="font-bold text-white">
                        Összesen: {bundle.totalPrice.toLocaleString('hu-HU')} Ft
                      </span>
                      <button
                        onClick={() => {
                          bundle.products.forEach((product) => {
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: null,
                              category: 'Csomag',
                            }, 1)
                          })
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart size={14} />
                        Mind a kosárba
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Tag size={32} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-gray-400">Nincs csomagajánlat</p>
                  <p className="text-xs text-gray-500 mt-1">Adj hozzá több terméket a kedvencekhez</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
