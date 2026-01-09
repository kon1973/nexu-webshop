'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Check, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzePriceOptimization, applyPriceChange } from '@/lib/actions/ai-actions'
import { toast } from 'sonner'

interface PriceOptimization {
  productId: number
  productName: string
  currentPrice: number
  suggestedPrice: number
  priceChange: number
  changePercent: number
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
  expectedImpact: string
}

export default function AIPriceOptimizer() {
  const [optimizations, setOptimizations] = useState<PriceOptimization[]>([])
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [appliedPrices, setAppliedPrices] = useState<Set<number>>(new Set())

  const categories = [
    'Telefonok',
    'Laptopok',
    'Táblagépek',
    'Fülhallgatók',
    'Kiegészítők',
    'Gaming',
    'Okosórák'
  ]

  const analyzeOptimizations = async () => {
    setIsLoading(true)
    try {
      const result = await analyzePriceOptimization(
        selectedCategory ? { category: selectedCategory } : undefined
      )
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      setOptimizations(result.optimizations || [])
      setSummary(result.summary || '')
    } catch (error) {
      toast.error('Hiba történt az elemzés során')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyPrice = async (optimization: PriceOptimization) => {
    try {
      const result = await applyPriceChange(optimization.productId, optimization.suggestedPrice)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`${optimization.productName} ára frissítve: ${optimization.suggestedPrice.toLocaleString('hu-HU')} Ft`)
      setAppliedPrices(prev => new Set([...prev, optimization.productId]))
    } catch {
      toast.error('Nem sikerült az ár frissítése')
    }
  }

  const confidenceColors = {
    high: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const confidenceLabels = {
    high: 'Magas',
    medium: 'Közepes',
    low: 'Alacsony'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-green-400" />
            AI Ároptimalizáló
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            AI-alapú árjavaslatok az eladások és készlet alapján
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
        >
          <option value="">Minden kategória</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={analyzeOptimizations}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          Elemzés indítása
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-xl p-4"
        >
          <h3 className="text-green-400 font-medium mb-2 flex items-center gap-2">
            <Sparkles size={16} />
            AI Összefoglaló
          </h3>
          <p className="text-gray-300 text-sm">{summary}</p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Árak elemzése folyamatban...</p>
            <p className="text-gray-500 text-sm mt-1">AI értékeli az eladási adatokat</p>
          </motion.div>
        ) : optimizations.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {optimizations.map((opt, index) => (
              <motion.div
                key={opt.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-[#121212] border rounded-xl p-4 ${
                  appliedPrices.has(opt.productId) 
                    ? 'border-green-500/50' 
                    : 'border-white/10 hover:border-white/20'
                } transition-colors`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{opt.productName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${confidenceColors[opt.confidence]}`}>
                        {confidenceLabels[opt.confidence]} bizalom
                      </span>
                      {appliedPrices.has(opt.productId) && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
                          <Check size={12} />
                          Alkalmazva
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-gray-400">
                        <span className="text-sm">Jelenlegi:</span>
                        <span className="text-white font-bold ml-2">
                          {opt.currentPrice.toLocaleString('hu-HU')} Ft
                        </span>
                      </div>
                      <ArrowRight className="text-gray-500" size={16} />
                      <div className="text-gray-400">
                        <span className="text-sm">Javasolt:</span>
                        <span className={`font-bold ml-2 ${opt.priceChange > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                          {opt.suggestedPrice.toLocaleString('hu-HU')} Ft
                        </span>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-sm ${
                        opt.priceChange > 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {opt.priceChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {opt.priceChange > 0 ? '+' : ''}{opt.changePercent}%
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-2">
                      <span className="text-gray-500">Indoklás:</span> {opt.reasoning}
                    </p>
                    <p className="text-gray-400 text-sm">
                      <span className="text-gray-500">Várható hatás:</span> {opt.expectedImpact}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplyPrice(opt)}
                    disabled={appliedPrices.has(opt.productId)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      appliedPrices.has(opt.productId)
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {appliedPrices.has(opt.productId) ? (
                      <span className="flex items-center gap-1">
                        <Check size={14} />
                        Kész
                      </span>
                    ) : (
                      'Alkalmaz'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
            <p>Kattints az &quot;Elemzés indítása&quot; gombra az árjavaslatok generálásához</p>
          </div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="text-yellow-400 font-medium mb-1">Fontos tudnivalók</p>
            <ul className="text-gray-400 space-y-1">
              <li>• Az AI az elmúlt 30 nap eladási adatait elemzi</li>
              <li>• A javaslatok a készletszint és értékelések alapján készülnek</li>
              <li>• Mindig ellenőrizd a javaslatokat alkalmazás előtt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
