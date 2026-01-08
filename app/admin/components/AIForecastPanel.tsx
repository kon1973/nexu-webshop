'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw, Calendar, AlertTriangle, Lightbulb, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { generateSalesForecast } from '@/lib/actions/ai-actions'

interface ForecastData {
  historicalData: Array<{ date: string; revenue: number; orders: number }>
  dailyForecast: Array<{ date: string; predicted: number; low: number; high: number }>
  summary: {
    avgDailyRevenue: number
    expectedMonthlyRevenue: number
    trend: 'growing' | 'stable' | 'declining'
    trendPercentage: number
  }
  aiForecast: {
    forecast?: {
      nextMonth: { low: number; expected: number; high: number }
      trend: string
      confidence: number
    }
    insights?: string[]
    recommendations?: string[]
    risks?: string[]
    opportunities?: string[]
  }
}

export default function AIForecastPanel() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forecastDays, setForecastDays] = useState(30)

  const loadForecast = async () => {
    setIsLoading(true)
    try {
      const result = await generateSalesForecast({ days: forecastDays })
      if (result.success) {
        setData(result as ForecastData)
      }
    } catch (error) {
      console.error('Forecast error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <TrendingUp className="text-green-400" size={20} />
      case 'declining': return <TrendingDown className="text-red-400" size={20} />
      default: return <Minus className="text-yellow-400" size={20} />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'growing': return 'text-green-400'
      case 'declining': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-blue-400" />
            Értékesítési Előrejelzés
          </h2>
          <p className="text-gray-400 text-sm mt-1">AI-alapú bevétel előrejelzés és trend elemzés</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={forecastDays}
            onChange={(e) => setForecastDays(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value={14}>14 nap</option>
            <option value={30}>30 nap</option>
            <option value={60}>60 nap</option>
            <option value={90}>90 nap</option>
          </select>
          <button
            onClick={loadForecast}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Előrejelzés generálása
          </button>
        </div>
      </div>

      {!data && !isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Kattints az "Előrejelzés generálása" gombra az AI elemzés elindításához</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <RefreshCw size={48} className="mx-auto text-purple-400 mb-4 animate-spin" />
          <p className="text-gray-400">Előrejelzés generálása...</p>
          <p className="text-gray-500 text-sm mt-2">Az AI elemzi az elmúlt 90 nap adatait</p>
        </div>
      )}

      {data && !isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-xs mb-1">Átlagos napi bevétel</p>
              <p className="text-2xl font-bold text-white">
                {data.summary.avgDailyRevenue.toLocaleString('hu-HU')} Ft
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-xs mb-1">Várható havi bevétel</p>
              <p className="text-2xl font-bold text-white">
                {data.summary.expectedMonthlyRevenue.toLocaleString('hu-HU')} Ft
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-xs mb-1">Trend</p>
              <div className="flex items-center gap-2">
                {getTrendIcon(data.summary.trend)}
                <span className={`text-2xl font-bold ${getTrendColor(data.summary.trend)}`}>
                  {data.summary.trendPercentage > 0 ? '+' : ''}{data.summary.trendPercentage}%
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-4"
            >
              <p className="text-gray-400 text-xs mb-1">AI Konfidencia</p>
              <p className="text-2xl font-bold text-purple-400">
                {Math.round((data.aiForecast?.forecast?.confidence || 0.75) * 100)}%
              </p>
            </motion.div>
          </div>

          {/* AI Insights & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights */}
            {data.aiForecast?.insights && data.aiForecast.insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#121212] border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="text-yellow-400" size={20} />
                  AI Megállapítások
                </h3>
                <ul className="space-y-3">
                  {data.aiForecast.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-yellow-400 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Recommendations */}
            {data.aiForecast?.recommendations && data.aiForecast.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#121212] border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="text-green-400" size={20} />
                  Javaslatok
                </h3>
                <ul className="space-y-3">
                  {data.aiForecast.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-green-400 mt-1">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Risks & Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risks */}
            {data.aiForecast?.risks && data.aiForecast.risks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-500/20 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-400" size={20} />
                  Kockázatok
                </h3>
                <ul className="space-y-2">
                  {data.aiForecast.risks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-red-400 mt-1">⚠</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Opportunities */}
            {data.aiForecast?.opportunities && data.aiForecast.opportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/20 border border-green-500/20 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-400" size={20} />
                  Lehetőségek
                </h3>
                <ul className="space-y-2">
                  {data.aiForecast.opportunities.map((opp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-green-400 mt-1">★</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Simple Forecast Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Napi előrejelzés</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {data.dailyForecast.slice(0, 14).map((day, idx) => {
                  const maxPredicted = Math.max(...data.dailyForecast.map(d => d.high))
                  const heightPercent = (day.predicted / maxPredicted) * 100
                  
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="h-32 w-12 bg-white/5 rounded-t relative flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-purple-600 to-blue-600 rounded-t"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{day.date.slice(5)}</p>
                      <p className="text-xs text-gray-400">{(day.predicted / 1000).toFixed(0)}k</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
