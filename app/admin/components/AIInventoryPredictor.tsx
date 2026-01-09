'use client'

import { useState, useTransition } from 'react'
import { Package, Sparkles, Loader2, TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, Calendar, BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { predictInventory } from '@/lib/actions/ai-actions'
import { getImageUrl } from '@/lib/image'
import { toast } from 'sonner'

interface InventoryPrediction {
  productId: number
  productName: string
  image: string | null
  currentStock: number
  predictedDemand: number
  daysUntilStockout: number | null
  recommendedReorder: number
  trend: 'increasing' | 'stable' | 'decreasing'
  confidence: number
  seasonalFactor?: string
}

interface InventoryResult {
  predictions: InventoryPrediction[]
  criticalItems: number
  lowStockItems: number
  overstockItems: number
  totalReorderValue: number
  insights: string[]
  seasonalTrends: Array<{
    category: string
    trend: string
    recommendation: string
  }>
}

export default function AIInventoryPredictor() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [result, setResult] = useState<InventoryResult | null>(null)
  const [isAnalyzing, startAnalyzing] = useTransition()
  const [filter, setFilter] = useState<'all' | 'critical' | 'low' | 'overstock'>('all')

  const handleAnalyze = () => {
    startAnalyzing(async () => {
      const res = await predictInventory(timeframe)
      if (res.success && res.result) {
        setResult(res.result)
      } else {
        toast.error(res.error || 'Hiba az elemzés során')
      }
    })
  }

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return <BarChart3 className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStockStatus = (prediction: InventoryPrediction) => {
    if (prediction.daysUntilStockout !== null && prediction.daysUntilStockout <= 7) {
      return { label: 'Kritikus', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    }
    if (prediction.daysUntilStockout !== null && prediction.daysUntilStockout <= 14) {
      return { label: 'Alacsony', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    }
    if (prediction.currentStock > prediction.predictedDemand * 3) {
      return { label: 'Túlkészlet', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    }
    return { label: 'Rendben', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
  }

  const filteredPredictions = result?.predictions.filter(p => {
    if (filter === 'all') return true
    const status = getStockStatus(p)
    if (filter === 'critical') return status.label === 'Kritikus'
    if (filter === 'low') return status.label === 'Alacsony'
    if (filter === 'overstock') return status.label === 'Túlkészlet'
    return true
  }) || []

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {[
            { id: '7d', label: '7 nap' },
            { id: '30d', label: '30 nap' },
            { id: '90d', label: '90 nap' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as typeof timeframe)}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeframe === t.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/25 group transition-all"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
              </div>
              <span>AI elemez...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Készlet előrejelzés
            </>
          )}
        </motion.button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-2xl font-bold text-red-400">{result.criticalItems}</span>
                </div>
                <div className="text-sm text-white/60">Kritikus készlet</div>
              </div>

              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-yellow-400">{result.lowStockItems}</span>
                </div>
                <div className="text-sm text-white/60">Alacsony készlet</div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <span className="text-2xl font-bold text-blue-400">{result.overstockItems}</span>
                </div>
                <div className="text-sm text-white/60">Túlkészletezett</div>
              </div>

              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingCart className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-bold text-green-400">
                    {result.totalReorderValue.toLocaleString('hu-HU')} Ft
                  </span>
                </div>
                <div className="text-sm text-white/60">Javasolt rendelés</div>
              </div>
            </div>

            {/* Insights */}
            {result.insights.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/30">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI Meglátások
                </h3>
                <ul className="space-y-2">
                  {result.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                      <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Seasonal Trends */}
            {result.seasonalTrends.length > 0 && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Szezonális trendek
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {result.seasonalTrends.map((trend, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg">
                      <div className="font-medium text-white text-sm mb-1">{trend.category}</div>
                      <div className="text-xs text-white/60 mb-2">{trend.trend}</div>
                      <div className="text-xs text-purple-400">{trend.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
              {[
                { id: 'all', label: 'Mind', count: result.predictions.length },
                { id: 'critical', label: 'Kritikus', count: result.criticalItems },
                { id: 'low', label: 'Alacsony', count: result.lowStockItems },
                { id: 'overstock', label: 'Túlkészlet', count: result.overstockItems }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as typeof filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filter === f.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {/* Predictions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-white/50 border-b border-white/10">
                    <th className="pb-3 font-medium">Termék</th>
                    <th className="pb-3 font-medium">Készlet</th>
                    <th className="pb-3 font-medium">Kereslet</th>
                    <th className="pb-3 font-medium">Trend</th>
                    <th className="pb-3 font-medium">Státusz</th>
                    <th className="pb-3 font-medium">Rendelés</th>
                    <th className="pb-3 font-medium">Elfogyás</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPredictions.map((prediction) => {
                    const status = getStockStatus(prediction)
                    return (
                      <tr key={prediction.productId} className="hover:bg-white/5">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-white/5">
                              {prediction.image && (
                                <Image
                                  src={getImageUrl(prediction.image) || ''}
                                  alt={prediction.productName}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/admin/edit-product/${prediction.productId}`}
                                className="text-sm text-white hover:text-indigo-400"
                              >
                                {prediction.productName}
                              </Link>
                              {prediction.seasonalFactor && (
                                <div className="text-xs text-white/40">{prediction.seasonalFactor}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-white font-medium">{prediction.currentStock}</span>
                          <span className="text-white/40 text-sm"> db</span>
                        </td>
                        <td className="py-3">
                          <span className="text-white/80">{prediction.predictedDemand}</span>
                          <span className="text-white/40 text-sm"> db/{timeframe}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            {getTrendIcon(prediction.trend)}
                            <span className="text-sm text-white/60 capitalize">
                              {prediction.trend === 'increasing' ? 'Növekvő' : 
                               prediction.trend === 'decreasing' ? 'Csökkenő' : 'Stabil'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3">
                          {prediction.recommendedReorder > 0 ? (
                            <span className="text-indigo-400 font-medium">
                              +{prediction.recommendedReorder} db
                            </span>
                          ) : (
                            <span className="text-white/40">-</span>
                          )}
                        </td>
                        <td className="py-3">
                          {prediction.daysUntilStockout !== null ? (
                            <span className={`font-medium ${
                              prediction.daysUntilStockout <= 7 ? 'text-red-400' :
                              prediction.daysUntilStockout <= 14 ? 'text-yellow-400' :
                              'text-white/60'
                            }`}>
                              {prediction.daysUntilStockout} nap
                            </span>
                          ) : (
                            <span className="text-white/40">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredPredictions.length === 0 && (
              <div className="text-center py-8 text-white/50">
                Nincs megjeleníthető előrejelzés ezzel a szűrővel
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!result && !isAnalyzing && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white/80 mb-2">Készlet Előrejelzés</h3>
          <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
            Az AI elemzi a korábbi rendeléseket és trendeket, majd előrejelzi a várható 
            keresletet és javaslatot tesz a készletfeltöltésre.
          </p>
          <button
            onClick={handleAnalyze}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Elemzés indítása
          </button>
        </div>
      )}
    </div>
  )
}
