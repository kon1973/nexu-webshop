'use client'

import { useState, useTransition } from 'react'
import { Scale, Sparkles, Trophy, X, Check, Minus, RefreshCw, ArrowRight, Target, Lightbulb, AlertTriangle, ShoppingCart, Users, Zap, DollarSign, Star, HelpCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { compareProductsWithAI, getAIPurchaseAdvice } from '@/lib/actions/user-actions'
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface CompareProduct {
  id: number
  name: string
  slug?: string
  price: number
  originalPrice?: number | null
  image: string | null
  category?: string | null
  brand?: string | null
  rating?: number
  stock?: number
}

interface AIComparisonResult {
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
  quickVerdict: string
}

interface PurchaseAdvice {
  topPick: {
    productId: number
    confidence: number
    reasoning: string
  }
  alternatives: Array<{
    productId: number
    scenario: string
  }>
  warnings: string[]
  tips: string[]
  verdict: string
}

interface AICompareAdvancedProps {
  products: CompareProduct[]
  onRemove?: (id: number) => void
}

export default function AICompareAdvanced({ products, onRemove }: AICompareAdvancedProps) {
  const { addToCart } = useCart()
  const [comparison, setComparison] = useState<AIComparisonResult | null>(null)
  const [advice, setAdvice] = useState<PurchaseAdvice | null>(null)
  const [isComparing, startComparing] = useTransition()
  const [isAdvising, startAdvising] = useTransition()
  const [activeView, setActiveView] = useState<'compare' | 'advice'>('compare')
  const [showAdviceForm, setShowAdviceForm] = useState(false)
  const [userContext, setUserContext] = useState({
    budget: '',
    priorities: [] as string[],
    useCase: ''
  })

  const loadComparison = () => {
    if (products.length < 2) return
    
    startComparing(async () => {
      const result = await compareProductsWithAI(products.map(p => p.id))
      if (result.success && result.comparison) {
        setComparison(result.comparison as AIComparisonResult)
      } else {
        toast.error(result.error || 'Hiba az összehasonlítás során')
      }
    })
  }

  const loadAdvice = () => {
    startAdvising(async () => {
      const result = await getAIPurchaseAdvice(
        products.map(p => p.id),
        {
          budget: userContext.budget ? parseInt(userContext.budget) : undefined,
          priorities: userContext.priorities.length > 0 ? userContext.priorities : undefined,
          useCase: userContext.useCase || undefined
        }
      )
      if (result.success && result.advice) {
        setAdvice(result.advice as PurchaseAdvice)
        setShowAdviceForm(false)
        setActiveView('advice')
      } else {
        toast.error(result.error || 'Hiba a tanács generálásakor')
      }
    })
  }

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  const getWinnerProduct = () => {
    if (!comparison?.winner) return null
    return products.find(p => p.id === comparison.winner.productId)
  }

  const handleAddToCart = (product: CompareProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? undefined,
      image: product.image || '',
      category: product.category || ''
    })
    toast.success(`${product.name} hozzáadva a kosárhoz!`)
  }

  const togglePriority = (priority: string) => {
    setUserContext(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }))
  }

  const winnerProduct = getWinnerProduct()
  const topPickProduct = advice?.topPick ? products.find(p => p.id === advice.topPick.productId) : null

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const isWinner = comparison?.winner?.productId === product.id
          const isTopPick = advice?.topPick?.productId === product.id
          
          return (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative bg-[#121212] border rounded-xl overflow-hidden transition-all ${
                isWinner || isTopPick
                  ? 'border-yellow-500/50 ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10'
                  : 'border-white/10 hover:border-purple-500/30'
              }`}
            >
              {/* Winner/Top Pick Badge */}
              {(isWinner || isTopPick) && (
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                  <Trophy size={12} />
                  {isWinner ? 'AI Győztes' : 'Ajánlott'}
                </div>
              )}

              {/* Remove Button */}
              {onRemove && (
                <button
                  onClick={() => onRemove(product.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-gray-400 hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              )}

              {/* Image */}
              <div className="aspect-square relative bg-gradient-to-br from-white/5 to-white/10">
                {product.image ? (
                  <Image
                    src={getImageUrl(product.image) || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Scale size={32} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{product.brand || product.category}</p>
                  <h3 className="text-white font-medium text-sm line-clamp-2">{product.name}</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  {product.rating !== undefined && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs">{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {product.stock !== undefined && (
                    <span className={`text-xs ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.stock > 0 ? 'Készleten' : 'Elfogyott'}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <ShoppingCart size={14} />
                  Kosárba
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Action Buttons */}
      {products.length >= 2 && !comparison && !advice && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={loadComparison}
            disabled={isComparing}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/25"
          >
            {isComparing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                AI elemzés...
              </>
            ) : (
              <>
                <Scale size={20} />
                AI Összehasonlítás
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowAdviceForm(true)}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl text-white font-semibold transition-all shadow-lg shadow-amber-500/25"
          >
            <Target size={20} />
            Személyre Szabott Tanács
          </button>
        </div>
      )}

      {/* Personalized Advice Form */}
      <AnimatePresence>
        {showAdviceForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-xl">
                    <Target size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Személyre Szabott Tanács</h3>
                    <p className="text-gray-400 text-sm">Mondd el az igényeidet a legjobb ajánlásért</p>
                  </div>
                </div>
                <button onClick={() => setShowAdviceForm(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign size={14} className="inline mr-1" />
                    Maximum költségkeret (opcionális)
                  </label>
                  <input
                    type="number"
                    value={userContext.budget}
                    onChange={(e) => setUserContext(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="pl. 150000"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                {/* Use Case */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Users size={14} className="inline mr-1" />
                    Mire használnád? (opcionális)
                  </label>
                  <input
                    type="text"
                    value={userContext.useCase}
                    onChange={(e) => setUserContext(prev => ({ ...prev, useCase: e.target.value }))}
                    placeholder="pl. gaming, munka, mindennapi használat"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              {/* Priorities */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Zap size={14} className="inline mr-1" />
                  Mi a fontos számodra?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Ár', 'Minőség', 'Márka', 'Tartósság', 'Design', 'Teljesítmény', 'Garancia', 'Vélemények'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => togglePriority(priority)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        userContext.priorities.includes(priority)
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={loadAdvice}
                disabled={isAdvising}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 rounded-xl text-black font-bold transition-all"
              >
                {isAdvising ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Elemzés folyamatban...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Személyre Szabott Ajánlás Kérése
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results View Toggle */}
      {(comparison || advice) && (
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit mx-auto">
          <button
            onClick={() => { setActiveView('compare'); if (!comparison) loadComparison(); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeView === 'compare' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scale size={16} />
            Összehasonlítás
          </button>
          <button
            onClick={() => { setActiveView('advice'); if (!advice) setShowAdviceForm(true); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeView === 'advice' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Target size={16} />
            Tanács
          </button>
        </div>
      )}

      {/* Comparison Results */}
      <AnimatePresence mode="wait">
        {activeView === 'compare' && comparison && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Verdict */}
            {comparison.quickVerdict && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-purple-300 font-medium text-center">
                  <Sparkles size={16} className="inline mr-2" />
                  {comparison.quickVerdict}
                </p>
              </div>
            )}

            {/* Winner Card */}
            {winnerProduct && (
              <div className="p-6 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-500/30 rounded-2xl">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <Trophy size={28} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-yellow-400 text-sm font-medium mb-1">AI Győztes</p>
                      <h3 className="text-white font-bold text-xl">{winnerProduct.name}</h3>
                      <p className="text-gray-300 mt-2">{comparison.winner.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <Link
                      href={`/shop/${winnerProduct.slug || winnerProduct.id}`}
                      className="flex-1 md:flex-none px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-colors text-center"
                    >
                      Megtekintés
                    </Link>
                    <button
                      onClick={() => handleAddToCart(winnerProduct)}
                      className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Kosárba
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Category Comparison */}
            {comparison.categories && comparison.categories.length > 0 && (
              <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Scale size={18} />
                    Kategóriák szerinti összehasonlítás
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {comparison.categories.map((cat, idx) => (
                    <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                      <span className="text-white font-medium w-40 flex-shrink-0">{cat.name}</span>
                      <div className="flex-1 flex items-center gap-2">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className={`flex-1 p-3 rounded-lg text-center transition-all ${
                              cat.winner === product.id
                                ? 'bg-green-500/20 border border-green-500/30'
                                : cat.winner === null
                                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                                  : 'bg-white/5 border border-white/5'
                            }`}
                          >
                            <span className="text-xs text-gray-400 block mb-1 truncate">{product.name.split(' ').slice(0, 2).join(' ')}</span>
                            {cat.winner === product.id ? (
                              <Check size={18} className="mx-auto text-green-400" />
                            ) : cat.winner === null ? (
                              <Minus size={18} className="mx-auto text-yellow-400" />
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm md:w-48 flex-shrink-0">{cat.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros and Cons */}
            {comparison.prosAndCons && comparison.prosAndCons.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comparison.prosAndCons.map((item) => {
                  const product = products.find(p => p.id === item.productId)
                  if (!product) return null

                  return (
                    <div key={item.productId} className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-white font-semibold flex-1">{product.name}</h4>
                        {comparison.winner?.productId === product.id && (
                          <Trophy size={18} className="text-yellow-400" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-green-400 text-sm font-medium mb-3 flex items-center gap-2">
                            <Check size={14} />
                            Előnyök
                          </h5>
                          <ul className="space-y-2">
                            {item.pros.map((pro, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-red-400 text-sm font-medium mb-3 flex items-center gap-2">
                            <X size={14} />
                            Hátrányok
                          </h5>
                          <ul className="space-y-2">
                            {item.cons.map((con, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-red-400 mt-1">•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Recommendation */}
            <div className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <Lightbulb size={24} className="text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-2">AI Javaslat</h3>
                  <p className="text-gray-300">{comparison.recommendation}</p>
                </div>
              </div>
            </div>

            {/* For Whom */}
            {comparison.forWhom && comparison.forWhom.length > 0 && (
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Users size={18} />
                  Kinek ajánljuk?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparison.forWhom.map((item) => {
                    const product = products.find(p => p.id === item.productId)
                    if (!product) return null

                    return (
                      <div key={item.productId} className="p-4 bg-white/5 rounded-xl">
                        <p className="text-white font-medium mb-2">{product.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.bestFor.map((reason, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Advice Results */}
        {activeView === 'advice' && advice && (
          <motion.div
            key="advice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Top Pick */}
            {topPickProduct && (
              <div className="p-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-2xl">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <Target size={28} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-amber-400 text-sm font-medium">Személyre szabott ajánlás</p>
                        <span className="px-2 py-0.5 bg-amber-500/30 text-amber-300 text-xs font-bold rounded">
                          {advice.topPick.confidence}% biztos
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-xl">{topPickProduct.name}</h3>
                      <p className="text-gray-300 mt-2">{advice.topPick.reasoning}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(topPickProduct)}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Megveszem
                  </button>
                </div>
              </div>
            )}

            {/* Alternatives */}
            {advice.alternatives && advice.alternatives.length > 0 && (
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <HelpCircle size={18} />
                  Alternatívák
                </h3>
                <div className="space-y-3">
                  {advice.alternatives.map((alt) => {
                    const product = products.find(p => p.id === alt.productId)
                    if (!product) return null

                    return (
                      <div key={alt.productId} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-400 text-sm">{alt.scenario}</p>
                        </div>
                        <Link
                          href={`/shop/${product.slug || product.id}`}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                        >
                          Megtekintés
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Warnings */}
            {advice.warnings && advice.warnings.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Figyelmeztetések
                </h4>
                <ul className="space-y-1">
                  {advice.warnings.map((warning, idx) => (
                    <li key={idx} className="text-red-300 text-sm flex items-start gap-2">
                      <span className="mt-1">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {advice.tips && advice.tips.length > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                  <Lightbulb size={16} />
                  Hasznos tippek
                </h4>
                <ul className="space-y-1">
                  {advice.tips.map((tip, idx) => (
                    <li key={idx} className="text-blue-300 text-sm flex items-start gap-2">
                      <span className="mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verdict */}
            {advice.verdict && (
              <div className="p-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-2xl text-center">
                <p className="text-amber-300 font-medium text-lg">
                  <Sparkles size={18} className="inline mr-2" />
                  {advice.verdict}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh Buttons */}
      {(comparison || advice) && (
        <div className="flex justify-center gap-4">
          <button
            onClick={loadComparison}
            disabled={isComparing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
          >
            <RefreshCw size={14} className={isComparing ? 'animate-spin' : ''} />
            Összehasonlítás újra
          </button>
          <button
            onClick={() => setShowAdviceForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
          >
            <Target size={14} />
            Új tanács kérése
          </button>
        </div>
      )}

      {/* Minimum Products Notice */}
      {products.length < 2 && (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <Scale size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Adj hozzá legalább 2 terméket az összehasonlításhoz</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
          >
            Termékek böngészése
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  )
}
