import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Search products in database
async function searchProducts(query: string, category?: string, maxPrice?: number, inStock?: boolean) {
  const where: any = {}

  // Search by name or description
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  }

  // Filter by category (category is a string in this schema)
  if (category) {
    where.category = { contains: category, mode: 'insensitive' }
  }

  // Filter by price
  if (maxPrice) {
    where.price = { lte: maxPrice }
  }

  // Filter by stock
  if (inStock) {
    where.stock = { gt: 0 }
  }

  const products = await prisma.product.findMany({
    where,
    take: 5,
    orderBy: { rating: 'desc' }
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.salePrice || p.price,
    originalPrice: p.salePrice ? p.price : null,
    category: p.category,
    rating: p.rating || 4.5,
    inStock: p.stock > 0,
    url: `/shop/${p.id}`
  }))
}

// Get store context
async function getStoreContext() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({ select: { category: true }, distinct: ['category'] }),
    prisma.setting.findUnique({ where: { key: 'siteName' } })
  ])

  return {
    storeName: settings?.value || 'NEXU Store',
    categories: products.map((p: { category: string }) => p.category),
    shippingInfo: 'Ingyenes szállítás 20.000 Ft felett, egyébként 1.990 Ft',
    returnPolicy: '14 napos visszaküldési jog',
    paymentMethods: 'Bankkártya, PayPal, Utánvét'
  }
}

// Process the messages and handle tool calls
async function processChat(messages: any[]) {
  const storeContext = await getStoreContext()

  const systemMessage = {
    role: 'system',
    content: `Te a ${storeContext.storeName} webshop AI értékesítési asszisztense vagy. 
    
Feladatod:
- Segíts a vásárlóknak megtalálni a megfelelő termékeket
- Adj részletes információkat a termékekről
- Válaszolj udvariasan és segítőkészen magyarul

Elérhető kategóriák: ${storeContext.categories.join(', ')}

Szállítási információ: ${storeContext.shippingInfo}
Visszaküldés: ${storeContext.returnPolicy}
Fizetési módok: ${storeContext.paymentMethods}

FONTOS: Ha a felhasználó termékeket keres, használd a searchProducts funkciót!
Ha termékeket találsz, formázd szépen a választ és adj linkeket: [Terméknév](/shop/ID)

Válaszolj röviden és lényegre törően!`
  }

  // Call OpenAI with function calling
  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [systemMessage, ...messages],
    functions: [
      {
        name: 'searchProducts',
        description: 'Keresés a termékek között név, kategória, ár vagy készlet alapján',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Keresési kifejezés (terméknév vagy leírás)'
            },
            category: {
              type: 'string',
              description: 'Kategória neve (pl: Telefonok, Laptopok, Gaming)'
            },
            maxPrice: {
              type: 'number',
              description: 'Maximum ár forintban'
            },
            inStock: {
              type: 'boolean',
              description: 'Csak készleten lévő termékek'
            }
          }
        }
      }
    ],
    function_call: 'auto',
    max_tokens: 1000,
    temperature: 0.7,
  })

  const assistantMessage = response.choices[0].message

  // Check if function was called
  if (assistantMessage.function_call) {
    const functionName = assistantMessage.function_call.name
    const functionArgs = JSON.parse(assistantMessage.function_call.arguments)

    if (functionName === 'searchProducts') {
      const products = await searchProducts(
        functionArgs.query,
        functionArgs.category,
        functionArgs.maxPrice,
        functionArgs.inStock
      )

      // Call OpenAI again with the function result
      const functionResult = {
        role: 'function' as const,
        name: 'searchProducts',
        content: JSON.stringify({
          found: products.length > 0,
          count: products.length,
          products
        })
      }

      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          systemMessage,
          ...messages,
          assistantMessage,
          functionResult
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      return {
        content: finalResponse.choices[0].message.content,
        products
      }
    }
  }

  return {
    content: assistantMessage.content,
    products: []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Filter and format messages for OpenAI
    const formattedMessages = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role,
        content: m.content
      }))

    const result = await processChat(formattedMessages)

    return NextResponse.json({
      content: result.content,
      products: result.products
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
