import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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

    // Calculate conversion rate (views to purchases - estimated)
    const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const estimatedViews = totalSold * 50 // Estimate: 2% conversion rate baseline
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

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Product analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze product' },
      { status: 500 }
    )
  }
}
