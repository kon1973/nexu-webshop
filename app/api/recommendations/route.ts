import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Product } from '@prisma/client'

type ProductWithExtras = Product & {
  variants: { id: string }[]
  _count: { reviews: number }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const excludeId = searchParams.get('excludeId')
  const category = searchParams.get('category')
  const recentlyViewed = searchParams.get('recentlyViewed')?.split(',').filter(Boolean) || []
  const cartCategories = searchParams.get('cartCategories')?.split(',').filter(Boolean) || []
  const limit = parseInt(searchParams.get('limit') || '4', 10)

  try {
    let products: ProductWithExtras[] = []
    let recommendationType: 'personalized' | 'trending' = 'trending'

    // If we have context (recently viewed or cart items), try personalized recommendations
    if (recentlyViewed.length > 0 || cartCategories.length > 0) {
      // Get categories from recently viewed products
      const recentCategories = await prisma.product.findMany({
        where: {
          OR: [
            { id: { in: recentlyViewed.map(id => parseInt(id, 10)).filter(id => !isNaN(id)) } },
            { slug: { in: recentlyViewed } }
          ]
        },
        select: { category: true }
      })

      const allCategories = [
        ...new Set([
          ...recentCategories.map(p => p.category),
          ...cartCategories,
          category
        ].filter(Boolean))
      ]

      if (allCategories.length > 0) {
        // Find products from same categories, ordered by rating and sales
        products = await prisma.product.findMany({
          where: {
            category: { in: allCategories as string[] },
            stock: { gt: 0 },
            isArchived: { not: true },
            ...(excludeId && { id: { not: parseInt(excludeId, 10) } })
          },
          orderBy: [
            { rating: 'desc' },
            { createdAt: 'desc' }
          ],
          take: limit,
          include: {
            variants: { select: { id: true } },
            _count: { select: { reviews: true } }
          }
        })

        if (products.length > 0) {
          recommendationType = 'personalized'
        }
      }
    }

    // Fallback to trending products if no personalized results
    if (products.length === 0) {
      products = await prisma.product.findMany({
        where: {
          stock: { gt: 0 },
          isArchived: { not: true },
          ...(excludeId && { id: { not: parseInt(excludeId, 10) } })
        },
        orderBy: [
          { rating: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        include: {
          variants: { select: { id: true } },
          _count: { select: { reviews: true } }
        }
      })
      recommendationType = 'trending'
    }

    // If still no products and we have a category, get from that category
    if (products.length === 0 && category) {
      products = await prisma.product.findMany({
        where: {
          category,
          stock: { gt: 0 },
          isArchived: { not: true },
          ...(excludeId && { id: { not: parseInt(excludeId, 10) } })
        },
        orderBy: { rating: 'desc' },
        take: limit,
        include: {
          variants: { select: { id: true } },
          _count: { select: { reviews: true } }
        }
      })
    }

    return NextResponse.json({
      products,
      type: recommendationType,
      count: products.length
    })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', products: [], type: 'trending' },
      { status: 500 }
    )
  }
}
