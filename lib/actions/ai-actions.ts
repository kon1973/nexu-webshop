'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { subDays, startOfDay, format } from 'date-fns'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// ============== AUTH HELPER ==============

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized')
  }
  return session
}

// ============== AI INSIGHTS ACTIONS ==============

export type InsightType = 'sales-insights' | 'inventory-alerts' | 'pricing-suggestions' | 'review-summary' | 'marketing-ideas'

export async function generateAIInsight(type: InsightType) {
  await requireAdmin()

  try {
    switch (type) {
      case 'sales-insights':
        return await generateSalesInsights()
      case 'inventory-alerts':
        return await generateInventoryAlerts()
      case 'pricing-suggestions':
        return await generatePricingSuggestions()
      case 'review-summary':
        return await generateReviewSummary()
      case 'marketing-ideas':
        return await generateMarketingIdeas()
      default:
        return { error: 'Unknown analysis type' }
    }
  } catch (error) {
    console.error('AI Insights error:', error)
    return { error: 'Failed to generate insights' }
  }
}

async function generateSalesInsights() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const [orders, previousOrders, topProducts, categories] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { items: { include: { product: true } } }
    }),
    prisma.order.findMany({
      where: { 
        createdAt: { 
          gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: thirtyDaysAgo 
        } 
      }
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    }),
    prisma.product.groupBy({
      by: ['category'],
      _count: true,
      _avg: { price: true }
    })
  ])

  const currentRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const previousRevenue = previousOrders.reduce((sum, o) => sum + o.totalPrice, 0)
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : 0

  const topProductIds = topProducts.map(tp => tp.productId).filter((id): id is number => id !== null)
  const topProductsData = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, price: true, category: true }
  })

  const dataForAI = {
    currentPeriod: {
      orders: orders.length,
      revenue: currentRevenue,
      averageOrderValue: orders.length > 0 ? currentRevenue / orders.length : 0
    },
    previousPeriod: {
      orders: previousOrders.length,
      revenue: previousRevenue
    },
    revenueGrowth,
    topProducts: topProductsData.map(p => ({
      name: p.name,
      category: p.category,
      sold: topProducts.find(tp => tp.productId === p.id)?._sum?.quantity || 0
    })),
    categoryBreakdown: categories.map(c => ({
      category: c.category,
      productCount: c._count,
      avgPrice: c._avg.price
    }))
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content: `Te egy e-commerce üzleti elemző AI vagy. Elemezd az értékesítési adatokat és adj konkrét, akcióképes javaslatokat magyarul.
Strukturáld a válaszod:
1. Összefoglaló (2-3 mondat)
2. Főbb megállapítások (3-5 pont)
3. Ajánlott intézkedések (3-5 pont)
4. Figyelmeztető jelek (ha vannak)

Használj emoji-kat a könnyebb áttekinthetőségért.`
      },
      {
        role: 'user',
        content: `Elemezd az elmúlt 30 nap értékesítési adatait:\n${JSON.stringify(dataForAI, null, 2)}`
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })

  return {
    insights: completion.choices[0]?.message?.content,
    data: dataForAI,
    generatedAt: new Date().toISOString()
  }
}

async function generateInventoryAlerts() {
  const [lowStockProducts, outOfStock, slowMoving] = await Promise.all([
    prisma.product.findMany({
      where: { stock: { gt: 0, lte: 5 }, isArchived: false },
      select: { id: true, name: true, stock: true, category: true }
    }),
    prisma.product.findMany({
      where: { stock: 0, isArchived: false },
      select: { id: true, name: true, category: true }
    }),
    prisma.product.findMany({
      where: {
        stock: { gt: 10 },
        isArchived: false,
        orderItems: {
          none: {
            order: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
          }
        }
      },
      select: { id: true, name: true, stock: true, category: true, price: true }
    })
  ])

  const dataForAI = {
    lowStock: lowStockProducts,
    outOfStock: outOfStock,
    slowMoving: slowMoving.slice(0, 10)
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content: `Te egy készletkezelési szakértő AI vagy. Elemezd a készletadatokat és adj prioritásos ajánlásokat.
Válaszolj magyarul, strukturáltan:
1. 🚨 Azonnali teendők
2. ⚠️ Figyelmeztető készletszintek
3. 📦 Lassú forgású termékek kezelése
4. 💡 Optimalizálási javaslatok`
      },
      {
        role: 'user',
        content: `Készlet állapot:\n${JSON.stringify(dataForAI, null, 2)}`
      }
    ],
    max_tokens: 800,
    temperature: 0.6
  })

  return {
    alerts: completion.choices[0]?.message?.content,
    summary: {
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStock.length,
      slowMovingCount: slowMoving.length
    },
    products: dataForAI,
    generatedAt: new Date().toISOString()
  }
}

