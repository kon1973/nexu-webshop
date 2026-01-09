'use server'

import 'server-only'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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

// ============================================================================
// AI-POWERED USER FEATURES
// ============================================================================

/**
 * Személyre szabott termékajánlások AI-val
 * A felhasználó böngészési előzményei és vásárlásai alapján
 */
export async function getPersonalizedRecommendations(params?: {
  recentlyViewedIds?: number[]
  cartIds?: number[]
  favoriteIds?: number[]
  limit?: number
}) {
  try {
    const limit = params?.limit || 8
    const session = await getSession()
    const userId = session?.user?.id

    // Collect user behavior data
    let purchasedCategories: string[] = []
    let purchasedBrands: string[] = []
    let avgPriceRange = { min: 0, max: 500000 }

    if (userId) {
      // Get user's purchase history
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: { category: true, brandId: true, price: true }
              }
            }
          }
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })

      const purchasedProducts = orders.flatMap(o => o.items.map(i => i.product))
      purchasedCategories = [...new Set(purchasedProducts.map(p => p?.category).filter((c): c is string => c !== null && c !== undefined))]
      purchasedBrands = [...new Set(purchasedProducts.map(p => p?.brandId).filter((b): b is string => b !== null && b !== undefined))]
      
      const prices = purchasedProducts.map(p => p?.price || 0).filter(p => p > 0)
      if (prices.length > 0) {
        avgPriceRange = {
          min: Math.floor(Math.min(...prices) * 0.5),
          max: Math.ceil(Math.max(...prices) * 1.5)
        }
      }
    }

    // Get viewed categories from recently viewed
    let viewedCategories: string[] = []
    if (params?.recentlyViewedIds?.length) {
      const viewedProducts = await prisma.product.findMany({
        where: { id: { in: params.recentlyViewedIds } },
        select: { category: true, brandId: true }
      })
      viewedCategories = [...new Set(viewedProducts.map(p => p.category).filter((c): c is string => c !== null && c !== undefined))]
    }

    // Combine interests
    const allCategories = [...new Set([...purchasedCategories, ...viewedCategories])]
    const excludeIds = [
      ...(params?.recentlyViewedIds || []),
      ...(params?.cartIds || [])
    ]

    // Build smart query
    const whereConditions: any = {
      isArchived: false,
      stock: { gt: 0 }
    }

    if (excludeIds.length > 0) {
      whereConditions.id = { notIn: excludeIds }
    }

    if (allCategories.length > 0 || purchasedBrands.length > 0) {
      whereConditions.OR = []
      if (allCategories.length > 0) {
        whereConditions.OR.push({ category: { in: allCategories } })
      }
      if (purchasedBrands.length > 0) {
        whereConditions.OR.push({ brandId: { in: purchasedBrands } })
      }
      whereConditions.OR.push({
        price: { gte: avgPriceRange.min, lte: avgPriceRange.max }
      })
    }

    const recommendations = await prisma.product.findMany({
      where: whereConditions,
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        brand: { select: { name: true } }
      }
    })

    // If not enough, add popular products
    if (recommendations.length < limit) {
      const moreProducts = await prisma.product.findMany({
        where: {
          isArchived: false,
          stock: { gt: 0 },
          id: { notIn: [...excludeIds, ...recommendations.map(r => r.id)] }
        },
        take: limit - recommendations.length,
        orderBy: { rating: 'desc' },
        include: {
          brand: { select: { name: true } }
        }
      })
      recommendations.push(...moreProducts)
    }

    return {
      success: true,
      products: recommendations,
      personalized: allCategories.length > 0 || purchasedBrands.length > 0
    }
  } catch (error) {
    console.error('Personalized recommendations error:', error)
    return { success: true, products: [], personalized: false }
  }
}

/**
 * AI-alapú természetes nyelvű termékkeresés
 */
export async function searchWithAI(query: string) {
  try {
    if (!query || query.length < 2) {
      return { success: false, error: 'Túl rövid keresés' }
    }

    // First, let AI understand the query intent
    const intentResponse = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy e-commerce kereső AI vagy. Elemezd a felhasználó keresését és válaszolj JSON formátumban:
{
  "intent": "product_search" | "category_browse" | "price_filter" | "feature_search",
  "keywords": ["kulcsszó1", "kulcsszó2"],
  "category": "kategória ha releváns" | null,
  "priceRange": { "min": szám | null, "max": szám | null },
  "features": ["feature1", "feature2"],
  "sortPreference": "price_asc" | "price_desc" | "rating" | "newest" | null
}

Példák:
- "olcsó telefon 100 ezer alatt" -> priceRange: {min: null, max: 100000}, category: "telefon"
- "legjobb laptop gamernek" -> features: ["gaming"], category: "laptop", sortPreference: "rating"
- "iPhone 15" -> keywords: ["iPhone", "15"], category: "telefon"`
        },
        {
          role: 'user',
          content: query
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
      temperature: 0.3
    })

    let searchParams: any = {}
    try {
      searchParams = JSON.parse(intentResponse.choices[0]?.message?.content || '{}')
    } catch {
      searchParams = { keywords: [query] }
    }

    // Build database query
    const whereConditions: any = {
      isArchived: false
    }

    // Keyword search
    const searchTerms = [...(searchParams.keywords || []), query]
    whereConditions.OR = searchTerms.flatMap(term => [
      { name: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { fullDescription: { contains: term, mode: 'insensitive' } }
    ])

    // Category filter
    if (searchParams.category) {
      whereConditions.category = { contains: searchParams.category, mode: 'insensitive' }
    }

    // Price filter
    if (searchParams.priceRange?.min || searchParams.priceRange?.max) {
      whereConditions.price = {}
      if (searchParams.priceRange.min) whereConditions.price.gte = searchParams.priceRange.min
      if (searchParams.priceRange.max) whereConditions.price.lte = searchParams.priceRange.max
    }

    // Sort
    let orderBy: any = { rating: 'desc' }
    if (searchParams.sortPreference === 'price_asc') orderBy = { price: 'asc' }
    else if (searchParams.sortPreference === 'price_desc') orderBy = { price: 'desc' }
    else if (searchParams.sortPreference === 'newest') orderBy = { createdAt: 'desc' }

    const products = await prisma.product.findMany({
      where: whereConditions,
      take: 20,
      orderBy,
      include: {
        brand: { select: { name: true } }
      }
    })

    // Generate AI summary of results
    let aiSummary = null
    if (products.length > 0) {
      const summaryResponse = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'Készíts egy rövid, barátságos összefoglalót a keresési eredményekről magyarul (max 2 mondat). Említsd meg az árakat és ha van akciós termék.'
          },
          {
            role: 'user',
            content: `Keresés: "${query}"\nTalált termékek: ${products.slice(0, 5).map(p => 
              `${p.name} (${p.salePrice || p.price} Ft${p.salePrice ? ' akciós' : ''})`
            ).join(', ')}`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
      aiSummary = summaryResponse.choices[0]?.message?.content
    }

    return {
      success: true,
      products,
      intent: searchParams.intent,
      aiSummary,
      appliedFilters: {
        category: searchParams.category,
        priceRange: searchParams.priceRange,
        sortBy: searchParams.sortPreference
      }
    }
  } catch (error) {
    console.error('AI search error:', error)
    // Fallback to simple search
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 20,
      orderBy: { rating: 'desc' }
    })
    return { success: true, products, aiSummary: null }
  }
}

/**
 * AI-alapú termék-összehasonlító
 */
export async function compareProductsWithAI(productIds: number[]) {
  try {
    if (productIds.length < 2 || productIds.length > 4) {
      return { success: false, error: '2-4 terméket lehet összehasonlítani' }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        brand: true,
        reviews: { 
          where: { status: 'approved' },
          take: 10, 
          orderBy: { createdAt: 'desc' } 
        }
      }
    })

    if (products.length < 2) {
      return { success: false, error: 'Nem található elég termék' }
    }

    // Prepare detailed data for AI
    const productData = products.map(p => {
      const specs = p.specifications as Array<{ key: string; value: string }> | null
      return {
        id: p.id,
        name: p.name,
        brand: p.brand?.name || 'Ismeretlen',
        price: p.salePrice || p.price,
        originalPrice: p.salePrice ? p.price : null,
        discount: p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0,
        category: p.category,
        rating: p.rating,
        reviewCount: p.reviews.length,
        avgReviewSentiment: p.reviews.length > 0 
          ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length).toFixed(1)
          : 'N/A',
        specifications: specs?.slice(0, 15).map(s => `${s.key}: ${s.value}`).join(', ') || 'Nincs specifikáció',
        stock: p.stock,
        inStock: p.stock > 0,
        description: p.description?.substring(0, 200) || ''
      }
    })

    const comparison = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy e-commerce termék-összehasonlító szakértő vagy. Részletesen elemezd és hasonlítsd össze a termékeket magyarul.

FONTOS: A válaszban a "winner" és minden "productId" mezőben a termék SZÁMSZERŰ ID-ját add meg (number típusként), NEM a nevét!

Válaszolj PONTOSAN ebben a JSON formátumban:
{
  "winner": {
    "productId": <termék_id_szám>,
    "reason": "Részletes indoklás, miért ez a legjobb választás (2-3 mondat)"
  },
  "categories": [
    {
      "name": "Ár-érték arány",
      "winner": <győztes_termék_id vagy null ha döntetlen>,
      "explanation": "Rövid magyarázat"
    },
    {
      "name": "Teljesítmény/Minőség",
      "winner": <győztes_termék_id vagy null>,
      "explanation": "Rövid magyarázat"
    },
    {
      "name": "Vásárlói elégedettség",
      "winner": <győztes_termék_id vagy null>,
      "explanation": "Rövid magyarázat"
    },
    {
      "name": "Funkciók/Felszereltség",
      "winner": <győztes_termék_id vagy null>,
      "explanation": "Rövid magyarázat"
    }
  ],
  "prosAndCons": [
    {
      "productId": <termék_id>,
      "pros": ["Előny 1", "Előny 2", "Előny 3"],
      "cons": ["Hátrány 1", "Hátrány 2"]
    }
  ],
  "recommendation": "Általános vásárlási javaslat (2-3 mondat)",
  "forWhom": [
    {
      "productId": <termék_id>,
      "bestFor": ["Célcsoport 1", "Célcsoport 2"]
    }
  ],
  "quickVerdict": "Egyetlen mondatos összefoglaló, melyik a legjobb és miért"
}`
        },
        {
          role: 'user',
          content: `Hasonlítsd össze részletesen ezeket a termékeket:\n\n${productData.map(p => 
            `ID: ${p.id}\nNév: ${p.name}\nMárka: ${p.brand}\nÁr: ${p.price} Ft${p.discount > 0 ? ` (-${p.discount}%)` : ''}\nKategória: ${p.category}\nÉrtékelés: ${p.rating}/5 (${p.reviewCount} vélemény)\nKészlet: ${p.inStock ? 'Raktáron' : 'Nincs készleten'}\nSpecifikációk: ${p.specifications}\nLeírás: ${p.description}`
          ).join('\n\n---\n\n')}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
      temperature: 0.7
    })

    let aiComparison = null
    try {
      aiComparison = JSON.parse(comparison.choices[0]?.message?.content || '{}')
    } catch {
      return { success: false, error: 'Az AI válasz feldolgozása sikertelen' }
    }

    return {
      success: true,
      comparison: aiComparison,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.salePrice || p.price,
        originalPrice: p.salePrice ? p.price : null,
        image: p.image,
        brand: p.brand?.name,
        category: p.category,
        rating: p.rating,
        stock: p.stock
      }))
    }
  } catch (error) {
    console.error('Compare products error:', error)
    return { success: false, error: 'Hiba az összehasonlítás során' }
  }
}

// ============================================================================
// AI PURCHASE DECISION HELPER - Vásárlási döntés segítő
// ============================================================================

export async function getAIPurchaseAdvice(productIds: number[], userContext?: {
  budget?: number
  priorities?: string[]
  useCase?: string
}) {
  try {
    if (productIds.length === 0) {
      return { success: false, error: 'Nincs termék megadva' }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        brand: true,
        reviews: {
          where: { status: 'approved' },
          take: 5
        }
      }
    })

    if (products.length === 0) {
      return { success: false, error: 'Termékek nem találhatók' }
    }

    const productSummary = products.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand?.name,
      price: p.salePrice || p.price,
      rating: p.rating,
      inStock: p.stock > 0,
      category: p.category
    }))

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy személyes vásárlási tanácsadó vagy. A felhasználó preferenciái alapján adj személyre szabott tanácsot magyarul.

Válaszolj JSON formátumban:
{
  "topPick": {
    "productId": <ajánlott_termék_id>,
    "confidence": 0-100,
    "reasoning": "Részletes indoklás"
  },
  "alternatives": [
    {
      "productId": <másik_termék_id>,
      "scenario": "Mikor válaszd ezt helyette"
    }
  ],
  "warnings": ["Figyelmeztető megjegyzések, ha vannak"],
  "tips": ["Hasznos vásárlási tippek"],
  "verdict": "Végleges ajánlás 1-2 mondatban"
}`
        },
        {
          role: 'user',
          content: `Termékek: ${JSON.stringify(productSummary)}
          
${userContext?.budget ? `Budget: ${userContext.budget} Ft` : ''}
${userContext?.priorities?.length ? `Prioritások: ${userContext.priorities.join(', ')}` : ''}
${userContext?.useCase ? `Felhasználás: ${userContext.useCase}` : ''}

Adj személyre szabott vásárlási tanácsot!`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
      temperature: 0.7
    })

    let advice = null
    try {
      advice = JSON.parse(response.choices[0]?.message?.content || '{}')
    } catch {
      return { success: false, error: 'Az AI válasz feldolgozása sikertelen' }
    }

    return {
      success: true,
      advice,
      products: productSummary
    }
  } catch (error) {
    console.error('Purchase advice error:', error)
    return { success: false, error: 'Hiba a tanács generálásakor' }
  }
}

