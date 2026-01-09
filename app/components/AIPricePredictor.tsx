'use client'

import { useState, useEffect, useTransition } from 'react'
import { TrendingUp, TrendingDown, Minus, Bell, Sparkles, Loader2, Clock, ShoppingCart, AlertCircle } from 'lucide-react'
import { getPricePrediction } from '@/lib/actions/user-actions'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface AIPricePredictorProps {
  productId: number
  currentPrice: number
  originalPrice?: number | null
}

interface PricePrediction {
  trend: 'up' | 'down' | 'stable'
  confidence: number
  reasoning: string
  recommendation: string
  bestTimeToBy: string
}

export default function AIPricePredictor({ productId, currentPrice, originalPrice }: AIPricePredictorProps) {
  const [prediction, setPrediction] = useState<PricePrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [alertSet, setAlertSet] = useState(false)

  useEffect(() => {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getPricePrediction(productId)
      if (result.success && result.prediction) {
        setPrediction(result.prediction)
      }
      setIsLoading(false)
    })
  }, [productId])

  const handleSetAlert = () => {
    setAlertSet(true)
    toast.success('Ár értesítő beállítva!', {
      description: 'Értesítünk, ha változik az ár.'
    })
  }

  if (isLoading || isPending) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Ár elemzése...</span>
      </div>
    )
  }

  if (!prediction) return null

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      label: 'Várhatóan emelkedik'
    },
    down: {
      icon: TrendingDown,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      label: 'Várhatóan csökken'
    },
    stable: {
      icon: Minus,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      label: 'Stabil ár'
    }
  }

  const config = trendConfig[prediction.trend]
  const TrendIcon = config.icon

  return (
    <div className="space-y-3">
      {/* Compact View */}
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className={`w-full flex items-center justify-between p-3 rounded-xl ${config.bgColor} border ${config.borderColor} hover:bg-opacity-30 transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <TrendIcon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${config.color}`}>{config.label}</span>
              <span className="text-xs text-gray-500">({prediction.confidence}% biztos)</span>
            </div>
            <p className="text-xs text-gray-400">{prediction.reasoning}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <motion.span
            animate={{ rotate: showDetails ? 180 : 0 }}
            className="text-gray-400"
          >
            ▼
          </motion.span>
        </div>
      </motion.button>

      {/* Detailed View */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor} space-y-4`}>
              {/* Recommendation */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-black/20">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white text-sm">Ajánlásunk</h4>
                  <p className="text-gray-300 text-sm">{prediction.recommendation}</p>
                </div>
              </div>

              {/* Best Time */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-black/20">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white text-sm">Legjobb időpont</h4>
                  <p className="text-gray-300 text-sm">{prediction.bestTimeToBy}</p>
                </div>
              </div>

              {/* Confidence Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Előrejelzés megbízhatósága</span>
                  <span>{prediction.confidence}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.confidence}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${
                      prediction.confidence >= 70 ? 'bg-green-500' :
                      prediction.confidence >= 50 ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}
                  />
                </div>
              </div>

              {/* Price Alert Button */}
              <button
                onClick={handleSetAlert}
                disabled={alertSet}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                  alertSet 
                    ? 'bg-green-500/20 text-green-400 cursor-default'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="font-medium">
                  {alertSet ? 'Értesítő beállítva ✓' : 'Értesíts, ha változik az ár'}
                </span>
              </button>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>
                  Az előrejelzés AI algoritmus alapján készül és tájékoztató jellegű. 
                  A tényleges árak eltérhetnek.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
