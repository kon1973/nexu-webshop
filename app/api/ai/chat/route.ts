import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const chatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
})

// System prompt for the shopping assistant
const systemPrompt = `Neved: NEXU AI Asszisztens. Te egy barátságos és segítőkész magyar webáruház AI asszisztens vagy a NEXU Store-ban.

Feladataid:
1. Segíteni a vásárlóknak termékeket keresni és ajánlani
2. Válaszolni a termékekkel kapcsolatos kérdésekre
3. Segíteni a vásárlási döntésekben
4. Akciók és ajánlatok bemutatása
5. Összehasonlítani termékeket

Stílus:
- Barátságos és közvetlen
- Használj emoji-kat mértékkel
- Magyar nyelven válaszolj
- Legyél tömör de informatív
- Ha nem tudsz valamit, mondd el őszintén

Kategóriák a boltban: Telefonok, Laptopok, Tablet, Gaming, TV, Hang, Kellékek, Okoseszközök

Ha a felhasználó terméket keres, mindig jelezd, hogy keresni fogsz a kínálatban.
Ha árat kérdez, HUF-ban (Ft) válaszolj.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = chatSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    const { message, history = [] } = validation.data

    // Check if user is asking for products
    const productKeywords = [
      'keresek', 'mutasd', 'ajánlj', 'termék', 'telefon', 'laptop', 'tablet', 
      'gaming', 'tv', 'fejhallgató', 'akció', 'olcsó', 'drága', 'legjobb',
      'top', 'népszerű', 'új', 'készlet', 'ár', 'ft', 'forint', 'vásárol',
      'összehasonlít', 'különbség', 'ajándék', 'csomag'
    ]
    
    const lowerMessage = message.toLowerCase()
    const isProductQuery = productKeywords.some(kw => lowerMessage.includes(kw))
    
    let products: any[] = []
    let searchContext = ''

    if (isProductQuery) {
      // Extract potential search terms and filters
      const priceMatch = lowerMessage.match(/(\d+)\s*(ezer|ft|forint)/i)
      const maxPrice = priceMatch 
        ? parseInt(priceMatch[1]) * (priceMatch[2].toLowerCase() === 'ezer' ? 1000 : 1) 
        : undefined

      // Determine category from message
      let category: string | undefined
      const categoryMap: Record<string, string> = {
        'telefon': 'Telefonok',
        'mobil': 'Telefonok',
        'laptop': 'Laptopok',
        'notebook': 'Laptopok',
        'tablet': 'Tablet',
        'gaming': 'Gaming',
        'játék': 'Gaming',
        'tv': 'TV',
        'tévé': 'TV',
        'fejhallgató': 'Hang',
        'hangszóró': 'Hang',
        'fülhallgató': 'Hang'
      }

      for (const [keyword, cat] of Object.entries(categoryMap)) {
        if (lowerMessage.includes(keyword)) {
          category = cat
          break
        }
      }

      // Check for sale/discount keywords
      const wantsSale = ['akció', 'leárazás', 'kedvezmény', 'olcsó'].some(kw => lowerMessage.includes(kw))

      // Search products
      const searchResults = await prisma.product.findMany({
        where: {
          isArchived: { not: true },
          stock: { gt: 0 },
          ...(category && { category }),
          ...(maxPrice && { price: { lte: maxPrice } }),
          ...(wantsSale && { salePrice: { not: null } })
        },
        orderBy: [
          ...(wantsSale ? [{ salePercentage: 'desc' as const }] : []),
          { rating: 'desc' as const },
          { stock: 'desc' as const }
        ],
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          image: true,
          category: true,
          rating: true,
          stock: true
        }
      })

      products = searchResults
      
      if (products.length > 0) {
        searchContext = `\n\nTalált termékek a kínálatból:\n${products.map((p, i) => 
          `${i + 1}. ${p.name} - ${p.salePrice ? `${p.salePrice.toLocaleString('hu-HU')} Ft (eredeti: ${p.price.toLocaleString('hu-HU')} Ft)` : `${p.price.toLocaleString('hu-HU')} Ft`} - Értékelés: ${p.rating}/5`
        ).join('\n')}`
      } else {
        searchContext = '\n\nSajnos nem találtam megfelelő terméket a keresési feltételek alapján.'
      }
    }

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({
          role: h.role as 'user' | 'assistant',
          content: h.content
        })),
        {
          role: 'user' as const,
          content: message + searchContext
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const text = completion.choices[0]?.message?.content || 'Elnézést, nem sikerült választ generálnom.'

    // Generate quick replies based on context
    const quickReplies: string[] = []
    if (products.length > 0) {
      quickReplies.push('Részletek az elsőről', 'Van olcsóbb?', 'Összehasonlítás')
    } else if (isProductQuery) {
      quickReplies.push('Másik kategória', 'Nagyobb költségkeret')
    }

    return NextResponse.json({
      message: text,
      products: products.length > 0 ? products : undefined,
      quickReplies: quickReplies.length > 0 ? quickReplies : undefined
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Elnézést, hiba történt. Próbáld újra!' },
      { status: 500 }
    )
  }
}
