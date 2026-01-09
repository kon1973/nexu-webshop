'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, ShoppingCart, Check, Sparkles, ChevronRight, X, Loader2, Gift, Percent, Info } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface BundleProduct {
  id: number
  name: string
  price: number
  image: string | null
  slug?: string | null
  category: string
  stock: number
}

interface Bundle {
  id: string
  name: string
  description: string
  products: BundleProduct[]
  originalPrice: number
  bundlePrice: number
  savings: number
  savingsPercent: number
  isActive: boolean
}

interface ProductBundleProps {
  bundles: Bundle[]
  currentProductId?: number
}

export default function ProductBundle({ bundles, currentProductId }: ProductBundleProps) {
  const { addToCart } = useCart()
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [addedBundles, setAddedBundles] = useState<Set<string>>(new Set())

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  const handleAddBundle = async (bundle: Bundle) => {
    setIsAdding(true)

    // Check stock for all products
    const outOfStock = bundle.products.filter(p => p.stock < 1)
    if (outOfStock.length > 0) {
      toast.error(`Néhány termék nincs készleten: ${outOfStock.map(p => p.name).join(', ')}`)
      setIsAdding(false)
      return
    }

    // Add all products to cart with a small delay for visual feedback
    for (const product of bundle.products) {
      await new Promise(resolve => setTimeout(resolve, 150))
      addToCart({
        id: product.id,
        name: product.name,
        price: Math.round(product.price * (1 - bundle.savingsPercent / 100)), // Apply bundle discount
        image: product.image,
        stock: product.stock,
        category: product.category
      })
    }

    setAddedBundles(prev => new Set([...prev, bundle.id]))
    setIsAdding(false)
    setSelectedBundle(null)
    
    toast.success(
      <div className="flex items-center gap-3">
        <Gift className="text-green-400" size={20} />
        <div>
          <p className="font-semibold">Csomag hozzáadva!</p>
          <p className="text-sm text-gray-400">Megtakarítás: {formatPrice(bundle.savings)}</p>
        </div>
      </div>,
      {
        action: {
          label: 'Kosár',
          onClick: () => window.location.href = '/cart'
        }
      }
    )
  }

  if (bundles.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-indigo-500/10 backdrop-blur-sm rounded-2xl border border-purple-500/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Csomagajánlatok
              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded-full">
                EXTRA
              </span>
            </h3>
            <p className="text-gray-400 text-sm">Spórolj akár több ezer forintot!</p>
          </div>
        </div>
      </div>

      {/* Bundles List */}
      <div className="p-4 space-y-4">
        {bundles.map((bundle, idx) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              addedBundles.has(bundle.id)
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10'
            }`}
            onClick={() => setSelectedBundle(bundle)}
          >
            {/* Bundle Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  {bundle.name}
                  {addedBundles.has(bundle.id) && (
                    <Check size={16} className="text-green-400" />
                  )}
                </h4>
                <p className="text-gray-400 text-sm line-clamp-2">{bundle.description}</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                <Percent size={14} className="text-green-400" />
                <span className="text-green-400 font-bold text-sm">-{bundle.savingsPercent}%</span>
              </div>
            </div>

            {/* Product Previews */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-3">
                {bundle.products.slice(0, 4).map((product, i) => (
                  <div
                    key={product.id}
                    className="w-10 h-10 rounded-lg bg-white/10 border-2 border-[#111] overflow-hidden"
                    style={{ zIndex: bundle.products.length - i }}
                  >
                    {product.image ? (
                      <Image
                        src={getImageUrl(product.image) || ''}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {bundle.products.length > 4 && (
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 border-2 border-[#111] flex items-center justify-center z-0">
                    <span className="text-purple-400 text-xs font-bold">+{bundle.products.length - 4}</span>
                  </div>
                )}
              </div>
              <span className="text-gray-500 text-sm">{bundle.products.length} termék</span>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-gray-500 text-sm line-through">{formatPrice(bundle.originalPrice)}</span>
                <span className="text-white font-bold text-lg">{formatPrice(bundle.bundlePrice)}</span>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <Sparkles size={14} />
                <span>Spórolsz: {formatPrice(bundle.savings)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bundle Detail Modal */}
      <AnimatePresence>
        {selectedBundle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBundle(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                        <Gift size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{selectedBundle.name}</h3>
                        <p className="text-gray-400 text-sm">{selectedBundle.products.length} termék</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedBundle(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Products */}
                <div className="p-4 space-y-3">
                  <p className="text-gray-400 text-sm mb-4">{selectedBundle.description}</p>
                  
                  {selectedBundle.products.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                      {/* Connector line */}
                      {idx > 0 && (
                        <div className="absolute left-8 -top-3 w-px h-3 bg-purple-500/50" />
                      )}
                      
                      <div className="w-14 h-14 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={getImageUrl(product.image) || ''}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/shop/${product.slug || product.id}`}
                          className="text-white font-medium hover:text-purple-400 transition-colors truncate block"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm line-through">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-green-400 text-sm font-medium">
                            {formatPrice(Math.round(product.price * (1 - selectedBundle.savingsPercent / 100)))}
                          </span>
                        </div>
                        {product.stock < 5 && product.stock > 0 && (
                          <span className="text-yellow-400 text-xs">Csak {product.stock} db</span>
                        )}
                        {product.stock < 1 && (
                          <span className="text-red-400 text-xs">Nincs készleten</span>
                        )}
                      </div>

                      {idx < selectedBundle.products.length - 1 && (
                        <div className="p-1 bg-purple-500/20 rounded-full">
                          <Plus size={12} className="text-purple-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 border-t border-white/10 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Eredeti ár:</span>
                    <span className="text-gray-500 line-through">{formatPrice(selectedBundle.originalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Kedvezmény:</span>
                    <span className="text-green-400 font-medium">-{formatPrice(selectedBundle.savings)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-white font-semibold">Csomag ár:</span>
                    <span className="text-white font-bold">{formatPrice(selectedBundle.bundlePrice)}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="p-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddBundle(selectedBundle)}
                    disabled={isAdding || selectedBundle.products.some(p => p.stock < 1)}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Hozzáadás...
                      </>
                    ) : addedBundles.has(selectedBundle.id) ? (
                      <>
                        <Check size={18} />
                        Hozzáadva a kosárhoz
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        Csomag kosárba
                      </>
                    )}
                  </motion.button>
                  
                  {selectedBundle.products.some(p => p.stock < 1) && (
                    <p className="text-red-400 text-sm text-center mt-2 flex items-center justify-center gap-1">
                      <Info size={14} />
                      Néhány termék nincs készleten
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
