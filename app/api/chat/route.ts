import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { prisma } from '@/lib/prisma'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// System prompt that defines the chatbot's behavior
const getSystemPrompt = async () => {
  // Fetch some product categories and popular products for context
  const categories = await prisma.category.findMany({
    take: 10,
    select: { name: true, slug: true }
  })
  
  const popularProducts = await prisma.product.findMany({
    take: 5,
    where: { stock: { gt: 0 } },
    orderBy: { rating: 'desc' },
    select: { name: true, price: true, category: true }
  })

  const categoryList = categories.map(c => c.name).join(', ')
  const productList = popularProducts.map(p => `${p.name} (${p.price.toLocaleString('hu-HU')} Ft)`).join(', ')

  return `Te a NEXU Store AI asszisztense vagy, egy magyar nyelvű elektronikai webshop chatbotja. 
  
Feladataid:
- Segíts a vásárlóknak termékeket találni
- Válaszolj a gyakori kérdésekre (szállítás, fizetés, garancia)
- Adj termékajánlásokat az igények alapján
- Légy udvarias és segítőkész

Fontos információk a boltról:
- Termékkategóriák: ${categoryList}
- Népszerű termékek: ${productList}
- Ingyenes szállítás 20.000 Ft felett
- Fizetési módok: Bankkártya (Stripe), Utánvét
- 14 napos visszaküldési jog
- Szállítási idő: 1-3 munkanap

Szabályok:
- Mindig magyarul válaszolj
- Legyél tömör de informatív
- Ha nem tudsz valamit, irányítsd a vásárlót a kapcsolat oldalra
- Ne adj ki hamis információt
- Linkekhez használd a /shop, /contact, /faq útvonalakat`
}

export async function POST(req: Request) {
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI szolgáltatás nincs konfigurálva' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { messages } = await req.json()
    
    const systemPrompt = await getSystemPrompt()

    const result = streamText({
      model: openai('gpt-4o-mini'), // Cost-effective model for chat
      system: systemPrompt,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Hiba történt a válasz generálása közben' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
