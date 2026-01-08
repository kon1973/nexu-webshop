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
        reviews: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    })

    if (products.length < 2) {
      return { success: false, error: 'Nem található elég termék' }
    }

    // Prepare data for AI
    const productData = products.map(p => ({
      name: p.name,
      brand: p.brand?.name || 'N/A',
      price: p.salePrice || p.price,
      originalPrice: p.salePrice ? p.price : null,
      category: p.category,
      rating: p.rating,
      reviewCount: p.reviews.length,
      specifications: p.specifications,
      inStock: p.stock > 0
    }))

    const comparison = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `Te egy e-commerce termék-összehasonlító szakértő vagy. Hasonlítsd össze a termékeket és adj részletes elemzést magyarul.

Válaszolj JSON formátumban:
{
  "summary": "Rövid összefoglaló (1-2 mondat)",
  "winner": {
    "name": "A legjobb választás neve",
    "reason": "Miért ez a legjobb"
  },
  "comparison": [
    {
      "aspect": "Ár-érték arány",
      "analysis": "Elemzés",
      "best": "Termék neve"
    }
  ],
  "recommendations": {
    "budget": "Ajánlás költségtudatos vásárlóknak",
    "performance": "Ajánlás teljesítményt keresőknek",
    "value": "Legjobb ár-érték arány"
  }
}`
        },
        {
          role: 'user',
          content: `Hasonlítsd össze ezeket a termékeket:\n${JSON.stringify(productData, null, 2)}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.7
    })

    let aiComparison = {}
    try {
      aiComparison = JSON.parse(comparison.choices[0]?.message?.content || '{}')
    } catch {
      aiComparison = { summary: 'Az összehasonlítás nem sikerült.' }
    }

    return {
      success: true,
      products,
      aiComparison
    }
  } catch (error) {
    console.error('Compare products error:', error)
    return { success: false, error: 'Hiba az összehasonlítás során' }
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
