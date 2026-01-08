import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productName, category, currentDescription, tone } = await request.json()

    if (!productName) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 })
    }

    const toneInstructions: Record<string, string> = {
      professional: 'Használj professzionális, üzleti hangnemet. Légy tömör és informatív.',
      friendly: 'Használj barátságos, közvetlen hangnemet. Szólítsd meg a vásárlót közvetlenül.',
      technical: 'Használj technikai, részletes hangnemet. Fókuszálj a műszaki specifikációkra.',
      marketing: 'Használj meggyőző, marketing hangnemet. Emeld ki az előnyöket és a vásárlói értéket.'
    }

    const systemPrompt = `Te egy magyar nyelvű e-commerce termékleírás szakértő vagy.
A feladatod vonzó, SEO-optimalizált termékleírások készítése.

Szabályok:
- Írj magyarul, helyesírási hibák nélkül
- Használj rövid, lényegre törő mondatokat
- Emeld ki a termék legfontosabb előnyeit
- Tartsd a leírást 150-250 szó között
- ${toneInstructions[tone] || toneInstructions.professional}
- Ne használj túlzó jelzőket ("legjobb", "tökéletes")
- Használj bullet pointokat ahol releváns
- Zárd egy cselekvésre ösztönző mondattal`

    const userPrompt = `Készíts termékleírást a következő termékhez:

Terméknév: ${productName}
${category ? `Kategória: ${category}` : ''}
${currentDescription ? `Jelenlegi leírás (inspirációnak): ${currentDescription}` : ''}

Generálj egy új, vonzó termékleírást!`

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const description = response.choices[0]?.message?.content || ''

    return NextResponse.json({
      success: true,
      description: description.trim()
    })
  } catch (error) {
    console.error('Description generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}
