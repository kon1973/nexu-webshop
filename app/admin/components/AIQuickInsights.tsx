'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Users, 
  ShoppingCart, Star, AlertTriangle, Sparkles, RefreshCw,
  ArrowRight, Calendar, Clock, Zap, Target, Award,
  Activity, BarChart3, PieChart, Eye
} from 'lucide-react'

interface AIQuickInsight {
  id: string
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ElementType
  color: string
  trend: 'up' | 'down' | 'neutral'
  priority: 'high' | 'medium' | 'low'
  insight?: string
  action?: string
}

interface AIRecommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: string
  icon: React.ElementType
}

export default function AIQuickInsights() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [activeInsight, setActiveInsight] = useState<string | null>(null)

  const insights: AIQuickInsight[] = [
    {
      id: 'revenue',
      title: 'Mai bevétel',
      value: '847 250 Ft',
      change: 23.5,
      changeLabel: 'tegnap óta',
      icon: DollarSign,
      color: 'green',
      trend: 'up',
      priority: 'high',
      insight: 'A bevétel 23.5%-kal meghaladja a tegnapi napot. Az iPhone kategória kiemelkedően teljesít.',
      action: 'Növeld az iPhone készletet!'
    },
    {
      id: 'orders',
      title: 'Új rendelések',
      value: 34,
      change: 12,
      changeLabel: 'előző nap',
      icon: ShoppingCart,
      color: 'blue',
      trend: 'up',
      priority: 'high',
      insight: 'A rendelések száma 12%-kal nőtt. A reggeli órák (8-10) a legaktívabbak.',
      action: 'Adj hozzá reggeli akciót!'
    },
    {
      id: 'conversion',
      title: 'Konverzió',
      value: '4.2%',
      change: 0.8,
      changeLabel: 'heti átlag',
      icon: Target,
      color: 'purple',
      trend: 'up',
      priority: 'medium',
      insight: 'A konverzió felülmúlja a heti átlagot. A termékoldal optimalizálás működik.',
      action: 'Folytasd az A/B tesztelést!'
    },
    {
      id: 'stock',
      title: 'Alacsony készlet',
      value: 7,
      change: -3,
      changeLabel: 'új alert',
      icon: Package,
      color: 'orange',
      trend: 'down',
      priority: 'high',
      insight: '3 új termék került kritikus készlet szintre. Sürgős utánpótlás szükséges.',
      action: 'Ellenőrizd a beszállítókat!'
    },
    {
      id: 'customers',
      title: 'Aktív ügyfelek',
      value: 128,
      change: 15,
      changeLabel: 'ma belépett',
      icon: Users,
      color: 'cyan',
      trend: 'up',
      priority: 'medium',
      insight: '15 új regisztráció ma. A Google hirdetések jól teljesítenek.',
      action: 'Küldj üdvözlő emailt!'
    },
    {
      id: 'reviews',
      title: 'Értékelések',
      value: '4.8★',
      change: 0.1,
      changeLabel: 'átlag',
      icon: Star,
      color: 'yellow',
      trend: 'up',
      priority: 'low',
      insight: 'Kiváló értékelések! 2 negatív vélemény vár válaszra.',
      action: 'Válaszolj a véleményekre!'
    }
  ]

  const recommendations: AIRecommendation[] = [
    {
      id: '1',
      title: 'Készlet figyelmeztető: iPhone 15 Pro',
      description: 'Csak 3 db maradt raktáron. Az elmúlt hét eladási adatai alapján 2 napon belül elfogy.',
      impact: 'high',
      category: 'inventory',
      icon: AlertTriangle
    },
    {
      id: '2',
      title: 'Ároptimalizálási lehetőség',
      description: 'A Samsung Galaxy S24 10%-kal olcsóbb a versenytársaknál. 5% áremelés még versenyképes.',
      impact: 'medium',
      category: 'pricing',
      icon: TrendingUp
    },
    {
      id: '3',
      title: 'Marketing ajánlás',
      description: 'A gaming kategória iránt 40%-kal nőtt az érdeklődés. Indíts célzott kampányt!',
      impact: 'high',
      category: 'marketing',
      icon: Sparkles
    },
    {
      id: '4',
      title: 'Ügyfélszerzés',
      description: '12 kosárelhagyás ma. Küldj emlékeztető emailt 15%-os kuponnal.',
      impact: 'medium',
      category: 'customers',
      icon: Users
    }
  ]

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
  }

  const impactColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30'
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Gyors Elemzések</h2>
            <p className="text-gray-400 text-sm">Valós idejű üzleti betekintések</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            <Clock size={14} />
            {lastUpdate.toLocaleTimeString('hu-HU')}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {insights.map((insight, index) => {
          const colors = colorClasses[insight.color]
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
              className={`relative p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                colors.bg
              } ${colors.border} ${
                activeInsight === insight.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {/* Priority indicator */}
              {insight.priority === 'high' && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}

              <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                <insight.icon size={20} className={colors.text} />
              </div>

              <p className="text-gray-400 text-xs mb-1">{insight.title}</p>
              <p className="text-2xl font-bold text-white">{insight.value}</p>

              <div className={`flex items-center gap-1 mt-2 text-xs ${
                insight.trend === 'up' ? 'text-green-400' : 
                insight.trend === 'down' ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {insight.trend === 'up' ? <TrendingUp size={12} /> : 
                 insight.trend === 'down' ? <TrendingDown size={12} /> : null}
                {insight.change > 0 ? '+' : ''}{insight.change}{typeof insight.change === 'number' && insight.change !== Math.floor(insight.change) ? '' : '%'}
                <span className="text-gray-500 ml-1">{insight.changeLabel}</span>
              </div>

              {/* Expanded insight */}
              <AnimatePresence>
                {activeInsight === insight.id && insight.insight && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <p className="text-gray-300 text-sm mb-2">{insight.insight}</p>
                    {insight.action && (
                      <button className="w-full mt-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1">
                        <Sparkles size={12} />
                        {insight.action}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-purple-400" size={20} />
          AI Ajánlások
          <span className="ml-auto px-2 py-0.5 bg-purple-500/20 rounded-full text-purple-400 text-xs">
            {recommendations.length} aktív
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <rec.icon size={18} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                      {rec.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${impactColors[rec.impact]}`}>
                      {rec.impact === 'high' ? 'Magas' : rec.impact === 'medium' ? 'Közepes' : 'Alacsony'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{rec.description}</p>
                </div>
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600 hover:bg-purple-500 rounded-lg">
                  <ArrowRight size={14} className="text-white" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-400" size={20} />
            Teljesítmény trendek
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Bevétel cél', current: 75, target: 100, color: 'green' },
              { label: 'Rendelés cél', current: 85, target: 100, color: 'blue' },
              { label: 'Konverzió cél', current: 60, target: 100, color: 'purple' },
              { label: 'Készlet egészség', current: 92, target: 100, color: 'cyan' }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{item.label}</span>
                  <span className={`font-medium ${colorClasses[item.color].text}`}>{item.current}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.current}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      item.color === 'green' ? 'from-green-500 to-emerald-500' :
                      item.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                      item.color === 'purple' ? 'from-purple-500 to-pink-500' :
                      'from-cyan-500 to-teal-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="text-orange-400" size={20} />
            Azonnali teendők
          </h3>
          <div className="space-y-3">
            {[
              { task: 'Válaszolj 2 értékelésre', urgency: 'high', icon: Star },
              { task: 'Pótold a kritikus készletet', urgency: 'high', icon: Package },
              { task: 'Küldj ki hírlevelet', urgency: 'medium', icon: Users },
              { task: 'Ellenőrizd a versenytárs árakat', urgency: 'low', icon: Eye }
            ].map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className={`w-2 h-2 rounded-full ${
                  item.urgency === 'high' ? 'bg-red-500' :
                  item.urgency === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <item.icon size={16} className="text-gray-400" />
                <span className="text-gray-300 flex-1">{item.task}</span>
                <ArrowRight size={14} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
