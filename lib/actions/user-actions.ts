'use server'

import 'server-only'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ============================================================================
// AUTH HELPERS
// ============================================================================

async function getSession() {
  const session = await auth()
  return session
}

async function requireAuth() {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('Nem vagy bejelentkezve')
  }
  return session.user
}

// ============================================================================
// NEWSLETTER ACTIONS
// ============================================================================

export async function subscribeToNewsletter(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Érvénytelen email cím' }
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existing) {
      if (!existing.isActive) {
        // Re-subscribe
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true }
        })
        return { success: true, message: 'Újra feliratkoztál!' }
      }
      return { success: false, error: 'Ez az email már feliratkozott' }
    }

    await prisma.newsletterSubscriber.create({
      data: { email }
    })

    return { success: true, message: 'Sikeres feliratkozás!' }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return { success: false, error: 'Hiba történt a feliratkozás során' }
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    if (!email) {
      return { success: false, error: 'Hiányzó email cím' }
    }

    const subscription = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (!subscription) {
      return { success: false, error: 'Ez az email nincs feliratkozva' }
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false }
    })

    return { success: true, message: 'Sikeres leiratkozás' }
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return { success: false, error: 'Hiba történt a leiratkozás során' }
  }
}

// ============================================================================
// REVIEW ACTIONS
// ============================================================================

export async function submitReview(data: {
  productId: number
  rating: number
  comment: string
  userName?: string
}) {
  try {
    const user = await requireAuth()

    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: 'Érvénytelen értékelés' }
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: data.productId,
        userId: user.id
      }
    })

    if (existingReview) {
      return { success: false, error: 'Már értékelted ezt a terméket' }
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: user.id,
        rating: data.rating,
        text: data.comment,
        userName: data.userName || user.name || 'Névtelen',
        status: 'pending'
      }
    })

    revalidatePath(`/shop/${data.productId}`)

    return { success: true, review }
  } catch (error) {
    console.error('Submit review error:', error)
    if (error instanceof Error && error.message === 'Nem vagy bejelentkezve') {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Hiba történt az értékelés mentésekor' }
  }
}

// ============================================================================
// FAVORITES ACTIONS
// ============================================================================

export async function getFavorites() {
  try {
    const user = await requireAuth()

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        product: true
      }
    })

    return { success: true, favorites: favorites.map(f => f.product) }
  } catch (error) {
    console.error('Get favorites error:', error)
    return { success: true, favorites: [] }
  }
}

export async function addToFavorites(productId: number) {
  try {
    const user = await requireAuth()

    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        productId
      }
    })

    if (existing) {
      return { success: true, message: 'Már a kedvencek között van' }
    }

    await prisma.favorite.create({
      data: {
        userId: user.id,
        productId
      }
    })

    revalidatePath('/favorites')

    return { success: true, message: 'Hozzáadva a kedvencekhez' }
  } catch (error) {
    console.error('Add to favorites error:', error)
    if (error instanceof Error && error.message === 'Nem vagy bejelentkezve') {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Hiba történt' }
  }
}

export async function removeFromFavorites(productId: number) {
  try {
    const user = await requireAuth()

    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        productId
      }
    })

    revalidatePath('/favorites')

    return { success: true, message: 'Eltávolítva a kedvencekből' }
  } catch (error) {
    console.error('Remove from favorites error:', error)
    if (error instanceof Error && error.message === 'Nem vagy bejelentkezve') {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Hiba történt' }
  }
}

export async function syncFavorites(productIds: number[]) {
  try {
    const user = await requireAuth()

    // Get current favorites
    const currentFavorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { productId: true }
    })

    const currentIds = currentFavorites.map(f => f.productId)

    // Add missing
    const toAdd = productIds.filter(id => !currentIds.includes(id))
    if (toAdd.length > 0) {
      await prisma.favorite.createMany({
        data: toAdd.map(productId => ({
          userId: user.id,
          productId
        })),
        skipDuplicates: true
      })
    }

    // Return all favorites
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: { product: true }
    })

    return { success: true, favorites: favorites.map(f => f.product) }
  } catch (error) {
    console.error('Sync favorites error:', error)
    return { success: true, favorites: [] }
  }
}

