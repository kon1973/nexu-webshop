'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bot, MessageSquare, ShoppingCart, TrendingUp, Users, Search, Package, Sparkles, ArrowUp, ArrowDown, RefreshCw, Brain, Wand2, BarChart3, LineChart, AlertTriangle, DollarSign, FileText, UserX, Gift, RotateCcw, Tag, PackageSearch, Shield, FlaskConical, Eye, Star, Share2, Settings, Zap, Activity, Globe, Clock, Target, ChevronRight, Info, Lightbulb, PieChart, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { getAIStats } from '@/lib/actions/ai-actions'

// Lazy load components for better performance
const AIInsightsPanel = dynamic(() => import('../components/AIInsightsPanel'), { loading: () => <LoadingPanel /> })
const AIMarketingAssistant = dynamic(() => import('../components/AIMarketingAssistant'), { loading: () => <LoadingPanel /> })
const AIProductAnalyzer = dynamic(() => import('../components/AIProductAnalyzer'), { loading: () => <LoadingPanel /> })
const AIForecastPanel = dynamic(() => import('../components/AIForecastPanel'), { loading: () => <LoadingPanel /> })
const AICustomerSegments = dynamic(() => import('../components/AICustomerSegments'), { loading: () => <LoadingPanel /> })
const AIAnomalyDetection = dynamic(() => import('../components/AIAnomalyDetection'), { loading: () => <LoadingPanel /> })
const AIInventoryOptimization = dynamic(() => import('../components/AIInventoryOptimization'), { loading: () => <LoadingPanel /> })
const AISEOPanel = dynamic(() => import('../components/AISEOPanel'), { loading: () => <LoadingPanel /> })
const AICustomerResponsePanel = dynamic(() => import('../components/AICustomerResponsePanel'), { loading: () => <LoadingPanel /> })
const AIPriceOptimizer = dynamic(() => import('../components/AIPriceOptimizer'), { loading: () => <LoadingPanel /> })
const AIContentStudio = dynamic(() => import('../components/AIContentStudio'), { loading: () => <LoadingPanel /> })
const AIChurnPrediction = dynamic(() => import('../components/AIChurnPrediction'), { loading: () => <LoadingPanel /> })
const AISmartBundler = dynamic(() => import('../components/AISmartBundler'), { loading: () => <LoadingPanel /> })
const AIReturnPredictor = dynamic(() => import('../components/AIReturnPredictor'), { loading: () => <LoadingPanel /> })
const AIAutoTagging = dynamic(() => import('../components/AIAutoTagging'), { loading: () => <LoadingPanel /> })
const AIInventoryPredictor = dynamic(() => import('../components/AIInventoryPredictor'), { loading: () => <LoadingPanel /> })
const AIFraudDetection = dynamic(() => import('../components/AIFraudDetection'), { loading: () => <LoadingPanel /> })
const AIABTestAnalyzer = dynamic(() => import('../components/AIABTestAnalyzer'), { loading: () => <LoadingPanel /> })
const AICompetitorMonitor = dynamic(() => import('../components/AICompetitorMonitor'), { loading: () => <LoadingPanel /> })
const AIReviewResponder = dynamic(() => import('../components/AIReviewResponder'), { loading: () => <LoadingPanel /> })
const AISocialManager = dynamic(() => import('../components/AISocialManager'), { loading: () => <LoadingPanel /> })
const AISettings = dynamic(() => import('../components/AISettings'), { loading: () => <LoadingPanel /> })

// Loading placeholder
function LoadingPanel() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="animate-spin text-purple-400" size={32} />
        <span className="text-gray-400 text-sm">Betöltés...</span>
      </div>
    </div>
  )
}

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

