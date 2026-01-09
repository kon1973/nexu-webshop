'use client'

import { useEffect, useState, useMemo, useTransition } from 'react'
import { useCompare } from '@/context/CompareContext'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingCart, X, ArrowLeft, Check, Package, Star, Plus, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '@/lib/image'
import { getCompareProducts, getSimilarProducts, type CompareProduct } from './actions'
import AICompareAdvanced from '@/app/components/AICompareAdvanced'

type SimilarProduct = {
  id: number
  name: string
  price: number
  image: string
  rating: number
  category: string
}

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<CompareProduct[]>([])
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([])
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [showAICompare, setShowAICompare] = useState(false)

  // Fetch full product data when compare list changes
  useEffect(() => {
    const ids = compareList.map(p => p.id)
    if (ids.length === 0) {
      setProducts([])
      setSimilarProducts([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    startTransition(async () => {
      const data = await getCompareProducts(ids)
      setProducts(data)
      
      // Get similar products from the first product's category
      if (data.length > 0) {
        const firstProduct = data[0]
        if (firstProduct.category) {
          const similar = await getSimilarProducts(firstProduct.category, ids)
          setSimilarProducts(similar)
        }
      }
      setIsLoading(false)
    })
  }, [compareList])

  // Collect all unique specs with their types
  const allSpecs = useMemo(() => {
    const specs = new Map<string, 'text' | 'boolean' | 'header'>();
    
    products.forEach(p => {
      p.specifications.forEach(s => {
        if (!specs.has(s.key)) {
          specs.set(s.key, s.type || 'text');
        }
      });
    });

    return Array.from(specs.entries()).map(([key, type]) => ({ key, type }));
  }, [products]);

  // Calculate best values for highlighting
  const bestValues = useMemo(() => {
    const best: { lowestPrice?: number; highestRating?: number; highestStock?: number } = {}
    
    if (products.length > 1) {
      best.lowestPrice = Math.min(...products.map(p => p.price))
      best.highestRating = Math.max(...products.map(p => p.rating))
      best.highestStock = Math.max(...products.map(p => p.stock))
    }
    
    return best
  }, [products])

  if (isLoading && compareList.length > 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-gray-400 mt-4">Termékek betöltése...</p>
      </div>
    )
  }

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Package className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Az összehasonlítás üres</h1>
          <p className="text-gray-400 mb-8">
            Még nem adtál hozzá termékeket az összehasonlításhoz. Böngéssz a termékek között és válaszd ki azokat, amelyeket össze szeretnél hasonlítani.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium transition-all shadow-lg shadow-purple-500/25"
          >
            <ArrowLeft size={20} />
            Vissza a vásárláshoz
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Termék összehasonlítás</h1>
          <p className="text-gray-400 mt-1">{products.length} termék összehasonlítása</p>
        </div>
        <div className="flex items-center gap-3">
          {products.length >= 2 && (
            <button
              onClick={() => setShowAICompare(!showAICompare)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showAICompare 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400'
              }`}
            >
              <Sparkles size={18} />
              AI Elemzés
            </button>
          )}
          <Link
            href="/shop"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Termék hozzáadása
          </Link>
          <button
            onClick={clearCompare}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            Összes törlése
          </button>
        </div>
      </motion.div>

      {/* AI Comparison Section */}
      <AnimatePresence>
        {showAICompare && products.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-6">
              <AICompareAdvanced 
                products={products.map(p => ({
                  id: p.id,
                  name: p.name,
                  slug: String(p.id),
                  price: p.price,
                  originalPrice: p.originalPrice,
                  image: p.image,
                  category: p.category,
                  brand: p.brand,
                  rating: p.rating,
                  stock: p.stock
                }))}
                onRemove={removeFromCompare}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Table */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="overflow-x-auto pb-4 -mx-4 px-4"
      >
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr>
              <th className="p-4 min-w-[180px] bg-[#0a0a0a] sticky left-0 z-20 border-b border-r border-white/10">
                <span className="text-gray-400 text-sm font-medium">Tulajdonságok</span>
              </th>
              {products.map((product, index) => (
                <motion.th 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 min-w-[280px] border-b border-white/10 align-top"
                >
                  <div className="relative group">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                      title="Eltávolítás"
                    >
                      <X size={14} />
                    </button>
                    <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative">
                      {getImageUrl(product.image) ? (
                        <Image 
                          src={getImageUrl(product.image)!} 
                          alt={product.name} 
                          fill
                          className="object-cover"
                          sizes="280px"
                        />
                      ) : (
                        <Package size={64} className="text-gray-600" />
                      )}
                    </div>
                    <Link href={`/shop/${product.id}`} className="block hover:text-purple-400 transition-colors">
                      <h3 className="font-bold text-white mb-1 line-clamp-2 text-lg">{product.name}</h3>
                    </Link>
                    {product.brand && (
                      <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-xl font-bold ${bestValues.lowestPrice === product.price ? 'text-green-400' : 'text-purple-400'}`}>
                        {product.price.toLocaleString('hu-HU')} Ft
                      </span>
                      {bestValues.lowestPrice === product.price && products.length > 1 && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full uppercase">
                          Legjobb ár
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        stock: product.stock,
                        category: product.category
                      })}
                      disabled={product.stock <= 0}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20"
                    >
                      <ShoppingCart size={18} />
                      {product.stock > 0 ? 'Kosárba' : 'Elfogyott'}
                    </button>
                  </div>
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {/* Category */}
            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="p-4 font-medium text-white bg-[#0a0a0a] sticky left-0 z-10 border-r border-white/10">Kategória</td>
              {products.map((product) => (
                <td key={product.id} className="p-4">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                    {product.category}
                  </span>
                </td>
              ))}
            </tr>
            
            {/* Brand */}
            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="p-4 font-medium text-white bg-[#0a0a0a] sticky left-0 z-10 border-r border-white/10">Márka</td>
              {products.map((product) => (
                <td key={product.id} className="p-4">
                  {product.brand || <span className="text-gray-500">-</span>}
                </td>
              ))}
            </tr>
            
            {/* Rating with visual stars */}
            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="p-4 font-medium text-white bg-[#0a0a0a] sticky left-0 z-10 border-r border-white/10">Értékelés</td>
              {products.map((product) => (
                <td key={product.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                        />
                      ))}
                    </div>
                    <span className={`font-bold ${bestValues.highestRating === product.rating && products.length > 1 ? 'text-yellow-400' : 'text-white'}`}>
                      {product.rating}
                    </span>
                    {bestValues.highestRating === product.rating && products.length > 1 && (
                      <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full uppercase">
                        Legjobb
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
            
            {/* Stock */}
            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="p-4 font-medium text-white bg-[#0a0a0a] sticky left-0 z-10 border-r border-white/10">Készlet</td>
              {products.map((product) => (
                <td key={product.id} className="p-4">
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">{product.stock} db</span>
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-red-400 font-medium">Nincs készleten</span>
                  )}
                </td>
              ))}
            </tr>
            
            {/* Description */}
            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="p-4 font-medium text-white bg-[#0a0a0a] sticky left-0 z-10 border-r border-white/10">Leírás</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-sm leading-relaxed text-gray-400">
                  <p className="line-clamp-3">{product.description}</p>
                </td>
              ))}
            </tr>
            
            {/* Specifications */}
            {allSpecs.map(({ key, type }) => {
              if (type === 'header') {
                return (
                  <tr key={key} className="bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                    <td className="p-4 font-bold text-purple-400 uppercase tracking-wider text-xs bg-[#0a0a0a] sticky left-0 z-10 border-r border-white/10">
                      {key}
                    </td>
                    {products.map(product => (
                      <td key={product.id} className="p-4"></td>
                    ))}
                  </tr>
                )
              }

              return (
                <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-white bg-[#0a0a0a] sticky left-0 z-10 border-r border-white/10 text-sm">{key}</td>
                  {products.map(product => {
                    const spec = product.specifications.find(s => s.key === key)
                    
                    let content: React.ReactNode = <span className="text-gray-600">-</span>;
                    
                    if (spec) {
                      if (spec.type === 'boolean') {
                        const boolValue = spec.value === 'true' || spec.value === '1' || spec.value.toLowerCase() === 'igen'
                        content = boolValue ? (
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <Check size={18} />
                            <span className="text-sm">Igen</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <X size={18} />
                            <span className="text-sm">Nem</span>
                          </span>
                        )
                      } else {
                        content = <span className="text-gray-300">{spec.value}</span>
                      }
                    }

                    return (
                      <td key={product.id} className="p-4 text-sm">
                        {content}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Similar Products Suggestions */}
      {similarProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold text-white mb-6">Hasonló termékek az összehasonlításhoz</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map(product => (
              <div
                key={product.id}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <Link href={`/shop/${product.id}`} className="block">
                  <div className="aspect-square bg-white/5 rounded-lg mb-3 overflow-hidden relative">
                    {getImageUrl(product.image) ? (
                      <Image
                        src={getImageUrl(product.image)!}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="200px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-white text-sm line-clamp-2 mb-2">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-bold text-sm">
                    {product.price.toLocaleString('hu-HU')} Ft
                  </span>
                  <Link
                    href={`/shop/${product.id}`}
                    className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                    title="Termék megtekintése"
                  >
                    <Plus size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
