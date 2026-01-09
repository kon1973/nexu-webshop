'use client'

import { useState, useEffect } from 'react'
import { Bot, MessageSquare, ShoppingCart, TrendingUp, Users, Clock, Search, Package, Sparkles, ArrowUp, ArrowDown, RefreshCw, Brain, Wand2, BarChart3, LineChart, AlertTriangle, Layers, DollarSign, FileText, UserX, Gift, RotateCcw, Tag, PackageSearch, Shield, FlaskConical, Eye, Star, Share2, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import AIInsightsPanel from '../components/AIInsightsPanel'
import AIMarketingAssistant from '../components/AIMarketingAssistant'
import AIProductAnalyzer from '../components/AIProductAnalyzer'
import AIForecastPanel from '../components/AIForecastPanel'
import AICustomerSegments from '../components/AICustomerSegments'
import AIAnomalyDetection from '../components/AIAnomalyDetection'
import AIInventoryOptimization from '../components/AIInventoryOptimization'
import AISEOPanel from '../components/AISEOPanel'
import AICustomerResponsePanel from '../components/AICustomerResponsePanel'
import AIPriceOptimizer from '../components/AIPriceOptimizer'
import AIContentStudio from '../components/AIContentStudio'
import AIChurnPrediction from '../components/AIChurnPrediction'
import AISmartBundler from '../components/AISmartBundler'
import AIReturnPredictor from '../components/AIReturnPredictor'
import AIAutoTagging from '../components/AIAutoTagging'
import AIInventoryPredictor from '../components/AIInventoryPredictor'
import AIFraudDetection from '../components/AIFraudDetection'
import AIABTestAnalyzer from '../components/AIABTestAnalyzer'
import AICompetitorMonitor from '../components/AICompetitorMonitor'
import AIReviewResponder from '../components/AIReviewResponder'
import AISocialManager from '../components/AISocialManager'
import AISettings from '../components/AISettings'
import { getAIStats } from '@/lib/actions/ai-actions'

interface ChatStats {
  totalConversations: number
  totalMessages: number
  avgMessagesPerConversation: number
  topQueries: { query: string; count: number }[]
  productSearches: number
  orderLookups: number
  cartAdditions: number
  conversionRate: number
  changes?: {
    conversations: string
    messages: string
    productSearches: string
    cartAdditions: string
    orderLookups: string
    conversionRate: string
  }
  aiPerformance?: {
    avgResponseTime: number
    avgResponseTimeChange: string
    avgResponseTimePositive: boolean
    successRate: number
    successRateChange: string
    successRatePositive: boolean
    toolCalls: number
    toolCallsChange: string
    toolCallsPositive: boolean
  }
  modelInfo?: {
    chatbotModel: string
    contentModel: string
    maxTokens: number
    temperature: number
    activeTools: number
    status: 'active' | 'inactive'
  }
}

interface DailyStats {
  date: string
  conversations: number
  messages: number
}

export default function AIDashboard() {
  const [stats, setStats] = useState<ChatStats | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [activeTab, setActiveTab] = useState<'stats' | 'insights' | 'marketing' | 'analyzer' | 'forecast' | 'segments' | 'anomaly' | 'inventory' | 'seo' | 'responses' | 'pricing' | 'content' | 'churn' | 'bundles' | 'returns' | 'tagging' | 'stockforecast' | 'fraud' | 'abtest' | 'competitor' | 'reviews' | 'social' | 'settings'>('stats')

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const data = await getAIStats(timeRange)
      if (data.success && data.stats) {
        setStats(data.stats)
        setDailyStats(data.dailyStats || [])
      }
    } catch (error) {
      console.error('Failed to fetch AI stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data for demo (only used when no real data)
  const mockStats: ChatStats = {
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
    topQueries: [
      { query: 'Még nincs adat', count: 0 }
    ],
    productSearches: 0,
    orderLookups: 0,
    cartAdditions: 0,
    conversionRate: 0,
    changes: {
      conversations: '0%',
      messages: '0%',
      productSearches: '0%',
      cartAdditions: '0%',
      orderLookups: '0%',
      conversionRate: '0%'
    },
    aiPerformance: {
      avgResponseTime: 0,
      avgResponseTimeChange: '0s',
      avgResponseTimePositive: true,
      successRate: 0,
      successRateChange: '0%',
      successRatePositive: true,
      toolCalls: 0,
      toolCallsChange: '0%',
      toolCallsPositive: true
    },
    modelInfo: {
      chatbotModel: 'gpt-4o-mini',
      contentModel: 'gpt-4o',
      maxTokens: 1500,
      temperature: 0.7,
      activeTools: 12,
      status: 'active'
    }
  }

  const displayStats = stats || mockStats
  const changes = displayStats.changes || mockStats.changes!
  const aiPerformance = displayStats.aiPerformance || mockStats.aiPerformance!
  const modelInfo = displayStats.modelInfo || mockStats.modelInfo!

  const isPositiveChange = (changeStr: string): boolean => {
    return changeStr.startsWith('+') || changeStr === '0%'
  }

  const statCards = [
    {
      title: 'Beszélgetések',
      value: displayStats.totalConversations.toLocaleString('hu-HU'),
      change: changes.conversations,
      positive: isPositiveChange(changes.conversations),
      icon: MessageSquare,
      color: 'purple'
    },
    {
      title: 'Üzenetek',
      value: displayStats.totalMessages.toLocaleString('hu-HU'),
      change: changes.messages,
      positive: isPositiveChange(changes.messages),
      icon: Bot,
      color: 'blue'
    },
    {
      title: 'Termékkeresések',
      value: displayStats.productSearches.toLocaleString('hu-HU'),
      change: changes.productSearches,
      positive: isPositiveChange(changes.productSearches),
      icon: Search,
      color: 'green'
    },
    {
      title: 'Kosárba helyezés',
      value: displayStats.cartAdditions.toLocaleString('hu-HU'),
      change: changes.cartAdditions,
      positive: isPositiveChange(changes.cartAdditions),
      icon: ShoppingCart,
      color: 'orange'
    },
    {
      title: 'Rendelés követés',
      value: displayStats.orderLookups.toLocaleString('hu-HU'),
      change: changes.orderLookups,
      positive: isPositiveChange(changes.orderLookups),
      icon: Package,
      color: 'pink'
    },
    {
      title: 'Konverzió',
      value: `${displayStats.conversionRate}%`,
      change: changes.conversionRate,
      positive: isPositiveChange(changes.conversionRate),
      icon: TrendingUp,
      color: 'cyan'
    }
  ]

  const colorClasses: Record<string, string> = {
    purple: 'from-purple-600 to-purple-800',
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    orange: 'from-orange-600 to-orange-800',
    pink: 'from-pink-600 to-pink-800',
    cyan: 'from-cyan-600 to-cyan-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" />
            AI Dashboard
          </h1>
          <p className="text-gray-400 mt-1">NEXU AI chatbot teljesítmény és elemzések</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="7d">Utolsó 7 nap</option>
            <option value="30d">Utolsó 30 nap</option>
            <option value="90d">Utolsó 90 nap</option>
          </select>
          <button
            onClick={fetchStats}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-xl">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare size={16} />
          Chatbot
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'insights'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Brain size={16} />
          Üzleti Elemzések
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'forecast'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LineChart size={16} />
          Előrejelzés
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'segments'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users size={16} />
          Ügyfél Szegmensek
        </button>
        <button
          onClick={() => setActiveTab('anomaly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'anomaly'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle size={16} />
          Anomáliák
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package size={16} />
          Készlet
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'seo'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search size={16} />
          SEO
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'marketing'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wand2 size={16} />
          Marketing
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'responses'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare size={16} />
          Válasz Generátor
        </button>
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'analyzer'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 size={16} />
          Termék Elemző
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'pricing'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign size={16} />
          Ároptimalizáló
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'content'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText size={16} />
          Content Studio
        </button>
        <button
          onClick={() => setActiveTab('churn')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'churn'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserX size={16} />
          Churn Előrejelzés
        </button>
        <button
          onClick={() => setActiveTab('bundles')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'bundles'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Gift size={16} />
          Smart Bundler
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'returns'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <RotateCcw size={16} />
          Visszáru Előrejelző
        </button>
        <button
          onClick={() => setActiveTab('tagging')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'tagging'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Tag size={16} />
          Auto Címkézés
        </button>
        <button
          onClick={() => setActiveTab('stockforecast')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'stockforecast'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <PackageSearch size={16} />
          Készlet Előrejelző
        </button>
        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'fraud'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield size={16} />
          Fraud Detekció
        </button>
        <button
          onClick={() => setActiveTab('abtest')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'abtest'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FlaskConical size={16} />
          A/B Tesztek
        </button>
        <button
          onClick={() => setActiveTab('competitor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'competitor'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye size={16} />
          Versenytárs Monitor
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Star size={16} />
          Értékelés Válasz
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'social'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Share2 size={16} />
          Social Media
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings size={16} />
          Beállítások
        </button>
      </div>

      {activeTab === 'insights' ? (
        <AIInsightsPanel />
      ) : activeTab === 'marketing' ? (
        <AIMarketingAssistant />
      ) : activeTab === 'analyzer' ? (
        <AIProductAnalyzer />
      ) : activeTab === 'forecast' ? (
        <AIForecastPanel />
      ) : activeTab === 'segments' ? (
        <AICustomerSegments />
      ) : activeTab === 'anomaly' ? (
        <AIAnomalyDetection />
      ) : activeTab === 'inventory' ? (
        <AIInventoryOptimization />
      ) : activeTab === 'seo' ? (
        <AISEOPanel />
      ) : activeTab === 'responses' ? (
        <AICustomerResponsePanel />
      ) : activeTab === 'pricing' ? (
        <AIPriceOptimizer />
      ) : activeTab === 'content' ? (
        <AIContentStudio />
      ) : activeTab === 'churn' ? (
        <AIChurnPrediction />
      ) : activeTab === 'bundles' ? (
        <AISmartBundler />
      ) : activeTab === 'returns' ? (
        <AIReturnPredictor />
      ) : activeTab === 'tagging' ? (
        <AIAutoTagging />
      ) : activeTab === 'stockforecast' ? (
        <AIInventoryPredictor />
      ) : activeTab === 'fraud' ? (
        <AIFraudDetection />
      ) : activeTab === 'abtest' ? (
        <AIABTestAnalyzer />
      ) : activeTab === 'competitor' ? (
        <AICompetitorMonitor />
      ) : activeTab === 'reviews' ? (
        <AIReviewResponder />
      ) : activeTab === 'social' ? (
        <AISocialManager />
      ) : activeTab === 'settings' ? (
        <AISettings />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#121212] border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClasses[stat.color]} flex items-center justify-center mb-3`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <p className="text-gray-400 text-xs mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
              {stat.positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Queries */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Search size={18} className="text-purple-400" />
            Leggyakoribb keresések
          </h2>
          <div className="space-y-3">
            {displayStats.topQueries.map((query, index) => {
              const maxCount = displayStats.topQueries[0]?.count || 1
              const percentage = (query.count / maxCount) * 100
              
              return (
                <div key={query.query} className="flex items-center gap-3">
                  <span className="text-gray-500 w-6 text-sm">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white capitalize">{query.query}</span>
                      <span className="text-gray-400">{query.count}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Performance */}
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-400" />
            AI Teljesítmény
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Átlagos válaszidő</p>
              <p className="text-xl font-bold text-white">{aiPerformance.avgResponseTime.toFixed(1)}s</p>
              <p className={`text-xs mt-1 ${aiPerformance.avgResponseTimePositive ? 'text-green-400' : 'text-red-400'}`}>
                {aiPerformance.avgResponseTimeChange} az előző időszakhoz képest
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Sikeres keresések</p>
              <p className="text-xl font-bold text-white">{aiPerformance.successRate}%</p>
              <p className={`text-xs mt-1 ${aiPerformance.successRatePositive ? 'text-green-400' : 'text-red-400'}`}>
                {aiPerformance.successRateChange} az előző időszakhoz képest
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Átl. üzenet/beszélgetés</p>
              <p className="text-xl font-bold text-white">{displayStats.avgMessagesPerConversation.toFixed(1)}</p>
              <p className="text-blue-400 text-xs mt-1">Átlagos aktivitás</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Tool hívások</p>
              <p className="text-xl font-bold text-white">{aiPerformance.toolCalls.toLocaleString('hu-HU')}</p>
              <p className={`text-xs mt-1 ${aiPerformance.toolCallsPositive ? 'text-green-400' : 'text-red-400'}`}>
                {aiPerformance.toolCallsChange} az előző időszakhoz képest
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Bot size={20} className="text-purple-400" />
              AI Model Info
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-4">
              <div>
                <p className="text-gray-400 text-xs">Chatbot Model</p>
                <p className="text-white font-semibold">{modelInfo.chatbotModel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Content Model</p>
                <p className="text-white font-semibold">{modelInfo.contentModel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Max Tokens</p>
                <p className="text-white font-semibold">{modelInfo.maxTokens.toLocaleString('hu-HU')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Temperature</p>
                <p className="text-white font-semibold">{modelInfo.temperature}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Aktív Tools</p>
                <p className="text-white font-semibold">{modelInfo.activeTools} db</p>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            modelInfo.status === 'active' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              modelInfo.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${
              modelInfo.status === 'active' ? 'text-green-400' : 'text-red-400'
            }`}>
              {modelInfo.status === 'active' ? 'Aktív' : 'Inaktív'}
            </span>
          </div>
        </div>
        
        {/* Tools list */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-gray-400 text-xs mb-2">Elérhető funkciók:</p>
          <div className="flex flex-wrap gap-2">
            {['Termékkeresés', 'Termék részletek', 'Rendelés követés', 'Összehasonlítás', 'FAQ válaszok', 'Népszerű termékek', 'Kosárba helyezés', 'Ajánlások', 'Kuponok', 'Szállítás', 'Készlet', 'Akciók'].map((tool) => (
              <span key={tool} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
