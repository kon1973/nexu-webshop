'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Target,
  Lightbulb,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface ProductAnalysis {
  productId: string
  productName: string
  summary: string
  metrics: {
    salesTrend: 'up' | 'down' | 'stable'
    salesChange: number
    avgRating: number
    reviewCount: number
    stockLevel: 'good' | 'low' | 'critical'
    currentStock: number
    conversionRate: number
  }
  insights: string[]
  recommendations: string[]
  competitorComparison?: string
  priceAnalysis?: {
    currentPrice: number
    suggestedPrice: number
    reason: string
  }
}

export default function AIProductAnalyzer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)

  const analyzeProduct = async () => {
    if (!searchQuery.trim()) {
      toast.error('Add meg a termék nevét vagy ID-ját!')
      return
    }

    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const response = await fetch('/api/admin/ai-product-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setAnalysis(data)
      toast.success('Elemzés kész!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Hiba történt az elemzés során')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-400" size={20} />
      case 'down':
        return <TrendingDown className="text-red-400" size={20} />
      default:
        return <BarChart3 className="text-yellow-400" size={20} />
    }
  }

  const getStockStatus = (level: 'good' | 'low' | 'critical') => {
    switch (level) {
      case 'good':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Megfelelő' }
      case 'low':
        return { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Alacsony' }
      case 'critical':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Kritikus' }
    }
  }

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
          <BarChart3 className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Termék Elemző</h2>
          <p className="text-gray-400 text-sm">Részletes termék teljesítmény elemzés</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyzeProduct()}
            placeholder="Termék neve vagy ID-ja..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          onClick={analyzeProduct}
          disabled={isAnalyzing}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Elemzés...
            </>
          ) : (
            <>
              <BarChart3 size={18} />
              Elemzés
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <Loader2 className="animate-spin text-blue-400 mx-auto mb-3" size={48} />
              <p className="text-gray-400">AI elemzi a terméket...</p>
              <p className="text-gray-500 text-sm mt-1">Ez néhány másodpercet vehet igénybe</p>
            </div>
          </motion.div>
        ) : analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{analysis.productName}</h3>
                <p className="text-gray-400 text-sm">ID: {analysis.productId}</p>
              </div>
              <button
                onClick={analyzeProduct}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">{analysis.summary}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getTrendIcon(analysis.metrics.salesTrend)}
                  <span className="text-gray-400 text-sm">Értékesítés</span>
                </div>
                <p className={`text-2xl font-bold ${
                  analysis.metrics.salesTrend === 'up' ? 'text-green-400' :
                  analysis.metrics.salesTrend === 'down' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {analysis.metrics.salesChange > 0 ? '+' : ''}{analysis.metrics.salesChange}%
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-400" size={20} />
                  <span className="text-gray-400 text-sm">Értékelés</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {analysis.metrics.avgRating.toFixed(1)}
                  <span className="text-gray-500 text-sm ml-1">({analysis.metrics.reviewCount})</span>
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                {(() => {
                  const status = getStockStatus(analysis.metrics.stockLevel)
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <status.icon className={status.color} size={20} />
                        <span className="text-gray-400 text-sm">Készlet</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {analysis.metrics.currentStock}
                        <span className={`text-sm ml-2 px-2 py-0.5 rounded ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </p>
                    </>
                  )
                })()}
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-purple-400" size={20} />
                  <span className="text-gray-400 text-sm">Konverzió</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {analysis.metrics.conversionRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Price Analysis */}
            {analysis.priceAnalysis && (
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-400" />
                  Ár elemzés
                </h4>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Jelenlegi ár</p>
                    <p className="text-xl font-bold text-white">
                      {analysis.priceAnalysis.currentPrice.toLocaleString('hu-HU')} Ft
                    </p>
                  </div>
                  <div className="text-2xl text-gray-600">→</div>
                  <div>
                    <p className="text-gray-400 text-sm">Javasolt ár</p>
                    <p className="text-xl font-bold text-green-400">
                      {analysis.priceAnalysis.suggestedPrice.toLocaleString('hu-HU')} Ft
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-2">{analysis.priceAnalysis.reason}</p>
              </div>
            )}

            {/* Insights */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-400" />
                Főbb megállapítások
              </h4>
              <ul className="space-y-2">
                {analysis.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-purple-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Target size={18} className="text-purple-400" />
                AI Javaslatok
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitor Comparison */}
            {analysis.competitorComparison && (
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Users size={18} className="text-blue-400" />
                  Piaci összehasonlítás
                </h4>
                <p className="text-gray-300 text-sm">{analysis.competitorComparison}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BarChart3 className="text-gray-600 mx-auto mb-3" size={48} />
            <p className="text-gray-500">
              Keress rá egy termékre a részletes AI elemzéshez
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
