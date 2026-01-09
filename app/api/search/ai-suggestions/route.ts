import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get AI-powered search suggestions
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Get personalized suggestions based on user history
    let personalizedSuggestions: string[] = []
    let recentProducts: any[] = []

    if (session?.user?.id) {
      // Get user's order history for personalization
      const userOrders = await prisma.order.findMany({
        where: { userId: session.user.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      // Extract categories from orders
      const categories = new Set<string>()
      userOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.product?.category) {
            categories.add(item.product.category)
          }
        })
      })

      // Generate suggestions based on purchase history
      if (categories.size > 0) {
        const categoryArray = Array.from(categories)
        personalizedSuggestions = categoryArray.map(cat => {
          const suggestions: Record<string, string[]> = {
            'Telefonok': ['telefon tok', 'töltő', 'fólia', 'powerbank'],
            'Laptopok': ['laptop táska', 'egér', 'billentyűzet', 'monitor'],
            'Gaming': ['gaming headset', 'gaming szék', 'kontroller'],
            'Tablet': ['tablet tok', 'stylus toll', 'billentyűzet'],
            'TV': ['soundbar', 'HDMI kábel', 'fali tartó'],
            'Hang': ['fülhallgató tok', 'fejhallgató állvány']
          }
          return suggestions[cat]?.[Math.floor(Math.random() * (suggestions[cat]?.length || 1))] || cat
        }).filter(Boolean).slice(0, 4)
      }

      // Get recently viewed products
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: { 
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              slug: true,
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 4
      })

      recentProducts = favorites.map(f => f.product)
    }

    // Get general trending suggestions
    const trendingSuggestions = [
      'iPhone 16 Pro Max',
      'Samsung Galaxy S25 Ultra',
      'MacBook Air M3',
      'AirPods Pro 2',
      'PS5 kontroller'
    ]

    // Combine suggestions
    const suggestions = personalizedSuggestions.length > 0
      ? [...personalizedSuggestions, ...trendingSuggestions.slice(0, 3)]
      : trendingSuggestions

    // Get some popular products if no recent ones
    if (recentProducts.length === 0) {
      const popularProducts = await prisma.product.findMany({
        where: {
          isArchived: { not: true },
          stock: { gt: 0 }
        },
        orderBy: { rating: 'desc' },
        take: 4,
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          slug: true,
          category: true
        }
      })
      recentProducts = popularProducts
    }

    return NextResponse.json({
      suggestions: [...new Set(suggestions)].slice(0, 6),
      recentProducts
    })
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    
    return NextResponse.json({
      suggestions: [
        'iPhone 16 Pro',
        'Samsung Galaxy',
        'Laptop',
        'Fülhallgató',
        'Gaming'
      ],
      recentProducts: []
    })
  }
}
