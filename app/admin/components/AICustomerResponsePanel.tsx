'use client'

import { useState } from 'react'
import { MessageSquare, Send, RefreshCw, Copy, Check, User, Mail, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateCustomerResponse } from '@/lib/actions/ai-actions'

interface ResponseData {
  success: boolean
  shortResponse?: string
  fullResponse?: string
  suggestedActions?: string[]
  sentiment?: 'positive' | 'neutral' | 'negative'
  requiresEscalation?: boolean
  error?: string
}

const TEMPLATE_TYPES = [
  { id: 'order_status', label: 'Rendelés állapot', icon: '📦' },
  { id: 'return_request', label: 'Visszaküldés', icon: '↩️' },
  { id: 'complaint', label: 'Panasz kezelés', icon: '⚠️' },
  { id: 'product_question', label: 'Termék kérdés', icon: '❓' },
  { id: 'shipping', label: 'Szállítás', icon: '🚚' },
  { id: 'payment', label: 'Fizetés', icon: '💳' },
  { id: 'general', label: 'Általános', icon: '💬' }
]

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professzionális' },
  { id: 'friendly', label: 'Barátságos' },
  { id: 'empathetic', label: 'Empatikus' },
  { id: 'formal', label: 'Formális' }
]

export default function AICustomerResponsePanel() {
  const [customerMessage, setCustomerMessage] = useState('')
  const [selectedType, setSelectedType] = useState('general')
  const [selectedTone, setSelectedTone] = useState('professional')
  const [customerName, setCustomerName] = useState('')
  const [orderId, setOrderId] = useState('')
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateResponse = async () => {
    if (!customerMessage.trim()) return
    
    setIsLoading(true)
    try {
      const result = await generateCustomerResponse({
        question: customerMessage,
        orderId: orderId || undefined,
        context: `Üzenet típusa: ${selectedType}, Hangnem: ${selectedTone}${customerName ? `, Ügyfél neve: ${customerName}` : ''}`
      }) as ResponseData
      
      if (result.success) {
        setResponse(result)
      }
    } catch (error) {
      console.error('Response error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyResponse = async () => {
    if (response?.fullResponse) {
      await navigator.clipboard.writeText(response.fullResponse)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const clearForm = () => {
    setCustomerMessage('')
    setCustomerName('')
    setOrderId('')
    setResponse(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-purple-400" />
          Ügyfél válasz generátor
        </h2>
        <p className="text-gray-400 text-sm mt-1">AI-alapú professzionális válaszok ügyfeleknek</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-gray-400 text-sm font-medium mb-2 block">Üzenet típusa</label>
            <div className="grid grid-cols-4 gap-2">
              {TEMPLATE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedType === type.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl block mb-1">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone selector */}
          <div>
            <label className="text-gray-400 text-sm font-medium mb-2 block">Hangnem</label>
            <div className="flex gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedTone === tone.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
                <User size={14} />
                Ügyfél neve
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="pl. Kiss Péter"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
                <Mail size={14} />
                Rendelés azonosító
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="pl. #12345"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Customer message */}
          <div>
            <label className="text-gray-400 text-sm font-medium mb-2 block">Ügyfél üzenete</label>
            <textarea
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              rows={6}
              placeholder="Másolja be ide az ügyfél üzenetét, amire válaszolni szeretne..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={generateResponse}
              disabled={isLoading || !customerMessage.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {isLoading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              Válasz generálása
            </button>
            <button
              onClick={clearForm}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Right: Response */}
        <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold text-white">Generált válasz</h3>
            {response && (
              <button
                onClick={copyResponse}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? 'Másolva!' : 'Másolás'}
              </button>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <RefreshCw size={32} className="mx-auto text-purple-400 mb-4 animate-spin" />
                <p className="text-gray-400">AI válasz generálása...</p>
              </motion.div>
            ) : response ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-4"
              >
                {/* Short Response */}
                {response.shortResponse && (
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-400 text-xs font-medium mb-2">Rövid válasz:</p>
                    <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                      {response.shortResponse}
                    </pre>
                  </div>
                )}

                {/* Full Response */}
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-xs font-medium mb-2">Teljes válasz:</p>
                  <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                    {response.fullResponse || 'Nincs válasz generálva.'}
                  </pre>
                </div>

                {/* Sentiment & Escalation badges */}
                <div className="flex items-center gap-3">
                  {response.sentiment && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">Hangulat:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        response.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                        response.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {response.sentiment === 'positive' ? 'Pozitív' : 
                         response.sentiment === 'negative' ? 'Negatív' : 'Semleges'}
                      </span>
                    </div>
                  )}
                  {response.requiresEscalation && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                      ⚠️ Eszkaláció szükséges
                    </span>
                  )}
                </div>

                {/* Suggested actions */}
                {response.suggestedActions && response.suggestedActions.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">Javasolt további lépések:</p>
                    <ul className="space-y-1">
                      {response.suggestedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                          <span className="text-purple-400">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center"
              >
                <MessageSquare size={40} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-500">A generált válasz itt fog megjelenni</p>
                <p className="text-gray-600 text-sm mt-2">
                  Töltsd ki a bal oldali mezőket és kattints a "Válasz generálása" gombra
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