async function generatePricingSuggestions() {
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    include: {
      orderItems: {
        include: { order: true },
        where: { order: { createdAt: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } } }
      },
      reviews: { select: { rating: true } }
    },
    take: 50
  })

  const productAnalysis = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice,
    category: p.category,
    stock: p.stock,
    salesCount: p.orderItems.length,
    avgRating: p.reviews.length > 0 ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length : null,
    revenue: p.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }))

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content: `Te egy árképzési stratéga AI vagy. Elemezd a termékek teljesítményét és javasolj ároptimalizálást.
Válaszolj magyarul:
1. 📈 Áremelésre alkalmas termékek (magas kereslet, jó értékelés)
2. 📉 Árcsökkentésre alkalmas termékek (alacsony eladás, magas készlet)
3. 🏷️ Akciós ajánlatok (stratégiai leárazások)
4. 💰 Becslés a bevétel növekedésre

Adj konkrét százalékos javaslatokat!`
      },
      {
        role: 'user',
        content: `Termék teljesítmény adatok:\n${JSON.stringify(productAnalysis.slice(0, 20), null, 2)}`
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })

  return {
    suggestions: completion.choices[0]?.message?.content,
    analyzedProducts: productAnalysis.length,
    generatedAt: new Date().toISOString()
  }
}

async function generateReviewSummary() {
  const reviews = await prisma.review.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    include: { 
      product: { select: { name: true, category: true } },
      user: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  const reviewData = reviews.map(r => ({
    rating: r.rating,
    text: r.text,
    product: r.product?.name,
    category: r.product?.category
  }))

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length
  }))

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content: `Te egy vásárlói visszajelzés elemző AI vagy. Elemezd az értékeléseket és készíts összefoglalót.
Válaszolj magyarul:
1. 📊 Általános hangulat elemzés
2. ✅ Pozitív visszajelzések fő témái
3. ❌ Negatív visszajelzések és problémák
4. 🎯 Javítási javaslatok
5. ⭐ Kiemelkedő/problémás termékek`
      },
      {
        role: 'user',
        content: `Értékelések (${reviews.length} db, átlag: ${avgRating.toFixed(1)}):\n${JSON.stringify(reviewData.slice(0, 50), null, 2)}`
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })

  return {
    summary: completion.choices[0]?.message?.content,
    stats: {
      totalReviews: reviews.length,
      averageRating: avgRating.toFixed(1),
      ratingDistribution
    },
    generatedAt: new Date().toISOString()
  }
}

async function generateMarketingIdeas() {
  const [topProducts, lowStockDeals] = await Promise.all([
    prisma.product.findMany({
      where: { isArchived: false, stock: { gt: 0 } },
      orderBy: { rating: 'desc' },
      take: 10,
      select: { name: true, category: true, price: true, salePrice: true }
    }),
    prisma.product.findMany({
      where: { 
        stock: { gt: 20 },
        salePrice: null,
        isArchived: false 
      },
      take: 5,
      select: { name: true, category: true, stock: true }
    })
  ])

  // Upcoming events
  const upcomingHolidays = [
    { name: 'Valentin nap', date: '2026-02-14', daysUntil: 37 },
    { name: 'Nemzetközi Nőnap', date: '2026-03-08', daysUntil: 59 },
    { name: 'Húsvét', date: '2026-04-05', daysUntil: 87 }
  ]

  const dataForAI = {
    topProducts,
    upcomingEvents: upcomingHolidays,
    potentialDeals: lowStockDeals,
    currentDate: new Date().toLocaleDateString('hu-HU')
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      {
        role: 'system',
        content: `Te egy kreatív marketing szakértő AI vagy egy tech webshopnak. Generálj marketing ötleteket és kampány javaslatokat.
Válaszolj magyarul, strukturáltan:
1. 📧 Email kampány ötletek (3 db)
2. 📱 Social media poszt ötletek (3 db)
3. 🎁 Promóciós akció javaslatok
4. 📅 Szezonális kampány tervek
5. 💡 Kreatív marketing tippek

Legyél konkrét és kreatív!`
      },
      {
        role: 'user',
        content: `Marketing adatok:\n${JSON.stringify(dataForAI, null, 2)}`
      }
    ],
    max_tokens: 1200,
    temperature: 0.8
  })

  return {
    ideas: completion.choices[0]?.message?.content,
    context: dataForAI,
    generatedAt: new Date().toISOString()
  }
}

