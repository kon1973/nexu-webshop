'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLoyaltyTier, getNextLoyaltyTier } from '@/lib/loyalty'

// Server action: Get user addresses
export async function getUserAddresses() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc' }
  })

  return addresses
}

// Server action: Get user loyalty status
export async function getUserLoyalty() {
  const session = await auth()
  if (!session?.user?.id) {
    return { discountPercentage: 0, tierName: '' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalSpent: true }
  })

  if (!user) {
    return { discountPercentage: 0, tierName: '' }
  }

  const tier = getLoyaltyTier(user.totalSpent)
  const nextTier = getNextLoyaltyTier(user.totalSpent)
  
  return {
    discountPercentage: tier.discount,
    tierName: tier.name,
    totalSpending: user.totalSpent,
    nextTier: nextTier ? {
      name: nextTier.name,
      minSpent: nextTier.minSpent,
      remaining: nextTier.minSpent - user.totalSpent
    } : null
  }
}

// Server action: Validate cart items (check stock & prices)
export async function validateCartItems(items: { id: number; variantId?: string; quantity: number }[]) {
  if (!items || items.length === 0) {
    return { valid: true, errors: [] }
  }

  const errors: string[] = []
  const productIds = items.map(item => item.id)
  const variantIds = items.filter(item => item.variantId).map(item => item.variantId!)

  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true, price: true, salePrice: true, isArchived: true }
    }),
    variantIds.length > 0 
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, stock: true, price: true }
        })
      : Promise.resolve([])
  ])

  const productMap = new Map(products.map(p => [p.id, p]))
  const variantMap = new Map(variants.map(v => [v.id, v]))

  for (const item of items) {
    const product = productMap.get(item.id)
    
    if (!product) {
      errors.push(`A "${item.id}" termék nem található.`)
      continue
    }

    if (product.isArchived) {
      errors.push(`A "${product.name}" termék már nem elérhető.`)
      continue
    }

    if (item.variantId) {
      const variant = variantMap.get(item.variantId)
      if (!variant) {
        errors.push(`A "${product.name}" variáns nem található.`)
        continue
      }
      if (variant.stock !== null && variant.stock < item.quantity) {
        errors.push(`A "${product.name}" variánsból csak ${variant.stock} db van készleten.`)
      }
    } else {
      if (product.stock < item.quantity) {
        errors.push(`A "${product.name}" termékből csak ${product.stock} db van készleten.`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
