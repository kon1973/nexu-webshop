'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, X, Send, Bot, User, Sparkles, ShoppingCart, 
  Package, Search, Clock, Loader2, ChevronDown, Mic, MicOff,
  Maximize2, Minimize2, Volume2, VolumeX, ThumbsUp, ThumbsDown,
  RefreshCw, History, Trash2, AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: ProductSuggestion[]
  quickReplies?: string[]
  isTyping?: boolean
  feedback?: 'positive' | 'negative' | null
}

interface ProductSuggestion {
  id: number
  name: string
  price: number
  salePrice?: number
  image: string | null
  slug?: string | null
  category: string
  rating?: number
}

interface AIShoppingAssistantProps {
  initialOpen?: boolean
  position?: 'bottom-right' | 'bottom-left'
}

// Quick action buttons
const quickActions = [
  { label: '🔥 Akciók', query: 'Mutasd az akciós termékeket!' },
  { label: '⭐ Top termékek', query: 'Mik a legnépszerűbb termékek?' },
  { label: '💰 Olcsó ajánlatok', query: 'Keresek 50000 Ft alatti ajánlatokat' },
  { label: '🎁 Ajándék ötletek', query: 'Ajándékot keresek' },
]

export default function AIShoppingAssistant({ 
  initialOpen = false, 
  position = 'bottom-right' 
}: AIShoppingAssistantProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addToCart } = useCart()

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Üdv! 👋 Én vagyok a NEXU AI asszisztensed. Segíthetek termékeket keresni, összehasonlítani, vagy bármilyen kérdésben a vásárlással kapcsolatban. Mit kereshetek neked ma?',
        timestamp: new Date(),
        quickReplies: quickActions.map(a => a.label)
      }])
    }
  }, [isOpen, messages.length])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Speech recognition
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('A böngésződ nem támogatja a hangfelismerést')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'hu-HU'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Hiba történt a hangfelismerés során')
    }
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      handleSend(transcript)
    }

    recognition.start()
  }, [])

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'hu-HU'
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add typing indicator
    const typingId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: typingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        products: data.products,
        quickReplies: data.quickReplies
      }))

    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Elnézést, valami hiba történt. Kérlek próbáld újra! 😅',
        timestamp: new Date()
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    const action = quickActions.find(a => a.label === reply)
    handleSend(action?.query || reply)
  }

  const handleAddToCart = (product: ProductSuggestion) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      stock: 999,
      category: product.category
    })
    toast.success(`${product.name} hozzáadva a kosárhoz!`)
  }

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, feedback } : m
    ))
    // Could send feedback to analytics
  }

  const clearChat = () => {
    setMessages([])
    setShowHistory(false)
  }

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 md:right-6' 
    : 'left-4 md:left-6'

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 ${positionClasses} z-40 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/30 text-white ${isOpen ? 'hidden' : 'flex'} items-center justify-center group`}
      >
        <MessageCircle size={24} />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
        />
        <span className="absolute right-full mr-3 px-3 py-1 bg-black/80 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          AI Asszisztens
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${positionClasses} bottom-4 z-50 ${
              isExpanded 
                ? 'w-[90vw] h-[85vh] max-w-4xl' 
                : 'w-[95vw] md:w-[400px] h-[600px] max-h-[80vh]'
            } bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <Bot size={20} className="text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]"
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    NEXU AI
                    <Sparkles size={14} className="text-yellow-400" />
                  </h3>
                  <p className="text-gray-400 text-xs">Mindig online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="Előzmények"
                >
                  <History size={18} />
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="Törlés"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title={isExpanded ? 'Kicsinyítés' : 'Nagyítás'}
                >
                  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-500' 
                          : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                      }`}>
                        {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>

                      {/* Content */}
                      <div>
                        <div className={`px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white/10 text-gray-100 rounded-bl-md'
                        }`}>
                          {message.isTyping ? (
                            <div className="flex items-center gap-1">
                              <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                              />
                              <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                              />
                              <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                              />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>

                        {/* Product suggestions */}
                        {message.products && message.products.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.products.slice(0, 3).map((product) => (
                              <motion.div
                                key={product.id}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all"
                              >
                                <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                                  {product.image ? (
                                    <Image
                                      src={getImageUrl(product.image) || ''}
                                      alt={product.name}
                                      width={48}
                                      height={48}
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <Package size={20} className="m-auto text-gray-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    href={`/shop/${product.slug || product.id}`}
                                    className="text-white text-sm font-medium hover:text-blue-400 truncate block"
                                  >
                                    {product.name}
                                  </Link>
                                  <div className="flex items-center gap-2">
                                    {product.salePrice ? (
                                      <>
                                        <span className="text-green-400 text-sm font-bold">
                                          {formatPrice(product.salePrice)}
                                        </span>
                                        <span className="text-gray-500 text-xs line-through">
                                          {formatPrice(product.price)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-white text-sm font-bold">
                                        {formatPrice(product.price)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="p-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors"
                                >
                                  <ShoppingCart size={16} />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Quick replies */}
                        {message.quickReplies && message.quickReplies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.quickReplies.map((reply, i) => (
                              <button
                                key={i}
                                onClick={() => handleQuickReply(reply)}
                                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Feedback buttons for assistant messages */}
                        {message.role === 'assistant' && !message.isTyping && message.content && (
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              onClick={() => handleFeedback(message.id, 'positive')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                message.feedback === 'positive' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'hover:bg-white/10 text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'negative')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                message.feedback === 'negative' 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'hover:bg-white/10 text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              <ThumbsDown size={14} />
                            </button>
                            {isSpeaking ? (
                              <button
                                onClick={stopSpeaking}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                              >
                                <VolumeX size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={() => speak(message.content)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-gray-300"
                              >
                                <Volume2 size={14} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className={`text-[10px] text-gray-600 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                          {message.timestamp.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (when no messages or at start) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(action.label)}
                      className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all text-left"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Írj egy üzenetet..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 focus:border-blue-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none pr-10"
                    disabled={isLoading}
                  />
                  <button
                    onClick={startListening}
                    disabled={isLoading}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'hover:bg-white/10 text-gray-500'
                    }`}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </motion.button>
              </div>
              <p className="text-center text-gray-600 text-[10px] mt-2">
                AI asszisztens • Válaszok ellenőrzése ajánlott
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
