import { prisma } from '@/lib/prisma'
import 'server-only'

export async function getRelatedProductsService(productId: number, limit: number = 4) {
  // 1. Find orders that contain this product
  // We limit to recent orders (e.g., last 6 months) or last N orders to keep it fast
  const ordersWithProduct = await prisma.orderItem.findMany({
    where: {
      productId: productId,
      order: {
        status: { in: ['paid', 'completed', 'shipped', 'delivered'] }
      }
    },
    select: { orderId: true },
    orderBy: { order: { createdAt: 'desc' } },
    take: 100 // Analyze last 100 orders with this product
  })

  const orderIds = ordersWithProduct.map(o => o.orderId)

  if (orderIds.length === 0) {
    return getFallbackRelatedProducts(productId, limit)
  }

  // 2. Find other products in these orders
  const coOccurringProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      orderId: { in: orderIds },
      productId: { not: productId },
      product: { isArchived: false } // Ensure product is active
    },
    _count: {
      productId: true
    },
    orderBy: {
      _count: {
        productId: 'desc'
      }
    },
    take: limit
  })

  // 3. If we found enough co-occurring products, fetch their details
  if (coOccurringProducts.length > 0) {
    const productIds = coOccurringProducts
      .map(p => p.productId)
      .filter((id): id is number => id !== null)

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: {
          select: { id: true }
        }
      }
    })

    // Sort them back in the order of frequency (prisma findMany doesn't guarantee order)
    const sortedProducts = productIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)

    // If we have enough, return them
    if (sortedProducts.length >= limit) {
      return sortedProducts
    }

    // If not enough, fill with fallback
    const fallbackLimit = limit - sortedProducts.length
    const fallbackProducts = await getFallbackRelatedProducts(productId, fallbackLimit, productIds)
    return [...sortedProducts, ...fallbackProducts]
  }

  return getFallbackRelatedProducts(productId, limit)
}

async function getFallbackRelatedProducts(productId: number, limit: number, excludeIds: number[] = []) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { category: true }
  })

  if (!product) return []

  return prisma.product.findMany({
    where: {
      category: product.category,
      isArchived: false,
      id: { notIn: [productId, ...excludeIds] }
    },
    take: limit,
    include: {
      variants: {
        select: { id: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}
