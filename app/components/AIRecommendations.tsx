'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronLeft, ChevronRight, ShoppingCart, Heart, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getPersonalizedRecommendations } from '@/lib/actions/user-actions'

interface RecommendedProduct {
  id: number
  name: string
  slug: string | null
  price: number
  originalPrice?: number | null
  salePrice?: number | null
  image: string | null
  category?: string | null
  brand?: { name: string } | null
}

interface AIRecommendationsData {
  success: boolean
  products?: RecommendedProduct[]
  personalized?: boolean
}

interface AIRecommendationsProps {
  userId?: string
  limit?: number
  className?: string
}

export default function AIRecommendations({ userId, limit = 8, className = '' }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
  const [basedOn, setBasedOn] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(4)

  useEffect(() => {
    loadRecommendations()
    
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(1)
      else if (window.innerWidth < 768) setItemsPerView(2)
      else if (window.innerWidth < 1024) setItemsPerView(3)
      else setItemsPerView(4)
    }
    
    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [userId, limit])

  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      const data = await getPersonalizedRecommendations({ limit }) as AIRecommendationsData
      if (data.success && data.products) {
        setRecommendations(data.products)
        setBasedOn(data.personalized ? ['Vásárlási előzmények', 'Böngészési szokások'] : ['Népszerű termékek'])
      }
    } catch (error) {
      console.error('Recommendations error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('hu-HU') + ' Ft'
  }

  const nextSlide = () => {
    if (currentIndex < recommendations.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl aspect-square animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" size={22} />
            Neked ajánljuk
          </h2>
          {basedOn.length > 0 && (
            <p className="text-gray-500 text-sm mt-1">
              {basedOn.join(' • ')} alapján
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadRecommendations}
            disabled={isLoading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Frissítés"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= recommendations.length - itemsPerView}
            className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: -currentIndex * (100 / itemsPerView + 1.5) + '%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
            >
              <Link
                href={`/shop/${product.slug}`}
                className="block bg-[#121212] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group relative"
              >
                {/* AI Badge */}
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                  <Sparkles size={10} />
                  AI ajánlott
                </div>

                {/* Image */}
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
                      <ShoppingCart size={32} />
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 bg-black/70 hover:bg-purple-600 rounded-lg text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        // Add to cart logic
                      }}
                    >
                      <ShoppingCart size={16} />
                    </button>
                    <button 
                      className="p-2 bg-black/70 hover:bg-red-500 rounded-lg text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        // Add to favorites logic
                      }}
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.category || product.brand?.name}</p>
                  <h3 className="text-white font-medium line-clamp-2 mb-2 group-hover:text-purple-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white">
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                    {product.salePrice && product.salePrice < product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {[...Array(Math.max(0, recommendations.length - itemsPerView + 1))].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === idx ? 'bg-purple-500 w-4' : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
