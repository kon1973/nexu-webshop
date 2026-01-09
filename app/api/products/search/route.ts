import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query.trim()) {
      return NextResponse.json({ products: [] })
    }

    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true
      },
      take: 10,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Product search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
