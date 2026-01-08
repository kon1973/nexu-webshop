'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  MessageSquare, 
  Megaphone,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

type InsightType = 'sales-insights' | 'inventory-alerts' | 'pricing-suggestions' | 'review-summary' | 'marketing-ideas'

interface InsightResult {
  content: string
  data?: any
  generatedAt: string
}

const insightTypes = [
  {
    id: 'sales-insights' as InsightType,
    name: 'Értékesítési elemzés',
    description: 'Bevétel trendek, top termékek, növekedési lehetőségek',
    icon: TrendingUp,
    color: 'from-green-600 to-emerald-600'
  },
  {
    id: 'inventory-alerts' as InsightType,
    name: 'Készlet riasztások',
    description: 'Alacsony készlet, kifogyott termékek, lassú forgás',
    icon: Package,
    color: 'from-orange-600 to-amber-600'
  },
  {
    id: 'pricing-suggestions' as InsightType,
    name: 'Ároptimalizálás',
    description: 'Áremelési/csökkentési javaslatok, akciók',
    icon: DollarSign,
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'review-summary' as InsightType,
    name: 'Értékelés összefoglaló',
    description: 'Vásárlói visszajelzések elemzése, trendek',
    icon: MessageSquare,
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'marketing-ideas' as InsightType,
    name: 'Marketing ötletek',
    description: 'Kampány javaslatok, promóciók, social media',
    icon: Megaphone,
    color: 'from-red-600 to-rose-600'
  }
]

export default function AIInsightsPanel() {
  const [selectedType, setSelectedType] = useState<InsightType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Record<InsightType, InsightResult | null>>({
    'sales-insights': null,
    'inventory-alerts': null,
    'pricing-suggestions': null,
    'review-summary': null,
    'marketing-ideas': null
  })
  const [expandedCards, setExpandedCards] = useState<Set<InsightType>>(new Set())

  const generateInsight = async (type: InsightType) => {
    setIsLoading(true)
    setSelectedType(type)
    
    try {
      const response = await fetch('/api/admin/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (!response.ok) throw new Error('Failed to generate')

      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [type]: {
          content: data.insights || data.suggestions || data.summary || data.alerts || data.ideas,
          data: data.data || data.stats || data.summary || data.context,
          generatedAt: data.generatedAt
        }
      }))
      
      setExpandedCards(prev => new Set([...prev, type]))
      toast.success('Elemzés elkészült!')
    } catch (error) {
      console.error('Insight error:', error)
      toast.error('Nem sikerült generálni az elemzést')
    } finally {
      setIsLoading(false)
      setSelectedType(null)
    }
  }

  const toggleCard = (type: InsightType) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/^(\d+\.)/gm, '<span class="text-purple-400 font-bold">$1</span>')
      .replace(/^([-•])/gm, '<span class="text-blue-400">$1</span>')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" />
            AI Üzleti Elemzések
          </h2>
          <p className="text-gray-400 text-sm mt-1">GPT-5.2 alapú intelligens elemzések és javaslatok</p>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insightTypes.map((insight) => {
          const result = results[insight.id]
          const isExpanded = expandedCards.has(insight.id)
          const isCurrentlyLoading = isLoading && selectedType === insight.id

          return (
            <motion.div
              key={insight.id}
              layout
              className={`bg-[#121212] border rounded-xl overflow-hidden transition-all ${
                result ? 'border-purple-500/30' : 'border-white/10'
              } ${isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}`}
            >
              {/* Card Header */}
              <div 
                className={`p-4 bg-gradient-to-r ${insight.color} cursor-pointer`}
                onClick={() => result && toggleCard(insight.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <insight.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{insight.name}</h3>
                      <p className="text-white/70 text-xs">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result && (
                      <span className="text-white/60 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(result.generatedAt).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {result && (
                      isExpanded ? <ChevronUp className="text-white/60" size={18} /> : <ChevronDown className="text-white/60" size={18} />
                    )}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {!result ? (
                  <button
                    onClick={() => generateInsight(insight.id)}
                    disabled={isCurrentlyLoading}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCurrentlyLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Elemzés folyamatban...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Elemzés generálása
                      </>
                    )}
                  </button>
                ) : (
                  <AnimatePresence>
                    {isExpanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4"
                      >
                        {/* Content */}
                        <div 
                          className="prose prose-invert prose-sm max-w-none text-gray-300"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(result.content) }}
                        />

                        {/* Data Summary if available */}
                        {result.data && (
                          <div className="mt-4 p-3 bg-white/5 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2">Nyers adatok</p>
                            <pre className="text-xs text-gray-400 overflow-x-auto">
                              {JSON.stringify(result.data, null, 2).slice(0, 500)}...
                            </pre>
                          </div>
                        )}

                        {/* Refresh button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            generateInsight(insight.id)
                          }}
                          disabled={isCurrentlyLoading}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={14} className={isCurrentlyLoading ? 'animate-spin' : ''} />
                          Újragenerálás
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-sm text-green-400"
                      >
                        <CheckCircle size={16} />
                        Elemzés kész - kattints a részletekért
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Generált elemzések</p>
          <p className="text-2xl font-bold text-white mt-1">
            {Object.values(results).filter(Boolean).length}
          </p>
        </div>
        <div className="bg-[#121212] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-xs">AI Model</p>
          <p className="text-2xl font-bold text-white mt-1">GPT-5.2</p>
        </div>
        <div className="bg-[#121212] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Elemzés típusok</p>
          <p className="text-2xl font-bold text-white mt-1">5</p>
        </div>
        <div className="bg-[#121212] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-xs">Státusz</p>
          <p className="text-green-400 font-bold mt-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Aktív
          </p>
        </div>
      </div>
    </div>
  )
}
