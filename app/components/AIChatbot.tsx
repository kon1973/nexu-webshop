'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, MinusCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Szia! 👋 Én a NEXU Store AI asszisztense vagyok. Miben segíthetek? Kérdezhetsz termékekről, szállításról, vagy bármi másról!'
      }])
    }
  }, [isOpen, messages.length])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Suggested quick questions
  const quickQuestions = [
    'Milyen telefonokat ajánlasz?',
    'Mennyi a szállítási idő?',
    'Van ingyenes szállítás?',
    'Hogyan fizethetek?'
  ]

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement
      form?.requestSubmit()
    }, 100)
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return
    
    setError(null)
    setIsLoading(true)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Hiba történt')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantId = (Date.now() + 1).toString()

      // Add empty assistant message
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        assistantContent += text
        
        // Update the assistant message content
        setMessages(prev => 
          prev.map(m => 
            m.id === assistantId 
              ? { ...m, content: assistantContent }
              : m
          )
        )
      }
    } catch (err) {
      setError('Hiba történt. Kérlek próbáld újra!')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
            aria-label="Chat megnyitása"
          >
            <MessageCircle size={24} />
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-30" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '32rem'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">NEXU AI Asszisztens</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  aria-label={isMinimized ? 'Maximalizálás' : 'Minimalizálás'}
                >
                  <MinusCircle size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  aria-label="Chat bezárása"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[320px]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-purple-600' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User size={16} className="text-white" />
                        ) : (
                          <Sparkles size={16} className="text-white" />
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white rounded-br-md'
                          : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-md'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content || '...'}</p>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-md">
                        <Loader2 size={16} className="animate-spin text-purple-400" />
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div className="text-center py-2">
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2">
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

                {/* Input Area */}
                <form 
                  id="chat-form"
                  onSubmit={onSubmit}
                  className="p-4 border-t border-white/10"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Írj egy üzenetet..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
                      aria-label="Üzenet küldése"
                    >
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2 text-center">
                    Powered by AI • A válaszok nem mindig pontosak
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