/**
 * AI Shopping Assistant - válaszol vásárlási kérdésekre
 */
export async function askShoppingAssistant(question: string, context?: {
  currentProduct?: number
  cartProducts?: number[]
  category?: string
}) {
  try {
    if (!question || question.length < 3) {
      return { success: false, error: 'Túl rövid kérdés' }
    }

    // Gather context
    let contextData: any = {}
    
    if (context?.currentProduct) {
      const product = await prisma.product.findUnique({
        where: { id: context.currentProduct },
        include: { brand: true, reviews: { take: 3 } }
      })
      if (product) {
        contextData.currentProduct = {
          name: product.name,
          price: product.salePrice || product.price,
          category: product.category,
          rating: product.rating,
          stock: product.stock,
          specifications: product.specifications
        }
      }
    }

    if (context?.cartProducts?.length) {
      const cartItems = await prisma.product.findMany({
        where: { id: { in: context.cartProducts } },
        select: { name: true, price: true, salePrice: true, category: true }
      })
      contextData.cartItems = cartItems
      contextData.cartTotal = cartItems.reduce((sum, p) => sum + (p.salePrice || p.price), 0)
    }

    // Get store info
    const storeInfo = {
      name: 'NEXU Webshop',
      shipping: 'Ingyenes szállítás 30.000 Ft felett, egyébként 1.490 Ft',
      returns: '14 napos visszaküldési jog',
      warranty: 'Minden termékre gyártói garancia',
      payment: 'Bankkártya, utánvét, átutalás'
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `Te a NEXU Webshop vásárlási asszisztense vagy. Segítesz a vásárlóknak kérdéseikben magyarul, barátságosan.

Bolt információk:
${JSON.stringify(storeInfo, null, 2)}

Kontextus:
${JSON.stringify(contextData, null, 2)}

Szabályok:
- Legyél segítőkész és barátságos
- Adj konkrét válaszokat
- Ha termékről van szó, említsd az árát
- Ha nem tudsz valamit, mondd el őszintén
- Max 3-4 mondat legyen a válasz`
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    const answer = response.choices[0]?.message?.content

    // Check if we should suggest products
    let suggestedProducts = null
    const keywords = ['ajánl', 'melyik', 'javasol', 'keres', 'milyen']
    if (keywords.some(k => question.toLowerCase().includes(k))) {
      const relatedProducts = await prisma.product.findMany({
        where: {
          isArchived: false,
          stock: { gt: 0 },
          ...(context?.category && { category: context.category })
        },
        take: 4,
        orderBy: { rating: 'desc' }
      })
      if (relatedProducts.length > 0) {
        suggestedProducts = relatedProducts
      }
    }

    return {
      success: true,
      answer,
      suggestedProducts
    }
  } catch (error) {
    console.error('Shopping assistant error:', error)
    return { success: false, error: 'Hiba történt a válasz generálásakor' }
  }
}

/**
 * AI Wishlist értesítő - ármozgás elemzés
 */
export async function analyzeWishlistPrices(favoriteProductIds: number[]) {
  try {
    if (!favoriteProductIds.length) {
      return { success: true, alerts: [], summary: null }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: favoriteProductIds } },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        stock: true,
        image: true
      }
    })

    const alerts = []
    
    for (const product of products) {
      // Price drop alert
      if (product.salePrice && product.salePrice < product.price) {
        const discount = Math.round((1 - product.salePrice / product.price) * 100)
        alerts.push({
          type: 'price_drop',
          productId: product.id,
          productName: product.name,
          image: product.image,
          message: `${discount}% kedvezmény!`,
          originalPrice: product.price,
          currentPrice: product.salePrice,
          priority: discount >= 20 ? 'high' : 'medium'
        })
      }

      // Low stock alert
      if (product.stock > 0 && product.stock <= 5) {
        alerts.push({
          type: 'low_stock',
          productId: product.id,
          productName: product.name,
          image: product.image,
          message: `Csak ${product.stock} db maradt!`,
          priority: product.stock <= 2 ? 'high' : 'medium'
        })
      }

      // Out of stock
      if (product.stock === 0) {
        alerts.push({
          type: 'out_of_stock',
          productId: product.id,
          productName: product.name,
          image: product.image,
          message: 'Elfogyott',
          priority: 'low'
        })
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    alerts.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])

    // Generate AI summary if there are alerts
    let summary = null
    if (alerts.length > 0) {
      const priceDrops = alerts.filter(a => a.type === 'price_drop')
      const lowStock = alerts.filter(a => a.type === 'low_stock')
      
      if (priceDrops.length > 0 || lowStock.length > 0) {
        summary = []
        if (priceDrops.length > 0) {
          summary.push(`🏷️ ${priceDrops.length} terméked most akcióban van!`)
        }
        if (lowStock.length > 0) {
          summary.push(`⚠️ ${lowStock.length} termék hamarosan elfogy.`)
        }
        summary = summary.join(' ')
      }
    }

    return {
      success: true,
      alerts,
      summary
    }
  } catch (error) {
    console.error('Wishlist analysis error:', error)
    return { success: true, alerts: [], summary: null }
  }
}

/**
 * AI termékértékelés segítő - segít értékelést írni
 */