// Tab categories
const tabCategories = [
  {
    id: 'overview',
    name: 'Áttekintés',
    icon: PieChart,
    tabs: [
      { id: 'stats', name: 'Chatbot', icon: MessageSquare, color: 'purple' },
      { id: 'insights', name: 'Üzleti Elemzések', icon: Brain, color: 'blue' },
      { id: 'forecast', name: 'Előrejelzés', icon: LineChart, color: 'green' }
    ]
  },
  {
    id: 'customers',
    name: 'Ügyfelek',
    icon: Users,
    tabs: [
      { id: 'segments', name: 'Szegmensek', icon: Users, color: 'cyan' },
      { id: 'churn', name: 'Churn', icon: UserX, color: 'red' },
      { id: 'responses', name: 'Válasz Gen.', icon: MessageSquare, color: 'orange' },
      { id: 'reviews', name: 'Értékelések', icon: Star, color: 'yellow' }
    ]
  },
  {
    id: 'products',
    name: 'Termékek',
    icon: Package,
    tabs: [
      { id: 'analyzer', name: 'Elemző', icon: BarChart3, color: 'purple' },
      { id: 'pricing', name: 'Ároptimalizáló', icon: DollarSign, color: 'green' },
      { id: 'bundles', name: 'Csomagok', icon: Gift, color: 'pink' },
      { id: 'tagging', name: 'Címkézés', icon: Tag, color: 'blue' }
    ]
  },
  {
    id: 'inventory',
    name: 'Készlet',
    icon: Layers,
    tabs: [
      { id: 'inventory', name: 'Optimalizálás', icon: Package, color: 'orange' },
      { id: 'stockforecast', name: 'Előrejelző', icon: PackageSearch, color: 'teal' },
      { id: 'returns', name: 'Visszáru', icon: RotateCcw, color: 'red' }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Wand2,
    tabs: [
      { id: 'marketing', name: 'Asszisztens', icon: Wand2, color: 'pink' },
      { id: 'content', name: 'Content Studio', icon: FileText, color: 'purple' },
      { id: 'seo', name: 'SEO', icon: Search, color: 'green' },
      { id: 'social', name: 'Social Media', icon: Share2, color: 'blue' }
    ]
  },
  {
    id: 'analytics',
    name: 'Analitika',
    icon: Activity,
    tabs: [
      { id: 'anomaly', name: 'Anomáliák', icon: AlertTriangle, color: 'yellow' },
      { id: 'fraud', name: 'Fraud', icon: Shield, color: 'red' },
      { id: 'abtest', name: 'A/B Teszt', icon: FlaskConical, color: 'purple' },
      { id: 'competitor', name: 'Versenytárs', icon: Eye, color: 'cyan' }
    ]
  },
  {
    id: 'system',
    name: 'Rendszer',
    icon: Settings,
    tabs: [
      { id: 'settings', name: 'Beállítások', icon: Settings, color: 'gray' }
    ]
  }
]

type TabId = 'stats' | 'insights' | 'marketing' | 'analyzer' | 'forecast' | 'segments' | 'anomaly' | 'inventory' | 'seo' | 'responses' | 'pricing' | 'content' | 'churn' | 'bundles' | 'returns' | 'tagging' | 'stockforecast' | 'fraud' | 'abtest' | 'competitor' | 'reviews' | 'social' | 'settings'

export default function AIDashboardEnhanced() {
  const [stats, setStats] = useState<ChatStats | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [activeTab, setActiveTab] = useState<TabId>('stats')
  const [expandedCategory, setExpandedCategory] = useState<string>('overview')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [realtimeMode, setRealtimeMode] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Auto-refresh in realtime mode
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (realtimeMode) {
      interval = setInterval(() => {
        fetchStats()
        setLastUpdate(new Date())
      }, 30000) // Every 30 seconds
    }
    return () => clearInterval(interval)
  }, [realtimeMode, timeRange])

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = useCallback(async () => {
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
  }, [timeRange])

  const mockStats: ChatStats = {
    totalConversations: 1247,
    totalMessages: 8934,
    avgMessagesPerConversation: 7.2,
    topQueries: [
      { query: 'iPhone 15 Pro', count: 234 },
      { query: 'Samsung Galaxy', count: 189 },
      { query: 'Laptop ajánlás', count: 156 },
      { query: 'Szállítási idő', count: 134 },
      { query: 'Garancia', count: 98 }
    ],
    productSearches: 3456,
    orderLookups: 892,
    cartAdditions: 567,
    conversionRate: 12.4,
    changes: {
      conversations: '+23%',
      messages: '+31%',
      productSearches: '+18%',
      cartAdditions: '+27%',
      orderLookups: '+15%',
      conversionRate: '+2.3%'
    },
    aiPerformance: {
      avgResponseTime: 1.8,
      avgResponseTimeChange: '-0.3s',
      avgResponseTimePositive: true,
      successRate: 94.5,
      successRateChange: '+2.1%',
      successRatePositive: true,
      toolCalls: 12456,
      toolCallsChange: '+34%',
      toolCallsPositive: true
    },
    modelInfo: {
      chatbotModel: 'gpt-4o-mini',
      contentModel: 'gpt-4o',
      maxTokens: 1500,
      temperature: 0.7,
      activeTools: 15,
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

  // Quick Actions
  const quickActions = [
    { id: 'generate-report', name: 'Havi riport generálása', icon: FileText, color: 'blue' },
    { id: 'optimize-prices', name: 'Árak optimalizálása', icon: DollarSign, color: 'green' },
    { id: 'check-anomalies', name: 'Anomáliák ellenőrzése', icon: AlertTriangle, color: 'yellow' },
    { id: 'generate-content', name: 'Tartalom generálása', icon: Wand2, color: 'purple' },
    { id: 'analyze-competitors', name: 'Versenytárs elemzés', icon: Eye, color: 'cyan' },
    { id: 'forecast-sales', name: 'Értékesítés előrejelzés', icon: TrendingUp, color: 'pink' }
  ]

  // AI Health Score
  const healthScore = Math.round((aiPerformance.successRate * 0.4 + (100 - aiPerformance.avgResponseTime * 10) * 0.3 + (displayStats.conversionRate * 5) * 0.3))

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
    if (score >= 60) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    return 'from-red-500/20 to-rose-500/20 border-red-500/30'
  }

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'insights': return <AIInsightsPanel />
      case 'marketing': return <AIMarketingAssistant />
      case 'analyzer': return <AIProductAnalyzer />
      case 'forecast': return <AIForecastPanel />
      case 'segments': return <AICustomerSegments />
      case 'anomaly': return <AIAnomalyDetection />
      case 'inventory': return <AIInventoryOptimization />
      case 'seo': return <AISEOPanel />
      case 'responses': return <AICustomerResponsePanel />
      case 'pricing': return <AIPriceOptimizer />
      case 'content': return <AIContentStudio />
      case 'churn': return <AIChurnPrediction />
      case 'bundles': return <AISmartBundler />
      case 'returns': return <AIReturnPredictor />
      case 'tagging': return <AIAutoTagging />
      case 'stockforecast': return <AIInventoryPredictor />
      case 'fraud': return <AIFraudDetection />
      case 'abtest': return <AIABTestAnalyzer />
      case 'competitor': return <AICompetitorMonitor />
      case 'reviews': return <AIReviewResponder />
      case 'social': return <AISocialManager />
      case 'settings': return <AISettings />
      default: return null
    }
  }

  const statCards = [
    { title: 'Beszélgetések', value: displayStats.totalConversations.toLocaleString('hu-HU'), change: changes.conversations, icon: MessageSquare, color: 'purple' },
    { title: 'Üzenetek', value: displayStats.totalMessages.toLocaleString('hu-HU'), change: changes.messages, icon: Bot, color: 'blue' },
    { title: 'Termékkeresések', value: displayStats.productSearches.toLocaleString('hu-HU'), change: changes.productSearches, icon: Search, color: 'green' },
    { title: 'Kosárba helyezés', value: displayStats.cartAdditions.toLocaleString('hu-HU'), change: changes.cartAdditions, icon: ShoppingCart, color: 'orange' },
    { title: 'Rendelés követés', value: displayStats.orderLookups.toLocaleString('hu-HU'), change: changes.orderLookups, icon: Package, color: 'pink' },
    { title: 'Konverzió', value: `${displayStats.conversionRate}%`, change: changes.conversionRate, icon: TrendingUp, color: 'cyan' }
  ]

  const colorClasses: Record<string, string> = {
    purple: 'from-purple-600 to-purple-800',
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    orange: 'from-orange-600 to-orange-800',
    pink: 'from-pink-600 to-pink-800',
    cyan: 'from-cyan-600 to-cyan-800',
    yellow: 'from-yellow-600 to-yellow-800',
    red: 'from-red-600 to-red-800',
    teal: 'from-teal-600 to-teal-800',
    gray: 'from-gray-600 to-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-pink-900/40 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                <Sparkles className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  AI Command Center
                </h1>
                <p className="text-gray-400">NEXU AI rendszer kezelőfelület • 22 aktív eszköz</p>
              </div>
            </div>
            
            {/* AI Health Score */}
            <div className={`inline-flex items-center gap-3 mt-3 px-4 py-2 rounded-xl bg-gradient-to-r ${getHealthBg(healthScore)} border`}>
              <Activity className={getHealthColor(healthScore)} size={20} />
              <div>
                <span className="text-gray-400 text-sm">AI Egészség: </span>
                <span className={`font-bold text-lg ${getHealthColor(healthScore)}`}>{healthScore}%</span>
              </div>
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${healthScore}%` }}
                  className={`h-full rounded-full ${healthScore >= 80 ? 'bg-green-500' : healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Controls Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Realtime Toggle */}
              <button
                onClick={() => setRealtimeMode(!realtimeMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  realtimeMode 
                    ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Zap size={16} className={realtimeMode ? 'animate-pulse' : ''} />
                {realtimeMode ? 'Élő' : 'Élő mód'}
              </button>

              {/* Time Range */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="7d">7 nap</option>
                <option value="30d">30 nap</option>
                <option value="90d">90 nap</option>
              </select>

              {/* Quick Actions */}
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/20"
              >
                <Lightbulb size={16} />
                Gyors műveletek
              </button>

              {/* Refresh */}
              <button
                onClick={fetchStats}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Last Update */}
            <div className="flex items-center gap-2 text-gray-500 text-sm justify-end">
              <Clock size={14} />
              Utolsó frissítés: {lastUpdate.toLocaleTimeString('hu-HU')}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {quickActions.map(action => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${colorClasses[action.color]} bg-opacity-20 border border-white/10 hover:border-white/20 transition-all`}
                  >
                    <action.icon size={24} className="text-white" />
                    <span className="text-white text-xs text-center">{action.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categorized Tab Navigation */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          {tabCategories.map(category => (
            <div key={category.id} className="relative group">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.id ? '' : category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  category.tabs.some(t => t.id === activeTab)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <category.icon size={16} />
                {category.name}
                <ChevronRight 
                  size={14} 
                  className={`transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''}`} 
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 min-w-[200px] shadow-xl"
                  >
                    {category.tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as TabId)
                          setExpandedCategory('')
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[tab.color]} flex items-center justify-center`}>
                          <tab.icon size={14} className="text-white" />
                        </div>
                        {tab.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'stats' ? (
            <>
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-[#121212] border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <stat.icon size={22} className="text-white" />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                    <div className={`flex items-center gap-1 text-sm ${isPositiveChange(stat.change) ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositiveChange(stat.change) ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {stat.change}
                      <span className="text-gray-500 text-xs ml-1">vs előző</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Performance & Insights Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Top Queries */}
                <div className="lg:col-span-2 bg-[#121212] border border-white/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="text-purple-400" size={20} />
                    Top keresések
                    <span className="ml-auto text-sm text-gray-500 font-normal">Utolsó {timeRange}</span>
                  </h2>
                  <div className="space-y-4">
                    {displayStats.topQueries.map((query, index) => {
                      const maxCount = displayStats.topQueries[0]?.count || 1
                      const percentage = (query.count / maxCount) * 100
                      
                      return (
                        <motion.div 
                          key={query.query} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              index === 1 ? 'bg-gray-500/20 text-gray-400' :
                              index === 2 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-white/5 text-gray-500'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-white font-medium group-hover:text-purple-400 transition-colors">{query.query}</span>
                                <span className="text-gray-400">{query.count} keresés</span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.1 }}
                                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* AI Performance Card */}
                <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="text-green-400" size={20} />
                    AI Teljesítmény
                  </h2>
                  <div className="space-y-4">
                    {/* Response Time */}
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Válaszidő</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          aiPerformance.avgResponseTimePositive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {aiPerformance.avgResponseTimeChange}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white">{aiPerformance.avgResponseTime.toFixed(1)}s</p>
                    </div>

                    {/* Success Rate */}
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Sikeres válaszok</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          aiPerformance.successRatePositive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {aiPerformance.successRateChange}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white">{aiPerformance.successRate}%</p>
                    </div>

                    {/* Tool Calls */}
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Tool hívások</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          aiPerformance.toolCallsPositive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {aiPerformance.toolCallsChange}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white">{aiPerformance.toolCalls.toLocaleString('hu-HU')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Info */}
              <div className="mt-6 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-pink-900/30 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Bot size={24} className="text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Konfiguráció</h2>
                      <p className="text-gray-400 text-sm">Aktív modellek és beállítások</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    modelInfo.status === 'active' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    <span className={`w-3 h-3 rounded-full animate-pulse ${
                      modelInfo.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={`font-medium ${
                      modelInfo.status === 'active' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {modelInfo.status === 'active' ? 'Rendszer aktív' : 'Rendszer inaktív'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Chatbot Model', value: modelInfo.chatbotModel, icon: MessageSquare },
                    { label: 'Content Model', value: modelInfo.contentModel, icon: FileText },
                    { label: 'Max Tokens', value: modelInfo.maxTokens.toLocaleString('hu-HU'), icon: Layers },
                    { label: 'Temperature', value: modelInfo.temperature.toString(), icon: Activity },
                    { label: 'Aktív Tools', value: `${modelInfo.activeTools} db`, icon: Zap }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon size={14} className="text-purple-400" />
                        <span className="text-gray-400 text-xs">{item.label}</span>
                      </div>
                      <p className="text-white font-semibold text-lg">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Available Tools */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                    <Info size={14} />
                    Elérhető AI funkciók
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Termékkeresés', 'Termék részletek', 'Rendelés követés', 'Összehasonlítás', 'FAQ válaszok', 'Népszerű termékek', 'Kosárba helyezés', 'Személyre szabott ajánlások', 'Kupon kezelés', 'Szállítási kalkulátor', 'Készlet ellenőrzés', 'Akciók keresése', 'Garancia info', 'Kapcsolat', 'Bolt infó'].map((tool) => (
                      <span key={tool} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors cursor-default">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            renderTabContent()
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