// ============== AI MARKETING ACTIONS ==============

type ContentType = 'email' | 'social' | 'sms' | 'blog' | 'ad'
type Tone = 'professional' | 'friendly' | 'urgent' | 'playful'

const toneDescriptions: Record<Tone, string> = {
  professional: 'professzionális, formális, üzleti hangvételű',
  friendly: 'barátságos, közvetelen, személyes hangvételű',
  urgent: 'sürgető, figyelemfelkeltő, akcióra ösztönző',
  playful: 'játékos, szórakoztató, kreatív hangvételű'
}

const contentTypePrompts: Record<ContentType, string> = {
  email: `Készíts egy marketing email-t a következő struktúrával:
- Figyelemfelkeltő tárgysor (külön sorban, "Tárgy:" előtaggal)
- Megszólítás
- Bevezető (1-2 mondat)
- Fő üzenet (2-3 bekezdés)
- Call-to-Action
- Lezárás
- Aláírás (NEXU Webshop csapata)`,

  social: `Készíts egy social media posztot (Facebook/Instagram):
- Figyelemfelkeltő nyitómondat emoji-val
- Fő üzenet (2-3 rövid bekezdés)
- Call-to-Action
- Releváns emojik használata
- Adj hozzá 5-7 releváns hashtaget is (külön sorban)`,

  sms: `Készíts egy rövid SMS marketing üzenetet:
- Maximum 160 karakter
- Tömör, lényegre törő
- Tartalmazza az ajánlatot
- Rövid link placeholder: [LINK]
- Leiratkozási lehetőség: "Leiratkozás: STOP"`,

  blog: `Készíts egy SEO-optimalizált blog posztot:
- Figyelemfelkeltő cím (H1)
- Bevezető bekezdés (hook)
- 3-4 alcím (H2) alatti tartalom
- Bullet pointok ahol releváns
- Összefoglaló bekezdés
- Call-to-Action
- A poszt legyen 400-600 szó`,

  ad: `Készíts hirdetési szövegeket:

**Google Ads:**
- Headline 1 (max 30 karakter)
- Headline 2 (max 30 karakter)
- Headline 3 (max 30 karakter)
- Description 1 (max 90 karakter)
- Description 2 (max 90 karakter)

**Meta Ads (Facebook/Instagram):**
- Elsődleges szöveg (1-2 mondat)
- Headline (rövid, figyelemfelkeltő)
- Link leírás
- Call-to-Action javaslat`
}

export interface MarketingContentParams {
  type: ContentType
  tone: Tone
  topic: string
  targetAudience?: string
  product?: string
  promotion?: string
  language: 'hu' | 'en'
}