export async function generateReviewHelper(productId: number, rating: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, category: true }
    })

    if (!product) {
      return { success: false, error: 'Termék nem található' }
    }

    const sentiment = rating >= 4 ? 'pozitív' : rating >= 3 ? 'semleges' : 'negatív'
    
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `Segíts a felhasználónak értékelést írni egy termékről. Adj 3 rövid javaslat pontot, hogy mit említhetne a ${sentiment} értékelésben. Legyél konkrét és releváns a termék kategóriájához.`
        },
        {
          role: 'user',
          content: `Termék: ${product.name}\nKategória: ${product.category}\nÉrtékelés: ${rating}/5 csillag`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })

    const suggestions = response.choices[0]?.message?.content

    return {
      success: true,
      suggestions,
      placeholders: rating >= 4 
        ? ['Mi tetszett a legjobban?', 'Kinek ajánlanád?', 'Mire használod?']
        : rating >= 3
        ? ['Mi volt jó benne?', 'Min lehetne javítani?', 'Megfelelt az elvárásoknak?']
        : ['Mi okozott csalódást?', 'Mit vártál volna?', 'Ajánlanád másnak?']
    }
  } catch (error) {
    console.error('Review helper error:', error)
    return { success: false, error: 'Hiba történt' }
  }
}

/**
 * AI Wishlist Analyzer - kompletes kedvencek elemzés
 * Személyre szabott ajánlások, áresés figyelés, csomagajánlatok
 */
export async function analyzeWishlist(productIds: number[]) {
  try {
    if (productIds.length < 2) {
      return { success: false, error: 'Legalább 2 termék szükséges az elemzéshez' }
    }

    // Fetch wishlist products with details
    const wishlistProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        salePercentage: true,
        category: true,
        brandId: true,
        brand: { select: { name: true } },
        image: true,
        slug: true,
        stock: true,
        specifications: true
      }
    })

    if (wishlistProducts.length === 0) {
      return { success: false, error: 'Nem találhatók a termékek' }
    }

    // Calculate insights
    const prices = wishlistProducts.map(p => p.salePrice || p.price)
    const totalValue = prices.reduce((a, b) => a + b, 0)
    const averagePrice = Math.round(totalValue / prices.length)
    
    // Group by category
    const categoryMap = new Map<string, number>()
    wishlistProducts.forEach(p => {
      const cat = p.category || 'Egyéb'
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
    })
    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))

    // Price range
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }

    // Check for price drops (compare salePrice to price - salePrice means it's on sale)
    const priceDropAlerts: Array<{
      productId: number
      productName: string
      currentPrice: number
      previousPrice: number
      percentageDrop: number
    }> = []
    
    wishlistProducts.forEach(product => {
      if (product.salePrice && product.salePrice < product.price) {
        const percentageDrop = Math.round((1 - product.salePrice / product.price) * 100)
        if (percentageDrop >= 5) {
          priceDropAlerts.push({
            productId: product.id,
            productName: product.name,
            currentPrice: product.salePrice,
            previousPrice: product.price,
            percentageDrop
          })
        }
      }
    })

    // Calculate potential savings
    let savingsOpportunity = 0
    priceDropAlerts.forEach(alert => {
      savingsOpportunity += alert.previousPrice - alert.currentPrice
    })

    // Find similar/complementary products for recommendations
    const categoryNames = Array.from(categoryMap.keys())
    const brandIds = wishlistProducts.map(p => p.brandId).filter(Boolean) as string[]
    
    const recommendedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { notIn: productIds } },
          { stock: { gt: 0 } },
          {
            OR: [
              { category: { in: categoryNames } },
              ...(brandIds.length > 0 ? [{ brandId: { in: brandIds } }] : [])
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        image: true,
        category: true,
        brandId: true,
        brand: { select: { name: true } }
      },
      orderBy: [
        { salePrice: 'asc' },
        { rating: 'desc' }
      ],
      take: 6
    })

    // Use AI to generate personalized recommendations and bundle suggestions
    let aiMessage = ''
    let bundleSuggestions: Array<{
      products: Array<{ id: number; name: string; price: number }>
      totalPrice: number
      savings: number
      reason: string
    }> = []

    try {
      const wishlistSummary = wishlistProducts.map(p => `${p.name} (${p.category}, ${p.price} Ft)`).join(', ')
      
      const response = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: `Te egy shopping asszisztens vagy. Elemezd a felhasználó kedvenceit és adj személyre szabott tanácsot.
            Válaszolj JSON formátumban:
            {
              "message": "Rövid, személyes üzenet a kedvencekről (max 100 karakter)",
              "bundleIdea": "Egy kreatív csomagötlet neve, ha releváns",
              "bundleReason": "Miért jó ez a csomag (max 50 karakter)"
            }`
          },
          {
            role: 'user',
            content: `Kedvencek: ${wishlistSummary}\nKategóriák: ${categoryNames.join(', ')}\nÁtlagár: ${averagePrice} Ft`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })

      const aiContent = response.choices[0]?.message?.content
      if (aiContent) {
        try {
          const parsed = JSON.parse(aiContent)
          aiMessage = parsed.message || ''
          
          // Create bundle suggestion if AI provided one
          if (parsed.bundleIdea && wishlistProducts.length >= 2) {
            const bundleProducts = wishlistProducts.slice(0, 3).map(p => ({
              id: p.id,
              name: p.name,
              price: p.salePrice || p.price
            }))
            const bundleTotal = bundleProducts.reduce((sum, p) => sum + p.price, 0)
            bundleSuggestions.push({
              products: bundleProducts,
              totalPrice: bundleTotal,
              savings: Math.round(bundleTotal * 0.05), // 5% bundle discount idea
              reason: parsed.bundleReason || 'Tökéletes kombináció'
            })
          }
        } catch {
          // Use raw message if not JSON
          aiMessage = aiContent.substring(0, 100)
        }
      }
    } catch (aiError) {
      console.error('AI wishlist analysis error:', aiError)
      aiMessage = 'Remek választások a kedvenceid között!'
    }

    // Format recommendations with reasons
    const recommendations = recommendedProducts.map(product => {
      let reason = ''
      const brandName = product.brand?.name
      if (wishlistProducts.some(wp => wp.category === product.category)) {
        reason = `Hasonló a kedvenceidhez`
      } else if (brandName && wishlistProducts.some(wp => wp.brand?.name === brandName)) {
        reason = `${brandName} termék, amit szeretsz`
      } else if (product.salePrice && product.salePrice < product.price) {
        reason = 'Most akciós!'
      } else {
        reason = 'Ajánlott neked'
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug || String(product.id),
        price: product.salePrice || product.price,
        originalPrice: product.salePrice ? product.price : null,
        image: product.image,
        category: product.category,
        reason
      }
    })

    return {
      success: true,
      insights: {
        totalValue,
        averagePrice,
        categories,
        priceRange,
        savingsOpportunity
      },
      recommendations,
      priceDropAlerts,
      bundleSuggestions,
      aiMessage
    }
  } catch (error) {
    console.error('Wishlist analysis error:', error)
    return { success: false, error: 'Hiba történt az elemzés során' }
  }
}

// ============================================================================
// AI REVIEW SUMMARY - Értékelések összefoglalása a termékoldalakon
// ============================================================================

