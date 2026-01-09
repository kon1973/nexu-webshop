'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FlaskConical, TrendingUp, TrendingDown, Users, Eye, 
  ShoppingCart, Target, RefreshCw, Play, Pause, BarChart3,
  CheckCircle, Clock, Sparkles, ArrowRight, Percent
} from 'lucide-react'
import { toast } from 'sonner'

interface ABTest {
  id: string
  name: string
  description: string
  status: 'running' | 'completed' | 'paused' | 'draft'
  startDate: string
  endDate?: string
  variants: {
    name: string
    traffic: number
    visitors: number
    conversions: number
    revenue: number
    conversionRate: number
    confidence: number
  }[]
  winner?: string
  aiRecommendation?: string
  metric: 'conversion' | 'revenue' | 'aov'
}

const mockTests: ABTest[] = [
  {
    id: '1',
    name: 'Checkout gomb szín',
    description: 'Lila vs Zöld checkout gomb',
    status: 'running',
    startDate: '2024-01-01',
    metric: 'conversion',
    variants: [
      { name: 'Kontroll (Lila)', traffic: 50, visitors: 5420, conversions: 312, revenue: 4250000, conversionRate: 5.76, confidence: 0 },
      { name: 'Variáns A (Zöld)', traffic: 50, visitors: 5380, conversions: 367, revenue: 4890000, conversionRate: 6.82, confidence: 94 }
    ],
    aiRecommendation: 'A zöld gomb 18.4%-kal jobb konverziót mutat. 94% konfidencia szinten a Variáns A a nyerő. Javasolt a teszt lezárása és a zöld gomb bevezetése.'
  },
  {
    id: '2',
    name: 'Terméklap layout',
    description: 'Egysoros vs Kétsoros specifikáció',
    status: 'completed',
    startDate: '2023-12-15',
    endDate: '2024-01-05',
    metric: 'revenue',
    winner: 'Variáns A (Kétsoros)',
    variants: [
      { name: 'Kontroll (Egysoros)', traffic: 50, visitors: 12400, conversions: 620, revenue: 8750000, conversionRate: 5.0, confidence: 0 },
      { name: 'Variáns A (Kétsoros)', traffic: 50, visitors: 12350, conversions: 741, revenue: 10420000, conversionRate: 6.0, confidence: 99 }
    ],
    aiRecommendation: 'A kétsoros layout 19.1%-kal magasabb bevételt generált. A teszt sikeresen lezárult, a változtatás bevezetése megtörtént.'
  },
  {
    id: '3',
    name: 'Ingyenes szállítás limit',
    description: '15.000 Ft vs 20.000 Ft',
    status: 'running',
    startDate: '2024-01-03',
    metric: 'aov',
    variants: [
      { name: 'Kontroll (15.000 Ft)', traffic: 50, visitors: 3200, conversions: 186, revenue: 3720000, conversionRate: 5.81, confidence: 0 },
      { name: 'Variáns A (20.000 Ft)', traffic: 50, visitors: 3180, conversions: 172, revenue: 3890000, conversionRate: 5.41, confidence: 67 }
    ],
    aiRecommendation: 'Még korai következtetéseket levonni. A 20.000 Ft-os limit magasabb átlagos kosárértéket eredményez (+8.3%), de alacsonyabb konverziót. További 1-2 hét adat szükséges.'
  }
]

