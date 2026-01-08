import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Search products for AI chatbot
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '5', 10)
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!, 10) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : undefined
  const inStock = searchParams.get('inStock') === 'true'

  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: { not: true },
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ]
        }),
        ...(category && { category: { contains: category, mode: 'insensitive' } }),
        ...(inStock && { stock: { gt: 0 } }),
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      },
      orderBy: [
        { rating: 'desc' },
        { stock: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        salePrice: true,
        image: true,
        images: true,
        category: true,
        stock: true,
        rating: true,
        _count: { select: { reviews: true } }
      }
    })

    // Format products for chat display
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description?.slice(0, 150) + (p.description && p.description.length > 150 ? '...' : ''),
      price: p.price,
      salePrice: p.salePrice,
      image: p.image || p.images?.[0],
      category: p.category,
      stock: p.stock,
      rating: p.rating,
      reviewCount: p._count.reviews,
      url: `/shop/${p.slug || p.id}`,
      inStock: p.stock > 0,
      isOnSale: !!p.salePrice
    }))

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      count: formattedProducts.length
    })
  } catch (error) {
    console.error('AI Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed', products: [] },
      { status: 500 }
    )
  }
}