export async function getAIReviewSummary(productId: number) {
  try {
    // Fetch approved reviews
    const reviews = await prisma.review.findMany({
      where: { 
        productId,
        status: 'approved'
      },
      select: {
        rating: true,
        text: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    if (reviews.length < 3) {
      return { 
        success: true, 
        hasSummary: false,
        message: 'Még nincs elég értékelés az összefoglaláshoz'
      }
    }

    // Calculate statistics
    const totalReviews = reviews.length
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    }

    // Prepare reviews for AI
    const reviewTexts = reviews
      .filter(r => r.text && r.text.length > 10)
      .slice(0, 20)
      .map(r => `[${r.rating}/5]: ${r.text}`)
      .join('\n')

    if (!reviewTexts) {
      return {
        success: true,
        hasSummary: true,
        summary: {
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews,
          ratingDistribution,
          aiSummary: null,
          pros: [],
          cons: []
        }
      }
    }

    // Generate AI summary
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy értékelés-elemző AI vagy. Elemezd a vásárlói véleményeket és adj összefoglalót.
Válaszolj JSON formátumban:
{
  "summary": "2-3 mondatos összefoglaló a vélemények alapján (max 200 karakter)",
  "pros": ["max 3 pozitívum rövidítve"],
  "cons": ["max 2 negatívum rövidítve, ha van"],
  "sentiment": "positive" | "mixed" | "negative",
  "recommendationRate": 0-100 közötti szám (mennyire ajánlják)
}`
        },
        {
          role: 'user',
          content: `Értékelések:\n${reviewTexts}\n\nÁtlagos értékelés: ${avgRating.toFixed(1)}/5`
        }
      ],
      max_tokens: 300,
      temperature: 0.5
    })

    const aiContent = response.choices[0]?.message?.content
    let aiAnalysis = {
      summary: 'A vásárlók általában elégedettek a termékkel.',
      pros: [] as string[],
      cons: [] as string[],
      sentiment: 'positive' as 'positive' | 'mixed' | 'negative',
      recommendationRate: Math.round(avgRating * 20)
    }

    if (aiContent) {
      try {
        const parsed = JSON.parse(aiContent)
        aiAnalysis = {
          summary: parsed.summary || aiAnalysis.summary,
          pros: parsed.pros || [],
          cons: parsed.cons || [],
          sentiment: parsed.sentiment || 'positive',
          recommendationRate: parsed.recommendationRate || aiAnalysis.recommendationRate
        }
      } catch {
        // Use default if parsing fails
      }
    }

    return {
      success: true,
      hasSummary: true,
      summary: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        ratingDistribution,
        ...aiAnalysis
      }
    }
  } catch (error) {
    console.error('AI review summary error:', error)
    return { success: false, error: 'Hiba az összefoglaló generálásakor' }
  }
}

// ============================================================================
// AI PRODUCT Q&A - Kérdés-válasz a termékről
// ============================================================================

export async function askProductQuestion(productId: number, question: string) {
  try {
    if (!question || question.length < 5) {
      return { success: false, error: 'Túl rövid kérdés' }
    }

    // Fetch product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        reviews: {
          where: { status: 'approved' },
          take: 10,
          select: { text: true, rating: true }
        }
      }
    })

    if (!product) {
      return { success: false, error: 'Termék nem található' }
    }

    // Build product context
    const specs = product.specifications as Array<{ key: string; value: string }> | null
    const specText = specs?.map(s => `${s.key}: ${s.value}`).join(', ') || 'Nincs részletes specifikáció'
    
    const reviewSummary = product.reviews.length > 0 
      ? `Vásárlói vélemények: ${product.reviews.map(r => `"${r.text?.substring(0, 100)}"`).join('; ')}`
      : ''

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te a NEXU webshop termékszakértője vagy. Válaszolj a vásárló kérdésére a megadott termékadatok alapján.

Szabályok:
- Csak a megadott információk alapján válaszolj
- Ha nem tudod a választ, mondd el őszintén
- Rövid, tömör válasz (max 150 szó)
- Magyar nyelven
- Barátságos, segítőkész hangnem
- Ha releváns, említsd meg a garanciát vagy visszaküldési lehetőséget`
        },
        {
          role: 'user',
          content: `Termék: ${product.name}
Márka: ${product.brand?.name || 'Nincs megadva'}
Kategória: ${product.category}
Ár: ${product.salePrice || product.price} Ft
Leírás: ${product.description || 'Nincs leírás'}
Specifikációk: ${specText}
Készlet: ${product.stock > 0 ? `${product.stock} db` : 'Nincs készleten'}
${reviewSummary}

Kérdés: ${question}`
        }
      ],
      max_tokens: 250,
      temperature: 0.7
    })

    const answer = response.choices[0]?.message?.content || 'Sajnos nem tudok válaszolni erre a kérdésre.'

    // Generate follow-up suggestions
    const followUpResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Adj 3 releváns követő kérdést a termékről. Csak a kérdéseket add vissza, JSON tömbben: ["kérdés1", "kérdés2", "kérdés3"]'
        },
        {
          role: 'user',
          content: `Termék: ${product.name}\nKategória: ${product.category}\nEredeti kérdés: ${question}`
        }
      ],
      max_tokens: 100,
      temperature: 0.8
    })

    let followUpQuestions: string[] = []
    try {
      const followUpContent = followUpResponse.choices[0]?.message?.content
      if (followUpContent) {
        followUpQuestions = JSON.parse(followUpContent)
      }
    } catch {
      followUpQuestions = [
        'Milyen garancia jár a termékhez?',
        'Mikor érkezik meg a szállítás?',
        'Van-e tartozék a csomagban?'
      ]
    }

    return {
      success: true,
      answer,
      followUpQuestions,
      productInfo: {
        name: product.name,
        price: product.salePrice || product.price,
        inStock: product.stock > 0
      }
    }
  } catch (error) {
    console.error('Product Q&A error:', error)
    return { success: false, error: 'Hiba a válasz generálásakor' }
  }
}

// ============================================================================
// AI SMART CART SUGGESTIONS - Kosár intelligens kiegészítő ajánlások
// ============================================================================

export async function getSmartCartSuggestions(cartProductIds: number[]) {
  try {
    if (cartProductIds.length === 0) {
      return { success: true, suggestions: [], bundles: [] }
    }

    // Get cart products
    const cartProducts = await prisma.product.findMany({
      where: { id: { in: cartProductIds } },
      include: { brand: true }
    })

    const categories = [...new Set(cartProducts.map(p => p.category))]
    const brands = [...new Set(cartProducts.map(p => p.brand?.name).filter(Boolean))]
    const totalCartValue = cartProducts.reduce((sum, p) => sum + (p.salePrice || p.price), 0)

    // Find complementary products
    const complementaryProducts = await prisma.product.findMany({
      where: {
        id: { notIn: cartProductIds },
        isArchived: false,
        OR: [
          // Accessories for the same category
          { 
            category: { contains: 'Kiegészítő' }
          },
          // Same brand, different category
          {
            brand: { name: { in: brands as string[] } },
            category: { notIn: categories }
          },
          // Lower price items (impulse buys)
          {
            price: { lte: totalCartValue * 0.2 }
          }
        ]
      },
      include: { brand: true },
      take: 20,
      orderBy: { rating: 'desc' }
    })

    // Use AI to rank and explain suggestions
    const productContext = cartProducts.map(p => `${p.name} (${p.category})`).join(', ')
    const suggestionContext = complementaryProducts.slice(0, 10).map(p => 
      `ID:${p.id}|${p.name}|${p.category}|${p.price}Ft`
    ).join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy intelligens e-commerce ajánló rendszer vagy. A kosár tartalma alapján válaszd ki a legjobb 3 kiegészítő terméket.

Válaszolj JSON formátumban:
{
  "suggestions": [
    {"id": termék_id, "reason": "rövid indoklás (max 30 karakter)"}
  ],
  "bundleIdea": {
    "name": "csomag neve",
    "description": "miért éri meg (max 50 karakter)",
    "discountPercent": 5-15 közötti szám
  }
}`
        },
        {
          role: 'user',
          content: `Kosár tartalma: ${productContext}\n\nLehetséges ajánlások:\n${suggestionContext}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    let aiSuggestions: { id: number; reason: string }[] = []
    let bundleIdea: { name: string; description: string; discountPercent: number } | null = null

    try {
      const content = response.choices[0]?.message?.content
      if (content) {
        const parsed = JSON.parse(content)
        aiSuggestions = parsed.suggestions || []
        bundleIdea = parsed.bundleIdea || null
      }
    } catch {
      // Fallback to simple recommendations
    }

    // Build final suggestions
    const suggestedIds = aiSuggestions.map(s => s.id)
    const suggestions = complementaryProducts
      .filter(p => suggestedIds.includes(p.id) || aiSuggestions.length === 0)
      .slice(0, 4)
      .map(product => {
        const aiReason = aiSuggestions.find(s => s.id === product.id)?.reason
        return {
          id: product.id,
          name: product.name,
          slug: product.slug || String(product.id),
          price: product.salePrice || product.price,
          originalPrice: product.salePrice ? product.price : null,
          image: product.image,
          category: product.category,
          reason: aiReason || 'Ajánlott kiegészítő'
        }
      })

    // Build bundle if AI suggested one
    const bundles = bundleIdea ? [{
      name: bundleIdea.name,
      description: bundleIdea.description,
      products: cartProducts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        price: p.salePrice || p.price
      })),
      discountPercent: bundleIdea.discountPercent,
      originalTotal: totalCartValue,
      discountedTotal: Math.round(totalCartValue * (1 - bundleIdea.discountPercent / 100))
    }] : []

    return {
      success: true,
      suggestions,
      bundles,
      freeShippingRemaining: Math.max(0, 30000 - totalCartValue),
      cartInsight: totalCartValue > 50000 
        ? '🎉 Kiváló választás! VIP kedvezményre jogosult vagy.'
        : totalCartValue > 30000 
          ? '✨ Ingyenes szállítás jár a rendelésedhez!'
          : `📦 Még ${(30000 - totalCartValue).toLocaleString('hu-HU')} Ft-ot rendelj az ingyenes szállításhoz!`
    }
  } catch (error) {
    console.error('Smart cart suggestions error:', error)
    return { success: false, error: 'Hiba az ajánlások betöltésekor' }
  }
}

// ============================================================================
// AI PRICE PREDICTION - Ár előrejelzés vásárlóknak
// ============================================================================

export async function getPricePrediction(productId: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        saleStartDate: true,
        saleEndDate: true,
        category: true,
        stock: true,
        createdAt: true
      }
    })

    if (!product) {
      return { success: false, error: 'Termék nem található' }
    }

    const currentPrice = product.salePrice || product.price
    const isOnSale = !!product.salePrice

    // Check if sale is ending soon
    const saleEndingSoon = product.saleEndDate && 
      new Date(product.saleEndDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

    // Check historical sales patterns (simplified - in production would use actual price history)
    const dayOfWeek = new Date().getDay()
    const monthOfYear = new Date().getMonth()
    
    // Black Friday / Holiday season (November-December)
    const isHolidaySeason = monthOfYear === 10 || monthOfYear === 11
    
    // Weekend sales
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Generate prediction
    let prediction: {
      trend: 'up' | 'down' | 'stable'
      confidence: number
      reasoning: string
      recommendation: string
      bestTimeToBy: string
    }

    if (isOnSale && saleEndingSoon) {
      prediction = {
        trend: 'up',
        confidence: 85,
        reasoning: 'Az akció hamarosan véget ér',
        recommendation: 'Érdemes most megvenni, amíg az akciós ár érvényes!',
        bestTimeToBy: 'Most!'
      }
    } else if (product.stock < 5 && product.stock > 0) {
      prediction = {
        trend: 'stable',
        confidence: 70,
        reasoning: 'Alacsony készlet, várhatóan nem lesz további akció',
        recommendation: 'Javasolt megvenni, mielőtt elfogy',
        bestTimeToBy: 'A készlet erejéig'
      }
    } else if (isHolidaySeason && !isOnSale) {
      prediction = {
        trend: 'down',
        confidence: 65,
        reasoning: 'Ünnepi szezon - várhatóak akciók',
        recommendation: 'Érdemes várni a Black Friday / karácsonyi akciókra',
        bestTimeToBy: 'November vége'
      }
    } else if (isOnSale) {
      prediction = {
        trend: 'up',
        confidence: 60,
        reasoning: 'Jelenleg akciós ár',
        recommendation: 'Az akciós ár kedvező, megéri kihasználni',
        bestTimeToBy: 'Most'
      }
    } else {
      prediction = {
        trend: 'stable',
        confidence: 50,
        reasoning: 'Nincs jelentős árváltozás várható',
        recommendation: 'Bármikor megveheted, stabil az ár',
        bestTimeToBy: 'Bármikor'
      }
    }

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        currentPrice,
        originalPrice: isOnSale ? product.price : null,
        isOnSale
      },
      prediction,
      priceAlertAvailable: true
    }
  } catch (error) {
    console.error('Price prediction error:', error)
    return { success: false, error: 'Hiba az előrejelzés generálásakor' }
  }
}

