'use client'

import { useState, useRef, useEffect, FormEvent, ChangeEvent, ReactNode, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, MinusCircle, ExternalLink, Star, ShoppingCart, Package, RefreshCw, Mic, MicOff, Volume2, History, Download, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCart } from '@/context/CartContext'

// ============== TYPES ==============

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
  cartAction?: CartAction
  orderInfo?: OrderInfo
  timestamp?: number
  quickActions?: QuickAction[]
}

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number | null
  url: string
  rating: number
  inStock: boolean
  category: string
  image?: string
}

interface CartAction {
  success: boolean
  action: string
  product: {
    id: number
    name: string
    price: number
    quantity: number
    image: string
  }
}

interface OrderInfo {
  found: boolean
  order?: {
    id: string
    status: string
    total: number
    createdAt: string
    items: { name: string; quantity: number; price: number }[]
  }
  orders?: {
    id: string
    status: string
    total: number
    createdAt: string
    itemCount: number
  }[]
}

interface QuickAction {
  label: string
  action: string
  icon?: string
}

// ============== CONSTANTS ==============

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-500/20 text-yellow-400',
  'processing': 'bg-blue-500/20 text-blue-400',
  'shipped': 'bg-purple-500/20 text-purple-400',
  'delivered': 'bg-green-500/20 text-green-400',
  'cancelled': 'bg-red-500/20 text-red-400'
}

const statusLabels: Record<string, string> = {
  'pending': 'Függőben',
  'processing': 'Feldolgozás alatt',
  'shipped': 'Kiszállítás alatt',
  'delivered': 'Kézbesítve',
  'cancelled': 'Törölve'
}

const thinkingMessages = [
  'Keresek a termékek között...',
  'Elemzem a kérdésed...',
  'Pillanat, utánanézek...',
  'Gondolkodom...',
  'Összegyűjtöm az információkat...'
]

const STORAGE_KEY = 'nexu-chat-history'

// ============== COMPONENTS ==============

function ChatProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 group">
      <Link href={product.url} className="block">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
              {product.name}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-400">{product.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold text-purple-400">
              {product.price.toLocaleString('hu-HU')} Ft
            </div>
            {product.originalPrice && (
              <div className="text-xs text-gray-500 line-through">
                {product.originalPrice.toLocaleString('hu-HU')} Ft
              </div>
            )}
            <div className={`text-xs mt-1 ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
              {product.inStock ? '✓ Készleten' : '✗ Elfogyott'}
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Link href={product.url} className="text-xs text-purple-400 flex items-center gap-1 hover:underline">
          Részletek <ExternalLink size={10} />
        </Link>
        {product.inStock && (
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs text-white transition-colors"
          >
            <ShoppingCart size={12} />
            Kosárba
          </button>
        )}
      </div>
    </div>
  )
}

type OrderType = {
  id: string
  status: string
  total: number
  createdAt: string
  items?: { name: string; quantity: number; price: number }[]
  itemCount?: number
}

function OrderCard({ order }: { order: OrderType }) {
  if (!order) return null
  const isDetailed = 'items' in order && order.items
  
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">#{order.id.slice(0, 8)}...</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>
      <div className="text-sm font-bold text-white mb-1">
        {order.total.toLocaleString('hu-HU')} Ft
      </div>
      <div className="text-xs text-gray-500">
        {new Date(order.createdAt).toLocaleDateString('hu-HU')}
      </div>
      {isDetailed && order.items && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="text-xs text-gray-400 flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span>{item.price.toLocaleString('hu-HU')} Ft</span>
            </div>
          ))}
        </div>
      )}
      <Link 
        href={`/orders/${order.id}`}
        className="mt-2 flex items-center gap-1 text-xs text-purple-400 hover:underline"
      >
        <Package size={12} />
        Rendelés részletei
      </Link>
    </div>
  )
}

function QuickActionButton({ action, onClick }: { action: QuickAction; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-full text-purple-300 transition-colors flex items-center gap-1.5"
    >
      {action.icon && <span>{action.icon}</span>}
      {action.label}
    </button>
  )
}

function renderContent(content: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }
    parts.push(
      <Link 
        key={match.index} 
        href={match[2]} 
        className="text-purple-400 hover:text-purple-300 underline"
      >
        {match[1]}
      </Link>
    )
    lastIndex = match.index + match[0].length
  }
  
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  if (parts.length === 0) return content
  return parts
}

// ============== MAIN COMPONENT ==============

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [savedSessions, setSavedSessions] = useState<{ date: string; messages: Message[] }[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const { addToCart, openCart } = useCart()

  // Load saved sessions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          setSavedSessions(JSON.parse(saved))
        } catch {}
      }
    }
  }, [])

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Szia! 👋 Én a NEXU AI asszisztens vagyok!\n\nMiben segíthetek ma?',
        timestamp: Date.now(),
        quickActions: [
          { label: 'Telefonok', action: 'Mutasd a telefonokat', icon: '📱' },
          { label: 'Laptopok', action: 'Keresek egy laptopot', icon: '💻' },
          { label: 'Akciók', action: 'Milyen akciók vannak?', icon: '🏷️' },
          { label: 'Rendelésem', action: 'Hol tart a rendelésem?', icon: '📦' },
          { label: 'Szállítás', action: 'Szállítási információk', icon: '🚚' },
        ]
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Thinking message animation
  useEffect(() => {
    if (isLoading) {
      const randomMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]
      setThinkingMessage(randomMessage)
      
      const interval = setInterval(() => {
        setThinkingMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)])
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'hu-HU'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        toast.error('Nem sikerült a hangfelismerés')
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('A böngésző nem támogatja a hangfelismerést')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      toast.info('Beszélj most...')
    }
  }, [isListening])

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder.png',
      category: product.category
    }, 1)
    toast.success(`${product.name} kosárba helyezve!`)
  }

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.id !== 'welcome'), userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Chat request failed')

      const data = await response.json()

      // Handle cart action from AI
      if (data.cartAction?.success) {
        const p = data.cartAction.product
        addToCart({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image || '/placeholder.png',
          category: 'AI ajánlás'
        }, p.quantity || 1)
        toast.success(`${p.name} kosárba helyezve!`)
      }

      // Generate quick actions based on context
      const quickActions: QuickAction[] = []
      if (data.products?.length > 0) {
        quickActions.push({ label: 'Kosár megnyitása', action: 'OPEN_CART', icon: '🛒' })
        quickActions.push({ label: 'Más termékek', action: 'Mutass más termékeket', icon: '🔄' })
      }
      if (data.orderInfo?.found) {
        quickActions.push({ label: 'Más rendelés', action: 'Más rendeléseimet is mutasd', icon: '📋' })
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Sajnálom, nem sikerült feldolgozni a kérést.',
        products: data.products || [],
        cartAction: data.cartAction,
        orderInfo: data.orderInfo,
        timestamp: Date.now(),
        quickActions: quickActions.length > 0 ? quickActions : undefined
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Hiba történt a chat során')
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Elnézést, technikai hiba történt. Kérlek próbáld újra!',
        timestamp: Date.now()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    if (action.action === 'OPEN_CART') {
      openCart()
      return
    }
    setInput(action.action)
    setTimeout(() => handleSubmit(), 50)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const clearChat = () => {
    // Save current session before clearing
    if (messages.length > 1) {
      const session = {
        date: new Date().toISOString(),
        messages: messages.filter(m => m.id !== 'welcome')
      }
      const newSessions = [session, ...savedSessions].slice(0, 10) // Keep last 10 sessions
      setSavedSessions(newSessions)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions))
    }

    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Szia! 👋 Én a NEXU AI asszisztens vagyok!\n\nMiben segíthetek ma?',
      timestamp: Date.now(),
      quickActions: [
        { label: 'Telefonok', action: 'Mutasd a telefonokat', icon: '📱' },
        { label: 'Laptopok', action: 'Keresek egy laptopot', icon: '💻' },
        { label: 'Akciók', action: 'Milyen akciók vannak?', icon: '🏷️' },
        { label: 'Rendelésem', action: 'Hol tart a rendelésem?', icon: '📦' },
        { label: 'Szállítás', action: 'Szállítási információk', icon: '🚚' },
      ]
    }])
    toast.success('Új beszélgetés indítva')
  }

  const loadSession = (session: { date: string; messages: Message[] }) => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '📜 Korábbi beszélgetés betöltve:',
        timestamp: Date.now()
      },
      ...session.messages
    ])
    setShowHistory(false)
    toast.success('Beszélgetés betöltve')
  }

  const exportChat = () => {
    const chatContent = messages
      .filter(m => m.id !== 'welcome')
      .map(m => `[${m.role === 'user' ? 'Te' : 'NEXU AI'}]: ${m.content}`)
      .join('\n\n')
    
    const blob = new Blob([chatContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexu-chat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Beszélgetés exportálva')
  }

  const quickQuestions = [
    { label: '📱 Telefonok', action: 'Mutasd a telefonokat' },
    { label: '💻 Laptopok', action: 'Keresek egy laptopot' },
    { label: '🚚 Szállítás', action: 'Szállítási információk' },
    { label: '📦 Rendelésem', action: 'Hol tart a rendelésem?' }
  ]

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            <MessageCircle size={24} />
            <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-30" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 'auto' : '600px' }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center relative">
                  <Bot size={20} className="text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    NEXU AI
                    <span className="px-1.5 py-0.5 bg-purple-600/30 rounded text-[10px] text-purple-300">GPT-5</span>
                  </h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 transition-colors rounded-lg ${showHistory ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  title="Előzmények"
                >
                  <History size={16} />
                </button>
                <button
                  onClick={exportChat}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="Exportálás"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="Új beszélgetés"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <MinusCircle size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* History Panel */}
                <AnimatePresence>
                  {showHistory && savedSessions.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-b border-white/10 bg-white/5 overflow-hidden"
                    >
                      <div className="p-3 max-h-40 overflow-y-auto">
                        <p className="text-xs text-gray-500 mb-2">Korábbi beszélgetések:</p>
                        <div className="space-y-1">
                          {savedSessions.map((session, idx) => (
                            <button
                              key={idx}
                              onClick={() => loadSession(session)}
                              className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span>{new Date(session.date).toLocaleDateString('hu-HU')}</span>
                                <span className="text-gray-500">{session.messages.length} üzenet</span>
                              </div>
                              <p className="text-gray-500 truncate mt-0.5">
                                {session.messages[0]?.content.slice(0, 50)}...
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' ? 'bg-purple-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'
                      }`}>
                        {message.role === 'user' ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
                      </div>
                      
                      <div className="max-w-[85%] space-y-2">
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white rounded-br-md'
                            : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-md'
                        }`}>
                          <div className="whitespace-pre-wrap">{renderContent(message.content)}</div>
                        </div>
                        
                        {/* Product cards */}
                        {message.products && message.products.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {message.products.map((product, idx) => (
                              <ChatProductCard key={idx} product={product} onAddToCart={handleAddToCart} />
                            ))}
                          </div>
                        )}

                        {/* Order info */}
                        {message.orderInfo?.found && (
                          <div className="space-y-2 mt-2">
                            {message.orderInfo.order && (
                              <OrderCard order={message.orderInfo.order} />
                            )}
                            {message.orderInfo.orders?.map((order, idx) => (
                              <OrderCard key={idx} order={order} />
                            ))}
                          </div>
                        )}

                        {/* Quick actions */}
                        {message.quickActions && message.quickActions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.quickActions.map((action, idx) => (
                              <QuickActionButton key={idx} action={action} onClick={() => handleQuickAction(action)} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-purple-400" />
                        <span className="text-sm text-gray-400">{thinkingMessage}</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions (only on welcome) */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2 flex-shrink-0">
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction({ label: q.label, action: q.action })}
                          className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-colors"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 flex-shrink-0">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder={isListening ? '🎤 Beszélj most...' : 'Írj üzenetet...'}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          isListening ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 focus:border-purple-500/50'
                        }`}
                        disabled={isLoading}
                      />
                      {/* Voice input button */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                          isListening 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-gray-600">
                      <Zap size={10} className="inline mr-1" />
                      GPT-5 Mini • Hangvezérlés támogatott
                    </p>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
