'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Loader2,
  ShoppingCart,
  Package,
  Percent,
  Truck,
  Star,
  ChevronRight,
  MessageSquare,
  Lightbulb,
  History,
  Trash2
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { usePathname } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  products?: Array<{
    id: string
    name: string
    price: number
    image?: string
    slug: string
  }>
  actions?: Array<{
    label: string
    type: 'link' | 'action'
    value: string
  }>
}

interface QuickAction {
  icon: typeof Bot
  label: string
  prompt: string
  color: string
}

const quickActions: QuickAction[] = [
  { icon: ShoppingCart, label: 'Ajánlások nekem', prompt: 'Milyen termékeket ajánlasz nekem a korábbi vásárlásaim alapján?', color: 'from-purple-500 to-blue-500' },
  { icon: Percent, label: 'Aktuális akciók', prompt: 'Milyen akciók és kedvezmények vannak most?', color: 'from-orange-500 to-red-500' },
  { icon: Truck, label: 'Szállítás info', prompt: 'Milyen szállítási lehetőségek vannak és mennyibe kerülnek?', color: 'from-green-500 to-emerald-500' },
  { icon: Package, label: 'Rendelés státusz', prompt: 'Mi a rendelésem státusza?', color: 'from-blue-500 to-cyan-500' },
]

export default function AIAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addToCart } = useCart()
  const pathname = usePathname()

  // Context-aware suggestions based on current page
  const getContextualSuggestions = useCallback((): string[] => {
    if (pathname?.includes('/shop')) {
      return ['Szűrd a termékeket', 'Melyik a legnépszerűbb?', 'Van akció?']
    }
    if (pathname?.includes('/cart')) {
      return ['Kupon kód?', 'Szállítási költség?', 'Hasonló termékek']
    }
    if (pathname?.includes('/checkout')) {
      return ['Szállítási idő?', 'Fizetési módok?', 'Van kedvezmény?']
    }
    return ['Termék keresés', 'Akciók', 'Segítség']
  }, [pathname])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexu-chat-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMessages(parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })))
      } catch (e) {
        console.error('Failed to load chat history:', e)
      }
    }
  }, [])

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('nexu-chat-history', JSON.stringify(messages.slice(-50)))
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setShowQuickActions(false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          context: {
            currentPage: pathname,
            cartItemCount: 0 // Could get from cart context
          }
        })
      })

      if (!response.ok) throw new Error('Chat request failed')

      const data = await response.json()
      
      // Parse response for products and actions
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'Sajnálom, nem tudtam feldolgozni a kérést.',
        timestamp: new Date(),
        suggestions: getContextualSuggestions(),
        products: data.products,
        actions: data.actions
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Elnézést, technikai hiba történt. Kérlek próbáld újra.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt)
  }

  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem('nexu-chat-history')
    setShowQuickActions(true)
  }

  const handleAddToCart = async (product: { id: string; name: string; price: number; image?: string }) => {
    addToCart({
      id: parseInt(product.id) || 0,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder.png',
      category: 'AI Ajánlás'
    }, 1)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? 20 : 0 }}
      >
        <Bot className="text-white" size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">NEXU AI Asszisztens</h3>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      Online • GPT-5 Mini
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                      title="Előzmények törlése"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && showQuickActions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                      <Bot className="text-purple-400" size={32} />
                    </div>
                    <h4 className="text-white font-semibold mb-2">Szia! 👋</h4>
                    <p className="text-gray-400 text-sm">
                      Miben segíthetek ma? Kereshetek termékeket, válaszolhatok kérdéseidre, vagy segíthetek a vásárlásban.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleQuickAction(action)}
                        className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all group"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                          <action.icon size={16} className="text-white" />
                        </div>
                        <span className="text-white text-sm font-medium">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                      <Lightbulb size={12} />
                      Tippek:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getContextualSuggestions().map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => sendMessage(suggestion)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-200'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot size={14} className="text-purple-400" />
                        <span className="text-xs text-gray-400">NEXU AI</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Product Cards */}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.products.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2 bg-black/20 rounded-lg"
                          >
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{product.name}</p>
                              <p className="text-purple-400 text-sm font-bold">
                                {product.price.toLocaleString('hu-HU')} Ft
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                            >
                              <ShoppingCart size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.role === 'assistant' && message.suggestions && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => sendMessage(suggestion)}
                            className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 rounded text-xs text-purple-300 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-500 mt-2">
                      {message.timestamp.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-purple-400" size={16} />
                      <span className="text-gray-400 text-sm">Gondolkodom...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage(input)
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Írj üzenetet..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="text-center text-gray-600 text-[10px] mt-2">
                NEXU AI • Powered by GPT-5 Mini
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
