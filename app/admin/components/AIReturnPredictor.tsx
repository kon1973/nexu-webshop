'use client'

import { useState, useTransition, useEffect } from 'react'
import { RotateCcw, AlertTriangle, TrendingDown, BarChart3, Package, Users, Loader2, ArrowRight, CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { predictReturns } from '@/lib/actions/ai-actions'
import { toast } from 'sonner'

interface ReturnPrediction {
  productId: number
  productName: string
  returnProbability: number
  riskLevel: 'high' | 'medium' | 'low'
  reasons: string[]
  preventionActions: string[]
  estimatedLoss: number
}

interface ReturnAnalysis {
  totalRiskProducts: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  potentialLosses: number
  predictions: ReturnPrediction[]
  generalInsights: string[]
  seasonalTrends: {
    month: string
    returnRate: number
  }[]
}

const RISK_STYLES = {
  high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: AlertTriangle },
  low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle }
}

export default function AIReturnPredictor() {
  const [analysis, setAnalysis] = useState<ReturnAnalysis | null>(null)
  const [isLoading, startLoading] = useTransition()
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const loadPredictions = () => {
    startLoading(async () => {
      const res = await predictReturns(timeRange)
      if (res.success && res.analysis) {
        setAnalysis(res.analysis)
      } else {
        toast.error(res.error || 'Hiba az előrejelzés során')
      }
    })
  }

  useEffect(() => {
    loadPredictions()
  }, [timeRange])

  const filteredPredictions = analysis?.predictions.filter(p => 
    filter === 'all' || p.riskLevel === filter
  ) || []

  const exportReport = () => {
    if (!analysis) return
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalRisk: analysis.totalRiskProducts,
        highRisk: analysis.highRiskCount,
        potentialLosses: analysis.potentialLosses
      },
      predictions: analysis.predictions,
      insights: analysis.generalInsights
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `return-prediction-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    toast.success('Riport letöltve!')
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
              <RotateCcw size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Visszáru Előrejelző</h2>
              <p className="text-gray-400 text-sm">Prediktív visszáru elemzés és prevenció</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="7d">7 nap</option>
              <option value="30d">30 nap</option>
              <option value="90d">90 nap</option>
            </select>
            <button
              onClick={loadPredictions}
              disabled={isLoading}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
            </button>
            <button
              onClick={exportReport}
              disabled={!analysis}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {isLoading && !analysis ? (
        <div className="p-12 text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-400 animate-spin" />
          </div>
          <p className="text-gray-400">AI elemzi a visszáru kockázatokat...</p>
        </div>
      ) : analysis ? (
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Package size={14} />
                Kockázatos termék
              </div>
              <p className="text-2xl font-bold text-white">{analysis.totalRiskProducts}</p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
                <XCircle size={14} />
                Magas kockázat
              </div>
              <p className="text-2xl font-bold text-red-400">{analysis.highRiskCount}</p>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                <AlertTriangle size={14} />
                Közepes kockázat
              </div>
              <p className="text-2xl font-bold text-yellow-400">{analysis.mediumRiskCount}</p>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
              <div className="flex items-center gap-2 text-orange-400 text-sm mb-1">
                <TrendingDown size={14} />
                Potenciális veszteség
              </div>
              <p className="text-2xl font-bold text-orange-400">{analysis.potentialLosses.toLocaleString('hu-HU')} Ft</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-gray-400 text-sm">Szűrés:</span>
            {[
              { id: 'all', label: 'Mind' },
              { id: 'high', label: 'Magas' },
              { id: 'medium', label: 'Közepes' },
              { id: 'low', label: 'Alacsony' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  filter === f.id
                    ? 'bg-red-500/30 text-red-400'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Predictions List */}
          <div className="space-y-3">
            {filteredPredictions.map(pred => {
              const style = RISK_STYLES[pred.riskLevel]
              const Icon = style.icon
              return (
                <motion.div
                  key={pred.productId}
                  layout
                  className={`p-4 rounded-xl border ${style.border} bg-white/5`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${style.bg}`}>
                      <Icon size={20} className={style.text} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{pred.productName}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${style.text}`}>
                            {pred.returnProbability}% kockázat
                          </span>
                          <span className="text-gray-500 text-sm">
                            ~{pred.estimatedLoss.toLocaleString('hu-HU')} Ft
                          </span>
                        </div>
                      </div>
                      
                      {/* Risk Bar */}
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pred.riskLevel === 'high' ? 'bg-red-500' :
                            pred.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${pred.returnProbability}%` }}
                        />
                      </div>

                      {/* Reasons */}
                      <div className="mb-3">
                        <p className="text-gray-500 text-xs mb-1">Okok:</p>
                        <div className="flex flex-wrap gap-1">
                          {pred.reasons.map((reason, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Prevention Actions */}
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Javasolt intézkedések:</p>
                        <ul className="space-y-1">
                          {pred.preventionActions.map((action, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                              <ArrowRight size={12} className="text-orange-400" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* General Insights */}
          {analysis.generalInsights.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-orange-500/30">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 size={18} className="text-orange-400" />
                Általános meglátások
              </h4>
              <ul className="space-y-2">
                {analysis.generalInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <CheckCircle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-gray-500">
          <RotateCcw size={48} className="mx-auto mb-3 opacity-50" />
          <p>Töltsd be az előrejelzéseket</p>
        </div>
      )}
    </div>
  )
}
