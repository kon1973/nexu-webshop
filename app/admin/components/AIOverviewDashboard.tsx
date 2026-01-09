'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Sparkles, TrendingUp, Users, Package, 
  DollarSign, ShoppingCart, Star, BarChart3, PieChart,
  Activity, Target, Zap, AlertTriangle, Award, Clock,
  ArrowUp, ArrowDown, Eye, RefreshCw, ChevronRight,
  Calendar, Globe, Layers
} from 'lucide-react'

interface MetricCard {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  sparklineData: number[]
  color: string
}

interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'info' | 'success'
  title: string
  description: string
  action?: string
  impact?: string
}

export default function AIOverviewDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today')
  const [isLoading, setIsLoading] = useState(false)

  const metrics: MetricCard[] = [
    {
      id: 'revenue',
      title: 'Bevétel',
      value: '2.847.250 Ft',
      change: '+23.5%',
      trend: 'up',
      icon: DollarSign,
      sparklineData: [30, 45, 35, 50, 65, 55, 70, 85, 75, 90],
      color: 'green'
    },
    {
      id: 'orders',
      title: 'Rendelések',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: ShoppingCart,
      sparklineData: [20, 35, 30, 45, 40, 55, 50, 60, 65, 70],
      color: 'blue'
    },
    {
      id: 'customers',
      title: 'Aktív ügyfelek',
      value: '1.247',
      change: '+8.3%',
      trend: 'up',
      icon: Users,
      sparklineData: [40, 42, 45, 48, 50, 52, 55, 58, 60, 62],
      color: 'purple'
    },
    {
      id: 'conversion',
      title: 'Konverzió',
      value: '4.2%',
      change: '+0.8%',
      trend: 'up',
      icon: Target,
      sparklineData: [3.0, 3.2, 3.5, 3.8, 4.0, 3.9, 4.1, 4.0, 4.2, 4.2],
      color: 'cyan'
    },
    {
      id: 'avgOrder',
      title: 'Átl. kosárérték',
      value: '42.500 Ft',
      change: '-2.1%',
      trend: 'down',
      icon: BarChart3,
      sparklineData: [45, 44, 43, 44, 43, 42, 43, 42, 42, 42],
      color: 'orange'
    },
    {
      id: 'satisfaction',
      title: 'Elégedettség',
      value: '4.8',
      change: '+0.1',
      trend: 'up',
      icon: Star,
      sparklineData: [4.5, 4.6, 4.6, 4.7, 4.7, 4.7, 4.8, 4.8, 4.8, 4.8],
      color: 'yellow'
    }
  ]

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Bevétel növelési lehetőség',
      description: 'A gaming kategória 40%-kal nagyobb keresletet mutat. Célzott kampánnyal +15% extra bevétel érhető el.',
      action: 'Kampány indítása',
      impact: '+450.000 Ft'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Készlet figyelmeztetés',
      description: '3 népszerű termék 48 órán belül kifogyhat. Azonnali utánrendelés szükséges.',
      action: 'Készlet kezelés',
      impact: 'Kritikus'
    },
    {
      id: '3',
      type: 'success',
      title: 'Konverzió javulás',
      description: 'Az elmúlt héten 15%-kal nőtt a konverziós ráta a termékoldal optimalizálásnak köszönhetően.',
      impact: '+12% bevétel'
    },
    {
      id: '4',
      type: 'info',
      title: 'Versenytárs aktivitás',
      description: 'Fő versenytárs 10%-os akciót indított iPhone kategóriában. Érdemes megfontolni a válaszlépést.',
      action: 'Elemzés megtekintése'
    }
  ]

  const topProducts = [
    { name: 'iPhone 15 Pro Max', sales: 45, revenue: '17.955.000 Ft', trend: 12 },
    { name: 'Samsung Galaxy S24', sales: 38, revenue: '11.020.000 Ft', trend: 8 },
    { name: 'MacBook Air M3', sales: 22, revenue: '10.978.000 Ft', trend: -3 },
    { name: 'AirPods Pro 2', sales: 67, revenue: '6.700.000 Ft', trend: 25 },
    { name: 'iPad Pro 12.9', sales: 15, revenue: '5.985.000 Ft', trend: 5 }
  ]

  const colorClasses: Record<string, { gradient: string; bg: string; text: string }> = {
    green: { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', text: 'text-green-400' },
    blue: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    purple: { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    cyan: { gradient: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
    orange: { gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    yellow: { gradient: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' }
  }

  const insightTypeStyles: Record<string, { bg: string; border: string; icon: React.ElementType }> = {
    opportunity: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: TrendingUp },
    warning: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle },
    success: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Award },
    info: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: Eye }
  }

  // Simple sparkline renderer
  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const width = 80
    const height = 30

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    }).join(' ')

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Selection */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-purple-500/20">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Áttekintés</h2>
            <p className="text-gray-400 text-sm">Intelligens üzleti összefoglaló</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-xl p-1">
            {['today', 'week', 'month'].map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf as typeof selectedTimeframe)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf === 'today' ? 'Ma' : tf === 'week' ? 'Hét' : 'Hónap'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsLoading(true)}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <RefreshCw size={18} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Score Card */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-white"
                >
                  87
                </motion.div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-green-500 rounded-full">
                <ArrowUp size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Üzleti Egészség Pontszám</h3>
              <p className="text-gray-400">+5 pont az előző időszakhoz képest</p>
            </div>
          </div>

          <div className="flex gap-6">
            {[
              { label: 'Bevétel trend', value: '↑ Növekvő', color: 'text-green-400' },
              { label: 'Készlet állapot', value: '⚠ Figyelés', color: 'text-yellow-400' },
              { label: 'Ügyfél elégedettség', value: '★ Kiváló', color: 'text-blue-400' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                <p className={`font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => {
          const colors = colorClasses[metric.color]
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <metric.icon size={18} className={colors.text} />
                </div>
                <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                  {renderSparkline(metric.sparklineData, metric.color === 'green' ? '#22c55e' : 
                    metric.color === 'blue' ? '#3b82f6' :
                    metric.color === 'purple' ? '#a855f7' :
                    metric.color === 'cyan' ? '#06b6d4' :
                    metric.color === 'orange' ? '#f97316' : '#eab308'
                  )}
                </div>
              </div>

              <p className="text-gray-400 text-xs mb-1">{metric.title}</p>
              <p className="text-xl font-bold text-white mb-1">{metric.value}</p>

              <div className={`flex items-center gap-1 text-xs ${
                metric.trend === 'up' ? 'text-green-400' : 
                metric.trend === 'down' ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {metric.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {metric.change}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            AI Felismerések
            <span className="ml-auto px-2 py-0.5 bg-purple-500/20 rounded-full text-purple-400 text-xs">
              {aiInsights.length} aktív
            </span>
          </h3>

          <div className="space-y-3">
            {aiInsights.map((insight, index) => {
              const style = insightTypeStyles[insight.type]
              const Icon = style.icon
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border ${style.bg} ${style.border} hover:scale-[1.01] transition-transform cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={18} className="text-white mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                      <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                      {(insight.action || insight.impact) && (
                        <div className="flex items-center gap-3 mt-2">
                          {insight.action && (
                            <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                              {insight.action}
                              <ChevronRight size={12} />
                            </button>
                          )}
                          {insight.impact && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              insight.impact.includes('+') ? 'bg-green-500/20 text-green-400' :
                              insight.impact === 'Kritikus' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {insight.impact}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="text-orange-400" size={20} />
            Top Termékek
          </h3>

          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-500/20 text-gray-400' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-white/5 text-gray-500'
                }`}>
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{product.name}</p>
                  <p className="text-gray-500 text-xs">{product.sales} eladás</p>
                </div>

                <div className="text-right">
                  <p className="text-white font-medium text-sm">{product.revenue}</p>
                  <p className={`text-xs ${product.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {product.trend >= 0 ? '+' : ''}{product.trend}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Globe, label: 'Látogatók ma', value: '2.847', color: 'blue' },
          { icon: Clock, label: 'Átl. munkamenet', value: '4:32', color: 'purple' },
          { icon: Layers, label: 'Aktív akciók', value: '12', color: 'orange' },
          { icon: Calendar, label: 'Következő kampány', value: '3 nap', color: 'green' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClasses[stat.color].bg}`}>
              <stat.icon size={18} className={colorClasses[stat.color].text} />
            </div>
            <div>
              <p className="text-gray-400 text-xs">{stat.label}</p>
              <p className="text-white font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
