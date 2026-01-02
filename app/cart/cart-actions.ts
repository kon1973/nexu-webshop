'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export type CartProductInfo = {
  id: number
  name: string
  price: number
  salePrice: number | null
  stock: number
  image: string
  category: string
  available: boolean
}

// Get fresh product data for cart items
export async function getCartProductsInfo(productIds: number[]): Promise<CartProductInfo[]> {
  if (productIds.length === 0) return []

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isArchived: false
    },
    select: {
      id: true,
      name: true,
      price: true,
      salePrice: true,
      stock: true,
      image: true,
      category: true
    }
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.salePrice ?? p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    image: p.image,
    category: p.category,
    available: p.stock > 0
  }))
}

// Get recommended products based on cart contents
export async function getCartRecommendations(cartProductIds: number[], limit = 4) {
  if (cartProductIds.length === 0) {
    // If cart is empty, return popular products
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        image: true,
        rating: true,
        category: true
      },
      orderBy: { rating: 'desc' },
      take: limit
    })

    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.salePrice ?? p.price,
      originalPrice: p.salePrice ? p.price : null,
      image: p.image,
      rating: p.rating,
      category: p.category
    }))
  }

  // Get categories of cart products
  const cartProducts = await prisma.product.findMany({
    where: { id: { in: cartProductIds } },
    select: { category: true }
  })

  const categories = [...new Set(cartProducts.map(p => p.category))]

  // Get products from same categories that are not in cart
  const recommendations = await prisma.product.findMany({
    where: {
      category: { in: categories },
      id: { notIn: cartProductIds },
      isArchived: false,
      stock: { gt: 0 }
    },
    select: {
      id: true,
      name: true,
      price: true,
      salePrice: true,
      image: true,
      rating: true,
      category: true
    },
    orderBy: { rating: 'desc' },
    take: limit
  })

  return recommendations.map(p => ({
    id: p.id,
    name: p.name,
    price: p.salePrice ?? p.price,
    originalPrice: p.salePrice ? p.price : null,
    image: p.image,
    rating: p.rating,
    category: p.category
  }))
}

// Get user's loyalty info based on totalSpent
export async function getUserLoyaltyInfo() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      totalSpent: true
    }
  })

  if (!user) return null

  // Calculate tier based on totalSpent
  const tiers = [
    { name: 'Bronze', minSpending: 0, discount: 0 },
    { name: 'Silver', minSpending: 50000, discount: 0.03 },
    { name: 'Gold', minSpending: 150000, discount: 0.05 },
    { name: 'Platinum', minSpending: 300000, discount: 0.08 },
    { name: 'Diamond', minSpending: 500000, discount: 0.10 }
  ]

  // Find current tier based on totalSpent
  let currentTier = tiers[0]
  for (const tier of tiers) {
    if (user.totalSpent >= tier.minSpending) {
      currentTier = tier
    }
  }
  
  const nextTier = tiers[tiers.indexOf(currentTier) + 1]

  return {
    tier: currentTier.name,
    discountPercentage: currentTier.discount,
    totalSpending: user.totalSpent,
    nextTier: nextTier ? {
      name: nextTier.name,
      requiredSpending: nextTier.minSpending,
      discount: nextTier.discount
    } : null
  }
}

// Check stock availability before checkout
export async function checkStockAvailability(items: Array<{ productId: number; quantity: number }>) {
  const productIds = items.map(i => i.productId)
  
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, stock: true, name: true }
  })

  const unavailable: Array<{ id: number; name: string; requested: number; available: number }> = []

  for (const item of items) {
    const product = products.find(p => p.id === item.productId)
    if (!product || product.stock < item.quantity) {
      unavailable.push({
        id: item.productId,
        name: product?.name || 'Unknown',
        requested: item.quantity,
        available: product?.stock || 0
      })
    }
  }

  return {
    allAvailable: unavailable.length === 0,
    unavailable
  }
}
