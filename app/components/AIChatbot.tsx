'use client'

import { useState, useRef, useEffect, FormEvent, ChangeEvent, ReactNode } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, MinusCircle, ExternalLink, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  url: string
  rating: number
  inStock: boolean
  category: string
}

// Product card component for chat
function ChatProductCard({ product }: { product: Product }) {
  return (
    <Link 
      href={product.url}
      className="block bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors border border-white/10 group"
    >
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
      <div className="mt-2 flex items-center justify-end">
        <span className="text-xs text-purple-400 flex items-center gap-1 group-hover:underline">
          Részletek <ExternalLink size={10} />
        </span>
      </div>
    </Link>
  )
}

// Render markdown-like content with links
function renderContent(content: string) {
  // Convert markdown links to clickable links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }
    // Add the link
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
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  // If no links found, return original content
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

  // Add welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Szia! 👋 Én a NEXU Store AI értékesítési asszisztense vagyok. Segítek megtalálni a tökéletes terméket!\n\nKérdezz bátran termékekről, vagy mondd el mire van szükséged! 🛍️'
      }])
    }
  }, [isOpen, messages.length])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Sajnálom, nem sikerült feldolgozni a kérést.',
        products: data.products || []
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
    // Submit after setting input
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      }
    }, 50)
  }

  const quickQuestions = [
    '📱 Telefonokat keresek',
    '💻 Laptopot ajánlj',
    '🎮 Gaming cuccok',
    '🚚 Szállítási infó'
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
            animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 'auto' : '500px' }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col"
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
                    Online • GPT-4o
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
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
                              <ChatProductCard key={idx} product={product} />
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
                        <span className="text-sm text-gray-400">Keresek...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2 flex-shrink-0">
                    <p className="text-xs text-gray-500 mb-2">Gyors kérdések:</p>
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
                    AI-alapú • Termékkeresés támogatott
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
