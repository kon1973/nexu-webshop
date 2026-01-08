'use client'

import { useState } from 'react'
import { Search, Sparkles, Tag, Filter, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateSEOSuggestions } from '@/lib/actions/ai-actions'

interface Product {
  id: number
  name: string
  slug: string
  metaTitle: string | null
  metaDescription: string | null
  category: string | null
}

interface SEOSuggestion {
  productId: number
  productName: string
  current: {
    metaTitle: string | null
    metaDescription: string | null
  }
  suggested: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    suggestions?: string[]
  }
}

interface SEOData {
  success: boolean
  suggestions: SEOSuggestion[]
  generatedAt?: string
}

export default function AISEOPanel() {
  const [data, setData] = useState<SEOData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<SEOSuggestion | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const loadSEO = async () => {
    setIsLoading(true)
    try {
      const result = await generateSEOSuggestions(20) as SEOData
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('SEO error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBar = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="text-green-400" />
            SEO Optimalizálás
          </h2>
          <p className="text-gray-400 text-sm mt-1">AI-generált meta címek és leírások</p>
        </div>
        <button
          onClick={loadSEO}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
        >
          <Sparkles size={16} className={isLoading ? 'animate-pulse' : ''} />
          SEO elemzés
        </button>
      </div>

      {!data && !isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Search size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Kattints az "SEO elemzés" gombra a javaslatok generálásához</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Sparkles size={48} className="mx-auto text-green-400 mb-4 animate-pulse" />
          <p className="text-gray-400">SEO elemzés folyamatban...</p>
          <p className="text-gray-500 text-sm mt-2">Az AI elemzi a termékeket és generálja a javaslatokat</p>
        </div>
      )}

      {data && !isLoading && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
              <p className="text-gray-400 text-sm">Elemzett termékek</p>
              <p className="text-3xl font-bold text-white mt-2">{data.suggestions.length}</p>
            </div>
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
              <p className="text-gray-400 text-sm">Generálás ideje</p>
              <p className="text-lg font-semibold text-green-400 mt-2">
                {data.generatedAt ? new Date(data.generatedAt).toLocaleString('hu-HU') : '-'}
              </p>
            </div>
          </div>

          {/* Products List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Products */}
            <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Package size={18} />
                  Termékek SEO állapota
                </h3>
              </div>
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {data.suggestions.map((suggestion) => {
                  const hasMetaTitle = !!suggestion.current.metaTitle
                  const hasMetaDesc = !!suggestion.current.metaDescription
                  const score = hasMetaTitle && hasMetaDesc ? 100 : hasMetaTitle || hasMetaDesc ? 50 : 0
                  
                  return (
                    <button
                      key={suggestion.productId}
                      onClick={() => setSelectedProduct(suggestion)}
                      className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                        selectedProduct?.productId === suggestion.productId ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm line-clamp-1">
                          {suggestion.productName}
                        </span>
                        <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                          {score === 0 ? 'Nincs' : score === 50 ? 'Részleges' : 'Teljes'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getScoreBar(score)} transition-all`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-gray-500 text-xs">→</span>
                        <div className="flex-1 h-1.5 bg-green-500/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: Details */}
            <div className="bg-[#121212] border border-white/10 rounded-xl">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-green-400" />
                  AI Javaslatok
                </h3>
              </div>
              
              <AnimatePresence mode="wait">
                {selectedProduct ? (
                  <motion.div
                    key={selectedProduct.productId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 space-y-4"
                  >
                    <h4 className="text-white font-medium">{selectedProduct.productName}</h4>
                    
                    {/* Meta Title */}
                    <div className="space-y-2">
                      <label className="text-gray-400 text-xs font-medium">Meta Title</label>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-500 text-xs mb-1">Jelenlegi:</p>
                        <p className="text-gray-400 text-sm">{selectedProduct.current.metaTitle || '(nincs beállítva)'}</p>
                      </div>
                      {selectedProduct.suggested.metaTitle && (
                        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-green-400 text-xs font-medium">AI Javaslat:</p>
                            <button
                              onClick={() => copyToClipboard(selectedProduct.suggested.metaTitle!, 'title')}
                              className="text-xs text-green-400 hover:text-green-300"
                            >
                              {copiedField === 'title' ? '✓ Másolva' : 'Másolás'}
                            </button>
                          </div>
                          <p className="text-white text-sm">{selectedProduct.suggested.metaTitle}</p>
                        </div>
                      )}
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-2">
                      <label className="text-gray-400 text-xs font-medium">Meta Description</label>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-500 text-xs mb-1">Jelenlegi:</p>
                        <p className="text-gray-400 text-sm">{selectedProduct.current.metaDescription || '(nincs beállítva)'}</p>
                      </div>
                      {selectedProduct.suggested.metaDescription && (
                        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-green-400 text-xs font-medium">AI Javaslat:</p>
                            <button
                              onClick={() => copyToClipboard(selectedProduct.suggested.metaDescription!, 'desc')}
                              className="text-xs text-green-400 hover:text-green-300"
                            >
                              {copiedField === 'desc' ? '✓ Másolva' : 'Másolás'}
                            </button>
                          </div>
                          <p className="text-white text-sm">{selectedProduct.suggested.metaDescription}</p>
                        </div>
                      )}
                    </div>

                    {/* Keywords */}
                    {selectedProduct.suggested.keywords && selectedProduct.suggested.keywords.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-gray-400 text-xs font-medium flex items-center gap-2">
                          <Tag size={14} />
                          Ajánlott kulcsszavak
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.suggested.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              onClick={() => copyToClipboard(keyword, `kw-${idx}`)}
                              className="px-2 py-1 bg-white/5 text-gray-300 rounded-md text-xs cursor-pointer hover:bg-white/10 transition-colors"
                            >
                              {copiedField === `kw-${idx}` ? '✓' : keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Suggestions */}
                    {selectedProduct.suggested.suggestions && selectedProduct.suggested.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-gray-400 text-xs font-medium">További javaslatok</label>
                        <ul className="space-y-1">
                          {selectedProduct.suggested.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-green-400">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Link to edit */}
                    <a
                      href={`/admin/edit-product/${selectedProduct.productId}`}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors"
                    >
                      Termék szerkesztése
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                  >
                    <Filter size={32} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-500 text-sm">Válassz egy terméket a javaslatok megtekintéséhez</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
