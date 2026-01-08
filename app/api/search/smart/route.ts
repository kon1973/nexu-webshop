import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Cache for search suggestions (simple in-memory cache)
const suggestionCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase().trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Check cache
    const cached = suggestionCache.get(query)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Get matching products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: true
      },
      take: 5
    })

    // Get categories that match
    const categoriesRaw = await prisma.category.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      take: 3
    })
    
    // Get product count for each category
    const categories = await Promise.all(
      categoriesRaw.map(async (cat) => {
        const productCount = await prisma.product.count({
          where: { category: cat.slug }
        })
        return { ...cat, productCount }
      })
    )

    // Generate AI suggestions if we have few results
    let aiSuggestions: string[] = []
    if (products.length < 3 && process.env.OPENAI_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-5-mini',
          messages: [
            {
              role: 'system',
              content: `Te egy webshop keresési asszisztens vagy. A felhasználó keresett valamire, de kevés találatot kapott.
Javasolj alternatív keresési kifejezéseket magyarul.
Válaszolj csak a keresési kifejezésekkel, vesszővel elválasztva, maximum 5 javaslat.
Ne írj mást, csak a kifejezéseket.`
            },
            {
              role: 'user',
              content: `A felhasználó a következőre keresett: "${query}". Milyen hasonló vagy kapcsolódó kifejezéseket javasolsz?`
            }
          ],
          max_tokens: 100,
          temperature: 0.5
        })

        const suggestions = completion.choices[0]?.message?.content?.split(',').map(s => s.trim()).filter(Boolean) || []
        aiSuggestions = suggestions.slice(0, 5)
      } catch (e) {
        console.error('AI suggestion error:', e)
      }
    }

    // Get popular searches (mock data for now)
    const popularSearches = [
      'iPhone',
      'Samsung Galaxy',
      'laptop',
      'gaming',
      'tablet'
    ].filter(s => s.toLowerCase().includes(query) || query.includes(s.toLowerCase())).slice(0, 3)

    const result = {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.images[0] || null,
        category: p.category
      })),
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c.productCount
      })),
      aiSuggestions,
      popularSearches,
      query
    }

    // Cache the result
    suggestionCache.set(query, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Smart search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
