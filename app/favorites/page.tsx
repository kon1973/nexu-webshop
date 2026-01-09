'use client'

import { useFavorites } from '@/context/FavoritesContext'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { ArrowLeft, HeartCrack, ShoppingCart, AlertTriangle, Tag, Sparkles, TrendingDown, Loader2, Share2, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/app/components/ProductCard'
import AIWishlistAnalyzer from '@/app/components/AIWishlistAnalyzer'
import WishlistSharing from '@/app/components/WishlistSharing'
import { toast } from 'sonner'
import { getRecommendationsForFavorites, checkFavoritesStock, checkPriceDrops, getPopularCategories } from './actions'
import type { Product } from '@prisma/client'

interface StockInfo {
  stock: number
  inStock: boolean
  lowStock: boolean
}

interface PriceDrop {
  id: number
  name: string
  price: number
  originalPrice: number
  discount: number
  image?: string | null
}

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites()
  const { addToCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [stockInfo, setStockInfo] = useState<Record<string, StockInfo>>({})
  const [priceDrops, setPriceDrops] = useState<PriceDrop[]>([])
  const [popularCategories, setPopularCategories] = useState<{name: string; count: number}[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch data with Server Actions
  useEffect(() => {
    if (favorites.length > 0) {
      const productIds = favorites.map(f => f.id)
      
      startTransition(async () => {
        // Fetch all data in parallel
        const [recsResult, stockResult, dropsResult] = await Promise.all([
          getRecommendationsForFavorites(favorites),
          checkFavoritesStock(productIds),
          checkPriceDrops(productIds)
        ])

        if (recsResult.success) setRecommendations(recsResult.products)
        if (stockResult.success) setStockInfo(stockResult.stockInfo)
        if (dropsResult.success) setPriceDrops(dropsResult.priceDrops)
      })
    } else {
      // Load popular categories when no favorites
      startTransition(async () => {
        const result = await getPopularCategories()
        if (result.success) setPopularCategories(result.categories)
      })
    }
  }, [favorites])

  const handleAddAllToCart = () => {
    let addedCount = 0
    favorites.forEach(product => {
      const stock = stockInfo[product.id]
      if (!stock || stock.inStock) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.salePrice || product.price,
          image: product.image || '',
          category: product.category
        }, 1)
        addedCount++
      }
    })
    if (addedCount > 0) {
      toast.success(`${addedCount} termék hozzáadva a kosárhoz`)
    } else {
      toast.error('Nincs elérhető termék a kedvencek között')
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: 'Kedvenceim - NEXU Store',
        url
      })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link másolva!')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      {/* Loading overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <Loader2 className="animate-spin text-purple-500" size={48} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"
              aria-label="Vissza a boltba"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold">
              Kedvenceim 
              <span className="text-purple-400 ml-2">({favorites.length})</span>
            </h1>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                title="Megosztás"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold transition"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Mind a kosárba</span>
              </button>
            </div>
          )}
        </div>

        {/* Price drops alert */}
        <AnimatePresence>
          {priceDrops.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <TrendingDown className="text-green-400" size={20} />
                </div>
                <h3 className="text-lg font-bold text-green-100">Árcsökkentés a kedvenceidnél!</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {priceDrops.map(drop => (
                  <Link 
                    key={drop.id} 
                    href={`/shop/${drop.id}`}
                    className="bg-black/30 rounded-xl p-4 hover:bg-black/50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      {drop.image && (
                        <img src={drop.image} alt={drop.name} className="w-12 h-12 object-cover rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-green-400 transition">{drop.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-green-400 font-bold">{drop.price.toLocaleString('hu-HU')} Ft</span>
                          <span className="text-xs text-gray-500 line-through">{drop.originalPrice.toLocaleString('hu-HU')} Ft</span>
                        </div>
                      </div>
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                        -{drop.discount}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {favorites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-[#121212] border border-white/5 rounded-2xl"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <HeartCrack size={48} className="text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Még nincsenek kedvenceid</h2>
            <p className="text-gray-400 mb-8">Böngéssz a boltban, és mentsd el, ami tetszik!</p>
            
            {/* Popular categories */}
            {popularCategories.length > 0 && (
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-4">Népszerű kategóriák</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularCategories.map(cat => (
                    <Link
                      key={cat.name}
                      href={`/shop?category=${encodeURIComponent(cat.name)}`}
                      className="px-4 py-2 bg-white/5 rounded-full text-sm hover:bg-purple-500/20 hover:text-purple-400 transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-bold transition-all"
            >
              <Sparkles size={18} />
              Irány a bolt
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Favorites grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {favorites.map((product, index) => {
                  const stock = stockInfo[product.id]
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Stock warning badge */}
                      {stock && !stock.inStock && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Elfogyott
                        </div>
                      )}
                      {stock && stock.lowStock && (
                        <div className="absolute top-2 left-2 z-10 bg-orange-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Csak {stock.stock} db
                        </div>
                      )}
                      <ProductCard product={product} />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {/* AI Wishlist Analyzer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <AIWishlistAnalyzer 
                products={favorites.map(f => ({
                  id: f.id,
                  name: f.name,
                  price: f.salePrice || f.price,
                  image: f.image || null
                }))}
              />
            </motion.div>

            {/* Wishlist Sharing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-500/20 p-2 rounded-lg">
                  <Users className="text-pink-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold">Megosztható kívánságlisták</h2>
              </div>
              <WishlistSharing />
            </motion.div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-16"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Tag className="text-purple-400" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold">Neked ajánljuk</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.slice(0, 4).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
