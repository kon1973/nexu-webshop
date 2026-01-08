import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ============== TOOL FUNCTIONS ==============

// Search products in database
async function searchProducts(query?: string, category?: string, maxPrice?: number, minPrice?: number, inStock?: boolean, sortBy?: string) {
  const where: any = { isArchived: false }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.category = { contains: category, mode: 'insensitive' }
  }

  if (maxPrice) {
    where.price = { ...where.price, lte: maxPrice }
  }

  if (minPrice) {
    where.price = { ...where.price, gte: minPrice }
  }

  if (inStock) {
    where.stock = { gt: 0 }
  }

  const orderBy: any = sortBy === 'price_asc' ? { price: 'asc' } 
    : sortBy === 'price_desc' ? { price: 'desc' }
    : sortBy === 'newest' ? { createdAt: 'desc' }
    : { rating: 'desc' }

  const products = await prisma.product.findMany({
    where,
    take: 6,
    orderBy
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.salePrice || p.price,
    originalPrice: p.salePrice ? p.price : null,
    category: p.category,
    rating: p.rating || 4.5,
    inStock: p.stock > 0,
    stock: p.stock,
    image: p.image,
    url: `/shop/${p.id}`
  }))
}

// Get product details
async function getProductDetails(productId: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      reviews: {
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      }
    }
  })

  if (!product) return null

  return {
    id: product.id,
    name: product.name,
    price: product.salePrice || product.price,
    originalPrice: product.salePrice ? product.price : null,
    description: product.description,
    fullDescription: product.fullDescription,
    category: product.category,
    rating: product.rating,
    stock: product.stock,
    inStock: product.stock > 0,
    specifications: product.specifications,
    reviews: product.reviews.map(r => ({
      rating: r.rating,
      comment: r.text,
      author: r.user?.name || r.userName || 'Anonim'
    })),
    url: `/shop/${product.id}`
  }
}

// Lookup order by email or order ID
async function lookupOrder(email?: string, orderId?: string) {
  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    })
    if (order) {
      return {
        found: true,
        order: {
          id: order.id,
          status: order.status,
          total: order.totalPrice,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          items: order.items.filter(i => i.product).map(i => ({
            name: i.product?.name || i.name || 'Termék',
            quantity: i.quantity,
            price: i.price
          }))
        }
      }
    }
  }

  if (email) {
    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: { include: { product: true } } }
    })
    
    if (orders.length > 0) {
      return {
        found: true,
        orders: orders.map(o => ({
          id: o.id,
          status: o.status,
          total: o.totalPrice,
          createdAt: o.createdAt,
          itemCount: o.items.length
        }))
      }
    }
  }

  return { found: false }
}

// Compare products
async function compareProducts(productIds: number[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.salePrice || p.price,
    category: p.category,
    rating: p.rating,
    stock: p.stock,
    specifications: p.specifications,
    url: `/shop/${p.id}`
  }))
}

// Get FAQ answers
function getFAQAnswer(topic: string): string {
  const faqs: Record<string, string> = {
    'szállítás': '🚚 Szállítási információk:\n- GLS futár: 1.990 Ft (1-3 munkanap)\n- Ingyenes szállítás 20.000 Ft felett!\n- Csomagpont: 1.490 Ft\n- Express szállítás: 2.990 Ft (másnap)',
    'fizetés': '💳 Fizetési módok:\n- Bankkártya (Visa, Mastercard)\n- PayPal\n- Utánvét (+500 Ft)\n- Átutalás',
    'visszaküldés': '↩️ Visszaküldés:\n- 14 napos elállási jog\n- Ingyenes visszaküldés hibás termék esetén\n- Visszaküldési címke kérése: info@nexustore.hu',
    'garancia': '🛡️ Garancia:\n- 2 év gyártói garancia minden termékre\n- 30 napos pénzvisszafizetési garancia\n- Szerviz: support@nexustore.hu',
    'kapcsolat': '📞 Kapcsolat:\n- Email: info@nexustore.hu\n- Telefon: +36 1 234 5678\n- Nyitvatartás: H-P 9:00-17:00',
    'kupon': '🎟️ Kuponok:\n- Iratkozz fel hírlevelünkre 10% kedvezményért!\n- Első vásárláskor: ELSO10 kupon\n- Szezonális akciókért kövesd Facebook oldalunkat!'
  }

  const key = Object.keys(faqs).find(k => topic.toLowerCase().includes(k))
  return key ? faqs[key] : 'Kérlek pontosítsd a kérdésed, vagy válaszd az alábbi témák egyikét: szállítás, fizetés, visszaküldés, garancia, kapcsolat, kupon'
}

// Get trending/popular products
async function getTrendingProducts() {
  const products = await prisma.product.findMany({
    where: { isArchived: false, stock: { gt: 0 } },
    orderBy: { rating: 'desc' },
    take: 4
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.salePrice || p.price,
    rating: p.rating,
    url: `/shop/${p.id}`
  }))
}

// ============== MAIN CHAT PROCESSING ==============

