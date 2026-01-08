'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Sparkles, X, Loader2, ArrowRight, Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { searchWithAI } from '@/lib/actions/user-actions'

interface AISearchResult {
  success: boolean
  intent?: {
    type: string
    filters: {
      priceRange?: { min?: number; max?: number }
      category?: string
      brand?: string
      features?: string[]
    }
    keywords: string[]
  }
  products?: Array<{
    id: number
    name: string
    slug: string
    price: number
    originalPrice?: number | null
    image: string | null
    category?: string | null
    matchReason: string
  }>
  suggestions?: string[]
  aiExplanation?: string
}

interface SmartSearchProps {
  onClose?: () => void
}

export default function SmartSearch({ onClose }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AISearchResult | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const exampleQueries = [
    'Olcsó telefon 100 ezer alatt',
    'Gaming laptop nagy teljesítménnyel',
    'Vezeték nélküli fülhallgató sportoláshoz',
    'Samsung telefon jó kamerával',
    'Laptop munkához és játékhoz'
  ]

  useEffect(() => {
    inputRef.current?.focus()
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = 'hu-HU'
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
        handleSearch(transcript)
      }
      
      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.abort()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query
    if (!q.trim()) return
    
    setIsLoading(true)
    setShowSuggestions(false)
    
    try {
      const data = await searchWithAI(q) as AISearchResult
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
    if (e.key === 'Escape' && onClose) {
      onClose()
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('hu-HU') + ' Ft'
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500 transition-colors">
          <div className="pl-5 pr-3">
            <Sparkles className="text-purple-400" size={20} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!e.target.value) {
                setShowSuggestions(true)
                setResults(null)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Mit keresel? Pl: 'Olcsó telefon 100 ezer alatt' vagy 'Gaming laptop nagy teljesítménnyel'"
            className="flex-1 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setResults(null)
                setShowSuggestions(true)
              }}
              className="p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
          {recognitionRef.current && (
            <button
              onClick={toggleVoice}
              className={`p-3 mx-1 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 animate-pulse' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="px-6 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Keresés
          </button>
        </div>
      </div>

      {/* Voice Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 text-red-400">
              <Mic size={18} className="animate-pulse" />
              <span>Hallgatom... Mondja el, mit keres!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example Queries */}
      <AnimatePresence>
        {showSuggestions && !isLoading && !results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <p className="text-gray-500 text-sm mb-3">Próbáld ki ezeket:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setQuery(example)
                    handleSearch(example)
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 text-sm transition-colors flex items-center gap-2"
                >
                  <Search size={14} />
                  {example}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <Loader2 size={40} className="mx-auto text-purple-400 animate-spin mb-4" />
          <p className="text-gray-400">AI elemzi a kérést és keresi a legjobb termékeket...</p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-6"
          >
            {/* AI Explanation */}
            {results.aiExplanation && (
              <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-purple-400 flex-shrink-0 mt-1" size={18} />
                  <div>
                    <p className="text-white text-sm">{results.aiExplanation}</p>
                    {results.intent?.filters && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {results.intent.filters.priceRange?.max && (
                          <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                            Max ár: {formatPrice(results.intent.filters.priceRange.max)}
                          </span>
                        )}
                        {results.intent.filters.category && (
                          <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                            {results.intent.filters.category}
                          </span>
                        )}
                        {results.intent.filters.brand && (
                          <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                            {results.intent.filters.brand}
                          </span>
                        )}
                        {results.intent.filters.features?.map((f) => (
                          <span key={f} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {results.products && results.products.length > 0 ? (
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Search size={18} className="text-purple-400" />
                  Találatok ({results.products.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/shop/${product.slug}`}
                        className="block bg-[#121212] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group"
                      >
                        <div className="aspect-square relative bg-white/5">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-4 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <Search size={32} />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                          <h4 className="text-white font-medium line-clamp-2 mb-2 group-hover:text-purple-400 transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-white">{formatPrice(product.price)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          {product.matchReason && (
                            <p className="text-xs text-purple-400 mt-2 line-clamp-1">
                              ✨ {product.matchReason}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Nem találtunk megfelelő terméket</p>
              </div>
            )}

            {/* Suggestions */}
            {results.suggestions && results.suggestions.length > 0 && (
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-sm mb-3">Kapcsolódó keresések:</p>
                <div className="flex flex-wrap gap-2">
                  {results.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuery(suggestion)
                        handleSearch(suggestion)
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 text-sm transition-colors flex items-center gap-1"
                    >
                      {suggestion}
                      <ArrowRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Add global type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
