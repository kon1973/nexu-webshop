'use client'

import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp, History, AlertCircle, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PricePoint {
  price: number
  date: Date | string
}

interface PriceHistoryProps {
  currentPrice: number
  originalPrice?: number
  priceHistory?: PricePoint[]
  productId: number
  className?: string
}

export default function PriceHistory({
  currentPrice,
  originalPrice,
  priceHistory = [],
  productId,
  className
}: PriceHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  // Calculate price trend
  const hasHistory = priceHistory.length > 1
  const previousPrice = hasHistory 
    ? priceHistory[priceHistory.length - 2]?.price 
    : originalPrice || currentPrice

  const priceDiff = currentPrice - previousPrice
  const percentChange = previousPrice > 0 
    ? Math.round((priceDiff / previousPrice) * 100) 
    : 0

  // Find lowest price
  const lowestPrice = hasHistory
    ? Math.min(...priceHistory.map(p => p.price))
    : currentPrice

  const isAtLowest = currentPrice <= lowestPrice
  const isOnSale = originalPrice && currentPrice < originalPrice

  // Generate mock price history if not provided
  const displayHistory = priceHistory.length > 0 
    ? priceHistory 
    : generateMockHistory(currentPrice, originalPrice)

  return (
    <div className={cn('bg-[#121212] border border-white/5 rounded-2xl overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            priceDiff < 0 ? 'bg-green-500/10' : priceDiff > 0 ? 'bg-red-500/10' : 'bg-white/5'
          )}>
            {priceDiff < 0 ? (
              <TrendingDown className="text-green-400" size={20} />
            ) : priceDiff > 0 ? (
              <TrendingUp className="text-red-400" size={20} />
            ) : (
              <Minus className="text-gray-400" size={20} />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Árelőzmények</p>
            <p className="text-xs text-gray-500">
              {priceDiff < 0 ? (
                <span className="text-green-400">{Math.abs(percentChange)}% csökkent</span>
              ) : priceDiff > 0 ? (
                <span className="text-red-400">{percentChange}% emelkedett</span>
              ) : (
                'Változatlan ár'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAtLowest && (
            <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400">
              LEGALACSONYABB
            </span>
          )}
          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Price chart visualization */}
              <div className="mb-4 h-24 bg-white/5 rounded-xl p-3 relative">
                <PriceChart data={displayHistory} currentPrice={currentPrice} />
              </div>

              {/* Price statistics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Jelenlegi</p>
                  <p className="text-sm font-bold text-white">
                    {currentPrice.toLocaleString('hu-HU')} Ft
                  </p>
                </div>
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Legalacsonyabb</p>
                  <p className="text-sm font-bold text-green-400">
                    {lowestPrice.toLocaleString('hu-HU')} Ft
                  </p>
                </div>
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Legmagasabb</p>
                  <p className="text-sm font-bold text-red-400">
                    {Math.max(...displayHistory.map(p => p.price)).toLocaleString('hu-HU')} Ft
                  </p>
                </div>
              </div>

              {/* Price history list */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {displayHistory.slice().reverse().map((point, index) => {
                  const prevPoint = displayHistory[displayHistory.length - index - 2]
                  const change = prevPoint ? point.price - prevPoint.price : 0
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <History size={12} className="text-gray-600" />
                        <span className="text-xs text-gray-400">
                          {formatDate(point.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {point.price.toLocaleString('hu-HU')} Ft
                        </span>
                        {change !== 0 && (
                          <span className={cn(
                            'text-[10px]',
                            change < 0 ? 'text-green-400' : 'text-red-400'
                          )}>
                            {change > 0 ? '+' : ''}{change.toLocaleString('hu-HU')}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Price alert */}
              <div className="mt-4 pt-4 border-t border-white/5">
                {!showAlert ? (
                  <button
                    onClick={() => setShowAlert(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <Bell size={14} />
                    Értesítés árcsökkenésről
                  </button>
                ) : (
                  <PriceAlertForm productId={productId} currentPrice={currentPrice} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple price chart visualization
function PriceChart({ 
  data, 
  currentPrice 
}: { 
  data: PricePoint[]
  currentPrice: number
}) {
  const prices = data.map(d => d.price)
  const min = Math.min(...prices) * 0.95
  const max = Math.max(...prices) * 1.05
  const range = max - min

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Gradient fill */}
      <defs>
        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={`
          M 0 ${100 - ((prices[0] - min) / range) * 100}
          ${prices.map((price, i) => {
            const x = (i / (prices.length - 1)) * 100
            const y = 100 - ((price - min) / range) * 100
            return `L ${x} ${y}`
          }).join(' ')}
          L 100 100 L 0 100 Z
        `}
        fill="url(#priceGradient)"
      />

      {/* Line */}
      <path
        d={`
          M 0 ${100 - ((prices[0] - min) / range) * 100}
          ${prices.map((price, i) => {
            const x = (i / (prices.length - 1)) * 100
            const y = 100 - ((price - min) / range) * 100
            return `L ${x} ${y}`
          }).join(' ')}
        `}
        fill="none"
        stroke="rgb(168, 85, 247)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />

      {/* Current price point */}
      <circle
        cx="100"
        cy={100 - ((currentPrice - min) / range) * 100}
        r="4"
        fill="rgb(168, 85, 247)"
        className="animate-pulse"
      />
    </svg>
  )
}

// Price alert form
function PriceAlertForm({ 
  productId, 
  currentPrice 
}: { 
  productId: number
  currentPrice: number 
}) {
  const [email, setEmail] = useState('')
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Implement actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-2">
        <AlertCircle className="text-green-400 mx-auto mb-2" size={24} />
        <p className="text-sm text-green-400">Értesítést beállítottuk!</p>
        <p className="text-xs text-gray-500 mt-1">
          Emailt küldünk, ha az ár {targetPrice.toLocaleString('hu-HU')} Ft alá csökken
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Email cím</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="pelda@email.com"
          required
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          Értesíts ha az ár ez alá csökken
        </label>
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(Number(e.target.value))}
          min={1}
          max={currentPrice - 1}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors"
      >
        {isSubmitting ? 'Beállítás...' : 'Értesítés beállítása'}
      </button>
    </form>
  )
}

// Helper functions
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('hu-HU', { 
    month: 'short', 
    day: 'numeric' 
  })
}

function generateMockHistory(currentPrice: number, originalPrice?: number): PricePoint[] {
  const history: PricePoint[] = []
  const basePrice = originalPrice || currentPrice * 1.1
  const now = new Date()

  // Generate 6 months of mock data
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    
    // Add some variance
    const variance = (Math.random() - 0.5) * 0.15
    let price = Math.round(basePrice * (1 + variance))
    
    // Make current price the last one
    if (i === 0) price = currentPrice

    history.push({ price, date })
  }

  return history
}
