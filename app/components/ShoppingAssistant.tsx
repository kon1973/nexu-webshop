'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Sparkles, ShoppingBag, Loader2, MinusCircle, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { askShoppingAssistant } from '@/lib/actions/user-actions'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  products?: Array<{
    id: number
    name: string
    slug: string
    price: number
    image: string | null
  }>
  suggestions?: string[]
}

interface ShoppingAssistantResponse {
  success: boolean
  answer?: string
  products?: Array<{
    id: number
    name: string
    slug: string
    price: number
    image: string | null
  }>
  suggestions?: string[]
}

export default function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, isMinimized, messages])

  const handleSend = async (message?: string) => {
    const text = message || input
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await askShoppingAssistant(text) as ShoppingAssistantResponse
      
      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer || 'Sajnálom, nem tudok segíteni ebben.',
          products: response.products,
          suggestions: response.suggestions
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Assistant error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hiba történt, kérlek próbáld újra.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('hu-HU') + ' Ft'
  }

  const quickQuestions = [
    'Milyen telefont ajánlasz 100 ezer alatt?',
    'Mi a különbség a laptop és tablet között?',
    'Melyik a legjobb gaming fülhallgató?',
    'Segíts választani ajándékot!'
  ]

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full text-white shadow-lg shadow-purple-500/30 transition-all group"
          >
            <div className="relative">
              <ShoppingBag size={24} />
              <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              AI Vásárlási Asszisztens
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : 'auto'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Vásárlási Asszisztens</h3>
                  <p className="text-gray-400 text-xs">AI segítség a vásárláshoz</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <MinusCircle size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                        <ShoppingBag size={28} className="text-purple-400" />
                      </div>
                      <h4 className="text-white font-medium mb-2">Szia! Miben segíthetek?</h4>
                      <p className="text-gray-500 text-sm mb-4">
                        Kérdezz bátran termékekről, vagy kérj ajánlást!
                      </p>
                      <div className="space-y-2">
                        {quickQuestions.map((q) => (
                          <button
                            key={q}
                            onClick={() => handleSend(q)}
                            className="w-full p-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-sm transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white rounded-2xl rounded-br-md'
                            : 'bg-white/5 text-gray-200 rounded-2xl rounded-bl-md'
                        } p-3`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Products */}
                        {message.products && message.products.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.products.slice(0, 3).map((product) => (
                              <Link
                                key={product.id}
                                href={`/shop/${product.slug}`}
                                className="flex items-center gap-3 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                              >
                                <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                  {product.image ? (
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  ) : (
                                    <ShoppingBag size={16} className="m-auto text-gray-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-xs font-medium line-clamp-1">{product.name}</p>
                                  <p className="text-purple-300 text-xs font-semibold">{formatPrice(product.price)}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSend(suggestion)}
                                className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-full text-purple-300 text-xs transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 text-gray-400 rounded-2xl rounded-bl-md p-3 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Gondolkodom...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Írj egy kérdést..."
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
