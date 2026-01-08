'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, TrendingDown, Clock, RefreshCw, ShoppingCart, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { detectAnomalies } from '@/lib/actions/ai-actions'

interface AnomalyData {
  anomalies: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    title: string
    description: string
    data?: any
  }>
  summary: {
    totalAnomalies: number
    highSeverity: number
    mediumSeverity: number
    lowSeverity: number
  }
  period: {
    start: string
    end: string
  }
}

const severityConfig = {
  high: { color: 'bg-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
  medium: { color: 'bg-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  low: { color: 'bg-yellow-500', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400' }
}

const typeIcons: Record<string, typeof AlertTriangle> = {
  high_value_order: ShoppingCart,
  frequent_orders: Users,
  traffic_spike: Zap,
  revenue_drop: TrendingDown,
  high_cancellation: AlertTriangle
}

export default function AIAnomalyDetection() {
  const [data, setData] = useState<AnomalyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const loadAnomalies = async () => {
    setIsLoading(true)
    try {
      const result = await detectAnomalies()
      if (result.success) {
        setData(result as AnomalyData)
      }
    } catch (error) {
      console.error('Anomaly detection error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadAnomalies, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Load on mount
  useEffect(() => {
    loadAnomalies()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-orange-400" />
            Anomália Detektálás
          </h2>
          <p className="text-gray-400 text-sm mt-1">Szokatlan tevékenységek és figyelmeztetések</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-white/10 border-white/20"
            />
            Auto-frissítés
          </label>
          <button
            onClick={loadAnomalies}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Frissítés
          </button>
        </div>
      </div>

      {isLoading && !data && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <RefreshCw size={48} className="mx-auto text-orange-400 mb-4 animate-spin" />
          <p className="text-gray-400">Anomáliák keresése...</p>
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-xs mb-1">Összes anomália</p>
              <p className="text-3xl font-bold text-white">{data.summary.totalAnomalies}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
            >
              <p className="text-red-400 text-xs mb-1">Magas prioritás</p>
              <p className="text-3xl font-bold text-red-400">{data.summary.highSeverity}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4"
            >
              <p className="text-orange-400 text-xs mb-1">Közepes prioritás</p>
              <p className="text-3xl font-bold text-orange-400">{data.summary.mediumSeverity}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
            >
              <p className="text-yellow-400 text-xs mb-1">Alacsony prioritás</p>
              <p className="text-3xl font-bold text-yellow-400">{data.summary.lowSeverity}</p>
            </motion.div>
          </div>

          {/* Period Info */}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock size={14} />
            Vizsgált időszak: {data.period.start} - {data.period.end}
          </div>

          {/* Anomalies List */}
          {data.anomalies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-900/20 border border-green-500/20 rounded-xl p-8 text-center"
            >
              <Shield size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-green-400 font-semibold">Minden rendben!</p>
              <p className="text-gray-400 text-sm mt-2">Nem találtunk szokatlan tevékenységet az elmúlt 7 napban.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {data.anomalies.map((anomaly, idx) => {
                const config = severityConfig[anomaly.severity]
                const Icon = typeIcons[anomaly.type] || AlertTriangle

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${config.bg} ${config.border} border rounded-xl p-4`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{anomaly.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.text} ${config.bg}`}>
                            {anomaly.severity === 'high' ? 'Magas' : anomaly.severity === 'medium' ? 'Közepes' : 'Alacsony'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{anomaly.description}</p>
                        {anomaly.data && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(anomaly.data).map(([key, value]) => (
                              <span key={key} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