// ============================================================================
// AI SIZE/VARIANT RECOMMENDER - Méret/variáns ajánló
// ============================================================================

export async function getVariantRecommendation(productId: number, userPreferences?: {
  previousPurchases?: { productId: number; variantId: string }[]
  preferredBrands?: string[]
}) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          where: { isActive: true }
        },
        brand: true
      }
    })

    if (!product) {
      return { success: false, error: 'Termék nem található' }
    }

    if (!product.variants || product.variants.length === 0) {
      return { 
        success: true, 
        hasVariants: false,
        message: 'Ennek a terméknek nincs variánsa'
      }
    }

    // Analyze variants
    const variantAnalysis = product.variants.map(variant => {
      const attrs = variant.attributes as Record<string, string> | null
      const stockStatus = variant.stock > 10 ? 'plenty' : variant.stock > 0 ? 'low' : 'out'
      const isOnSale = !!variant.salePrice
      const price = variant.salePrice || variant.price

      return {
        id: variant.id,
        sku: variant.sku,
        attributes: attrs || {},
        price,
        isOnSale,
        stock: variant.stock,
        stockStatus,
        images: variant.images as string[]
      }
    })

    // Find most popular (highest stock usually indicates bestseller)
    const sortedByStock = [...variantAnalysis].sort((a, b) => b.stock - a.stock)
    const mostPopular = sortedByStock[0]

    // Find best value (sale items)
    const saleVariants = variantAnalysis.filter(v => v.isOnSale)
    const bestValue = saleVariants.length > 0 
      ? saleVariants.reduce((a, b) => a.price < b.price ? a : b)
      : null

    // Get available attributes
    const availableAttributes: Record<string, string[]> = {}
    variantAnalysis.forEach(v => {
      Object.entries(v.attributes).forEach(([key, value]) => {
        if (!availableAttributes[key]) {
          availableAttributes[key] = []
        }
        if (!availableAttributes[key].includes(value)) {
          availableAttributes[key].push(value)
        }
      })
    })

    return {
      success: true,
      hasVariants: true,
      productName: product.name,
      totalVariants: product.variants.length,
      availableAttributes,
      recommendations: {
        mostPopular: mostPopular ? {
          id: mostPopular.id,
          attributes: mostPopular.attributes,
          reason: 'Legnépszerűbb választás',
          price: mostPopular.price,
          inStock: mostPopular.stock > 0
        } : null,
        bestValue: bestValue ? {
          id: bestValue.id,
          attributes: bestValue.attributes,
          reason: 'Legjobb ár-érték arány',
          price: bestValue.price,
          savings: Math.round(((variantAnalysis.find(v => !v.isOnSale)?.price || bestValue.price) - bestValue.price)),
          inStock: bestValue.stock > 0
        } : null,
        inStockVariants: variantAnalysis.filter(v => v.stock > 0).length
      },
      allVariants: variantAnalysis
    }
  } catch (error) {
    console.error('Variant recommendation error:', error)
    return { success: false, error: 'Hiba a variáns ajánlásakor' }
  }
}

// ============================================================================
// AI GIFT FINDER
// ============================================================================

interface GiftRecipient {
  relationship: string
  age?: string
  gender?: string
  interests?: string[]
  occasion: string
  budget: { min: number; max: number }
}

export async function getAIGiftSuggestions(recipient: GiftRecipient) {
  try {
    // Get products within budget range
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { price: { gte: recipient.budget.min, lte: recipient.budget.max } },
          { salePrice: { gte: recipient.budget.min, lte: recipient.budget.max } }
        ],
        stock: { gt: 0 },
        isArchived: false
      },
      include: { brand: true },
      take: 50
    })

    if (products.length === 0) {
      return { 
        success: true, 
        analysis: {
          suggestions: [],
          personalMessage: 'Sajnos nem találtunk termékeket ebben az árkategóriában.',
          alternativeIdeas: ['Próbálj szélesebb költségkeretet megadni', 'Nézz körül más kategóriákban']
        }
      }
    }

    // Build product info for AI
    const productInfo = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.salePrice || p.price,
      category: p.category,
      brand: p.brand?.name,
      description: p.description.substring(0, 150),
      image: p.image,
      rating: p.rating
    }))

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy ajándék szakértő AI vagy. A feladatod, hogy a legjobb ajándékokat ajánld a megadott kritériumok alapján.
          
Válaszolj CSAK érvényes JSON formátumban:
{
  "suggestions": [
    {
      "productId": number,
      "reason": "string - miért ez a tökéletes ajándék",
      "matchScore": number (1-100),
      "giftTips": "string - tipp a csomagoláshoz vagy átadáshoz"
    }
  ],
  "personalMessage": "string - személyre szabott üzenet a vásárlónak",
  "wrappingIdeas": ["string array - csomagolási ötletek"],
  "alternativeIdeas": ["string array - ha nem talál megfelelőt, mit tehetne"]
}`
        },
        {
          role: 'user',
          content: `Kinek keresek ajándékot:
- Kapcsolat: ${recipient.relationship}
- Kor: ${recipient.age || 'nem megadott'}
- Nem: ${recipient.gender || 'nem megadott'}
- Érdeklődés: ${recipient.interests?.join(', ') || 'nem megadott'}
- Alkalom: ${recipient.occasion}
- Költségkeret: ${recipient.budget.min.toLocaleString('hu-HU')} - ${recipient.budget.max.toLocaleString('hu-HU')} Ft

Elérhető termékek:
${JSON.stringify(productInfo, null, 2)}

Válassz ki maximum 5 legjobb ajándékot és adj személyre szabott ajánlást!`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No AI response')

    const aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    // Enrich suggestions with product data
    const enrichedSuggestions = aiResult.suggestions.map((s: { productId: number; reason: string; matchScore: number; giftTips?: string }) => {
      const product = products.find(p => p.id === s.productId)
      if (!product) return null
      return {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.salePrice || product.price,
        image: product.image,
        category: product.category,
        reason: s.reason,
        matchScore: s.matchScore,
        giftTips: s.giftTips
      }
    }).filter(Boolean)

    return {
      success: true,
      analysis: {
        suggestions: enrichedSuggestions,
        personalMessage: aiResult.personalMessage,
        wrappingIdeas: aiResult.wrappingIdeas,
        alternativeIdeas: aiResult.alternativeIdeas
      }
    }
  } catch (error) {
    console.error('Gift suggestions error:', error)
    return { success: false, error: 'Hiba az ajándékötletek generálásakor' }
  }
}

// ============================================================================
// AI DEAL HUNTER
// ============================================================================

export async function getAIDealAnalysis(options?: {
  category?: string
  maxBudget?: number
  dealType?: string
}) {
  try {
    // Get products on sale
    const products = await prisma.product.findMany({
      where: {
        salePrice: { not: null },
        stock: { gt: 0 },
        isArchived: false,
        ...(options?.category && { category: options.category }),
        ...(options?.maxBudget && { salePrice: { lte: options.maxBudget } })
      },
      include: { brand: true },
      orderBy: { salePercentage: 'desc' },
      take: 30
    })

    // Also get recent orders to analyze popular items
    const recentOrderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _count: true,
      orderBy: { _count: { productId: 'desc' } },
      take: 20
    })
    const popularProductIds = recentOrderItems.map(i => i.productId).filter((id): id is number => id !== null)

    // Build deals list
    const deals = products.map(p => {
      const discount = p.salePrice && p.price > 0 
        ? Math.round(((p.price - p.salePrice) / p.price) * 100)
        : 0
      
      // Calculate deal score based on multiple factors
      const isPopular = popularProductIds.includes(p.id)
      let dealScore = Math.min(100, discount * 1.5) // Base score from discount
      if (isPopular) dealScore += 15
      if (p.rating >= 4.5) dealScore += 10
      if (p.stock < 10) dealScore += 5 // Urgency
      dealScore = Math.min(100, Math.round(dealScore))

      // Determine deal type
      let dealType: 'flash' | 'clearance' | 'seasonal' | 'bundle' | 'new' = 'clearance'
      if (discount >= 40) dealType = 'flash'
      else if (p.stock < 5) dealType = 'clearance'

      // Buying advice
      let buyingAdvice: 'buy-now' | 'wait' | 'skip' = 'wait'
      if (dealScore >= 80 && p.stock < 10) buyingAdvice = 'buy-now'
      else if (dealScore >= 60) buyingAdvice = 'buy-now'
      else if (dealScore < 40) buyingAdvice = 'skip'

      return {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        price: p.salePrice!,
        originalPrice: p.price,
        discount,
        image: p.image,
        category: p.category,
        rating: p.rating,
        stock: p.stock,
        dealScore,
        dealType,
        buyingAdvice,
        aiVerdict: ''
      }
    })

    // Sort by deal score
    deals.sort((a, b) => b.dealScore - a.dealScore)

    // Get AI analysis for top deals
    const topDeals = deals.slice(0, 10)
    
    if (topDeals.length > 0) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Te egy okos vásárlási tanácsadó AI vagy. Elemezd az akciókat és adj tanácsot.
            
Válaszolj CSAK JSON formátumban:
{
  "verdicts": [{ "productId": number, "verdict": "rövid értékelés magyarul" }],
  "insights": ["string array - általános megfigyelések az akciókról"],
  "bestTimeToShop": "string - mikor érdemes vásárolni",
  "predictions": [{ 
    "productId": number, 
    "predictedPrice": number,
    "predictedDate": "string pl: 2 hét múlva",
    "confidence": number (1-100),
    "recommendation": "string"
  }]
}`
          },
          {
            role: 'user',
            content: `Elemezd ezeket az akciókat és adj tanácsot:
${JSON.stringify(topDeals.map(d => ({
  id: d.productId,
  name: d.name,
  price: d.price,
  originalPrice: d.originalPrice,
  discount: d.discount,
  category: d.category,
  stock: d.stock,
  rating: d.rating
})), null, 2)}`
          }
        ],
        temperature: 0.6,
        max_tokens: 1200
      })

      const content = response.choices[0]?.message?.content
      if (content) {
        const aiAnalysis = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))
        
        // Add verdicts to deals
        aiAnalysis.verdicts?.forEach((v: { productId: number; verdict: string }) => {
          const deal = topDeals.find(d => d.productId === v.productId)
          if (deal) deal.aiVerdict = v.verdict
        })

        return {
          success: true,
          analysis: {
            topDeals: topDeals.slice(0, 5),
            flashDeals: deals.filter(d => d.dealType === 'flash').slice(0, 5),
            clearanceDeals: deals.filter(d => d.dealType === 'clearance').slice(0, 5),
            pricePredictions: (aiAnalysis.predictions || []).map((p: { productId: number; predictedPrice: number; predictedDate: string; confidence: number; recommendation: string }) => {
              const deal = topDeals.find(d => d.productId === p.productId)
              return {
                productId: p.productId,
                name: deal?.name || '',
                currentPrice: deal?.price || 0,
                predictedPrice: p.predictedPrice,
                predictedDate: p.predictedDate,
                confidence: p.confidence,
                recommendation: p.recommendation
              }
            }),
            aiInsights: aiAnalysis.insights || [],
            bestTimeToShop: aiAnalysis.bestTimeToShop || 'Hétvégén általában több akció van'
          }
        }
      }
    }

    return {
      success: true,
      analysis: {
        topDeals: topDeals.slice(0, 5),
        flashDeals: deals.filter(d => d.dealType === 'flash').slice(0, 5),
        clearanceDeals: deals.filter(d => d.dealType === 'clearance').slice(0, 5),
        pricePredictions: [],
        aiInsights: ['Jelenleg ' + deals.length + ' termék van akcióban'],
        bestTimeToShop: 'Hétvégén általában több akció van'
      }
    }
  } catch (error) {
    console.error('Deal analysis error:', error)
    return { success: false, error: 'Hiba az akciók elemzésekor' }
  }
}

