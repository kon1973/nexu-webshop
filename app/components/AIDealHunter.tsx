'use client'

import { useState, useTransition, useEffect } from 'react'
import { Zap, Tag, Clock, TrendingDown, Sparkles, ShoppingCart, Bell, BellRing, ArrowRight, Loader2, Percent, Star, X, Check, RefreshCw, Filter, Eye, EyeOff, Target, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getAIDealAnalysis, subscribeToDeals } from '@/lib/actions/user-actions'
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface Deal {
  productId: number
  name: string
  slug?: string | null
  price: number
  originalPrice: number
  discount: number
  image: string | null
  category?: string | null
  rating?: number
  stock?: number
  dealScore: number
  dealType: 'flash' | 'clearance' | 'seasonal' | 'bundle' | 'new'
  expiresAt?: string
  aiVerdict: string
  buyingAdvice: 'buy-now' | 'wait' | 'skip'
}

interface DealAnalysis {
  topDeals: Deal[]
  flashDeals: Deal[]
  clearanceDeals: Deal[]
  pricePredictions: Array<{
    productId: number
    name: string
    currentPrice: number
    predictedPrice: number
    predictedDate: string
    confidence: number
    recommendation: string
  }>
  aiInsights: string[]
  bestTimeToShop: string
}

interface WatchlistItem {
  productId: number
  name: string
  image: string | null
  targetPrice: number
  currentPrice: number
  addedAt: number
  notifyBelow?: number
}

const DEAL_TYPES = [
  { id: 'all', label: 'Összes', icon: Tag },
  { id: 'flash', label: 'Flash', icon: Zap },
  { id: 'clearance', label: 'Leárazás', icon: TrendingDown },
  { id: 'bundle', label: 'Csomag', icon: Percent }
]

const CATEGORIES = [
  'Összes kategória',
  'Telefonok',
  'Laptopok',
  'TV & Audio',
  'Játékok',
  'Okosotthon',
  'Kiegészítők'
]

const WATCHLIST_KEY = 'nexu-deal-watchlist'

