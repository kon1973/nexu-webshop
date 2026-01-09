'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { MessageCircle, Send, Sparkles, Loader2, Bot, User, ChevronDown, HelpCircle } from 'lucide-react'
import { askProductQuestion } from '@/lib/actions/user-actions'
import { motion, AnimatePresence } from 'framer-motion'

interface AIProductQAProps {
  productId: number
  productName: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  followUpQuestions?: string[]
}

const SUGGESTED_QUESTIONS = [
  'Milyen garancia jár hozzá?',
  'Mikor szállítják ki?',
  'Milyen tartozékok vannak benne?',
  'Kompatibilis-e más eszközökkel?'
]

export default function AIProductQA({ productId, productName }: AIProductQAProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isPending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    startTransition(async () => {
      const result = await askProductQuestion(productId, question)
      
      if (result.success && result.answer) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.answer,
          followUpQuestions: result.followUpQuestions
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.error || 'Sajnos nem tudok válaszolni erre a kérdésre. Próbáld meg másképp megfogalmazni!'
        }
        setMessages(prev => [...prev, errorMessage])
      }
    })
  }

  const handleQuickQuestion = (question: string) => {
    handleSubmit(question)
  }

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 rounded-xl p-4 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-white">Van kérdésed a termékről?</h3>
              <p className="text-sm text-gray-400">AI asszisztensünk segít!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Kérdezz</span>
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-purple-500/30 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">AI Termék Asszisztens</h3>
            <p className="text-xs text-gray-400">{productName}</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="font-medium text-white mb-2">Kérdezz bármit a termékről!</h4>
            <p className="text-sm text-gray-400 mb-6">
              AI asszisztensünk a termékadatok alapján válaszol
            </p>
            
            {/* Quick questions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm rounded-full border border-purple-500/30 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Follow-up questions */}
                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400 mb-2">Kapcsolódó kérdések:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {message.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickQuestion(q)}
                            className="text-xs px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-full transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-sm text-gray-400">Gondolkodom...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(input)
        }}
        className="p-4 border-t border-white/10 bg-black/20"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Írd be a kérdésedet..."
            disabled={isPending}
            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          <Sparkles className="w-3 h-3 inline mr-1" />
          AI válaszol a termékadatok alapján
        </p>
      </form>
    </motion.div>
  )
}