export async function subscribeToDeals(productId: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Bejelentkezés szükséges' }
    }

    // In a real app, you'd store this in a PriceAlert table
    // For now, we'll just return success
    console.log(`User ${session.user.id} subscribed to price alerts for product ${productId}`)
    
    return { success: true, message: 'Feliratkozás sikeres!' }
  } catch (error) {
    console.error('Deal subscription error:', error)
    return { success: false, error: 'Hiba a feliratkozáskor' }
  }
}

// ============================================================================
// AI VOICE SEARCH
// ============================================================================

export async function processVoiceSearch(query: string) {
  try {
    // Get all products for context
    const products = await prisma.product.findMany({
      where: { 
        isArchived: false,
        stock: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        image: true,
        category: true,
        description: true
      },
      take: 100
    })

    // Use AI to interpret the voice query
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy e-commerce keresési asszisztens vagy. A felhasználó hangalapú keresést végzett. 
Értelmezd a magyar nyelvű keresést és válassz releváns termékeket.

Válaszolj CSAK JSON formátumban:
{
  "interpretation": "string - mit értettél a keresésből magyarul, barátságosan",
  "productIds": [number array - releváns termék ID-k, max 6],
  "relevanceScores": [number array - 1-100 közötti relevancia pontszámok],
  "filters": {
    "category": "string or null",
    "minPrice": number or null,
    "maxPrice": number or null,
    "inStock": boolean or null
  },
  "suggestions": ["string array - 3 javasolt keresés hasonló témában"]
}`
        },
        {
          role: 'user',
          content: `Keresés: "${query}"

Elérhető termékek:
${products.map(p => `ID: ${p.id}, Név: ${p.name}, Kategória: ${p.category}, Ár: ${p.salePrice || p.price} Ft`).join('\n')}`
        }
      ],
      temperature: 0.5,
      max_tokens: 800
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No AI response')

    const aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    // Build results
    const results = (aiResult.productIds || []).map((id: number, idx: number) => {
      const product = products.find(p => p.id === id)
      if (!product) return null
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.salePrice || product.price,
        image: product.image,
        category: product.category,
        relevanceScore: aiResult.relevanceScores?.[idx] || 80
      }
    }).filter(Boolean)

    return {
      success: true,
      result: {
        query,
        interpretation: aiResult.interpretation || `Keresés: "${query}"`,
        results,
        suggestions: aiResult.suggestions || [],
        filters: aiResult.filters
      }
    }
  } catch (error) {
    console.error('Voice search error:', error)
    return { success: false, error: 'Hiba a hangkeresés feldolgozásakor' }
  }
}

// ============================================================================
// AI BUDGET PLANNER
// ============================================================================

interface BudgetPlanItem {
  id: string
  name: string
  productId?: number
  price: number
  priority: 'must-have' | 'nice-to-have' | 'optional'
  category?: string
}

export async function analyzeBudgetPlan(data: {
  budget: number
  items: BudgetPlanItem[]
}) {
  try {
    const { budget, items } = data
    
    // Calculate totals
    const totalCost = items.reduce((sum, item) => sum + item.price, 0)
    const mustHaveTotal = items.filter(i => i.priority === 'must-have').reduce((sum, i) => sum + i.price, 0)
    const niceToHaveTotal = items.filter(i => i.priority === 'nice-to-have').reduce((sum, i) => sum + i.price, 0)
    const optionalTotal = items.filter(i => i.priority === 'optional').reduce((sum, i) => sum + i.price, 0)

    // Find cheaper alternatives for over-budget items
    const productIds = items.filter(i => i.productId).map(i => i.productId!)
    const alternatives = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { gt: 0 },
        id: { notIn: productIds },
        OR: items.map(i => ({
          category: i.category,
          price: { lt: i.price }
        }))
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        image: true,
        category: true
      },
      take: 20
    })

    // Build AI prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy pénzügyi tanácsadó AI vagy vásárláshoz. Elemezd a költségvetést és adj javaslatokat.

Válaszolj CSAK JSON formátumban:
{
  "aiAdvice": "string - általános tanács magyarul, max 2 mondat",
  "recommendations": [
    {
      "type": "swap|remove|add|wait",
      "itemId": "string or null - melyik elemre vonatkozik",
      "suggestion": "string - javaslat leírása",
      "potentialSavings": number or null,
      "alternativeProductId": number or null
    }
  ],
  "savingsTips": ["string array - 3 spórolási tipp"]
}`
        },
        {
          role: 'user',
          content: `Költségkeret: ${budget.toLocaleString('hu-HU')} Ft
Tervezett költés: ${totalCost.toLocaleString('hu-HU')} Ft
${totalCost > budget ? `TÚLLÉPÉS: ${(totalCost - budget).toLocaleString('hu-HU')} Ft` : `Maradék: ${(budget - totalCost).toLocaleString('hu-HU')} Ft`}

Tervezett vásárlások:
${items.map(i => `- ${i.name}: ${i.price.toLocaleString('hu-HU')} Ft (${i.priority === 'must-have' ? 'Kötelező' : i.priority === 'nice-to-have' ? 'Jó lenne' : 'Opcionális'})`).join('\n')}

Olcsóbb alternatívák:
${alternatives.slice(0, 10).map(a => `- ${a.name}: ${(a.salePrice || a.price).toLocaleString('hu-HU')} Ft (${a.category})`).join('\n')}

Adj maximum 3 konkrét javaslatot a költségkeret tartásához!`
        }
      ],
      temperature: 0.6,
      max_tokens: 800
    })

    const content = response.choices[0]?.message?.content
    let aiResult = { aiAdvice: '', recommendations: [], savingsTips: [] }
    
    if (content) {
      try {
        aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))
      } catch {
        // use defaults
      }
    }

    // Enrich recommendations with product data
    const enrichedRecs = (aiResult.recommendations || []).map((rec: { type: string; itemId?: string; suggestion: string; potentialSavings?: number; alternativeProductId?: number }) => {
      const alt = rec.alternativeProductId 
        ? alternatives.find(a => a.id === rec.alternativeProductId)
        : null
      
      return {
        type: rec.type,
        itemId: rec.itemId,
        suggestion: rec.suggestion,
        potentialSavings: rec.potentialSavings,
        alternativeProduct: alt ? {
          id: alt.id,
          name: alt.name,
          price: alt.salePrice || alt.price,
          slug: alt.slug,
          image: alt.image
        } : undefined
      }
    })

    return {
      success: true,
      analysis: {
        totalCost,
        budgetStatus: totalCost < budget ? 'under' : totalCost > budget ? 'over' : 'exact',
        savings: Math.max(0, budget - totalCost),
        priorityBreakdown: {
          mustHave: mustHaveTotal,
          niceToHave: niceToHaveTotal,
          optional: optionalTotal
        },
        recommendations: enrichedRecs,
        aiAdvice: aiResult.aiAdvice || 'Elemezd a prioritásokat és fontold meg az opcionális tételek elhagyását.',
        savingsTips: aiResult.savingsTips || []
      }
    }
  } catch (error) {
    console.error('Budget analysis error:', error)
    return { success: false, error: 'Hiba a költségvetés elemzésekor' }
  }
}

