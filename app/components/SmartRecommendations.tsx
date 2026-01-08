'use client'

import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@prisma/client'
import { useCart } from '@/context/CartContext'
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react'
import { getRecommendations } from '@/lib/actions/user-actions'

interface SmartRecommendationsProps {
  currentProductId?: number
  currentCategory?: string
  maxItems?: number
}

type ProductWithExtras = Product & { 
  variants?: { id: string }[]
  _count?: { reviews: number }
}

export default function SmartRecommendations({ 
  currentProductId, 
  currentCategory,
  maxItems = 4 
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ProductWithExtras[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [recommendationType, setRecommendationType] = useState<'personalized' | 'trending'>('trending')
  const { cart } = useCart()

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true)
      
      try {
        const result = await getRecommendations({
          productId: currentProductId,
          category: currentCategory,
          limit: maxItems
        })
        
        if (result.success && result.products) {
          setRecommendations(result.products as ProductWithExtras[])
          setRecommendationType(currentProductId ? 'personalized' : 'trending')
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        setRecommendations([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentProductId, currentCategory, maxItems, cart.length])

  if (isLoading) {
    return (
      <div className="mt-16 pt-12 border-t border-white/10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) return null

  return (
    <div className="mt-16 pt-12 border-t border-white/10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {recommendationType === 'personalized' ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {recommendationType === 'personalized' ? 'Neked ajánljuk' : 'Népszerű termékek'}
            </h2>
            <p className="text-sm text-gray-500">
              {recommendationType === 'personalized' 
                ? 'A böngészési előzményeid alapján' 
                : 'Legtöbbet vásárolt termékek'}
            </p>
          </div>
        </div>
        <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full">
          {recommendations.length} termék
        </span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
