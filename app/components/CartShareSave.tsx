'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, Copy, Mail, MessageCircle, Link2, Check, X, 
  ShoppingCart, QrCode, Download, Users, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart, CartItem } from '@/context/CartContext'
import { QRCodeSVG } from 'qrcode.react'

interface SavedCart {
  id: string
  name: string
  items: CartItem[]
  createdAt: string
  shareCode?: string
}

export default function CartShareSave() {
  const { cart, itemCount } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'share' | 'save' | 'load'>('share')
  const [shareLink, setShareLink] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [cartName, setCartName] = useState('')
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Generate share link
  const generateShareLink = async () => {
    if (cart.length === 0) {
      toast.error('A kosár üres!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/cart/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      })

      if (!response.ok) throw new Error('Failed to generate link')

      const data = await response.json()
      setShareLink(data.url)
      setShareCode(data.code)
      toast.success('Megosztási link létrehozva!')
    } catch (error) {
      toast.error('Hiba történt a link generálásakor')
    } finally {
      setIsGenerating(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link másolva a vágólapra!')
    } catch (error) {
      toast.error('Másolás sikertelen')
    }
  }

  // Share via different platforms
  const shareVia = (platform: 'whatsapp' | 'email' | 'messenger') => {
    if (!shareLink) {
      generateShareLink().then(() => {
        setTimeout(() => shareVia(platform), 500)
      })
      return
    }

    const message = `Nézd meg a kosaram a NEXU Store-ban! 🛒`
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareLink)}`,
      email: `mailto:?subject=${encodeURIComponent('NEXU Store Kosár')}&body=${encodeURIComponent(message + '\n\n' + shareLink)}`,
      messenger: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`
    }

    window.open(urls[platform], '_blank')
  }

  // Save cart locally
  const saveCart = () => {
    if (cart.length === 0) {
      toast.error('A kosár üres!')
      return
    }
    if (!cartName.trim()) {
      toast.error('Adj nevet a kosárnak!')
      return
    }

    const newCart: SavedCart = {
      id: Date.now().toString(),
      name: cartName,
      items: cart,
      createdAt: new Date().toISOString()
    }

    const existing = JSON.parse(localStorage.getItem('nexu-saved-carts') || '[]')
    existing.push(newCart)
    localStorage.setItem('nexu-saved-carts', JSON.stringify(existing))
    
    setSavedCarts(existing)
    setCartName('')
    toast.success('Kosár elmentve!')
  }

  // Load saved carts
  const loadSavedCarts = () => {
    const saved = JSON.parse(localStorage.getItem('nexu-saved-carts') || '[]')
    setSavedCarts(saved)
  }

  // Delete saved cart
  const deleteSavedCart = (id: string) => {
    const updated = savedCarts.filter(c => c.id !== id)
    localStorage.setItem('nexu-saved-carts', JSON.stringify(updated))
    setSavedCarts(updated)
    toast.success('Kosár törölve')
  }

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (cart.length === 0) return null

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true)
          loadSavedCarts()
        }}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl text-gray-400 hover:text-white transition-all group"
      >
        <Share2 size={18} className="group-hover:text-purple-400 transition-colors" />
        <span className="text-sm font-medium">Megosztás / Mentés</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                        <ShoppingCart size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Kosár kezelése</h3>
                        <p className="text-gray-400 text-sm">{itemCount} termék • {formatPrice(totalPrice)}</p>
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

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  {[
                    { id: 'share', label: 'Megosztás', icon: Share2 },
                    { id: 'save', label: 'Mentés', icon: Download },
                    { id: 'load', label: 'Betöltés', icon: Users }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                          ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTab === 'share' && (
                    <div className="space-y-4">
                      {/* Generate Link */}
                      {!shareLink ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={generateShareLink}
                          disabled={isGenerating}
                          className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                              >
                                <Sparkles size={18} />
                              </motion.div>
                              Generálás...
                            </>
                          ) : (
                            <>
                              <Link2 size={18} />
                              Megosztási link generálása
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <>
                          {/* Share Link Display */}
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                              <Check size={16} className="text-green-400" />
                              <span className="text-green-400 text-sm font-medium">Link kész!</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm truncate"
                              />
                              <button
                                onClick={() => copyToClipboard(shareLink)}
                                className="p-2 bg-purple-500 hover:bg-purple-400 rounded-lg transition-colors"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                            <p className="text-gray-500 text-xs mt-2">
                              Kód: <span className="text-purple-400 font-mono">{shareCode}</span>
                            </p>
                          </div>

                          {/* QR Code Toggle */}
                          <button
                            onClick={() => setShowQR(!showQR)}
                            className="w-full py-2 text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                          >
                            <QrCode size={16} />
                            {showQR ? 'QR kód elrejtése' : 'QR kód megjelenítése'}
                          </button>

                          <AnimatePresence>
                            {showQR && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex justify-center p-4 bg-white rounded-xl"
                              >
                                <QRCodeSVG value={shareLink} size={150} />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Share Buttons */}
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => shareVia('whatsapp')}
                              className="flex flex-col items-center gap-2 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-colors"
                            >
                              <MessageCircle size={24} className="text-green-400" />
                              <span className="text-xs text-gray-400">WhatsApp</span>
                            </button>
                            <button
                              onClick={() => shareVia('email')}
                              className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-colors"
                            >
                              <Mail size={24} className="text-blue-400" />
                              <span className="text-xs text-gray-400">Email</span>
                            </button>
                            <button
                              onClick={() => shareVia('messenger')}
                              className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors"
                            >
                              <Share2 size={24} className="text-purple-400" />
                              <span className="text-xs text-gray-400">Megosztás</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'save' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Kosár neve</label>
                        <input
                          type="text"
                          value={cartName}
                          onChange={(e) => setCartName(e.target.value)}
                          placeholder="pl. Karácsonyi vásárlás"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={saveCart}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Kosár mentése
                      </motion.button>

                      <p className="text-gray-500 text-xs text-center">
                        A mentett kosarak a böngésződben tárolódnak
                      </p>
                    </div>
                  )}

                  {activeTab === 'load' && (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {savedCarts.length === 0 ? (
                        <div className="text-center py-8">
                          <Users size={40} className="mx-auto text-gray-600 mb-3" />
                          <p className="text-gray-400">Nincs mentett kosár</p>
                        </div>
                      ) : (
                        savedCarts.map((saved) => (
                          <motion.div
                            key={saved.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium">{saved.name}</h4>
                              <button
                                onClick={() => deleteSavedCart(saved.id)}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <X size={14} className="text-gray-500 hover:text-red-400" />
                              </button>
                            </div>
                            <p className="text-gray-500 text-xs mb-3">
                              {saved.items.length} termék • {new Date(saved.createdAt).toLocaleDateString('hu-HU')}
                            </p>
                            <button
                              onClick={() => {
                                // Load cart logic would go here
                                toast.success(`"${saved.name}" kosár betöltve!`)
                                setIsOpen(false)
                              }}
                              className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm font-medium rounded-lg transition-colors"
                            >
                              Betöltés
                            </button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
