'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Eye, 
  CreditCard, MapPin, Clock, User, ShoppingCart,
  TrendingUp, RefreshCw, Filter, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

interface FraudAlert {
  id: string
  orderId: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  indicators: string[]
  customerEmail: string
  orderAmount: number
  timestamp: string
  status: 'pending' | 'reviewed' | 'blocked' | 'approved'
  details: {
    ipCountry?: string
    billingCountry?: string
    deviceFingerprint?: string
    previousOrders: number
    velocityCheck: boolean
    addressMismatch: boolean
    unusualAmount: boolean
    newAccount: boolean
  }
}

// Simulated fraud detection data
const mockAlerts: FraudAlert[] = [
  {
    id: '1',
    orderId: 'ORD-2024-001',
    riskScore: 85,
    riskLevel: 'critical',
    indicators: ['Új fiók', 'IP ország eltérés', 'Magas összeg', 'Gyors tranzakció'],
    customerEmail: 'suspicious@temp.com',
    orderAmount: 450000,
    timestamp: new Date().toISOString(),
    status: 'pending',
    details: {
      ipCountry: 'Nigéria',
      billingCountry: 'Magyarország',
      previousOrders: 0,
      velocityCheck: true,
      addressMismatch: true,
      unusualAmount: true,
      newAccount: true
    }
  },
  {
    id: '2',
    orderId: 'ORD-2024-002',
    riskScore: 45,
    riskLevel: 'medium',
    indicators: ['Több sikertelen fizetés', 'Eltérő szállítási cím'],
    customerEmail: 'user@example.com',
    orderAmount: 89000,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending',
    details: {
      ipCountry: 'Magyarország',
      billingCountry: 'Magyarország',
      previousOrders: 2,
      velocityCheck: false,
      addressMismatch: true,
      unusualAmount: false,
      newAccount: false
    }
  },
  {
    id: '3',
    orderId: 'ORD-2024-003',
    riskScore: 15,
    riskLevel: 'low',
    indicators: ['Első vásárlás'],
    customerEmail: 'newbuyer@gmail.com',
    orderAmount: 35000,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'approved',
    details: {
      ipCountry: 'Magyarország',
      billingCountry: 'Magyarország',
      previousOrders: 0,
      velocityCheck: false,
      addressMismatch: false,
      unusualAmount: false,
      newAccount: true
    }
  }
]