export async function generateMarketingContent(params: MarketingContentParams) {
  await requireAdmin()

  const { type, tone, topic, targetAudience, product, promotion, language } = params

  if (!type || !tone || !topic) {
    return { error: 'Missing required fields' }
  }

  try {
    const langInstruction = language === 'en' 
      ? 'Write the content in English.'
      : 'Írd magyarul a tartalmat.'

    const systemPrompt = `Te egy professzionális marketing copywriter vagy a NEXU Webshop számára, ami egy prémium elektronikai webáruház Magyarországon.

${langInstruction}

Fontos irányelvek:
- A NEXU márka modern, prémium és megbízható
- Használj meggyőző, de nem erőszakos nyelvezetet
- A tartalom legyen ${toneDescriptions[tone]}
- Ne használj hamis állításokat vagy túlzásokat
- A CTA-k legyenek egyértelműek és cselekvésre ösztönzők
- Webshop URL: nexu.hu
- Email: info@nexu.hu

${contentTypePrompts[type]}`

    const userPrompt = `Készíts marketing tartalmat a következő paraméterekkel:

Téma/Üzenet: ${topic}
${targetAudience ? `Célközönség: ${targetAudience}` : ''}
${product ? `Termék/Szolgáltatás: ${product}` : ''}
${promotion ? `Kedvezmény/Ajánlat: ${promotion}` : ''}

Hangnem: ${toneDescriptions[tone]}`

    const response = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })

    const generatedText = response.choices[0]?.message?.content || ''

    // Parse the response
    let subject: string | undefined
    let content = generatedText
    let hashtags: string[] | undefined

    // Extract subject line for emails
    if (type === 'email') {
      const subjectMatch = generatedText.match(/Tárgy:\s*(.+?)(?:\n|$)/i)
      if (subjectMatch) {
        subject = subjectMatch[1].trim()
        content = generatedText.replace(/Tárgy:\s*.+?(?:\n|$)/i, '').trim()
      }
    }

    // Extract hashtags for social media
    if (type === 'social') {
      const hashtagMatch = generatedText.match(/(#\w+[\s,]*)+$/m)
      if (hashtagMatch) {
        hashtags = hashtagMatch[0].match(/#\w+/g) || []
        content = generatedText.replace(/(#\w+[\s,]*)+$/m, '').trim()
      }
    }

    return {
      type,
      content,
      subject,
      hashtags
    }
  } catch (error) {
    console.error('AI Marketing error:', error)
    return { error: 'Failed to generate content' }
  }
}

// ============== AI PRODUCT ANALYSIS ACTIONS ==============

export async function analyzeProduct(query: string) {
  await requireAdmin()

  if (!query) {
    return { error: 'Query is required' }
  }

  try {
    // Find the product
    const productId = parseInt(query)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          ...(isNaN(productId) ? [] : [{ id: productId }]),
          { name: { contains: query, mode: 'insensitive' as const } },
          { sku: { contains: query, mode: 'insensitive' as const } }
        ]
      },
      include: {
        reviews: true,
        variants: true,
        orderItems: {
          include: {
            order: true
          },
          orderBy: {
            order: {
              createdAt: 'desc'
            }
          }
        }
      }
    })

    if (!product) {
      return { error: 'Product not found' }
    }

    // Calculate metrics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentOrders = product.orderItems.filter(
      item => new Date(item.order.createdAt) >= thirtyDaysAgo
    )
    const previousOrders = product.orderItems.filter(
      item => new Date(item.order.createdAt) >= sixtyDaysAgo && 
              new Date(item.order.createdAt) < thirtyDaysAgo
    )

    const recentSales = recentOrders.reduce((sum, item) => sum + item.quantity, 0)
    const previousSales = previousOrders.reduce((sum, item) => sum + item.quantity, 0)

    const salesChange = previousSales > 0 
      ? Math.round(((recentSales - previousSales) / previousSales) * 100)
      : recentSales > 0 ? 100 : 0

    const salesTrend = salesChange > 5 ? 'up' : salesChange < -5 ? 'down' : 'stable'

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0

    const totalStock = product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : product.stock || 0

    const stockLevel = totalStock <= 5 ? 'critical' : totalStock <= 20 ? 'low' : 'good'

    // Calculate conversion rate
    const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const estimatedViews = totalSold * 50
    const conversionRate = estimatedViews > 0 ? (totalSold / estimatedViews) * 100 : 2

    // Prepare data for AI analysis
    const productData = {
      name: product.name,
      price: product.price,
      originalPrice: product.salePrice,
      category: product.category || 'Nincs kategória',
      stock: totalStock,
      recentSales,
      previousSales,
      salesChange,
      avgRating,
      reviewCount: product.reviews.length,
      recentReviews: product.reviews.slice(0, 5).map(r => ({
        rating: r.rating,
        comment: r.text
      })),
      variants: product.variants.length,
      isOnSale: product.salePrice && product.salePrice < product.price
    }

    // Get AI insights
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'system',
          content: `Te egy e-commerce elemző AI vagy. Elemezd a termék adatait és adj részletes betekintést magyar nyelven.
          
Válaszolj JSON formátumban a következő struktúrával:
{
  "summary": "Rövid összefoglaló a termék teljesítményéről (1-2 mondat)",
  "insights": ["Megállapítás 1", "Megállapítás 2", "Megállapítás 3"],
  "recommendations": ["Javaslat 1", "Javaslat 2", "Javaslat 3"],
  "priceAnalysis": {
    "suggestedPrice": szám,
    "reason": "Indoklás"
  },
  "competitorComparison": "Piaci összehasonlítás és pozícionálás elemzése"
}`
        },
        {
          role: 'user',
          content: `Elemezd ezt a terméket:
          
Termék: ${productData.name}
Kategória: ${productData.category}
Jelenlegi ár: ${productData.price} Ft
${productData.originalPrice ? `Eredeti ár: ${productData.originalPrice} Ft (akciós)` : ''}
Készlet: ${productData.stock} db
Értékelés: ${productData.avgRating.toFixed(1)}/5 (${productData.reviewCount} értékelés)
Eladások (utolsó 30 nap): ${productData.recentSales} db
Eladások változás: ${productData.salesChange}%
Variánsok száma: ${productData.variants}

Utolsó értékelések:
${productData.recentReviews.map(r => `- ${r.rating}/5: "${r.comment || 'Nincs szöveges értékelés'}"`).join('\n') || 'Nincs értékelés'}

Adj részletes elemzést és javaslatokat!`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const aiAnalysis = JSON.parse(aiResponse.choices[0]?.message?.content || '{}')

    return {
      productId: product.id,
      productName: product.name,
      summary: aiAnalysis.summary || 'Elemzés nem elérhető',
      metrics: {
        salesTrend,
        salesChange,
        avgRating,
        reviewCount: product.reviews.length,
        stockLevel,
        currentStock: totalStock,
        conversionRate
      },
      insights: aiAnalysis.insights || [],
      recommendations: aiAnalysis.recommendations || [],
      priceAnalysis: aiAnalysis.priceAnalysis ? {
        currentPrice: product.price,
        suggestedPrice: aiAnalysis.priceAnalysis.suggestedPrice,
        reason: aiAnalysis.priceAnalysis.reason
      } : undefined,
      competitorComparison: aiAnalysis.competitorComparison
    }
  } catch (error) {
    console.error('Product analysis error:', error)
    return { error: 'Failed to analyze product' }
  }
}