export async function getSmartBudgetSuggestions(budget: number) {
  try {
    // Get products within budget
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { gt: 0 },
        OR: [
          { price: { lte: budget } },
          { salePrice: { lte: budget } }
        ]
      },
      include: { brand: true },
      orderBy: [
        { rating: 'desc' },
        { salePrice: 'asc' }
      ],
      take: 30
    })

    // Use AI to create a smart shopping list
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy okos vásárlási tanácsadó AI vagy. Készíts egy optimális bevásárló listát a megadott költségkeretből.

Válaszolj CSAK JSON formátumban:
{
  "suggestions": [
    {
      "productId": number,
      "priority": "must-have|nice-to-have|optional",
      "reason": "string - miért ajánlod"
    }
  ]
}`
        },
        {
          role: 'user',
          content: `Költségkeret: ${budget.toLocaleString('hu-HU')} Ft

Elérhető termékek:
${products.slice(0, 20).map(p => `ID: ${p.id}, ${p.name}, ${(p.salePrice || p.price).toLocaleString('hu-HU')} Ft, ${p.category}, Értékelés: ${p.rating}`).join('\n')}

Válassz ki 3-5 terméket, ami belefér a költségkeretbe és jó ár-érték arányt képvisel!`
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No AI response')

    const aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    // Enrich with product data
    const suggestions = (aiResult.suggestions || []).map((s: { productId: number; priority: string; reason: string }) => {
      const product = products.find(p => p.id === s.productId)
      if (!product) return null
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.salePrice || product.price,
        category: product.category,
        image: product.image,
        priority: s.priority,
        reason: s.reason
      }
    }).filter(Boolean)

    return { success: true, suggestions }
  } catch (error) {
    console.error('Smart suggestions error:', error)
    return { success: false, error: 'Hiba a javaslatok generálásakor' }
  }
}

// ============================================================================
// AI STYLE ADVISOR
// ============================================================================

// ============================================================================
// AI TECH ADVISOR
// ============================================================================

interface TechPreferences {
  useCase: string
  priority: string[]
  budget: string
  experienceLevel: string
  ecosystem?: string
}

export async function getTechRecommendations(preferences: TechPreferences) {
  try {
    // Get products based on budget
    const budgetRanges: Record<string, { min: number; max: number }> = {
      'budget': { min: 0, max: 100000 },
      'mid': { min: 100000, max: 300000 },
      'premium': { min: 300000, max: 500000 },
      'flagship': { min: 500000, max: 999999999 }
    }
    const range = budgetRanges[preferences.budget] || { min: 0, max: 999999999 }

    // Map use cases to relevant categories
    const useCaseCategories: Record<string, string[]> = {
      'gaming': ['Laptopok', 'Monitorok', 'Gaming', 'Fejhallgatók', 'Billentyűzetek', 'Egerek'],
      'office': ['Laptopok', 'Monitorok', 'Billentyűzetek', 'Webkamerák', 'Fejhallgatók'],
      'content': ['Laptopok', 'Monitorok', 'Kamerák', 'Mikrofonok', 'Világítás'],
      'music': ['Fejhallgatók', 'Hangszórók', 'Audio', 'Mikrofonok'],
      'smarthome': ['Okosotthon', 'Hangszórók', 'Kamerák', 'Szenzorok'],
      'mobile': ['Telefonok', 'Tabletek', 'Powerbankok', 'Fülhallgatók', 'Okosórák']
    }

    const relevantCategories = useCaseCategories[preferences.useCase] || []

    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { gt: 0 },
        OR: [
          { price: { gte: range.min, lte: range.max } },
          { salePrice: { gte: range.min, lte: range.max } }
        ],
        ...(relevantCategories.length > 0 ? {
          category: { in: relevantCategories }
        } : {})
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        image: true,
        category: true,
        description: true,
        specifications: true
      },
      take: 60
    })

    const useCaseLabels: Record<string, string> = {
      'gaming': 'Gaming',
      'office': 'Home Office',
      'content': 'Tartalomgyártás',
      'music': 'Zenei produkció',
      'smarthome': 'Okosotthon',
      'mobile': 'Mobilitás'
    }

    const priorityLabels: Record<string, string> = {
      'performance': 'Teljesítmény',
      'battery': 'Akkumulátor élettartam',
      'connectivity': 'Vezetéknélküli kapcsolat',
      'display': 'Kijelző minőség',
      'portability': 'Hordozhatóság',
      'value': 'Ár-érték arány'
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy tech tanácsadó AI vagy. A felhasználó igényei alapján adj személyre szabott tech eszköz ajánlásokat.

Válaszolj CSAK JSON formátumban:
{
  "profile": "string - 2-3 mondatos tech profil leírás magyarul",
  "setupType": "string - pl. 'Gamer Setup', 'Produktív Home Office', 'Kreatív Stúdió' stb.",
  "productIds": [number array - max 8 releváns termék ID a legjobbtól],
  "matchScores": [number array - 60-100 közötti match pontszámok],
  "techReasons": [string array - rövid tech indoklás magyarul minden termékhez, pl. 'RTX 4060 ideális 1080p gaminghez'],
  "bundles": [
    {
      "name": "Csomag neve - pl. 'Alap Gaming Csomag'",
      "description": "Rövid leírás",
      "productIds": [number array - 2-5 összeillő termék],
      "savings": number - megtakarítás Ft-ban ha van
    }
  ],
  "tips": ["string array - 3-5 tech tipp a felhasználási területhez"],
  "futureUpgrades": ["string array - 2-3 jövőbeli fejlesztési javaslat"]
}`
        },
        {
          role: 'user',
          content: `Tech igények:
- Felhasználás: ${useCaseLabels[preferences.useCase] || preferences.useCase}
- Prioritások: ${preferences.priority.map(p => priorityLabels[p] || p).join(', ')}
- Költségkeret: ${preferences.budget}
- Tapasztalat: ${preferences.experienceLevel}
${preferences.ecosystem ? `- Ökoszisztéma: ${preferences.ecosystem}` : ''}

Elérhető termékek:
${products.map(p => `ID: ${p.id}, ${p.name}, ${p.category}, ${(p.salePrice || p.price).toLocaleString()} Ft`).join('\n')}

Adj tech ajánlásokat és állíts össze csomagokat!`
        }
      ],
      temperature: 0.6,
      max_tokens: 1500
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No AI response')

    const aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    // Build recommendations
    const recommendations = (aiResult.productIds || []).map((id: number, idx: number) => {
      const product = products.find(p => p.id === id)
      if (!product) return null
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.salePrice || product.price,
        image: product.image,
        category: product.category,
        matchScore: aiResult.matchScores?.[idx] || 80,
        techReason: aiResult.techReasons?.[idx] || ''
      }
    }).filter(Boolean)

    // Build bundles
    const bundles = (aiResult.bundles || []).map((bundle: { name: string; description: string; productIds: number[]; savings: number }) => {
      const items = bundle.productIds.map(id => {
        const product = products.find(p => p.id === id)
        if (!product) return null
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.salePrice || product.price,
          image: product.image
        }
      }).filter((item): item is NonNullable<typeof item> => item !== null)
      
      const totalPrice = items.reduce((sum, item) => sum + item.price, 0)
      
      return {
        name: bundle.name,
        description: bundle.description || '',
        items,
        totalPrice,
        savings: bundle.savings || 0
      }
    })

    return {
      success: true,
      result: {
        profile: aiResult.profile || 'A tech profilod elemzés alatt...',
        setupType: aiResult.setupType || 'Egyedi Setup',
        recommendations,
        bundles,
        tips: aiResult.tips || [],
        futureUpgrades: aiResult.futureUpgrades || []
      }
    }
  } catch (error) {
    console.error('Tech recommendations error:', error)
    return { success: false, error: 'Hiba a tech elemzés során' }
  }
}

// ============================================================================
// AI SHOPPING LIST
// ============================================================================

interface ShoppingListItem {
  id: string
  name: string
  quantity: number
  priority: 'high' | 'medium' | 'low'
}

