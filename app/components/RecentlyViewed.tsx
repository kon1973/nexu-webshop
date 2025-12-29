'use client'

import { useRecentlyViewed } from '@/context/RecentlyViewedContext'
import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@prisma/client'

export default function RecentlyViewed() {
  const { viewedIds } = useRecentlyViewed()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (viewedIds.length === 0) {
      setLoading(false)
      return
    }

    // Fetch products based on IDs
    // Since we don't have a bulk fetch API for IDs easily accessible from client without server action or new API,
    // we can create a simple server action or API.
    // For now, let's assume we fetch them via a new API endpoint /api/products/batch
    
    fetch('/api/products/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: viewedIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort by order in viewedIds
          const sorted = data.sort((a, b) => viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id))
          setProducts(sorted)
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