async function getStoreContext() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({ select: { category: true }, distinct: ['category'], where: { isArchived: false } }),
    prisma.setting.findUnique({ where: { key: 'siteName' } })
  ])

  return {
    storeName: settings?.value || 'NEXU Store',
    categories: products.map((p: { category: string }) => p.category),
  }
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'searchProducts',
      description: 'Keresés termékek között. Használd amikor a felhasználó termékeket keres vagy böngészik.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Keresési kifejezés' },
          category: { type: 'string', description: 'Kategória (pl: Telefonok, Laptopok, Gaming, Kiegészítők)' },
          maxPrice: { type: 'number', description: 'Maximum ár forintban' },
          minPrice: { type: 'number', description: 'Minimum ár forintban' },
          inStock: { type: 'boolean', description: 'Csak készleten lévő termékek' },
          sortBy: { type: 'string', enum: ['rating', 'price_asc', 'price_desc', 'newest'], description: 'Rendezés' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getProductDetails',
      description: 'Részletes termék információk lekérése (leírás, specifikációk, vélemények)',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'number', description: 'A termék azonosítója' }
        },
        required: ['productId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'lookupOrder',
      description: 'Rendelés keresése email cím vagy rendelésszám alapján',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Vásárló email címe' },
          orderId: { type: 'string', description: 'Rendelés azonosító' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'compareProducts',
      description: 'Termékek összehasonlítása',
      parameters: {
        type: 'object',
        properties: {
          productIds: { type: 'array', items: { type: 'number' }, description: 'Összehasonlítandó termékek ID-i' }
        },
        required: ['productIds']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getFAQAnswer',
      description: 'Gyakori kérdésekre válasz (szállítás, fizetés, visszaküldés, garancia, kapcsolat, kupon)',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Téma: szállítás, fizetés, visszaküldés, garancia, kapcsolat, kupon' }
        },
        required: ['topic']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getTrendingProducts',
      description: 'Népszerű/trendi termékek lekérése',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'addToCart',
      description: 'Termék kosárba helyezése. Visszaadja a termék adatait a kosárba helyezéshez.',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'number', description: 'A termék azonosítója' },
          quantity: { type: 'number', description: 'Mennyiség (alapértelmezett: 1)' }
        },
        required: ['productId']
      }
    }
  }
]

async function executeFunction(name: string, args: any): Promise<any> {
  switch (name) {
    case 'searchProducts':
      return await searchProducts(args.query, args.category, args.maxPrice, args.minPrice, args.inStock, args.sortBy)
    case 'getProductDetails':
      return await getProductDetails(args.productId)
    case 'lookupOrder':
      return await lookupOrder(args.email, args.orderId)
    case 'compareProducts':
      return await compareProducts(args.productIds)
    case 'getFAQAnswer':
      return getFAQAnswer(args.topic)
    case 'getTrendingProducts':
      return await getTrendingProducts()
    case 'addToCart':
      const product = await prisma.product.findUnique({ where: { id: args.productId } })
      if (!product) return { success: false, message: 'Termék nem található' }
      if (product.stock < (args.quantity || 1)) return { success: false, message: 'Nincs elegendő készlet' }
      return {
        success: true,
        action: 'ADD_TO_CART',
        product: {
          id: product.id,
          name: product.name,
          price: product.salePrice || product.price,
          quantity: args.quantity || 1,
          image: product.image
        }
      }
    default:
      return { error: 'Unknown function' }
  }
}

async function processChat(messages: any[]) {
  const storeContext = await getStoreContext()

  const systemMessage = {
    role: 'system' as const,
    content: `Te a ${storeContext.storeName} webshop AI értékesítési asszisztense vagy, a neved NEXU AI.

## Személyiség
- Barátságos, segítőkész és professzionális
- Magyarul válaszolsz, természetes stílusban
- Használj emoji-kat mértékkel a barátságosságért

## Képességeid
1. **Termékkeresés** - Keress termékeket név, kategória, ár vagy egyéb szempontok alapján
2. **Termék részletek** - Adj részletes információt termékekről (specifikációk, vélemények)
3. **Rendelés követés** - Segíts megtalálni rendeléseket email vagy rendelésszám alapján
4. **Összehasonlítás** - Hasonlíts össze termékeket
5. **FAQ** - Válaszolj gyakori kérdésekre (szállítás, fizetés, garancia, stb.)
6. **Kosárba helyezés** - Segíts termékeket kosárba tenni

## Elérhető kategóriák
${storeContext.categories.join(', ')}

## Fontos szabályok
- MINDIG használj tool-t ha releváns (ne találj ki adatokat)
- Termékek említésekor adj linket: [Terméknév](/shop/ID)
- Ha kosárba helyezel, használd az addToCart funkciót
- Légy tömör de informatív
- Ha nem találsz terméket, ajánlj alternatívákat

## Üdvözlés után
Kínáld fel a segítséget: termékkeresés, rendelés követés, vagy kérdések megválaszolása.`
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [systemMessage, ...messages],
    tools,
    tool_choice: 'auto',
    max_tokens: 1500,
    temperature: 0.7,
  })

  const assistantMessage = response.choices[0].message
  let products: any[] = []
  let cartAction: any = null
  let orderInfo: any = null

  // Handle tool calls
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    const toolResults: any[] = []

    for (const toolCall of assistantMessage.tool_calls) {
      // Type guard for function tool calls
      if ('function' in toolCall) {
        const args = JSON.parse(toolCall.function.arguments)
        const result = await executeFunction(toolCall.function.name, args)

        // Collect special results
        if (toolCall.function.name === 'searchProducts' || toolCall.function.name === 'getTrendingProducts') {
          products = result
        }
        if (toolCall.function.name === 'addToCart' && result.success) {
          cartAction = result
        }
        if (toolCall.function.name === 'lookupOrder') {
          orderInfo = result
        }

        toolResults.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        })
      }
    }

    // Get final response with tool results
    const finalResponse = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        systemMessage,
        ...messages,
        assistantMessage,
        ...toolResults
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    return {
      content: finalResponse.choices[0].message.content,
      products,
      cartAction,
      orderInfo
    }
  }

  return {
    content: assistantMessage.content,
    products: [],
    cartAction: null,
    orderInfo: null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const formattedMessages = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role,
        content: m.content
      }))

    const result = await processChat(formattedMessages)

    return NextResponse.json({
      content: result.content,
      products: result.products,
      cartAction: result.cartAction,
      orderInfo: result.orderInfo
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
