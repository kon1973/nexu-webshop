'use client'

import { useRecentlyViewed } from '@/context/RecentlyViewedContext'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@prisma/client'
import { getProductsByIds } from '@/lib/actions/user-actions'

export default function RecentlyViewed() {
  const { viewedIds } = useRecentlyViewed()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (viewedIds.length === 0) {
      setLoading(false)
      return
    }

    // Fetch products based on IDs using server action
    getProductsByIds(viewedIds)
      .then((result) => {
        if (result.success && Array.isArray(result.products)) {
          setProducts(result.products as Product[])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [viewedIds])

  if (loading || products.length === 0) return null

  return (
    <div className="mt-20 pt-12 border-t border-white/10">
      <h2 className="text-2xl font-bold mb-8">Legutóbb megtekintett termékek</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
