'use client'

import { useState, useEffect } from 'react'
import { Bot, MessageSquare, ShoppingCart, TrendingUp, Users, Clock, Search, Package, Sparkles, ArrowUp, ArrowDown, RefreshCw, Brain, Wand2, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import AIInsightsPanel from '../components/AIInsightsPanel'
import AIMarketingAssistant from '../components/AIMarketingAssistant'
import AIProductAnalyzer from '../components/AIProductAnalyzer'

interface ChatStats {
  totalConversations: number
  totalMessages: number
  avgMessagesPerConversation: number
  topQueries: { query: string; count: number }[]
  productSearches: number
  orderLookups: number
  cartAdditions: number
  conversionRate: number
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
  const [activeTab, setActiveTab] = useState<'stats' | 'insights' | 'marketing' | 'analyzer'>('stats')

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/ai-stats?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setDailyStats(data.dailyStats)
      }
    } catch (error) {
      console.error('Failed to fetch AI stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data for demo
  const mockStats: ChatStats = {
    totalConversations: 1247,
    totalMessages: 8932,
    avgMessagesPerConversation: 7.2,
    topQueries: [
      { query: 'telefon', count: 342 },
      { query: 'laptop', count: 256 },
      { query: 'szállítás', count: 189 },
      { query: 'rendelés', count: 156 },
      { query: 'gaming', count: 134 }
    ],
    productSearches: 2341,
    orderLookups: 567,
    cartAdditions: 423,
    conversionRate: 18.2
  }

  const displayStats = stats || mockStats

  const statCards = [
    {
      title: 'Beszélgetések',
      value: displayStats.totalConversations.toLocaleString('hu-HU'),
      change: '+12%',
      positive: true,
      icon: MessageSquare,
      color: 'purple'
    },
    {
      title: 'Üzenetek',
      value: displayStats.totalMessages.toLocaleString('hu-HU'),
      change: '+8%',
      positive: true,
      icon: Bot,
      color: 'blue'
    },
    {
      title: 'Termékkeresések',
      value: displayStats.productSearches.toLocaleString('hu-HU'),
      change: '+24%',
      positive: true,
      icon: Search,
      color: 'green'
    },
    {
      title: 'Kosárba helyezés',
      value: displayStats.cartAdditions.toLocaleString('hu-HU'),
      change: '+15%',
      positive: true,
      icon: ShoppingCart,
      color: 'orange'
    },
    {
      title: 'Rendelés követés',
      value: displayStats.orderLookups.toLocaleString('hu-HU'),
      change: '-3%',
      positive: false,
      icon: Package,
      color: 'pink'
    },
    {
      title: 'Konverzió',
      value: `${displayStats.conversionRate}%`,
      change: '+2.3%',
      positive: true,
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
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare size={16} />
          Chatbot Statisztikák
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
          AI Üzleti Elemzések
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
          Marketing Asszisztens
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
      </div>

      {activeTab === 'insights' ? (
        <AIInsightsPanel />
      ) : activeTab === 'marketing' ? (
        <AIMarketingAssistant />
      ) : activeTab === 'analyzer' ? (
        <AIProductAnalyzer />
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
              <p className="text-xl font-bold text-white">1.2s</p>
              <p className="text-green-400 text-xs mt-1">-0.3s a múlt héthez képest</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Sikeres keresések</p>
              <p className="text-xl font-bold text-white">94.2%</p>
              <p className="text-green-400 text-xs mt-1">+2.1% a múlt héthez képest</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Átl. üzenet/beszélgetés</p>
              <p className="text-xl font-bold text-white">{displayStats.avgMessagesPerConversation.toFixed(1)}</p>
              <p className="text-blue-400 text-xs mt-1">Stabil</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Tool hívások</p>
              <p className="text-xl font-bold text-white">3,421</p>
              <p className="text-green-400 text-xs mt-1">+18% a múlt héthez képest</p>
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
                <p className="text-white font-semibold">GPT-5 Mini</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Content Model</p>
                <p className="text-white font-semibold">GPT-5.2</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Max Tokens</p>
                <p className="text-white font-semibold">1,500</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Temperature</p>
                <p className="text-white font-semibold">0.7</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Aktív Tools</p>
                <p className="text-white font-semibold">12 db</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Aktív</span>
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
