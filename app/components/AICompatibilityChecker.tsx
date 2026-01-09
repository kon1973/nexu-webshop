'use client'

import { useState, useTransition, useEffect } from 'react'
import { CircuitBoard, Sparkles, Loader2, Plus, X, Check, AlertTriangle, AlertCircle, Cpu, HardDrive, MemoryStick, Monitor, Zap, Info, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { checkCompatibility } from '@/lib/actions/user-actions'
import { getImageUrl } from '@/lib/image'
import { toast } from 'sonner'

interface SelectedProduct {
  id: number
  name: string
  slug: string | null
  price: number
  image: string | null
  category: string
  specifications?: Record<string, string>
}

interface CompatibilityResult {
  isCompatible: boolean
  overallScore: number
  issues: Array<{
    severity: 'error' | 'warning' | 'info'
    products: string[]
    message: string
    suggestion?: string
  }>
  recommendations: Array<{
    type: string
    message: string
    productId?: number
    productName?: string
  }>
  bottlenecks: string[]
  powerRequirement?: number
  summary: string
}

const CATEGORY_ICONS: Record<string, typeof Cpu> = {
  'Processzorok': Cpu,
  'Alaplapok': CircuitBoard,
  'Memóriák': MemoryStick,
  'Tárolók': HardDrive,
  'Monitorok': Monitor,
  'Tápegységek': Zap
}

export default function AICompatibilityChecker() {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SelectedProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [isChecking, startChecking] = useTransition()
  const [showSearch, setShowSearch] = useState(false)

  // Search products
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
        const data = await res.json()
        if (data.products) {
          setSearchResults(data.products.filter((p: SelectedProduct) => 
            !selectedProducts.some(sp => sp.id === p.id)
          ))
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedProducts])

  const addProduct = (product: SelectedProduct) => {
    if (selectedProducts.length >= 8) {
      toast.error('Maximum 8 terméket választhatsz ki')
      return
    }
    setSelectedProducts(prev => [...prev, product])
    setSearchQuery('')
    setSearchResults([])
    setShowSearch(false)
    setResult(null)
  }

  const removeProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
    setResult(null)
  }

  const handleCheck = () => {
    if (selectedProducts.length < 2) {
      toast.error('Válassz ki legalább 2 terméket!')
      return
    }

    startChecking(async () => {
      const res = await checkCompatibility(selectedProducts.map(p => p.id))
      if (res.success && res.result) {
        setResult(res.result)
      } else {
        toast.error(res.error || 'Hiba az ellenőrzés során')
      }
    })
  }

  const getSeverityStyles = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: AlertCircle }
      case 'warning':
        return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: AlertTriangle }
      case 'info':
        return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-indigo-900/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <CircuitBoard size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Kompatibilitás Ellenőrző</h2>
              <p className="text-gray-400 text-sm">Ellenőrizd, hogy a kiválasztott alkatrészek kompatibilisek-e</p>
            </div>
          </div>
          {selectedProducts.length > 0 && (
            <div className="text-sm text-white/60">
              {selectedProducts.length}/8 termék
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Selected Products */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedProducts.map((product) => {
              const Icon = CATEGORY_ICONS[product.category] || Cpu
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl group"
                >
                  <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-white/5">
                    {product.image ? (
                      <Image
                        src={getImageUrl(product.image) || ''}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="max-w-[150px]">
                    <div className="text-sm font-medium text-white truncate">{product.name}</div>
                    <div className="text-xs text-white/50">{product.category}</div>
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )
            })}

            {/* Add Product Button */}
            {selectedProducts.length < 8 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-white/20 hover:border-violet-500/50 hover:bg-violet-500/10 rounded-xl text-white/60 hover:text-violet-400 transition-all group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                Termék hozzáadása
              </motion.button>
            )}
          </div>

          {/* Search Modal */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Keress terméket (pl. RTX 4070, Ryzen 7)..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    autoFocus
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left transition-colors"
                      >
                        <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-white/5 shrink-0">
                          {product.image && (
                            <Image
                              src={getImageUrl(product.image) || ''}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{product.name}</div>
                          <div className="text-xs text-white/50">{product.category}</div>
                        </div>
                        <div className="text-sm text-violet-400">
                          {product.price.toLocaleString('hu-HU')} Ft
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => {
                      setShowSearch(false)
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="px-4 py-2 text-white/60 hover:text-white"
                  >
                    Bezárás
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Check Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleCheck}
          disabled={selectedProducts.length < 2 || isChecking}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-violet-600/25 group"
        >
          {isChecking ? (
            <div className="flex items-center gap-3">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
              </div>
              <span>AI elemzi a kompatibilitást...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Kompatibilitás ellenőrzése
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-6"
            >
              {/* Overall Score */}
              <div className={`p-6 rounded-xl border ${result.isCompatible ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {result.isCompatible ? (
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                    ) : (
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        {result.isCompatible ? 'Kompatibilis konfiguráció' : 'Kompatibilitási problémák'}
                      </div>
                      <div className="text-sm text-white/60">{result.summary}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}%
                    </div>
                    <div className="text-xs text-white/50">Kompatibilitás</div>
                  </div>
                </div>

                {result.powerRequirement && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Becsült energiaigény: <span className="font-medium text-white">{result.powerRequirement}W</span>
                  </div>
                )}
              </div>

              {/* Issues */}
              {result.issues.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Észlelt problémák</h3>
                  <div className="space-y-3">
                    {result.issues.map((issue, idx) => {
                      const styles = getSeverityStyles(issue.severity)
                      const Icon = styles.icon
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl ${styles.bg} border ${styles.border}`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 ${styles.text} shrink-0 mt-0.5`} />
                            <div>
                              <div className="text-sm text-white/80">{issue.message}</div>
                              {issue.suggestion && (
                                <div className="text-sm text-white/60 mt-1">
                                  💡 {issue.suggestion}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {issue.products.map((product, pIdx) => (
                                  <span key={pIdx} className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/70">
                                    {product}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Bottlenecks */}
              {result.bottlenecks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Potenciális szűk keresztmetszetek</h3>
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                    <ul className="space-y-2">
                      {result.bottlenecks.map((bottleneck, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                          <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                          {bottleneck}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Ajánlások</h3>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          <span className="text-sm text-white/80">{rec.message}</span>
                        </div>
                        {rec.productId && (
                          <Link
                            href={`/shop/${rec.productId}`}
                            className="text-sm text-violet-400 hover:text-violet-300"
                          >
                            Megnézem →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {selectedProducts.length === 0 && !showSearch && (
          <div className="text-center py-12">
            <CircuitBoard className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/80 mb-2">Válassz ki termékeket</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Add hozzá az alkatrészeket (CPU, alaplap, RAM, stb.) és az AI ellenőrzi, hogy kompatibilisek-e egymással.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
