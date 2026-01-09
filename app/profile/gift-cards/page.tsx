'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Copy, Check, Wallet, Send, Clock, AlertCircle, ChevronRight, CreditCard, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface GiftCard {
  id: string
  code: string
  amount: number
  balance: number
  design: string
  status: string
  recipientName: string
  recipientEmail: string
  senderName?: string
  message?: string
  expiresAt: string
  createdAt: string
  redemptions: Array<{
    id: string
    amount: number
    usedAt: string
  }>
}

const designGradients: Record<string, string> = {
  classic: 'from-purple-600 to-blue-600',
  birthday: 'from-pink-500 to-orange-500',
  christmas: 'from-red-600 to-green-600',
  tech: 'from-cyan-500 to-purple-500',
  minimal: 'from-gray-600 to-gray-800'
}

export default function MyGiftCardsPage() {
  const [purchased, setPurchased] = useState<GiftCard[]>([])
  const [received, setReceived] = useState<GiftCard[]>([])
  const [activeTab, setActiveTab] = useState<'received' | 'purchased'>('received')
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchGiftCards()
  }, [])

  const fetchGiftCards = async () => {
    try {
      const response = await fetch('/api/gift-cards')
      const data = await response.json()

      if (data.success) {
        setPurchased(data.purchased || [])
        setReceived(data.received || [])
      }
    } catch (error) {
      toast.error('Nem sikerült betölteni az ajándékkártyákat')
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Kód másolva!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('hu-HU') + ' Ft'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date()
    
    if (isExpired || status === 'expired') {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Lejárt</span>
    }
    if (status === 'redeemed') {
      return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Felhasználva</span>
    }
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Aktív</span>
    }
    if (status === 'pending') {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Függőben</span>
    }
    return null
  }

  const cards = activeTab === 'received' ? received : purchased
  const emptyMessage = activeTab === 'received' 
    ? 'Még nem kaptál ajándékkártyát'
    : 'Még nem vásároltál ajándékkártyát'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
              <Gift className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ajándékkártyáim</h1>
              <p className="text-gray-400 text-sm">Kezeld a kapott és vásárolt ajándékkártyáidat</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Wallet size={14} />
              Kapott
            </div>
            <p className="text-2xl font-bold text-white">{received.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Send size={14} />
              Küldött
            </div>
            <p className="text-2xl font-bold text-white">{purchased.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <CreditCard size={14} />
              Egyenlegem
            </div>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(received.filter(c => c.status === 'active').reduce((sum, c) => sum + c.balance, 0))}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Clock size={14} />
              Aktív
            </div>
            <p className="text-2xl font-bold text-white">
              {received.filter(c => c.status === 'active').length + purchased.filter(c => c.status === 'active').length}
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Wallet size={16} className="inline mr-2" />
            Kapott kártyák ({received.length})
          </button>
          <button
            onClick={() => setActiveTab('purchased')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'purchased'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Send size={16} className="inline mr-2" />
            Küldött kártyák ({purchased.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="text-gray-600" size={32} />
            </div>
            <p className="text-gray-400 mb-6">{emptyMessage}</p>
            <Link
              href="/gift-cards"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              <Gift size={18} />
              Ajándékkártya vásárlása
            </Link>
          </motion.div>
        )}

        {/* Gift Cards Grid */}
        {!isLoading && cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Card Preview */}
                  <div className={`bg-gradient-to-br ${designGradients[card.design] || designGradients.classic} p-6 relative`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <p className="text-white/80 text-xs mb-1">NEXU Ajándékkártya</p>
                        <p className="text-white text-2xl font-bold">{formatCurrency(card.amount)}</p>
                        {card.balance !== card.amount && (
                          <p className="text-white/60 text-sm mt-1">
                            Egyenleg: {formatCurrency(card.balance)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(card.status, card.expiresAt)}
                      </div>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg text-white">{card.code}</span>
                        <button
                          onClick={() => copyCode(card.code)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {copiedCode === card.code ? (
                            <Check size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">
                          {activeTab === 'received' ? 'Küldő' : 'Címzett'}
                        </span>
                        <span className="text-white">
                          {activeTab === 'received' 
                            ? (card.senderName || 'Ismeretlen') 
                            : card.recipientName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Lejárat</span>
                        <span className="text-white">{formatDate(card.expiresAt)}</span>
                      </div>
                    </div>

                    {card.message && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Üzenet</p>
                        <p className="text-white text-sm italic">&quot;{card.message}&quot;</p>
                      </div>
                    )}

                    {/* Usage History */}
                    {card.redemptions.length > 0 && (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-gray-400 text-xs mb-2">Felhasználási előzmények</p>
                        <div className="space-y-2">
                          {card.redemptions.map(r => (
                            <div key={r.id} className="flex justify-between text-sm">
                              <span className="text-gray-400">{formatDate(r.usedAt)}</span>
                              <span className="text-red-400">-{formatCurrency(r.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Use Button */}
                    {card.status === 'active' && card.balance > 0 && activeTab === 'received' && (
                      <Link
                        href="/shop"
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
                      >
                        Vásárlás <ChevronRight size={16} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Buy New Gift Card CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl text-center"
        >
          <h3 className="text-lg font-bold text-white mb-2">Adj ajándékba technológiát!</h3>
          <p className="text-gray-400 text-sm mb-4">
            Vásárolj NEXU ajándékkártyát barátaidnak, családodnak
          </p>
          <Link
            href="/gift-cards"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            <Gift size={18} />
            Ajándékkártya vásárlása
            <ExternalLink size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
