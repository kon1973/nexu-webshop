'use client'

import { useState } from 'react'
import { Users, Crown, Heart, Star, AlertTriangle, UserX, RefreshCw, Target, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { analyzeCustomerSegments } from '@/lib/actions/ai-actions'

interface SegmentData {
  totalCustomers: number
  segments: Array<{
    name: string
    count: number
    totalRevenue: number
    avgOrderValue: number
    avgOrders: number
  }>
  aiStrategies: {
    segmentStrategies?: Record<string, { strategy: string; actions: string[] }>
    overallInsights?: string[]
    priorityActions?: string[]
  }
  topCustomers: Array<{
    name: string | null
    email: string | null
    totalSpent: number
    orders: number
  }>
}

const segmentConfig: Record<string, { icon: typeof Users; color: string; label: string; description: string }> = {
  vip: { icon: Crown, color: 'from-yellow-500 to-orange-500', label: 'VIP', description: '500k Ft+ vagy 10+ rendelés' },
  loyal: { icon: Heart, color: 'from-pink-500 to-red-500', label: 'Lojális', description: '3-9 rendelés, aktív' },
  promising: { icon: Star, color: 'from-purple-500 to-indigo-500', label: 'Ígéretes', description: '2 rendelés, magas érték' },
  newCustomers: { icon: Users, color: 'from-green-500 to-emerald-500', label: 'Új vásárló', description: '1 rendelés, 30 napon belül' },
  atRisk: { icon: AlertTriangle, color: 'from-orange-500 to-red-500', label: 'Kockázatos', description: '60-180 napja inaktív' },
  lost: { icon: UserX, color: 'from-gray-500 to-gray-600', label: 'Elvesztett', description: '180+ napja inaktív' }
}

export default function AICustomerSegments() {
  const [data, setData] = useState<SegmentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)

  const loadSegments = async () => {
    setIsLoading(true)
    try {
      const result = await analyzeCustomerSegments()
      if (result.success) {
        setData(result as SegmentData)
      }
    } catch (error) {
      console.error('Segments error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-purple-400" />
            Ügyfélszegmentáció
          </h2>
          <p className="text-gray-400 text-sm mt-1">AI-alapú vásárlói elemzés és stratégiák</p>
        </div>
        <button
          onClick={loadSegments}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Elemzés indítása
        </button>
      </div>

      {!data && !isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Kattints az "Elemzés indítása" gombra az ügyfélszegmentáció elindításához</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <RefreshCw size={48} className="mx-auto text-purple-400 mb-4 animate-spin" />
          <p className="text-gray-400">Ügyfelek elemzése...</p>
        </div>
      )}

      {data && !isLoading && (
        <>
          {/* Total */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Összes aktív ügyfél</p>
            <p className="text-4xl font-bold text-white">{data.totalCustomers.toLocaleString('hu-HU')}</p>
          </div>

          {/* Segments Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.segments.map((segment, idx) => {
              const config = segmentConfig[segment.name] || { icon: Users, color: 'from-gray-500 to-gray-600', label: segment.name, description: '' }
              const Icon = config.icon
              const isSelected = selectedSegment === segment.name

              return (
                <motion.button
                  key={segment.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedSegment(isSelected ? null : segment.name)}
                  className={`bg-[#121212] border rounded-xl p-4 text-left transition-all ${
                    isSelected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${config.color} flex items-center justify-center mb-3`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <p className="text-white font-semibold">{config.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{segment.count}</p>
                  <p className="text-gray-500 text-xs mt-1">{config.description}</p>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-gray-400 text-xs">Bevétel</p>
                    <p className="text-white text-sm font-medium">{(segment.totalRevenue / 1000000).toFixed(1)}M Ft</p>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Selected Segment Strategy */}
          {selectedSegment && data.aiStrategies?.segmentStrategies?.[selectedSegment] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border border-purple-500/30 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="text-purple-400" />
                {segmentConfig[selectedSegment]?.label || selectedSegment} - AI Stratégia
              </h3>
              <p className="text-gray-300 mb-4">{data.aiStrategies.segmentStrategies[selectedSegment].strategy}</p>
              <div>
                <p className="text-gray-400 text-sm mb-2">Javasolt akciók:</p>
                <ul className="space-y-2">
                  {data.aiStrategies.segmentStrategies[selectedSegment].actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-purple-400">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Priority Actions */}
          {data.aiStrategies?.priorityActions && data.aiStrategies.priorityActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="text-green-400" />
                Prioritásos teendők
              </h3>
              <div className="grid gap-3">
                {data.aiStrategies.priorityActions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-300 text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Customers */}
          {data.topCustomers && data.topCustomers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#121212] border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Crown className="text-yellow-400" />
                Top 10 Vásárló
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs border-b border-white/10">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Név</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium text-right">Rendelések</th>
                      <th className="pb-3 font-medium text-right">Összes költés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topCustomers.map((customer, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-3 text-gray-500">{idx + 1}</td>
                        <td className="py-3 text-white">{customer.name || 'N/A'}</td>
                        <td className="py-3 text-gray-400 text-sm">{customer.email}</td>
                        <td className="py-3 text-white text-right">{customer.orders}</td>
                        <td className="py-3 text-green-400 text-right font-semibold">
                          {customer.totalSpent.toLocaleString('hu-HU')} Ft
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
