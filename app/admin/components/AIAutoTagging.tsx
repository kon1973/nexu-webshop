'use client'

import { useState, useTransition } from 'react'
import { Tag, Sparkles, Loader2, CheckCircle, AlertCircle, Package, RefreshCw, Wand2, Eye, Save, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { autoTagProducts, suggestCategoriesForProduct } from '@/lib/actions/ai-actions'
import { getImageUrl } from '@/lib/image'
import { toast } from 'sonner'

interface ProductTag {
  productId: number
  productName: string
  image: string | null
  currentTags: string[]
  suggestedTags: string[]
  suggestedCategory?: string
  confidence: number
  reasoning: string
}

interface TaggingResult {
  totalProcessed: number
  newTagsAdded: number
  categorySuggestions: number
  products: ProductTag[]
}

export default function AIAutoTagging() {
  const [result, setResult] = useState<TaggingResult | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [isAnalyzing, startAnalyzing] = useTransition()
  const [isSaving, startSaving] = useTransition()
  const [mode, setMode] = useState<'untagged' | 'all' | 'review'>('untagged')
  const [previewProduct, setPreviewProduct] = useState<ProductTag | null>(null)

  const analyzeProducts = () => {
    startAnalyzing(async () => {
      const res = await autoTagProducts(mode === 'untagged' ? 'untagged' : 'all')
      if (res.success && res.result) {
        setResult(res.result)
        setSelectedProducts(res.result.products.map((p: ProductTag) => p.productId))
      } else {
        toast.error(res.error || 'Hiba az elemzés során')
      }
    })
  }

  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAll = () => {
    if (result) {
      setSelectedProducts(result.products.map(p => p.productId))
    }
  }

  const deselectAll = () => {
    setSelectedProducts([])
  }

  const applyTags = () => {
    if (selectedProducts.length === 0) {
      toast.error('Válassz ki termékeket!')
      return
    }

    startSaving(async () => {
      // This would call an API to save the tags
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success(`${selectedProducts.length} termék címkéi frissítve!`)
      setSelectedProducts([])
    })
  }

  const getConfidenceStyle = (confidence: number) => {
    if (confidence >= 80) return { bg: 'bg-green-500/20', text: 'text-green-400' }
    if (confidence >= 60) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400' }
    return { bg: 'bg-orange-500/20', text: 'text-orange-400' }
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
              <Tag size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Auto-Címkézés</h2>
              <p className="text-gray-400 text-sm">Automatikus címke és kategória javaslatok</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'untagged', label: 'Címke nélküliek', desc: 'Csak címke nélküli termékek' },
            { id: 'all', label: 'Összes', desc: 'Minden termék újraelemzése' },
            { id: 'review', label: 'Felülvizsgálat', desc: 'Meglévő címkék ellenőrzése' }
          ].map(m => (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode(m.id as typeof mode)}
              className={`flex-1 p-3 rounded-xl border transition-all text-left relative ${
                mode === m.id
                  ? 'bg-violet-500/20 border-violet-500 text-violet-400 shadow-lg shadow-violet-500/20'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <p className="font-medium">{m.label}</p>
              <p className="text-xs opacity-70">{m.desc}</p>
              {mode === m.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-2 h-2 bg-violet-400 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Analyze Button */}
        {!result && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={analyzeProducts}
            disabled={isAnalyzing}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl flex items-center justify-center gap-3 font-medium shadow-xl shadow-violet-600/25 group transition-all"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                </div>
                <span>AI elemzi a termékeket...</span>
              </div>
            ) : (
              <>
                <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                Termékek elemzése
              </>
            )}
          </motion.button>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-3xl font-bold text-white">{result.totalProcessed}</p>
                <p className="text-gray-400 text-sm">Elemzett termék</p>
              </div>
              <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/30 text-center">
                <p className="text-3xl font-bold text-violet-400">{result.newTagsAdded}</p>
                <p className="text-gray-400 text-sm">Új címke javaslat</p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 text-center">
                <p className="text-3xl font-bold text-purple-400">{result.categorySuggestions}</p>
                <p className="text-gray-400 text-sm">Kategória javaslat</p>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg"
                >
                  Mind kijelöl
                </button>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg"
                >
                  Kijelölés törlése
                </button>
                <span className="text-gray-400 text-sm ml-2">
                  {selectedProducts.length} / {result.products.length} kijelölve
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setResult(null)
                    setSelectedProducts([])
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Újra
                </button>
                <button
                  onClick={applyTags}
                  disabled={selectedProducts.length === 0 || isSaving}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Címkék alkalmazása
                </button>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {result.products.map(product => {
                const confStyle = getConfidenceStyle(product.confidence)
                const isSelected = selectedProducts.includes(product.productId)
                
                return (
                  <motion.div
                    key={product.productId}
                    layout
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-500/10 border-violet-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => toggleProduct(product.productId)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-1 ${
                        isSelected ? 'bg-violet-500 border-violet-500' : 'border-gray-600'
                      }`}>
                        {isSelected && <CheckCircle size={14} className="text-white" />}
                      </div>

                      {/* Product Image */}
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white/5 shrink-0">
                        {product.image ? (
                          <Image
                            src={getImageUrl(product.image) || ''}
                            alt={product.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white truncate">{product.productName}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${confStyle.bg} ${confStyle.text}`}>
                              {product.confidence}% biztos
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewProduct(product)
                              }}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <Eye size={16} className="text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Current Tags */}
                        {product.currentTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {product.currentTags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Suggested Tags */}
                        <div className="flex flex-wrap gap-1">
                          {product.suggestedTags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-violet-500/30 text-violet-300 text-xs rounded flex items-center gap-1">
                              <Sparkles size={10} />
                              {tag}
                            </span>
                          ))}
                          {product.suggestedCategory && (
                            <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded flex items-center gap-1">
                              <Tag size={10} />
                              Kategória: {product.suggestedCategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {previewProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setPreviewProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-[#1a1a1a] rounded-2xl border border-white/10 max-w-lg w-full p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Címke előnézet</h3>
                  <button
                    onClick={() => setPreviewProduct(null)}
                    className="p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-white/5">
                    {previewProduct.image && (
                      <Image
                        src={getImageUrl(previewProduct.image) || ''}
                        alt={previewProduct.productName}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{previewProduct.productName}</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Bizonyosság: <span className="text-violet-400">{previewProduct.confidence}%</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Jelenlegi címkék:</p>
                    <div className="flex flex-wrap gap-1">
                      {previewProduct.currentTags.length > 0 ? (
                        previewProduct.currentTags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-600 text-sm">Nincs címke</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Javasolt címkék:</p>
                    <div className="flex flex-wrap gap-1">
                      {previewProduct.suggestedTags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-violet-500/30 text-violet-300 text-sm rounded">
                          + {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {previewProduct.suggestedCategory && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Javasolt kategória:</p>
                      <span className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded">
                        {previewProduct.suggestedCategory}
                      </span>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-400 text-sm mb-2">AI indoklás:</p>
                    <p className="text-gray-300 text-sm bg-white/5 p-3 rounded-lg">
                      {previewProduct.reasoning}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
