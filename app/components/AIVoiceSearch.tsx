'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Mic, MicOff, Search, Sparkles, Loader2, X, Volume2, ArrowRight, History, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { processVoiceSearch } from '@/lib/actions/user-actions'
import { getImageUrl } from '@/lib/image'

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionType extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface SearchResult {
  id: number
  name: string
  slug?: string | null
  price: number
  image: string | null
  category: string
  relevanceScore: number
}

interface VoiceSearchResult {
  query: string
  interpretation: string
  results: SearchResult[]
  suggestions: string[]
  filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
  }
}

export default function AIVoiceSearch() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, startProcessing] = useTransition()
  const [result, setResult] = useState<VoiceSearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexu-voice-search-history')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
    synthRef.current = window.speechSynthesis
  }, [])

  // Save search history
  const saveToHistory = (query: string) => {
    const updated = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(updated)
    localStorage.setItem('nexu-voice-search-history', JSON.stringify(updated))
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI() as SpeechRecognitionType
        recognition.lang = 'hu-HU'
        recognition.continuous = false
        recognition.interimResults = true

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex
          const transcriptResult = event.results[current][0].transcript
          setTranscript(transcriptResult)

          if (event.results[current].isFinal) {
            handleSearch(transcriptResult)
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          setError('Nem sikerült értelmezni a hangot. Próbáld újra!')
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const startListening = () => {
    setError(null)
    setTranscript('')
    setResult(null)
    
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    } else {
      setError('A böngésződ nem támogatja a hangfelismerést')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) return

    saveToHistory(query)
    
    startProcessing(async () => {
      const response = await processVoiceSearch(query)
      if (response.success && response.result) {
        setResult(response.result)
        
        // Speak the interpretation
        if (synthRef.current && response.result.interpretation) {
          const utterance = new SpeechSynthesisUtterance(response.result.interpretation)
          utterance.lang = 'hu-HU'
          utterance.rate = 1.0
          synthRef.current.speak(utterance)
        }
      } else {
        setError(response.error || 'Hiba történt a keresés során')
      }
    })
  }

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (transcript.trim()) {
      handleSearch(transcript)
    }
  }

  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'hu-HU'
      synthRef.current.speak(utterance)
    }
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('nexu-voice-search-history')
  }

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  return (
    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25">
            <Mic size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              AI Hangkeresés
              <Sparkles size={20} className="text-cyan-400" />
            </h2>
            <p className="text-gray-400">Keress termékeket a hangoddal - magyarul!</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Voice Input Section */}
        <div className="text-center space-y-4">
          {/* Microphone Button */}
          <motion.button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`relative w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/50'
                : 'bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isProcessing ? (
              <Loader2 size={40} className="text-white animate-spin" />
            ) : isListening ? (
              <MicOff size={40} className="text-white" />
            ) : (
              <Mic size={40} className="text-white" />
            )}
            
            {/* Pulse animation when listening */}
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
          </motion.button>

          <p className="text-gray-400 text-sm">
            {isListening
              ? 'Hallgatlak... Beszélj most!'
              : isProcessing
                ? 'Feldolgozás...'
                : 'Kattints a mikrofonra és mondj valamit'}
          </p>

          {/* Example phrases */}
          <div className="flex flex-wrap justify-center gap-2">
            {['Olcsó telefon', 'Ajándék férfinak', 'Legjobb laptop munkához'].map((phrase) => (
              <button
                key={phrase}
                onClick={() => {
                  setTranscript(phrase)
                  handleSearch(phrase)
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-full transition-colors"
              >
                &quot;{phrase}&quot;
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Fallback */}
        <form onSubmit={handleTextSearch} className="relative">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Vagy írd be a keresést..."
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-4 pr-24 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={!transcript.trim() || isProcessing}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <History size={14} />
              Korábbi keresések
            </button>
            
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 bg-black/30 rounded-xl border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Utolsó keresések</span>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Törlés
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((h, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTranscript(h)
                          handleSearch(h)
                          setShowHistory(false)
                        }}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-full transition-colors"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* AI Interpretation */}
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-cyan-300 text-sm font-medium mb-1">AI értelmezés:</p>
                    <p className="text-white">{result.interpretation}</p>
                  </div>
                  <button
                    onClick={() => speakText(result.interpretation)}
                    className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
                
                {result.filters && Object.keys(result.filters).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.filters.category && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                        Kategória: {result.filters.category}
                      </span>
                    )}
                    {result.filters.maxPrice && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                        Max: {formatPrice(result.filters.maxPrice)}
                      </span>
                    )}
                    {result.filters.inStock && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        Készleten
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Product Results */}
              {result.results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug || product.id}`}
                      className="flex gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                    >
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={getImageUrl(product.image) || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Search size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium line-clamp-2">{product.name}</h4>
                        <p className="text-gray-500 text-sm">{product.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-cyan-400 font-bold">{formatPrice(product.price)}</span>
                          <span className="text-xs text-gray-500">
                            {product.relevanceScore}% egyezés
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Nincs találat erre a keresésre
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-gray-400 text-sm mb-2">Próbáld ezeket is:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTranscript(suggestion)
                          handleSearch(suggestion)
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-sm rounded-full transition-colors"
                      >
                        {suggestion}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
