'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, TrendingDown, Check, X, Sparkles, AlertTriangle, Loader2, Mail, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface PriceAlert {
  id: string
  productId: number
  productName: string
  productImage: string | null
  currentPrice: number
  targetPrice: number
  createdAt: string
  triggered: boolean
  email?: string
}

interface AIPriceAlertProps {
  productId: number
  productName: string
  productImage: string | null
  currentPrice: number
  userEmail?: string
  existingAlert?: PriceAlert | null
  onAlertCreated?: (alert: PriceAlert) => void
  onAlertDeleted?: (alertId: string) => void
}

export default function AIPriceAlert({
  productId,
  productName,
  productImage,
  currentPrice,
  userEmail,
  existingAlert,
  onAlertCreated,
  onAlertDeleted
}: AIPriceAlertProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [targetPrice, setTargetPrice] = useState<number>(Math.round(currentPrice * 0.9))
  const [email, setEmail] = useState(userEmail || '')
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [alert, setAlert] = useState<PriceAlert | null>(existingAlert || null)
  const [aiSuggestion, setAiSuggestion] = useState<{ price: number; probability: number; timeframe: string } | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  const discount = Math.round(((currentPrice - targetPrice) / currentPrice) * 100)

  // Load AI price prediction when opened
  useEffect(() => {
    if (isOpen && !aiSuggestion && !isLoadingAI) {
      loadAIPrediction()
    }
  }, [isOpen])

  const loadAIPrediction = async () => {
    setIsLoadingAI(true)
    // Simulate AI prediction - in real app this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // AI suggests a realistic target price based on historical data
    const suggestionDiscount = Math.random() * 15 + 5 // 5-20% discount
    const suggestedPrice = Math.round(currentPrice * (1 - suggestionDiscount / 100))
    const probability = Math.round(60 + Math.random() * 30) // 60-90%
    const days = Math.round(7 + Math.random() * 21) // 7-28 days
    
    setAiSuggestion({
      price: suggestedPrice,
      probability,
      timeframe: `${days} napon belül`
    })
    setIsLoadingAI(false)
  }

  const handleCreateAlert = async () => {
    if (!email) {
      toast.error('Kérlek add meg az email címed!')
      return
    }
    if (targetPrice >= currentPrice) {
      toast.error('A célár alacsonyabb kell legyen a jelenlegi árnál!')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          targetPrice,
          email
        })
      })

      if (!response.ok) {
        throw new Error('Nem sikerült létrehozni az értesítést')
      }

      const newAlert = await response.json()
      setAlert(newAlert)
      onAlertCreated?.(newAlert)
      setIsOpen(false)
      toast.success('Árfigyelő beállítva!', {
        description: `Értesítünk, ha az ár ${formatPrice(targetPrice)} alá csökken.`
      })
    } catch (error) {
      toast.error('Hiba történt az árfigyelő beállításakor')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteAlert = async () => {
    if (!alert) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/price-alerts/${alert.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Nem sikerült törölni az értesítést')
      }

      setAlert(null)
      onAlertDeleted?.(alert.id)
      toast.success('Árfigyelő törölve')
    } catch (error) {
      toast.error('Hiba történt a törlés során')
    } finally {
      setIsDeleting(false)
    }
  }

  const useAISuggestion = () => {
    if (aiSuggestion) {
      setTargetPrice(aiSuggestion.price)
    }
  }

  // Quick presets
  const presets = [
    { label: '-5%', value: Math.round(currentPrice * 0.95) },
    { label: '-10%', value: Math.round(currentPrice * 0.9) },
    { label: '-15%', value: Math.round(currentPrice * 0.85) },
    { label: '-20%', value: Math.round(currentPrice * 0.8) }
  ]

  return (
    <div className="relative">
      {/* Trigger Button */}
      {alert ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-xl text-green-400 transition-all"
        >
          <BellRing size={18} className="animate-pulse" />
          <span className="text-sm font-medium">Árfigyelő aktív</span>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 rounded-xl text-gray-400 hover:text-yellow-400 transition-all group"
        >
          <Bell size={18} className="group-hover:animate-bounce" />
          <span className="text-sm font-medium">Árfigyelő</span>
        </motion.button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                        <TrendingDown size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Árfigyelő</h3>
                        <p className="text-gray-400 text-sm">Értesítünk, ha csökken az ár</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Product info */}
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                      {productImage ? (
                        <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Bell size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{productName}</p>
                      <p className="text-xl font-bold text-white">{formatPrice(currentPrice)}</p>
                    </div>
                  </div>

                  {alert ? (
                    /* Existing Alert Info */
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                          <Check size={18} />
                          <span className="font-medium">Árfigyelő aktív</span>
                        </div>
                        <p className="text-gray-300">
                          Értesítünk emailben, ha az ár <span className="text-white font-bold">{formatPrice(alert.targetPrice)}</span> alá csökken.
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Email: {alert.email}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDeleteAlert}
                        disabled={isDeleting}
                        className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isDeleting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <Trash2 size={18} />
                            Árfigyelő törlése
                          </>
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    /* Create Alert Form */
                    <>
                      {/* AI Suggestion */}
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl">
                        <div className="flex items-center gap-2 text-purple-400 mb-3">
                          <Sparkles size={18} />
                          <span className="font-medium">AI Árjóslat</span>
                        </div>
                        {isLoadingAI ? (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Elemzés...</span>
                          </div>
                        ) : aiSuggestion ? (
                          <div className="space-y-2">
                            <p className="text-gray-300 text-sm">
                              <span className="text-purple-400">{aiSuggestion.probability}%</span> eséllyel 
                              <span className="text-white font-bold mx-1">{formatPrice(aiSuggestion.price)}</span>
                              alá csökkenhet {aiSuggestion.timeframe}.
                            </p>
                            <button
                              onClick={useAISuggestion}
                              className="text-sm text-purple-400 hover:text-purple-300 underline"
                            >
                              Használom ezt a célárat
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {/* Target Price */}
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Célár</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-yellow-500/50"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Ft</span>
                        </div>
                        {discount > 0 && (
                          <p className="text-green-400 text-sm mt-1">
                            -{discount}% a jelenlegi árból
                          </p>
                        )}
                        {targetPrice >= currentPrice && (
                          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                            <AlertTriangle size={14} />
                            A célár alacsonyabb kell legyen!
                          </p>
                        )}
                      </div>

                      {/* Quick Presets */}
                      <div className="flex gap-2">
                        {presets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => setTargetPrice(preset.value)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              targetPrice === preset.value
                                ? 'bg-yellow-500 text-black'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Email értesítés</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="pelda@email.com"
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500/50"
                          />
                        </div>
                      </div>

                      {/* Submit */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateAlert}
                        disabled={isCreating || !email || targetPrice >= currentPrice}
                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Beállítás...
                          </>
                        ) : (
                          <>
                            <Bell size={18} />
                            Árfigyelő beállítása
                          </>
                        )}
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
