'use client'

import { useState } from 'react'
import { UserX, AlertTriangle, TrendingDown, RefreshCw, Mail, Phone, Gift, Users, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeChurnRisk } from '@/lib/actions/ai-actions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { hu } from 'date-fns/locale'

interface ChurnCustomer {
  userId: string
  email: string
  name: string | null
  riskScore: number
  riskLevel: 'high' | 'medium' | 'low'
  lastOrderDate: Date | string | null
  daysSinceLastOrder: number
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  riskFactors: string[]
  recommendedActions: string[]
}

interface AIInsights {
  summary?: string
  urgentActions?: string[]
  campaignIdeas?: Array<{ name: string; target: string; description: string }>
  preventionTips?: string[]
}

export default function AIChurnPrediction() {
  const [customers, setCustomers] = useState<ChurnCustomer[]>([])
  const [summary, setSummary] = useState<{
    totalCustomers: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
    atRiskRevenue: number
  } | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<ChurnCustomer | null>(null)

  const analyzeChurn = async () => {
    setIsLoading(true)
    try {
      const result = await analyzeChurnRisk()
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCustomers((result.customers || []) as any)
      setSummary(result.summary || null)
      setAiInsights(result.aiInsights as AIInsights || null)
    } catch {
      toast.error('Hiba történt az elemzés során')
    } finally {
      setIsLoading(false)
    }
  }

  const riskColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30'
  }

  const riskLabels = {
    high: 'Magas',
    medium: 'Közepes',
    low: 'Alacsony'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserX className="text-red-400" />
            Ügyfél Lemorzsolódás Előrejelzés
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            AI-alapú kockázatelemzés és megtartási javaslatok
          </p>
        </div>
        <button
          onClick={analyzeChurn}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          Elemzés indítása
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border border-white/10 rounded-xl p-4"
          >
            <Users size={20} className="text-blue-400 mb-2" />
            <p className="text-gray-400 text-xs">Összes vásárló</p>
            <p className="text-2xl font-bold text-white">{summary.totalCustomers}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#121212] border border-red-500/30 rounded-xl p-4"
          >
            <AlertTriangle size={20} className="text-red-400 mb-2" />
            <p className="text-gray-400 text-xs">Magas kockázat</p>
            <p className="text-2xl font-bold text-red-400">{summary.highRisk}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#121212] border border-yellow-500/30 rounded-xl p-4"
          >
            <TrendingDown size={20} className="text-yellow-400 mb-2" />
            <p className="text-gray-400 text-xs">Közepes kockázat</p>
            <p className="text-2xl font-bold text-yellow-400">{summary.mediumRisk}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#121212] border border-green-500/30 rounded-xl p-4"
          >
            <Users size={20} className="text-green-400 mb-2" />
            <p className="text-gray-400 text-xs">Alacsony kockázat</p>
            <p className="text-2xl font-bold text-green-400">{summary.lowRisk}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#121212] border border-purple-500/30 rounded-xl p-4"
          >
            <Gift size={20} className="text-purple-400 mb-2" />
            <p className="text-gray-400 text-xs">Kockáztatott bevétel</p>
            <p className="text-xl font-bold text-purple-400">
              {summary.atRiskRevenue.toLocaleString('hu-HU')} Ft
            </p>
          </motion.div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/20 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="text-orange-400" />
            AI Elemzés és Javaslatok
          </h3>
          
          {aiInsights.summary && (
            <p className="text-gray-300 mb-4">{aiInsights.summary}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights.urgentActions && aiInsights.urgentActions.length > 0 && (
              <div>
                <h4 className="text-red-400 font-medium mb-2">🚨 Sürgős teendők</h4>
                <ul className="space-y-1">
                  {aiInsights.urgentActions.map((action, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.preventionTips && aiInsights.preventionTips.length > 0 && (
              <div>
                <h4 className="text-green-400 font-medium mb-2">💡 Megelőzési tippek</h4>
                <ul className="space-y-1">
                  {aiInsights.preventionTips.map((tip, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {aiInsights.campaignIdeas && aiInsights.campaignIdeas.length > 0 && (
            <div className="mt-4">
              <h4 className="text-purple-400 font-medium mb-2">📧 Kampány ötletek</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiInsights.campaignIdeas.map((campaign, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white font-medium text-sm">{campaign.name}</p>
                    <p className="text-gray-500 text-xs mt-1">Célcsoport: {campaign.target}</p>
                    <p className="text-gray-400 text-xs mt-1">{campaign.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Customer List */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Ügyfelek elemzése...</p>
          </motion.div>
        ) : customers.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 text-xs font-medium p-4">Ügyfél</th>
                    <th className="text-left text-gray-400 text-xs font-medium p-4">Kockázat</th>
                    <th className="text-left text-gray-400 text-xs font-medium p-4">Utolsó rendelés</th>
                    <th className="text-left text-gray-400 text-xs font-medium p-4">Rendelések</th>
                    <th className="text-left text-gray-400 text-xs font-medium p-4">Összköltés</th>
                    <th className="text-left text-gray-400 text-xs font-medium p-4">Kockázati tényezők</th>
                    <th className="text-left text-gray-400 text-xs font-medium p-4">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <motion.tr
                      key={customer.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <p className="text-white font-medium">{customer.name || 'N/A'}</p>
                        <p className="text-gray-500 text-xs">{customer.email}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs border ${riskColors[customer.riskLevel]}`}>
                            {riskLabels[customer.riskLevel]}
                          </span>
                          <span className="text-gray-500 text-xs">{customer.riskScore}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">
                          {customer.lastOrderDate 
                            ? format(new Date(customer.lastOrderDate), 'yyyy. MMM d.', { locale: hu })
                            : 'N/A'
                          }
                        </p>
                        <p className="text-gray-500 text-xs">{customer.daysSinceLastOrder} napja</p>
                      </td>
                      <td className="p-4 text-white">{customer.totalOrders}</td>
                      <td className="p-4 text-white">
                        {customer.totalSpent.toLocaleString('hu-HU')} Ft
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.riskFactors.slice(0, 2).map((factor, i) => (
                            <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                              {factor}
                            </span>
                          ))}
                          {customer.riskFactors.length > 2 && (
                            <span className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-xs">
                              +{customer.riskFactors.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Részletek"
                          >
                            <Users size={16} />
                          </button>
                          <a
                            href={`mailto:${customer.email}`}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors"
                            title="Email küldése"
                          >
                            <Mail size={16} />
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <UserX size={48} className="mx-auto mb-4 opacity-30" />
            <p>Kattints az &quot;Elemzés indítása&quot; gombra a lemorzsolódási kockázat elemzéséhez</p>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{selectedCustomer.name || 'Névtelen'}</h3>
                  <p className="text-gray-400 text-sm">{selectedCustomer.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm border ${riskColors[selectedCustomer.riskLevel]}`}>
                  {selectedCustomer.riskScore}% kockázat
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Összes rendelés</p>
                  <p className="text-white font-bold">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Összköltés</p>
                  <p className="text-white font-bold">{selectedCustomer.totalSpent.toLocaleString('hu-HU')} Ft</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Átlag kosárérték</p>
                  <p className="text-white font-bold">{selectedCustomer.avgOrderValue.toLocaleString('hu-HU')} Ft</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Napok óta inaktív</p>
                  <p className="text-white font-bold">{selectedCustomer.daysSinceLastOrder}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-red-400 font-medium mb-2">Kockázati tényezők</h4>
                <div className="space-y-1">
                  {selectedCustomer.riskFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                      <AlertTriangle size={14} className="text-red-400" />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-green-400 font-medium mb-2">Javasolt lépések</h4>
                <div className="space-y-1">
                  {selectedCustomer.recommendedActions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                      <Gift size={14} className="text-green-400" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`mailto:${selectedCustomer.email}?subject=Visszav%C3%A1runk%20a%20NEXU-n%C3%A1l!`}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-center flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  Email küldése
                </a>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                >
                  Bezárás
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