// ============================================================================
// COUPON ACTIONS
// ============================================================================

export async function validateCoupon(code: string, cartTotal: number) {
  try {
    if (!code) {
      return { valid: false, error: 'Hiányzó kuponkód' }
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return { valid: false, error: 'Érvénytelen kuponkód' }
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Ez a kupon már nem aktív' }
    }

    const now = new Date()
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { valid: false, error: 'Ez a kupon lejárt' }
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Ez a kupon elérte a használati limitet' }
    }

    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return { 
        valid: false, 
        error: `Minimum rendelési érték: ${coupon.minOrderValue.toLocaleString('hu-HU')} Ft` 
      }
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round(cartTotal * (coupon.discountValue / 100))
    } else {
      discount = coupon.discountValue
    }

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount
    }
  } catch (error) {
    console.error('Validate coupon error:', error)
    return { valid: false, error: 'Hiba történt a kupon ellenőrzésekor' }
  }
}

// ============================================================================
// ORDER ACTIONS
// ============================================================================

export async function cancelOrder(orderId: string) {
  try {
    const user = await requireAuth()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      return { success: false, error: 'Rendelés nem található' }
    }

    if (order.userId !== user.id) {
      return { success: false, error: 'Nincs jogosultságod ehhez a rendeléshez' }
    }

    if (!['PENDING', 'PROCESSING'].includes(order.status)) {
      return { success: false, error: 'Ez a rendelés már nem mondható le' }
    }

    // Restore stock
    for (const item of order.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } }
        })
      } else if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    })

    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return { success: true, message: 'Rendelés lemondva' }
  } catch (error) {
    console.error('Cancel order error:', error)
    if (error instanceof Error && error.message === 'Nem vagy bejelentkezve') {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Hiba történt a lemondás során' }
  }
}

// ============================================================================
// PRODUCT ACTIONS
// ============================================================================

export async function getProductsByIds(ids: number[]) {
  try {
    if (!ids.length) {
      return { success: true, products: [] }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } }
    })

    // Maintain order
    const productMap = new Map(products.map(p => [p.id, p]))
    const orderedProducts = ids
      .map(id => productMap.get(id))
      .filter(Boolean)

    return { success: true, products: orderedProducts }
  } catch (error) {
    console.error('Get products by ids error:', error)
    return { success: true, products: [] }
  }
}

export async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      where: { 
        isVisible: true,
        products: { some: { isArchived: false } } 
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, brands }
  } catch (error) {
    console.error('Get brands error:', error)
    return { success: true, brands: [] }
  }
}

// ============================================================================
// RECOMMENDATIONS ACTION
// ============================================================================

export async function getRecommendations(params: {
  productId?: number
  category?: string
  limit?: number
}) {
  try {
    const { productId, category, limit = 8 } = params
    
    let recommendations: Awaited<ReturnType<typeof prisma.product.findMany>> = []

    if (productId) {
      // Get similar products
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { category: true, brandId: true, price: true }
      })

      if (product) {
        recommendations = await prisma.product.findMany({
          where: {
            id: { not: productId },
            isArchived: false,
            OR: [
              { category: product.category },
              { brandId: product.brandId },
              { 
                price: { 
                  gte: Math.floor(product.price * 0.7), 
                  lte: Math.ceil(product.price * 1.3)
                } 
              }
            ]
          },
          take: limit,
          orderBy: { createdAt: 'desc' }
        })
      }
    } else if (category) {
      // Get category products
      recommendations = await prisma.product.findMany({
        where: {
          category,
          isArchived: false
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Get popular products
      recommendations = await prisma.product.findMany({
        where: { isArchived: false },
        take: limit,
        orderBy: [
          { rating: 'desc' },
          { createdAt: 'desc' }
        ]
      })
    }

    return { success: true, products: recommendations }
  } catch (error) {
    console.error('Get recommendations error:', error)
    return { success: true, products: [] }
  }
}
