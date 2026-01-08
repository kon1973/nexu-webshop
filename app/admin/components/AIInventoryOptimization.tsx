'use client'

import { useState } from 'react'
import { Package, AlertTriangle, TrendingDown, RefreshCw, Check, Archive } from 'lucide-react'
import { motion } from 'framer-motion'
import { analyzeInventoryOptimization } from '@/lib/actions/ai-actions'

interface InventoryData {
  summary: {
    totalProducts: number
    healthy: number
    critical: number
    low: number
    overstock: number
    outOfStock: number
  }
  criticalItems: Array<{
    id: number
    name: string
    category: string | null
    stock: number
    monthlySales: number
    daysOfStock: number
  }>
  overstockItems: Array<{
    id: number
    name: string
    category: string | null
    stock: number
    monthlySales: number
    daysOfStock: number
  }>
  aiRecommendations: {
    urgentActions?: string[]
    restockRecommendations?: Array<{ product: string; suggestedQuantity: number; reason: string }>
    overstockSolutions?: Array<{ product: string; suggestion: string }>
    generalInsights?: string[]
  }
}

export default function AIInventoryOptimization() {
  const [data, setData] = useState<InventoryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'critical' | 'overstock'>('critical')

  const loadInventory = async () => {
    setIsLoading(true)
    try {
      const result = await analyzeInventoryOptimization()
      if (result.success) {
        setData(result as InventoryData)
      }
    } catch (error) {
      console.error('Inventory error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'critical': return 'bg-red-500'
      case 'low': return 'bg-orange-500'
      case 'overstock': return 'bg-blue-500'
      case 'outOfStock': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="text-blue-400" />
            Készlet Optimalizálás
          </h2>
          <p className="text-gray-400 text-sm mt-1">AI-alapú készletgazdálkodási javaslatok</p>
        </div>
        <button
          onClick={loadInventory}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Elemzés indítása
        </button>
      </div>

      {!data && !isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Kattints az "Elemzés indítása" gombra a készlet optimalizáláshoz</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <RefreshCw size={48} className="mx-auto text-blue-400 mb-4 animate-spin" />
          <p className="text-gray-400">Készlet elemzése...</p>
        </div>
      )}

      {data && !isLoading && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Összes termék', value: data.summary.totalProducts, color: 'bg-purple-500' },
              { label: 'Egészséges', value: data.summary.healthy, color: 'bg-green-500' },
              { label: 'Kritikus', value: data.summary.critical, color: 'bg-red-500' },
              { label: 'Alacsony', value: data.summary.low, color: 'bg-orange-500' },
              { label: 'Túlkészlet', value: data.summary.overstock, color: 'bg-blue-500' },
              { label: 'Elfogyott', value: data.summary.outOfStock, color: 'bg-gray-500' }
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#121212] border border-white/10 rounded-xl p-4"
              >
                <div className={`w-3 h-3 rounded-full ${item.color} mb-2`} />
                <p className="text-gray-400 text-xs">{item.label}</p>
                <p className="text-2xl font-bold text-white">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Urgent Actions */}
          {data.aiRecommendations?.urgentActions && data.aiRecommendations.urgentActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-500/20 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-400" />
                Sürgős teendők
              </h3>
              <ul className="space-y-2">
                {data.aiRecommendations.urgentActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-red-400 mt-1">!</span>
                    {action}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <AlertTriangle size={16} />
              Kritikus készlet ({data.criticalItems.length})
            </button>
            <button
              onClick={() => setActiveTab('overstock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'overstock'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Archive size={16} />
              Túlkészlet ({data.overstockItems.length})
            </button>
          </div>

          {/* Items Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden"
          >
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-gray-400 text-xs">
                  <th className="px-4 py-3 font-medium">Termék</th>
                  <th className="px-4 py-3 font-medium">Kategória</th>
                  <th className="px-4 py-3 font-medium text-right">Készlet</th>
                  <th className="px-4 py-3 font-medium text-right">Havi eladás</th>
                  <th className="px-4 py-3 font-medium text-right">Elegendő</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'critical' ? data.criticalItems : data.overstockItems).map((item) => (
                  <tr key={item.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <a href={`/admin/edit-product/${item.id}`} className="text-white hover:text-purple-400 transition-colors">
                        {item.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{item.category || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${activeTab === 'critical' ? 'text-red-400' : 'text-blue-400'}`}>
                        {item.stock} db
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">{item.monthlySales} db</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.daysOfStock <= 7 ? 'bg-red-500/20 text-red-400' :
                        item.daysOfStock > 180 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {item.daysOfStock === 999 ? '∞' : `${item.daysOfStock} nap`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* AI Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Restock Recommendations */}
            {data.aiRecommendations?.restockRecommendations && data.aiRecommendations.restockRecommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#121212] border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="text-orange-400" />
                  Utánrendelési javaslatok
                </h3>
                <div className="space-y-3">
                  {data.aiRecommendations.restockRecommendations.map((rec, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{rec.product}</span>
                        <span className="text-orange-400 font-bold">{rec.suggestedQuantity} db</span>
                      </div>
                      <p className="text-gray-400 text-xs">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Overstock Solutions */}
            {data.aiRecommendations?.overstockSolutions && data.aiRecommendations.overstockSolutions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#121212] border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Archive className="text-blue-400" />
                  Túlkészlet megoldások
                </h3>
                <div className="space-y-3">
                  {data.aiRecommendations.overstockSolutions.map((sol, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3">
                      <span className="text-white font-medium text-sm block mb-1">{sol.product}</span>
                      <p className="text-gray-400 text-xs">{sol.suggestion}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* General Insights */}
          {data.aiRecommendations?.generalInsights && data.aiRecommendations.generalInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">AI Megállapítások</h3>
              <ul className="space-y-2">
                {data.aiRecommendations.generalInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <Check className="text-purple-400 flex-shrink-0 mt-0.5" size={16} />
                    {insight}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
