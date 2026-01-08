'use client'

import { useState, useEffect } from 'react'
import { Scale, Sparkles, Trophy, X, Check, Minus, RefreshCw, Share2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { compareProductsWithAI } from '@/lib/actions/user-actions'

interface CompareProduct {
  id: number
  name: string
  slug: string
  price: number
  originalPrice?: number | null
  image: string | null
  category?: string | null
  brand?: { name: string } | null
  description?: string | null
  specs?: Record<string, string>
}

interface AIComparisonResult {
  success: boolean
  comparison?: {
    winner: {
      productId: number
      reason: string
    }
    categories: Array<{
      name: string
      winner: number | null
      explanation: string
    }>
    prosAndCons: Array<{
      productId: number
      pros: string[]
      cons: string[]
    }>
    recommendation: string
    forWhom: Array<{
      productId: number
      bestFor: string[]
    }>
  }
}

interface AICompareProps {
  products: CompareProduct[]
  onRemove?: (id: number) => void
}

export default function AICompare({ products, onRemove }: AICompareProps) {
  const [comparison, setComparison] = useState<AIComparisonResult['comparison'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'recommendation'>('overview')

  const loadComparison = async () => {
    if (products.length < 2) return
    
    setIsLoading(true)
    try {
      const result = await compareProductsWithAI(products.map(p => p.id)) as AIComparisonResult
      if (result.success && result.comparison) {
        setComparison(result.comparison)
      }
    } catch (error) {
      console.error('Comparison error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('hu-HU') + ' Ft'
  }

  const getWinnerProduct = () => {
    if (!comparison?.winner) return null
    return products.find(p => p.id === comparison.winner.productId)
  }

  const winnerProduct = getWinnerProduct()

  return (
    <div className="space-y-6">
      {/* Products Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative bg-[#121212] border rounded-xl overflow-hidden ${
              comparison?.winner?.productId === product.id 
                ? 'border-yellow-500/50 ring-2 ring-yellow-500/20' 
                : 'border-white/10'
            }`}
          >
            {/* Winner Badge */}
            {comparison?.winner?.productId === product.id && (
              <div className="absolute top-2 left-2 z-10 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
                <Trophy size={12} />
                AI Győztes
              </div>
            )}
            
            {/* Remove Button */}
            {onRemove && (
              <button
                onClick={() => onRemove(product.id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-red-500/50 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}

            {/* Image */}
            <div className="aspect-square relative bg-white/5">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <Scale size={32} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-1">{product.brand?.name || product.category}</p>
              <h3 className="text-white font-medium line-clamp-2 mb-2">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Compare Button */}
      {products.length >= 2 && !comparison && (
        <div className="text-center">
          <button
            onClick={loadComparison}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                AI elemzés folyamatban...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                AI Összehasonlítás
              </>
            )}
          </button>
          <p className="text-gray-500 text-sm mt-2">Az AI részletesen összehasonlítja a termékeket</p>
        </div>
      )}

      {products.length < 2 && (
        <div className="text-center py-8 bg-white/5 rounded-xl">
          <Scale size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">Adj hozzá legalább 2 terméket az összehasonlításhoz</p>
        </div>
      )}

      {/* AI Results */}
      <AnimatePresence>
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Áttekintés
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'details' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Részletek
              </button>
              <button
                onClick={() => setActiveTab('recommendation')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'recommendation' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Javaslat
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Winner Card */}
                {winnerProduct && (
                  <div className="p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-yellow-500/20 rounded-xl">
                        <Trophy size={24} className="text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">
                          AI Győztes: {winnerProduct.name}
                        </h3>
                        <p className="text-gray-300">{comparison.winner.reason}</p>
                      </div>
                      <Link
                        href={`/shop/${winnerProduct.slug}`}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        Megtekintés
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Category Comparison */}
                {comparison.categories && (
                  <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-white font-semibold">Kategóriák szerinti összehasonlítás</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {comparison.categories.map((cat, idx) => (
                        <div key={idx} className="p-4 flex items-center gap-4">
                          <span className="text-gray-400 w-32 flex-shrink-0">{cat.name}</span>
                          <div className="flex-1 flex items-center gap-2">
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className={`flex-1 p-2 rounded-lg text-center text-sm ${
                                  cat.winner === product.id
                                    ? 'bg-green-500/20 text-green-400 font-medium'
                                    : 'bg-white/5 text-gray-400'
                                }`}
                              >
                                {cat.winner === product.id ? (
                                  <Check size={16} className="mx-auto" />
                                ) : cat.winner === null ? (
                                  <Minus size={16} className="mx-auto" />
                                ) : (
                                  <span className="opacity-50">—</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-gray-500 text-xs w-48 flex-shrink-0">{cat.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {comparison.prosAndCons?.map((item) => {
                  const product = products.find(p => p.id === item.productId)
                  if (!product) return null
                  
                  return (
                    <div key={item.productId} className="bg-[#121212] border border-white/10 rounded-xl p-6">
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        {product.name}
                        {comparison.winner?.productId === product.id && (
                          <Trophy size={16} className="text-yellow-400" />
                        )}
                      </h4>
                      
                      {/* Pros */}
                      <div className="mb-4">
                        <h5 className="text-green-400 text-sm font-medium mb-2">Előnyök</h5>
                        <ul className="space-y-1">
                          {item.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                              <Check size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Cons */}
                      <div>
                        <h5 className="text-red-400 text-sm font-medium mb-2">Hátrányok</h5>
                        <ul className="space-y-1">
                          {item.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                              <X size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}

            {/* Recommendation Tab */}
            {activeTab === 'recommendation' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Main Recommendation */}
                <div className="p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl">
                  <div className="flex items-start gap-4">
                    <Sparkles size={24} className="text-purple-400 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-2">AI Javaslat</h3>
                      <p className="text-gray-300">{comparison.recommendation}</p>
                    </div>
                  </div>
                </div>

                {/* For Whom */}
                {comparison.forWhom && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comparison.forWhom.map((item) => {
                      const product = products.find(p => p.id === item.productId)
                      if (!product) return null
                      
                      return (
                        <div key={item.productId} className="bg-[#121212] border border-white/10 rounded-xl p-6">
                          <h4 className="text-white font-medium mb-3">{product.name}</h4>
                          <p className="text-gray-500 text-sm mb-3">Ideális választás, ha:</p>
                          <ul className="space-y-2">
                            {item.bestFor.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                <ArrowRight size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                          <Link
                            href={`/shop/${product.slug}`}
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors"
                          >
                            Termék megtekintése
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={loadComparison}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Újra elemzés
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