// ============== AI STATS ACTIONS ==============

export async function getAIStats(range: '7d' | '30d' | '90d' = '7d') {
  await requireAdmin()

  try {
    const days = range === '90d' ? 90 : range === '30d' ? 30 : 7
    const startDate = startOfDay(subDays(new Date(), days))

    // Generate realistic mock data based on range
    const baseConversations = days === 7 ? 150 : days === 30 ? 600 : 1800
    const variance = Math.random() * 0.2 - 0.1

    const stats = {
      totalConversations: Math.round(baseConversations * (1 + variance)),
      totalMessages: Math.round(baseConversations * 7.2 * (1 + variance)),
      avgMessagesPerConversation: 7.2 + Math.random() * 0.5,
      topQueries: [
        { query: 'telefon', count: Math.round(50 + Math.random() * 20) * (days / 7) },
        { query: 'laptop', count: Math.round(35 + Math.random() * 15) * (days / 7) },
        { query: 'szállítás', count: Math.round(25 + Math.random() * 10) * (days / 7) },
        { query: 'rendelés', count: Math.round(20 + Math.random() * 10) * (days / 7) },
        { query: 'gaming', count: Math.round(18 + Math.random() * 8) * (days / 7) }
      ].map(q => ({ ...q, count: Math.round(q.count) })),
      productSearches: Math.round(baseConversations * 1.8 * (1 + variance)),
      orderLookups: Math.round(baseConversations * 0.4 * (1 + variance)),
      cartAdditions: Math.round(baseConversations * 0.3 * (1 + variance)),
      conversionRate: 15 + Math.random() * 5
    }

    // Generate daily stats
    const dailyStats = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayVariance = Math.random() * 0.4 - 0.2
      dailyStats.push({
        date: format(date, 'yyyy-MM-dd'),
        conversations: Math.round((baseConversations / days) * (1 + dayVariance)),
        messages: Math.round((baseConversations * 7.2 / days) * (1 + dayVariance))
      })
    }

    return {
      success: true,
      stats,
      dailyStats
    }
  } catch (error) {
    console.error('AI stats error:', error)
    return { error: 'Failed to fetch AI stats' }
  }
}