export default function AIDealHunter() {
  const { addToCart } = useCart()
  const [isAnalyzing, startAnalysis] = useTransition()
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('Összes kategória')
  const [selectedType, setSelectedType] = useState('all')
  const [showPredictions, setShowPredictions] = useState(false)
  const [subscribedDeals, setSubscribedDeals] = useState<Set<number>>(new Set())
  const [maxBudget, setMaxBudget] = useState('')
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [priceAlertInput, setPriceAlertInput] = useState<{ productId: number; price: string } | null>(null)
  const [showInsights, setShowInsights] = useState(true)

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(WATCHLIST_KEY)
    if (saved) setWatchlist(JSON.parse(saved))
  }, [])

  // Add to watchlist
  const addToWatchlist = (deal: Deal, targetPrice?: number) => {
    const item: WatchlistItem = {
      productId: deal.productId,
      name: deal.name,
      image: deal.image,
      targetPrice: targetPrice || Math.round(deal.price * 0.9),
      currentPrice: deal.price,
      addedAt: Date.now(),
      notifyBelow: targetPrice
    }
    const newWatchlist = [item, ...watchlist.filter(w => w.productId !== deal.productId)].slice(0, 20)
    setWatchlist(newWatchlist)
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist))
    setPriceAlertInput(null)
    toast.success('Termék hozzáadva a figyelőlistához!')
  }

  // Remove from watchlist
  const removeFromWatchlist = (productId: number) => {
    const newWatchlist = watchlist.filter(w => w.productId !== productId)
    setWatchlist(newWatchlist)
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist))
    toast.success('Eltávolítva a figyelőlistáról')
  }

  // Check if in watchlist
  const isInWatchlist = (productId: number) => watchlist.some(w => w.productId === productId)

  const handleAnalyze = () => {
    startAnalysis(async () => {
      const result = await getAIDealAnalysis({
        category: selectedCategory !== 'Összes kategória' ? selectedCategory : undefined,
        maxBudget: maxBudget ? parseInt(maxBudget) : undefined,
        dealType: selectedType !== 'all' ? selectedType : undefined
      })
      if (result.success && result.analysis) {
        setAnalysis(result.analysis)
      } else {
        toast.error(result.error || 'Hiba történt az elemzés során')
      }
    })
  }

  const handleSubscribe = async (deal: Deal) => {
    const result = await subscribeToDeals(deal.productId)
    if (result.success) {
      setSubscribedDeals(prev => new Set(prev).add(deal.productId))
      toast.success('Értesítünk, ha tovább csökken az ár!')
    }
  }

  const handleAddToCart = (deal: Deal) => {
    addToCart({
      id: deal.productId,
      name: deal.name,
      price: deal.price,
      originalPrice: deal.originalPrice,
      image: deal.image || '',
      category: deal.category || ''
    })
    toast.success(`${deal.name} hozzáadva a kosárhoz!`)
  }

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  const getBuyingAdviceColor = (advice: string) => {
    switch (advice) {
      case 'buy-now': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'wait': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'skip': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-white/10 border-white/10'
    }
  }

  const getBuyingAdviceText = (advice: string) => {
    switch (advice) {
      case 'buy-now': return 'Vedd meg most!'
      case 'wait': return 'Várj még!'
      case 'skip': return 'Hagyd ki'
      default: return ''
    }
  }

  const getDealTypeIcon = (type: string) => {
    switch (type) {
      case 'flash': return <Zap size={14} className="text-yellow-400" />
      case 'clearance': return <TrendingDown size={14} className="text-red-400" />
      case 'bundle': return <Percent size={14} className="text-purple-400" />
      case 'seasonal': return <Tag size={14} className="text-blue-400" />
      default: return <Tag size={14} className="text-gray-400" />
    }
  }

  const filteredDeals = analysis ? [
    ...analysis.topDeals,
    ...analysis.flashDeals,
    ...analysis.clearanceDeals
  ].filter((deal, idx, arr) => 
    arr.findIndex(d => d.productId === deal.productId) === idx &&
    (selectedType === 'all' || deal.dealType === selectedType)
  ).sort((a, b) => b.dealScore - a.dealScore) : []

  return (
    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/25">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Akcióvadász
                <Sparkles size={20} className="text-orange-400" />
              </h2>
              <p className="text-gray-400">Találd meg a legjobb ajánlatokat mesterséges intelligenciával</p>
            </div>
          </div>
          <div className="flex gap-2">
            {watchlist.length > 0 && (
              <button
                onClick={() => setShowWatchlist(!showWatchlist)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showWatchlist ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Eye size={18} />
                <span className="hidden sm:inline">Figyelőlista</span>
                <span className="text-xs bg-white/20 px-1.5 rounded">{watchlist.length}</span>
              </button>
            )}
            {analysis && (
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showPredictions ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Clock size={18} />
                <span className="hidden sm:inline">Ár előrejelzés</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Watchlist Panel */}
      <AnimatePresence>
        {showWatchlist && watchlist.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 bg-purple-900/20 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Eye size={18} className="text-purple-400" />
                  Figyelőlista ({watchlist.length})
                </h3>
                <p className="text-gray-500 text-sm">Értesítünk, ha csökken az ár</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {watchlist.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                      {item.image ? (
                        <Image
                          src={getImageUrl(item.image) || '/placeholder.png'}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag size={20} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="text-gray-400">Jelenlegi:</span>
                        <span className="text-white">{formatPrice(item.currentPrice)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Cél:</span>
                        <span className="text-green-400">{formatPrice(item.targetPrice)}</span>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(item.productId)}
                        className="text-xs text-gray-400 hover:text-red-400 mt-1 transition-colors"
                      >
                        Eltávolítás
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="p-4 border-b border-white/10 bg-black/20">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
              ))}
            </select>
          </div>

          {/* Deal Types */}
          <div className="flex gap-2">
            {DEAL_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedType === type.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <type.icon size={14} />
                {type.label}
              </button>
            ))}
          </div>

          {/* Budget */}
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="Max költségkeret"
            className="w-40 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />

          {/* Search Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 disabled:opacity-50 text-white font-semibold rounded-lg transition-all ml-auto group shadow-lg shadow-orange-500/25"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                </div>
                <span>AI keres...</span>
              </div>
            ) : (
              <>
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                Akciók keresése
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!analysis ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={48} className="mx-auto text-orange-400/50 mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Fedezd fel a legjobb ajánlatokat!</h3>
            <p className="text-gray-400 mb-6">
              Az AI elemzi az árakat, akciókat és előrejelzést ad a legjobb vásárlási időpontról.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/30 group"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                  </div>
                  <span>AI elemzés folyamatban...</span>
                </div>
              ) : (
                <>
                  <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                  Akcióvadászat indítása
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Price Predictions View */}
            {showPredictions ? (
              <motion.div
                key="predictions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock size={20} className="text-orange-400" />
                    Ár előrejelzések
                  </h3>
                  <button onClick={() => setShowPredictions(false)} className="text-gray-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                {analysis.pricePredictions.map((pred, idx) => (
                  <div key={pred.productId} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{pred.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        pred.predictedPrice < pred.currentPrice
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {pred.predictedPrice < pred.currentPrice ? '↓' : '↑'} 
                        {Math.abs(((pred.predictedPrice - pred.currentPrice) / pred.currentPrice) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Jelenlegi ár</p>
                        <p className="text-white font-semibold">{formatPrice(pred.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Előrejelzett ár</p>
                        <p className={`font-semibold ${pred.predictedPrice < pred.currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPrice(pred.predictedPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Mikor?</p>
                        <p className="text-white font-semibold">{pred.predictedDate}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{pred.confidence}% biztos</span>
                      </div>
                      <p className="text-sm text-gray-300 italic">{pred.recommendation}</p>
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <p className="text-orange-300 text-sm">
                    <Clock size={14} className="inline mr-2" />
                    <strong>Legjobb vásárlási időpont:</strong> {analysis.bestTimeToShop}
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Deals View */
              <motion.div
                key="deals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* AI Insights */}
                {analysis.aiInsights && analysis.aiInsights.length > 0 && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <h4 className="text-orange-300 font-medium mb-2 flex items-center gap-2">
                      <Sparkles size={16} />
                      AI Elemzés
                    </h4>
                    <ul className="space-y-1">
                      {analysis.aiInsights.map((insight, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-orange-400 mt-1">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Deals Grid */}
                <div className="grid gap-4">
                  {filteredDeals.map((deal, idx) => (
                    <motion.div
                      key={deal.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className={`flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                        deal.dealScore >= 90
                          ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 hover:border-green-500/50 shadow-lg shadow-green-500/10'
                          : deal.dealScore >= 70
                            ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30 hover:border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="w-full md:w-28 aspect-square relative rounded-lg overflow-hidden bg-white/5 flex-shrink-0 group-hover:scale-105 transition-transform">
                        {deal.image ? (
                          <Image
                            src={getImageUrl(deal.image) || '/placeholder.png'}
                            alt={deal.name}
                            fill
                            className="object-contain p-2"
                            sizes="112px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tag size={28} className="text-gray-600" />
                          </div>
                        )}
                        {/* Discount Badge */}
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded shadow-lg"
                        >
                          -{deal.discount}%
                        </motion.div>
                        {/* Deal Type */}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded flex items-center gap-1">
                          {getDealTypeIcon(deal.dealType)}
                        </div>
                      </div>

                      {/* Deal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="text-white font-semibold line-clamp-1">{deal.name}</h4>
                            <p className="text-gray-500 text-sm">{deal.category}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-white font-bold text-lg">{formatPrice(deal.price)}</p>
                            <p className="text-gray-500 text-sm line-through">{formatPrice(deal.originalPrice)}</p>
                          </div>
                        </div>

                        {/* AI Verdict */}
                        <p className="text-sm text-gray-300 mb-3">{deal.aiVerdict}</p>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          {/* Deal Score */}
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  deal.dealScore >= 90 ? 'bg-green-500' :
                                  deal.dealScore >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${deal.dealScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{deal.dealScore}/100</span>
                          </div>

                          {/* Rating */}
                          {deal.rating && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star size={12} fill="currentColor" />
                              <span className="text-xs">{deal.rating.toFixed(1)}</span>
                            </div>
                          )}

                          {/* Stock */}
                          {deal.stock !== undefined && deal.stock < 10 && (
                            <span className="text-xs text-red-400">
                              Csak {deal.stock} db!
                            </span>
                          )}

                          {/* Buying Advice */}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getBuyingAdviceColor(deal.buyingAdvice)}`}>
                            {getBuyingAdviceText(deal.buyingAdvice)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href={`/shop/${deal.slug || deal.productId}`}
                            className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-center rounded-lg text-sm transition-colors"
                          >
                            Részletek
                          </Link>
                          {/* Watchlist Button */}
                          {priceAlertInput?.productId === deal.productId ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={priceAlertInput.price}
                                onChange={(e) => setPriceAlertInput({ ...priceAlertInput, price: e.target.value })}
                                placeholder="Cél ár"
                                className="w-24 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                              />
                              <button
                                onClick={() => addToWatchlist(deal, parseInt(priceAlertInput.price) || undefined)}
                                className="p-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setPriceAlertInput(null)}
                                className="p-2 bg-white/10 hover:bg-white/20 text-gray-400 rounded-lg"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => isInWatchlist(deal.productId) 
                                ? removeFromWatchlist(deal.productId) 
                                : setPriceAlertInput({ productId: deal.productId, price: String(Math.round(deal.price * 0.9)) })
                              }
                              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isInWatchlist(deal.productId)
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
                              }`}
                              title={isInWatchlist(deal.productId) ? 'Eltávolítás' : 'Figyelőlistára'}
                            >
                              {isInWatchlist(deal.productId) ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                          {deal.buyingAdvice !== 'buy-now' && !subscribedDeals.has(deal.productId) ? (
                            <button
                              onClick={() => handleSubscribe(deal)}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                            >
                              <Bell size={14} />
                            </button>
                          ) : subscribedDeals.has(deal.productId) ? (
                            <button disabled className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                              <BellRing size={14} />
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleAddToCart(deal)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                              deal.buyingAdvice === 'buy-now'
                                ? 'bg-green-500 hover:bg-green-400 text-white'
                                : 'bg-orange-500 hover:bg-orange-400 text-white'
                            }`}
                          >
                            <ShoppingCart size={14} />
                            Kosárba
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredDeals.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Nincs találat a megadott szűrőkkel
                  </div>
                )}

                {/* Refresh Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  >
                    <RefreshCw size={18} className={isAnalyzing ? 'animate-spin' : ''} />
                    Frissítés
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