export default function AIFraudDetection() {
  const [alerts, setAlerts] = useState<FraudAlert[]>(mockAlerts)
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')

  const filteredAlerts = alerts.filter(alert => 
    filterLevel === 'all' || alert.riskLevel === filterLevel
  )

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Kritikus'
      case 'high': return 'Magas'
      case 'medium': return 'Közepes'
      case 'low': return 'Alacsony'
      default: return level
    }
  }

  const handleAction = async (alertId: string, action: 'approve' | 'block') => {
    setIsAnalyzing(true)
    await new Promise(r => setTimeout(r, 1000))
    
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: action === 'approve' ? 'approved' : 'blocked' }
        : a
    ))
    
    toast.success(action === 'approve' 
      ? 'Rendelés jóváhagyva' 
      : 'Rendelés blokkolva'
    )
    setSelectedAlert(null)
    setIsAnalyzing(false)
  }

  const runFullScan = async () => {
    setIsAnalyzing(true)
    toast.info('AI csalás-elemzés folyamatban...')
    await new Promise(r => setTimeout(r, 3000))
    toast.success('Elemzés kész! 3 új riasztás.')
    setIsAnalyzing(false)
  }

  const stats = {
    totalAlerts: alerts.length,
    critical: alerts.filter(a => a.riskLevel === 'critical').length,
    blocked: alerts.filter(a => a.status === 'blocked').length,
    approved: alerts.filter(a => a.status === 'approved').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Csalásfelismerés</h2>
            <p className="text-gray-400 text-sm">Gyanús tranzakciók valós idejű elemzése</p>
          </div>
        </div>
        <button
          onClick={runFullScan}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
          Teljes vizsgálat
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <AlertTriangle size={14} />
            Összes riasztás
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalAlerts}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
            <XCircle size={14} />
            Kritikus
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-orange-400 text-sm mb-1">
            <Shield size={14} />
            Blokkolva
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.blocked}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
            <CheckCircle size={14} />
            Jóváhagyva
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-400" />
        <span className="text-gray-400 text-sm">Szűrés:</span>
        {['all', 'critical', 'high', 'medium', 'low'].map(level => (
          <button
            key={level}
            onClick={() => setFilterLevel(level as typeof filterLevel)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterLevel === level
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {level === 'all' ? 'Mind' : getRiskLabel(level)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white/5 border rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors ${
                alert.status === 'blocked' ? 'border-red-500/30 opacity-60' :
                alert.status === 'approved' ? 'border-green-500/30' :
                'border-white/10'
              }`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Risk Score Circle */}
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 -rotate-90">
                      <circle
                        cx="28" cy="28" r="24"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="28" cy="28" r="24"
                        fill="none"
                        stroke={
                          alert.riskScore >= 70 ? '#ef4444' :
                          alert.riskScore >= 40 ? '#f59e0b' :
                          '#22c55e'
                        }
                        strokeWidth="4"
                        strokeDasharray={`${alert.riskScore * 1.5} 150`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                      {alert.riskScore}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{alert.orderId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${getRiskColor(alert.riskLevel)}`}>
                        {getRiskLabel(alert.riskLevel)}
                      </span>
                      {alert.status !== 'pending' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          alert.status === 'approved' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {alert.status === 'approved' ? 'Jóváhagyva' : 'Blokkolva'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{alert.customerEmail}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} />
                        {alert.orderAmount.toLocaleString('hu-HU')} Ft
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(alert.timestamp).toLocaleString('hu-HU')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 max-w-xs">
                  {alert.indicators.slice(0, 3).map((indicator, i) => (
                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                      {indicator}
                    </span>
                  ))}
                  {alert.indicators.length > 3 && (
                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                      +{alert.indicators.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedAlert.orderId}</h3>
                  <p className="text-gray-400">{selectedAlert.customerEmail}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{selectedAlert.riskScore}</div>
                  <div className={`text-sm ${getRiskColor(selectedAlert.riskLevel).split(' ')[0]}`}>
                    {getRiskLabel(selectedAlert.riskLevel)} kockázat
                  </div>
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-3">Kockázati jelzők</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedAlert.indicators.map((indicator, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertTriangle size={16} className="text-red-400" />
                      <span className="text-white text-sm">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-3">Részletek</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">IP Ország</div>
                    <div className="text-white flex items-center gap-2">
                      <MapPin size={14} />
                      {selectedAlert.details.ipCountry || 'Ismeretlen'}
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Számlázási ország</div>
                    <div className="text-white flex items-center gap-2">
                      <MapPin size={14} />
                      {selectedAlert.details.billingCountry || 'Ismeretlen'}
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Korábbi rendelések</div>
                    <div className="text-white flex items-center gap-2">
                      <ShoppingCart size={14} />
                      {selectedAlert.details.previousOrders} db
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Rendelés összege</div>
                    <div className="text-white flex items-center gap-2">
                      <CreditCard size={14} />
                      {selectedAlert.orderAmount.toLocaleString('hu-HU')} Ft
                    </div>
                  </div>
                </div>
              </div>

              {/* Checks */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-3">Ellenőrzések</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Sebesség ellenőrzés', value: selectedAlert.details.velocityCheck },
                    { label: 'Cím eltérés', value: selectedAlert.details.addressMismatch },
                    { label: 'Szokatlan összeg', value: selectedAlert.details.unusualAmount },
                    { label: 'Új fiók', value: selectedAlert.details.newAccount }
                  ].map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">{check.label}</span>
                      {check.value ? (
                        <span className="flex items-center gap-1 text-red-400 text-sm">
                          <XCircle size={14} /> Gyanús
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle size={14} /> OK
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedAlert.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(selectedAlert.id, 'block')}
                    disabled={isAnalyzing}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Blokkolás
                  </button>
                  <button
                    onClick={() => handleAction(selectedAlert.id, 'approve')}
                    disabled={isAnalyzing}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Jóváhagyás
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