export default function AIABTestAnalyzer() {
  const [tests, setTests] = useState<ABTest[]>(mockTests)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'running' | 'completed'>('all')

  const filteredTests = tests.filter(test => 
    filter === 'all' || test.status === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-500/20'
      case 'completed': return 'text-blue-400 bg-blue-500/20'
      case 'paused': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return 'Futó'
      case 'completed': return 'Befejezett'
      case 'paused': return 'Szüneteltetve'
      default: return 'Vázlat'
    }
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'conversion': return 'Konverzió'
      case 'revenue': return 'Bevétel'
      case 'aov': return 'Átl. kosárérték'
      default: return metric
    }
  }

  const analyzeTest = async (test: ABTest) => {
    setIsAnalyzing(true)
    toast.info('AI elemzés folyamatban...')
    await new Promise(r => setTimeout(r, 2000))
    toast.success('Elemzés kész!')
    setIsAnalyzing(false)
  }

  const toggleTestStatus = (testId: string) => {
    setTests(prev => prev.map(t => 
      t.id === testId 
        ? { ...t, status: t.status === 'running' ? 'paused' : 'running' as const }
        : t
    ))
  }

  const stats = {
    running: tests.filter(t => t.status === 'running').length,
    completed: tests.filter(t => t.status === 'completed').length,
    totalVisitors: tests.reduce((sum, t) => sum + t.variants.reduce((s, v) => s + v.visitors, 0), 0),
    avgLift: 15.2
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
            <FlaskConical className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI A/B Teszt Elemző</h2>
            <p className="text-gray-400 text-sm">Tesztek automatikus elemzése és optimalizálás</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          <Play size={16} />
          Új teszt
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
            <Play size={14} />
            Futó tesztek
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.running}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
            <CheckCircle size={14} />
            Befejezett
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Users size={14} />
            Összes látogató
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalVisitors.toLocaleString()}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
            <TrendingUp size={14} />
            Átl. javulás
          </div>
          <p className="text-2xl font-bold text-purple-400">+{stats.avgLift}%</p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'running', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'Mind' : f === 'running' ? 'Futó' : 'Befejezett'}
          </button>
        ))}
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            {/* Test Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setSelectedTest(selectedTest?.id === test.id ? null : test)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FlaskConical className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{test.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(test.status)}`}>
                        {getStatusLabel(test.status)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-gray-400">
                        {getMetricLabel(test.metric)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{test.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {test.winner && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-green-400 text-sm">Győztes: {test.winner}</span>
                    </div>
                  )}
                  {test.status === 'running' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTestStatus(test.id)
                      }}
                      className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors"
                    >
                      <Pause size={16} className="text-yellow-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {selectedTest?.id === test.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10"
                >
                  <div className="p-4 space-y-4">
                    {/* Variants Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      {test.variants.map((variant, i) => {
                        const isWinner = test.winner === variant.name || 
                          (!test.winner && variant.confidence > 90)
                        return (
                          <div 
                            key={i}
                            className={`p-4 rounded-xl border ${
                              isWinner 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : 'bg-white/5 border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">{variant.name}</h4>
                              {isWinner && (
                                <span className="flex items-center gap-1 text-green-400 text-xs">
                                  <Sparkles size={12} />
                                  Nyerő
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-gray-500 text-xs">Látogatók</p>
                                <p className="text-white font-medium">{variant.visitors.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Konverziók</p>
                                <p className="text-white font-medium">{variant.conversions.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Konverziós ráta</p>
                                <p className="text-white font-medium">{variant.conversionRate.toFixed(2)}%</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Bevétel</p>
                                <p className="text-white font-medium">{(variant.revenue / 1000000).toFixed(1)}M Ft</p>
                              </div>
                            </div>
                            {variant.confidence > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/10">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Konfidencia</span>
                                  <span className={variant.confidence >= 95 ? 'text-green-400' : 'text-yellow-400'}>
                                    {variant.confidence}%
                                  </span>
                                </div>
                                <div className="mt-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      variant.confidence >= 95 ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}
                                    style={{ width: `${variant.confidence}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* AI Recommendation */}
                    {test.aiRecommendation && (
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                            <Sparkles className="text-purple-400" size={16} />
                          </div>
                          <div>
                            <h4 className="text-white font-medium mb-1">AI Javaslat</h4>
                            <p className="text-gray-300 text-sm">{test.aiRecommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => analyzeTest(test)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
                        Újraelemzés
                      </button>
                      {test.status === 'running' && test.variants.some(v => v.confidence >= 95) && (
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                        >
                          <CheckCircle size={16} />
                          Teszt lezárása
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
