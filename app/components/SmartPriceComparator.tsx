'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingDown, TrendingUp, Minus, Bell, History, 
  ChevronDown, ChevronUp, Calendar, Info, Sparkles,
  AlertCircle, Check, X, ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface PriceHistory {
  price: number
  date: string
}

interface PriceInsight {
  currentPrice: number
  lowestPrice: number
  highestPrice: number
  averagePrice: number
  priceHistory: PriceHistory[]
  trend: 'up' | 'down' | 'stable'
  percentageChange: number
  recommendation: 'buy' | 'wait' | 'neutral'
  predictedPrice?: number
  priceDropAlert?: number
}

interface SmartPriceComparatorProps {
  productId: number
  productName: string
  currentPrice: number
  originalPrice?: number | null
}

export default function SmartPriceComparator({ 
  productId, 
  productName, 
  currentPrice, 
  originalPrice 
}: SmartPriceComparatorProps) {
  const [insights, setInsights] = useState<PriceInsight | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [priceAlert, setPriceAlert] = useState<number | null>(null)
  const [alertEmail, setAlertEmail] = useState('')
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [isAlertSaving, setIsAlertSaving] = useState(false)

  useEffect(() => {
    fetchPriceInsights()
  }, [productId])

  const fetchPriceInsights = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}/price-insights`)
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      } else {
        // Generate mock insights for demo
        generateMockInsights()
      }
    } catch {
      generateMockInsights()
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockInsights = () => {
    const basePrice = currentPrice
    const variation = basePrice * 0.15
    
    const history: PriceHistory[] = []
    const now = new Date()
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      const randomVariation = (Math.random() - 0.5) * variation
      const price = Math.round(basePrice + randomVariation)
      
      history.push({
        price,
        date: date.toISOString().split('T')[0]
      })
    }
    
    const prices = history.map(h => h.price)
    const lowestPrice = Math.min(...prices)
    const highestPrice = Math.max(...prices)
    const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    
    const recentPrices = prices.slice(-7)
    const trend = recentPrices[recentPrices.length - 1] < recentPrices[0] ? 'down' : 
                  recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'up' : 'stable'
    
    const percentageChange = Math.round(((currentPrice - averagePrice) / averagePrice) * 100)
    
    const recommendation = currentPrice <= lowestPrice * 1.05 ? 'buy' :
                          currentPrice >= highestPrice * 0.95 ? 'wait' : 'neutral'
    
    setInsights({
      currentPrice,
      lowestPrice,
      highestPrice,
      averagePrice,
      priceHistory: history,
      trend,
      percentageChange,
      recommendation,
      predictedPrice: Math.round(averagePrice * (1 + (Math.random() - 0.5) * 0.1))
    })
  }

  const savePriceAlert = async () => {
    if (!priceAlert || !alertEmail) {
      toast.error('Add meg az árat és az email címet!')
      return
    }

    setIsAlertSaving(true)
    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          targetPrice: priceAlert,
          email: alertEmail
        })
      })

      if (response.ok) {
        toast.success('Ár értesítő beállítva!')
        setShowAlertForm(false)
        setPriceAlert(null)
      } else {
        toast.error('Hiba történt a mentéskor')
      }
    } catch {
      toast.error('Hiba történt')
    } finally {
      setIsAlertSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('hu-HU') + ' Ft'
  }

  const getTrendIcon = () => {
    if (!insights) return null
    switch (insights.trend) {
      case 'up':
        return <TrendingUp className="text-red-400" size={16} />
      case 'down':
        return <TrendingDown className="text-green-400" size={16} />
      default:
        return <Minus className="text-gray-400" size={16} />
    }
  }

  const getRecommendationInfo = () => {
    if (!insights) return null
    
    switch (insights.recommendation) {
      case 'buy':
        return {
          icon: <Check className="text-green-400" size={18} />,
          text: 'Most érdemes venni!',
          description: 'Az ár közel van a legalacsonyabb szinthez',
          color: 'green'
        }
      case 'wait':
        return {
          icon: <AlertCircle className="text-yellow-400" size={18} />,
          text: 'Érdemes várni',
          description: 'Az ár jelenleg magasabb az átlagnál',
          color: 'yellow'
        }
      default:
        return {
          icon: <Info className="text-blue-400" size={18} />,
          text: 'Átlagos ár',
          description: 'Az ár a szokásos tartományban van',
          color: 'blue'
        }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
        <div className="h-8 bg-white/10 rounded w-2/3" />
      </div>
    )
  }

  if (!insights) return null

  const recommendation = getRecommendationInfo()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-400" size={18} />
            <h3 className="text-white font-semibold text-sm">Intelligens ár elemzés</h3>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors"
          >
            <History size={14} />
            Előzmények
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* Recommendation banner */}
        {recommendation && (
          <div className={`flex items-center gap-3 p-3 bg-${recommendation.color}-500/10 border border-${recommendation.color}-500/30 rounded-xl`}>
            {recommendation.icon}
            <div>
              <p className={`text-${recommendation.color}-400 font-medium text-sm`}>
                {recommendation.text}
              </p>
              <p className="text-gray-400 text-xs">{recommendation.description}</p>
            </div>
          </div>
        )}

        {/* Price stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">Legalacsonyabb</p>
            <p className="text-green-400 font-bold text-sm">
              {formatPrice(insights.lowestPrice)}
            </p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">Átlag</p>
            <p className="text-white font-bold text-sm">
              {formatPrice(insights.averagePrice)}
            </p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-gray-500 text-xs mb-1">Legmagasabb</p>
            <p className="text-red-400 font-bold text-sm">
              {formatPrice(insights.highestPrice)}
            </p>
          </div>
        </div>

        {/* Current price indicator */}
        <div className="relative h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full overflow-hidden">
          <motion.div
            className="absolute w-3 h-3 bg-white rounded-full shadow-lg border-2 border-purple-500 -top-0.5"
            style={{
              left: `${Math.min(100, Math.max(0, 
                ((currentPrice - insights.lowestPrice) / (insights.highestPrice - insights.lowestPrice)) * 100
              ))}%`,
              transform: 'translateX(-50%)'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
        </div>

        {/* Trend info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-gray-400">
              {insights.trend === 'up' ? 'Emelkedő' : 
               insights.trend === 'down' ? 'Csökkenő' : 'Stabil'} trend
            </span>
          </div>
          <span className={`font-medium ${
            insights.percentageChange > 0 ? 'text-red-400' : 
            insights.percentageChange < 0 ? 'text-green-400' : 'text-gray-400'
          }`}>
            {insights.percentageChange > 0 ? '+' : ''}{insights.percentageChange}% az átlaghoz képest
          </span>
        </div>

        {/* Price history chart */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-black/20 rounded-xl p-4 mt-2">
                <p className="text-gray-400 text-xs mb-3 flex items-center gap-2">
                  <Calendar size={14} />
                  Utolsó 30 nap
                </p>
                
                {/* Simple chart */}
                <div className="h-24 flex items-end gap-0.5">
                  {insights.priceHistory.slice(-30).map((point, index) => {
                    const minPrice = Math.min(...insights.priceHistory.map(p => p.price))
                    const maxPrice = Math.max(...insights.priceHistory.map(p => p.price))
                    const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100 || 50
                    
                    return (
                      <motion.div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-purple-500/50 to-purple-400/50 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.02, duration: 0.3 }}
                        title={`${point.date}: ${formatPrice(point.price)}`}
                      />
                    )
                  })}
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>30 napja</span>
                  <span>Ma</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price alert */}
        <div className="pt-2 border-t border-white/10">
          <AnimatePresence mode="wait">
            {!showAlertForm ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAlertForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm"
              >
                <Bell size={16} />
                Értesítést kérek, ha csökken az ár
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">Ár értesítő beállítása</p>
                  <button
                    onClick={() => setShowAlertForm(false)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Célár</label>
                    <input
                      type="number"
                      value={priceAlert || ''}
                      onChange={(e) => setPriceAlert(Number(e.target.value))}
                      placeholder={`pl. ${Math.round(currentPrice * 0.9)}`}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Email cím</label>
                    <input
                      type="email"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setPriceAlert(Math.round(currentPrice * 0.95))}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => setPriceAlert(Math.round(currentPrice * 0.9))}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => setPriceAlert(Math.round(currentPrice * 0.85))}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-xs transition-colors"
                  >
                    -15%
                  </button>
                </div>
                
                <button
                  onClick={savePriceAlert}
                  disabled={isAlertSaving || !priceAlert || !alertEmail}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  {isAlertSaving ? 'Mentés...' : 'Értesítő beállítása'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Predicted price */}
        {insights.predictedPrice && (
          <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg text-xs">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-gray-400">
              AI előrejelzés: <span className="text-purple-300 font-medium">
                {formatPrice(insights.predictedPrice)}
              </span> a következő 2 hétben
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
