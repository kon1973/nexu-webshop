import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Unsplash API for free stock images
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

interface GenerateRequest {
  productName: string
  category?: string
  currentDescription?: string
  tone: string
  generateImages?: boolean
  generateSpecs?: boolean
  contentType?: 'short' | 'full' | 'seo'
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GenerateRequest = await request.json()
    const { 
      productName, 
      category, 
      currentDescription, 
      tone,
      generateImages = false,
      generateSpecs = false,
      contentType = 'full'
    } = body

    if (!productName) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 })
    }

    const toneInstructions: Record<string, string> = {
      professional: 'Használj professzionális, üzleti hangnemet. Légy tömör és informatív.',
      friendly: 'Használj barátságos, közvetlen hangnemet. Szólítsd meg a vásárlót közvetlenül.',
      technical: 'Használj technikai, részletes hangnemet. Fókuszálj a műszaki specifikációkra és pontos adatokra.',
      marketing: 'Használj meggyőző, marketing hangnemet. Emeld ki az előnyöket és a vásárlói értéket.',
      luxury: 'Használj exkluzív, prémium hangnemet. Sugallj minőséget és egyediséget.',
      casual: 'Használj laza, fiatalos hangnemet. Légy kreatív és szórakoztató.'
    }

    const contentTypeInstructions: Record<string, string> = {
      short: `Készíts egy rövid, 50-80 szavas összefoglaló leírást.`,
      full: `Készíts egy teljes, 200-350 szavas részletes leírást szakaszokkal:
      - Bevezető bekezdés (2-3 mondat)
      - Főbb jellemzők (bullet pontok)
      - Használati előnyök
      - Cselekvésre ösztönző záró mondat`,
      seo: `Készíts SEO-optimalizált tartalmat:
      - H2 címsor a termékhez
      - Meta description (max 160 karakter)
      - Kulcsszavak (5-8 releváns kifejezés)
      - Részletes leírás (250-400 szó)
      - FAQ szekció (3 gyakori kérdés-válasz)`
    }

    const systemPrompt = `Te egy világszínvonalú magyar nyelvű e-commerce tartalomkészítő AI vagy.
Szakértője vagy a termékleírásoknak, SEO-nak és a konverzió-optimalizálásnak.

ALAPSZABÁLYOK:
- Írj hibátlan magyarsággal
- Kerüld a sablonos megfogalmazásokat
- Használj érzelmi triggereket (biztonság, kényelem, státusz)
- Építs be social proof elemeket ahol releváns
- ${toneInstructions[tone] || toneInstructions.professional}

TARTALMI UTASÍTÁSOK:
${contentTypeInstructions[contentType] || contentTypeInstructions.full}

FORMÁZÁS:
- Használj Markdown formázást
- **félkövér** a fontos kifejezésekhez
- Bullet pontok a jellemzőkhöz
- Számozott lista az előnyökhöz ahol releváns`

    const userPrompt = `Készíts profi termékleírást:

📦 Terméknév: ${productName}
${category ? `📂 Kategória: ${category}` : ''}
${currentDescription ? `📝 Meglévő leírás (fejleszd tovább): ${currentDescription}` : ''}

Generáld le a tartalmat a megadott formátumban!`

    // Generate description with GPT-5.2
    const descriptionResponse = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.75
    })

    const description = descriptionResponse.choices[0]?.message?.content || ''

    // Generate specifications if requested
    let specifications = null
    if (generateSpecs) {
      const specsResponse = await openai.chat.completions.create({
        model: 'gpt-5.2',
        messages: [
          {
            role: 'system',
            content: `Te egy technikai specifikáció szakértő vagy. Generálj reális és részletes műszaki specifikációkat a termékhez.
Válaszolj JSON formátumban:
{
  "specifications": [
    { "name": "Specifikáció neve", "value": "Érték" }
  ]
}
Csak a JSON-t add vissza, semmilyen más szöveget!`
          },
          {
            role: 'user',
            content: `Generálj 8-12 reális műszaki specifikációt ehhez a termékhez: ${productName} (kategória: ${category || 'általános'})`
          }
        ],
        max_tokens: 800,
        temperature: 0.5
      })

      try {
        const specsText = specsResponse.choices[0]?.message?.content || '{}'
        const jsonMatch = specsText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          specifications = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error('Specs parsing error:', e)
      }
    }

    // Search for relevant images if requested
    let images: { url: string; alt: string; source: string }[] = []
    if (generateImages && UNSPLASH_ACCESS_KEY) {
      try {
        // Create search query from product name
        const searchQuery = productName.split(' ').slice(0, 3).join(' ')
        
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=6&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
          }
        )

        if (unsplashResponse.ok) {
          const unsplashData = await unsplashResponse.json()
          images = unsplashData.results?.map((img: any) => ({
            url: img.urls.regular,
            thumbnail: img.urls.thumb,
            alt: img.alt_description || productName,
            source: 'Unsplash',
            photographer: img.user?.name,
            downloadUrl: img.links?.download
          })) || []
        }
      } catch (e) {
        console.error('Image search error:', e)
      }
    }

    // Generate SEO metadata
    const seoResponse = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'system',
          content: `Generálj SEO metaadatokat a termékhez. Válaszolj JSON formátumban:
{
  "metaTitle": "Max 60 karakter",
  "metaDescription": "Max 155 karakter",
  "keywords": ["kulcsszó1", "kulcsszó2"],
  "slug": "url-friendly-slug"
}
Csak a JSON-t add vissza!`
        },
        {
          role: 'user',
          content: `Termék: ${productName}, Kategória: ${category || 'általános'}`
        }
      ],
      max_tokens: 300,
      temperature: 0.5
    })

    let seoData = null
    try {
      const seoText = seoResponse.choices[0]?.message?.content || '{}'
      const jsonMatch = seoText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        seoData = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('SEO parsing error:', e)
    }

    return NextResponse.json({
      success: true,
      description: description.trim(),
      specifications,
      images,
      seo: seoData,
      model: 'gpt-5.2'
    })
  } catch (error) {
    console.error('Description generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}