export async function optimizeShoppingList(items: ShoppingListItem[]) {
  try {
    // Find products matching list items
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        image: true,
        category: true
      },
      take: 100
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy tech bevásárlólista optimalizáló AI vagy egy elektronikai webshopban. Elemezd a kívánt tech eszközök listáját és találj jobb/olcsóbb alternatívákat.

Válaszolj CSAK JSON formátumban:
{
  "totalOriginal": number,
  "totalOptimized": number,
  "suggestions": [
    {
      "originalItem": "string - eredeti tétel neve",
      "betterProductId": number or null,
      "reason": "string - miért jobb ez tech szempontból (pl. jobb specifikációk, újabb modell, kompatibilitás)"
    }
  ],
  "purchaseOrder": ["string array - javasolt beszerzési sorrend, pl. először alaplap, utána CPU stb."],
  "tips": ["string array - tech vásárlási tippek, pl. kompatibilitás, garancia, specifikációk"]
}`
        },
        {
          role: 'user',
          content: `Tech bevásárlólista:
${items.map(i => `- ${i.name} (${i.quantity}x, ${i.priority === 'high' ? 'Sürgős' : i.priority === 'medium' ? 'Normál' : 'Ráér'})`).join('\n')}

Elérhető tech termékek:
${products.map(p => `ID: ${p.id}, ${p.name}, ${p.category}, ${(p.salePrice || p.price).toLocaleString()} Ft`).join('\n')}

Optimalizáld a tech listát és keress jobb specifikációjú/árú alternatívákat!`
        }
      ],
      temperature: 0.6,
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No AI response')

    const aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    // Enrich suggestions with product data
    const suggestions = (aiResult.suggestions || []).map((sug: { originalItem: string; betterProductId?: number; reason: string }) => {
      const product = sug.betterProductId ? products.find(p => p.id === sug.betterProductId) : null
      return {
        originalItem: sug.originalItem,
        betterProduct: product ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.salePrice || product.price,
          image: product.image
        } : undefined,
        reason: sug.reason
      }
    })

    return {
      success: true,
      optimization: {
        totalOriginal: aiResult.totalOriginal || 0,
        totalOptimized: aiResult.totalOptimized || 0,
        savings: (aiResult.totalOriginal || 0) - (aiResult.totalOptimized || 0),
        suggestions,
        purchaseOrder: aiResult.purchaseOrder || [],
        tips: aiResult.tips || []
      }
    }
  } catch (error) {
    console.error('Shopping list optimization error:', error)
    return { success: false, error: 'Hiba az optimalizálás során' }
  }
}

export async function findBestDealsForList(itemNames: string[]) {
  try {
    // Find products on sale that match list items
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { gt: 0 },
        salePrice: { not: null }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        image: true,
        category: true
      },
      orderBy: { salePrice: 'asc' },
      take: 50
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy tech akciókereső AI vagy. Párosítsd a keresett tech eszközöket az aktuálisan akciós termékekkel.

Válaszolj CSAK JSON formátumban:
{
  "matches": [
    {
      "itemName": "string - keresett tech eszköz neve",
      "productId": number
    }
  ]
}`
        },
        {
          role: 'user',
          content: `Keresett tech eszközök: ${itemNames.join(', ')}

Akciós tech termékek:
${products.map(p => `ID: ${p.id}, ${p.name}, ${p.category}, ${p.salePrice?.toLocaleString()} Ft (eredeti: ${p.price.toLocaleString()} Ft)`).join('\n')}

Párosítsd a keresett eszközöket a legjobb akciós tech termékekkel!`
        }
      ],
      temperature: 0.5,
      max_tokens: 600
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No AI response')

    const aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    const deals = (aiResult.matches || []).map((match: { itemName: string; productId: number }) => {
      const product = products.find(p => p.id === match.productId)
      if (!product || !product.salePrice) return null
      
      const discount = Math.round((1 - product.salePrice / product.price) * 100)
      
      return {
        itemName: match.itemName,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.salePrice,
          originalPrice: product.price,
          image: product.image,
          discount
        }
      }
    }).filter(Boolean)

    return { success: true, deals }
  } catch (error) {
    console.error('Find deals error:', error)
    return { success: false, error: 'Hiba az akciók keresésekor' }
  }
}

// ============================================================================
// AI COMPATIBILITY CHECKER
// ============================================================================

export async function checkCompatibility(productIds: number[]) {
  try {
    if (productIds.length < 2) {
      return { success: false, error: 'Legalább 2 termék szükséges' }
    }

    // Fetch products with specifications
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        specifications: true,
        price: true,
        salePrice: true
      }
    })

    if (products.length < 2) {
      return { success: false, error: 'Nem található elég termék' }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy tech kompatibilitás ellenőrző AI vagy. Elemezd a megadott PC alkatrészeket/tech eszközöket és állapítsd meg, hogy kompatibilisek-e egymással.

Figyelj ezekre:
- CPU és alaplap socket kompatibilitás
- RAM típus és sebesség támogatás
- Tápegység teljesítmény
- Fizikai méretek (pl. GPU hossz, hűtő magasság)
- PCIe generációk
- M.2 slot típusok

Válaszolj CSAK JSON formátumban:
{
  "isCompatible": boolean,
  "overallScore": number (0-100),
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "products": ["string array - érintett termékek"],
      "message": "string - probléma leírása magyarul",
      "suggestion": "string - megoldási javaslat"
    }
  ],
  "bottlenecks": ["string array - teljesítmény szűk keresztmetszetek"],
  "recommendations": [
    {
      "type": "upgrade" | "alternative" | "addition",
      "message": "string - ajánlás magyarul"
    }
  ],
  "powerRequirement": number (watt, ha releváns),
  "summary": "string - rövid összefoglaló magyarul"
}`
        },
        {
          role: 'user',
          content: `Ellenőrizd ezeket az alkatrészeket/eszközöket:

${products.map(p => `Termék: ${p.name}
Kategória: ${p.category}
Leírás: ${(p.description || '').slice(0, 300)}
Specifikációk: ${JSON.stringify(p.specifications || {})}
---`).join('\n')}`
        }
      ],
      temperature: 0.4,
      max_tokens: 1200
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No AI response')

    const aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    return {
      success: true,
      result: {
        isCompatible: aiResult.isCompatible ?? false,
        overallScore: aiResult.overallScore ?? 0,
        issues: aiResult.issues || [],
        bottlenecks: aiResult.bottlenecks || [],
        recommendations: aiResult.recommendations || [],
        powerRequirement: aiResult.powerRequirement,
        summary: aiResult.summary || ''
      }
    }
  } catch (error) {
    console.error('Compatibility check error:', error)
    return { success: false, error: 'Hiba a kompatibilitás ellenőrzés során' }
  }
}

// ============================================================================
// AI UPGRADE ADVISOR
// ============================================================================

interface UpgradeInput {
  currentSetup: Array<{ category: string; description: string }>
  useCase: string
  maxBudget: number
}

export async function getUpgradeRecommendations(input: UpgradeInput) {
  try {
    const { currentSetup, useCase, maxBudget } = input

    // Get available products for upgrades
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { gt: 0 },
        OR: [
          { price: { lte: maxBudget } },
          { salePrice: { lte: maxBudget } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        image: true,
        category: true,
        description: true,
        specifications: true
      },
      take: 80
    })

    const useCaseLabels: Record<string, string> = {
      'gaming': 'Gaming (magas FPS, jó grafika)',
      'work': 'Munka és produktivitás (multitasking, office)',
      'content': 'Tartalomgyártás (videó szerkesztés, renderelés)',
      'mixed': 'Vegyes használat'
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy PC/tech upgrade tanácsadó AI vagy. A felhasználó jelenlegi konfigurációja és felhasználási célja alapján adj fejlesztési javaslatokat.

Válaszolj CSAK JSON formátumban:
{
  "analysis": "string - 2-3 mondatos elemzés a jelenlegi setupról",
  "currentPerformance": number (0-100),
  "potentialPerformance": number (0-100 a javasolt fejlesztésekkel),
  "priorityUpgrades": [
    {
      "category": "string - pl. Videokártya, Processzor",
      "urgency": "high" | "medium" | "low",
      "reason": "string - miért fontos ez a fejlesztés",
      "productIds": [number array - ajánlott termék ID-k],
      "expectedImprovement": "string - pl. +50% FPS"
    }
  ],
  "budgetOptions": [
    {
      "tier": "string - pl. Alap, Közép, Prémium",
      "totalCost": number,
      "productIds": [number array],
      "performanceGain": number (százalékos növekedés)
    }
  ],
  "tips": ["string array - általános tippek"],
  "timeline": "string - ajánlott fejlesztési ütemezés"
}`
        },
        {
          role: 'user',
          content: `Jelenlegi konfiguráció:
${currentSetup.map(s => `- ${s.category}: ${s.description}`).join('\n')}

Felhasználási cél: ${useCaseLabels[useCase] || useCase}
Maximum költségkeret: ${maxBudget.toLocaleString('hu-HU')} Ft

Elérhető termékek fejlesztéshez:
${products.map(p => `ID: ${p.id}, ${p.name}, ${p.category}, ${(p.salePrice || p.price).toLocaleString()} Ft`).join('\n')}

Adj részletes fejlesztési tervet!`
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No AI response')

    const aiResult = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))

    // Build priority upgrades with products
    const priorityUpgrades = (aiResult.priorityUpgrades || []).map((upgrade: {
      category: string
      urgency: 'high' | 'medium' | 'low'
      reason: string
      productIds: number[]
      expectedImprovement: string
    }) => ({
      category: upgrade.category,
      urgency: upgrade.urgency,
      reason: upgrade.reason,
      expectedImprovement: upgrade.expectedImprovement,
      products: (upgrade.productIds || []).map((id: number) => {
        const product = products.find(p => p.id === id)
        if (!product) return null
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.salePrice || product.price,
          image: product.image,
          category: product.category,
          improvementScore: 0,
          reason: ''
        }
      }).filter(Boolean)
    }))

    // Build budget options
    const budgetOptions = (aiResult.budgetOptions || []).map((option: {
      tier: string
      totalCost: number
      productIds: number[]
      performanceGain: number
    }) => ({
      tier: option.tier,
      totalCost: option.totalCost,
      performanceGain: option.performanceGain,
      products: (option.productIds || []).map((id: number) => {
        const product = products.find(p => p.id === id)
        if (!product) return null
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.salePrice || product.price,
          image: product.image,
          category: product.category,
          improvementScore: 0,
          reason: ''
        }
      }).filter(Boolean)
    }))

    return {
      success: true,
      result: {
        analysis: aiResult.analysis || '',
        currentPerformance: aiResult.currentPerformance || 50,
        potentialPerformance: aiResult.potentialPerformance || 80,
        priorityUpgrades,
        budgetOptions,
        tips: aiResult.tips || [],
        timeline: aiResult.timeline || ''
      }
    }
  } catch (error) {
    console.error('Upgrade recommendations error:', error)
    return { success: false, error: 'Hiba az upgrade elemzés során' }
  }
}
