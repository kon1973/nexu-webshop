import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json()

    switch (type) {
      case 'sales-insights':
        return NextResponse.json(await generateSalesInsights())
      case 'inventory-alerts':
        return NextResponse.json(await generateInventoryAlerts())
      case 'pricing-suggestions':
        return NextResponse.json(await generatePricingSuggestions())
      case 'review-summary':
        return NextResponse.json(await generateReviewSummary())
      case 'marketing-ideas':
        return NextResponse.json(await generateMarketingIdeas())
      default:
        return NextResponse.json({ error: 'Unknown analysis type' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
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
    // Products with no sales in 30 days but in stock
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
  const [topProducts, upcomingHolidays, lowStockDeals] = await Promise.all([
    prisma.product.findMany({
      where: { isArchived: false, stock: { gt: 0 } },
      orderBy: { rating: 'desc' },
      take: 10,
      select: { name: true, category: true, price: true, salePrice: true }
    }),
    // Simulate upcoming events
    Promise.resolve([
      { name: 'Valentin nap', date: '2026-02-14', daysUntil: 37 },
      { name: 'Nemzetközi Nőnap', date: '2026-03-08', daysUntil: 59 },
      { name: 'Húsvét', date: '2026-04-05', daysUntil: 87 }
    ]),
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
