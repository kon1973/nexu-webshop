'use client'

import { useState } from 'react'
import { Package, Sparkles, RefreshCw, Plus, Check, Gift, TrendingUp, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateSmartBundles, createBundle } from '@/lib/actions/ai-actions'
import { toast } from 'sonner'

interface BundleProduct {
  id: number
  name: string
  price: number
  category: string
}

interface BundleSuggestion {
  products: BundleProduct[]
  bundlePrice: number
  savings: number
  savingsPercent: number
  confidence: number
  reasoning: string
  targetAudience: string
}

interface DataInsights {
  analyzedOrders: number
  uniqueProductPairs: number
  topPairCount: number
}

export default function AISmartBundler() {
  const [bundles, setBundles] = useState<BundleSuggestion[]>([])
  const [dataInsights, setDataInsights] = useState<DataInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [createdBundles, setCreatedBundles] = useState<Set<number>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const categories = [
    'Telefonok',
    'Laptopok',
    'Gaming',
    'Kiegészítők',
    'Fülhallgatók'
  ]

  const analyzeBundles = async () => {
    setIsLoading(true)
    try {
      const result = await generateSmartBundles(
        selectedCategory ? { category: selectedCategory } : undefined
      )
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      setBundles(result.bundles || [])
      setDataInsights(result.dataInsights || null)
    } catch {
      toast.error('Hiba történt az elemzés során')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBundle = async (bundle: BundleSuggestion, index: number) => {
    try {
      const bundleName = `${bundle.products[0].category} Csomag`
      const result = await createBundle({
        name: bundleName,
        productIds: bundle.products.map(p => p.id),
        bundlePrice: bundle.bundlePrice,
        description: `${bundle.reasoning}\n\nTartalmazza: ${bundle.products.map(p => p.name).join(', ')}`
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`"${bundleName}" csomag sikeresen létrehozva!`)
      setCreatedBundles(prev => new Set([...prev, index]))
    } catch {
      toast.error('Nem sikerült létrehozni a csomagot')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="text-orange-400" />
            AI Smart Bundler
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Intelligens termékcsomag javaslatok a vásárlási minták alapján
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
        >
          <option value="">Minden kategória</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={analyzeBundles}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          Csomagok generálása
        </button>
      </div>

      {/* Data Insights */}
      {dataInsights && (
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border border-white/10 rounded-xl p-4"
          >
            <ShoppingBag size={20} className="text-orange-400 mb-2" />
            <p className="text-gray-400 text-xs">Elemzett rendelések</p>
            <p className="text-2xl font-bold text-white">{dataInsights.analyzedOrders}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#121212] border border-white/10 rounded-xl p-4"
          >
            <Package size={20} className="text-blue-400 mb-2" />
            <p className="text-gray-400 text-xs">Termékpár kombináció</p>
            <p className="text-2xl font-bold text-white">{dataInsights.uniqueProductPairs}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#121212] border border-white/10 rounded-xl p-4"
          >
            <TrendingUp size={20} className="text-green-400 mb-2" />
            <p className="text-gray-400 text-xs">Legtöbb együttes vásárlás</p>
            <p className="text-2xl font-bold text-white">{dataInsights.topPairCount}×</p>
          </motion.div>
        </div>
      )}

      {/* Bundle Suggestions */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Vásárlási minták elemzése...</p>
            <p className="text-gray-500 text-sm mt-1">AI keresi az ideális termék kombinációkat</p>
          </motion.div>
        ) : bundles.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {bundles.map((bundle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-[#121212] border rounded-xl overflow-hidden ${
                  createdBundles.has(index) 
                    ? 'border-green-500/50' 
                    : 'border-white/10 hover:border-orange-500/30'
                } transition-colors`}
              >
                {/* Bundle Header */}
                <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="text-orange-400" size={20} />
                      <span className="text-white font-semibold">
                        {bundle.products.length} termékes csomag
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-sm">
                        {bundle.savingsPercent}% megtakarítás
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-xs">
                        {bundle.confidence}% bizalom
                      </span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    {bundle.products.map((product, pIndex) => (
                      <div key={pIndex} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <div>
                          <p className="text-white text-sm font-medium">{product.name}</p>
                          <p className="text-gray-500 text-xs">{product.category}</p>
                        </div>
                        <p className="text-gray-400">{product.price.toLocaleString('hu-HU')} Ft</p>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between py-3 border-t border-white/10">
                    <div>
                      <p className="text-gray-400 text-xs">Külön ár:</p>
                      <p className="text-gray-500 line-through">
                        {bundle.products.reduce((sum, p) => sum + p.price, 0).toLocaleString('hu-HU')} Ft
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Csomag ár:</p>
                      <p className="text-orange-400 font-bold text-lg">
                        {bundle.bundlePrice.toLocaleString('hu-HU')} Ft
                      </p>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm">{bundle.reasoning}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Célközönség: {bundle.targetAudience}
                    </p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleCreateBundle(bundle, index)}
                    disabled={createdBundles.has(index)}
                    className={`w-full mt-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                      createdBundles.has(index)
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-500 text-white'
                    }`}
                  >
                    {createdBundles.has(index) ? (
                      <>
                        <Check size={18} />
                        Csomag létrehozva
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Csomag létrehozása
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p>Kattints a &quot;Csomagok generálása&quot; gombra</p>
            <p className="text-sm mt-1">Az AI elemzi a vásárlási mintákat és javasol optimális csomagokat</p>
          </div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="text-orange-400 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="text-orange-400 font-medium mb-1">Hogyan működik?</p>
            <ul className="text-gray-400 space-y-1">
              <li>• Az AI az elmúlt 30 nap rendeléseit elemzi</li>
              <li>• Azonosítja a gyakran együtt vásárolt termékeket</li>
              <li>• Optimális árazást javasol (10-20% kedvezmény)</li>
              <li>• A létrehozott csomagok a &quot;Csomagok&quot; kategóriában jelennek meg</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
