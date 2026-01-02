'use server'

import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

interface FavoriteItem {
  id: number | string
  name?: string
  category?: string
}

// Get personalized recommendations based on favorites
export async function getRecommendationsForFavorites(favorites: FavoriteItem[]) {
  if (!favorites.length) {
    return { success: true, products: [] }
  }

  try {
    // Get categories from favorites
    const categories = [...new Set(favorites.map(f => f.category).filter(Boolean))]
    const favoriteIds = favorites.map(f => typeof f.id === 'string' ? parseInt(f.id, 10) : f.id)

    // Find similar products
    const recommendations = await prisma.product.findMany({
      where: {
        AND: [
          { id: { notIn: favoriteIds } },
          { stock: { gt: 0 } },
          categories.length > 0 ? { category: { in: categories as string[] } } : {}
        ]
      },
      orderBy: [
        { rating: 'desc' }
      ],
      take: 8
    })

    return { success: true, products: recommendations }
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return { success: false, products: [] }
  }
}

// Check stock availability for favorites
export async function checkFavoritesStock(productIds: (string | number)[]) {
  if (!productIds.length) {
    return { success: true, stockInfo: {} }
  }

  try {
    const numericIds = productIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id)
    
    const products = await prisma.product.findMany({
      where: { id: { in: numericIds } },
      select: {
        id: true,
        stock: true,
        name: true,
        price: true,
        salePrice: true,
        image: true
      }
    })

    const stockInfo: Record<string, { stock: number; inStock: boolean; lowStock: boolean }> = {}
    
    products.forEach(product => {
      stockInfo[product.id] = {
        stock: product.stock,
        inStock: product.stock > 0,
        lowStock: product.stock > 0 && product.stock <= 5
      }
    })

    return { success: true, stockInfo }
  } catch (error) {
    console.error('Error checking favorites stock:', error)
    return { success: false, stockInfo: {} }
  }
}

// Get price drops for favorites (products where salePrice exists - meaning on sale)
export async function checkPriceDrops(productIds: (string | number)[]) {
  if (!productIds.length) {
    return { success: true, priceDrops: [] }
  }

  try {
    const numericIds = productIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id)
    
    const products = await prisma.product.findMany({
      where: {
        id: { in: numericIds },
        salePrice: { not: null }
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        image: true
      }
    })

    const priceDrops = products.filter(p => 
      p.salePrice && p.salePrice < p.price
    ).map(p => ({
      id: p.id,
      name: p.name,
      price: p.salePrice!,
      originalPrice: p.price,
      discount: Math.round(((p.price - p.salePrice!) / p.price) * 100),
      image: p.image
    }))

    return { success: true, priceDrops }
  } catch (error) {
    console.error('Error checking price drops:', error)
    return { success: false, priceDrops: [] }
  }
}

// Get popular categories from all favorites
const getCachedPopularCategories = unstable_cache(
  async () => {
    const products = await prisma.product.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 5
    })

    return products.map(p => ({
      name: p.category,
      count: p._count.category
    }))
  },
  ['popular-categories'],
  { revalidate: 3600 }
)

export async function getPopularCategories() {
  try {
    const categories = await getCachedPopularCategories()
    return { success: true, categories }
  } catch (error) {
    return { success: false, categories: [] }
  }
}
