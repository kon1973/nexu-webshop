'use client'

import { useState, useRef, useEffect, FormEvent, ChangeEvent, ReactNode } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, MinusCircle, ExternalLink, Star, ShoppingCart, Package, Trash2, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCart } from '@/context/CartContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
  cartAction?: CartAction
  orderInfo?: OrderInfo
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

// Status badge colors
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

// Product card component for chat
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

// Order card component
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

// Render markdown-like content with links
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

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()

  // Add welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Szia! 👋 Én a NEXU AI asszisztens vagyok!\n\nMiben segíthetek?\n• 🔍 Termék keresés\n• 📦 Rendelés követés\n• ❓ Kérdések (szállítás, fizetés, garancia)\n• 🛒 Kosárba helyezés'
      }])
    }
  }, [isOpen, messages.length])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Sajnálom, nem sikerült feldolgozni a kérést.',
        products: data.products || [],
        cartAction: data.cartAction,
        orderInfo: data.orderInfo
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Hiba történt a chat során')
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Elnézést, technikai hiba történt. Kérlek próbáld újra!'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }, 50)
  }

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Szia! 👋 Én a NEXU AI asszisztens vagyok!\n\nMiben segíthetek?\n• 🔍 Termék keresés\n• 📦 Rendelés követés\n• ❓ Kérdések (szállítás, fizetés, garancia)\n• 🛒 Kosárba helyezés'
    }])
  }

  const quickQuestions = [
    '📱 Telefonok',
    '💻 Laptopok',
    '🚚 Szállítás',
    '📦 Rendelésem'
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
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 'auto' : '550px' }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">NEXU AI Asszisztens</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Online • GPT-5 Mini
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
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
                  <MinusCircle size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
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
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-purple-400" />
                        <span className="text-sm text-gray-400">Gondolkodom...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2 flex-shrink-0">
                    <p className="text-xs text-gray-500 mb-2">Gyors opciók:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickQuestion(q)}
                          className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form id="chat-form" onSubmit={handleSubmit} className="p-4 border-t border-white/10 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Kérdezz bármit..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl flex items-center justify-center text-white transition-colors"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2 text-center">
                    Powered by GPT-5 Mini • Termékkeresés, rendelés követés, kosárba helyezés
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
