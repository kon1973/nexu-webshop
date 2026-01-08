import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

type ContentType = 'email' | 'social' | 'sms' | 'blog' | 'ad'
type Tone = 'professional' | 'friendly' | 'urgent' | 'playful'

const toneDescriptions: Record<Tone, string> = {
  professional: 'professzionális, formális, üzleti hangvételű',
  friendly: 'barátságos, közvetelen, személyes hangvételű',
  urgent: 'sürgető, figyelemfelkeltő, akcióra ösztönző',
  playful: 'játékos, szórakoztató, kreatív hangvételű'
}

const contentTypePrompts: Record<ContentType, string> = {
  email: `Készíts egy marketing email-t a következő struktúrával:
- Figyelemfelkeltő tárgysor (külön sorban, "Tárgy:" előtaggal)
- Megszólítás
- Bevezető (1-2 mondat)
- Fő üzenet (2-3 bekezdés)
- Call-to-Action
- Lezárás
- Aláírás (NEXU Webshop csapata)`,

  social: `Készíts egy social media posztot (Facebook/Instagram):
- Figyelemfelkeltő nyitómondat emoji-val
- Fő üzenet (2-3 rövid bekezdés)
- Call-to-Action
- Releváns emojik használata
- Adj hozzá 5-7 releváns hashtaget is (külön sorban)`,

  sms: `Készíts egy rövid SMS marketing üzenetet:
- Maximum 160 karakter
- Tömör, lényegre törő
- Tartalmazza az ajánlatot
- Rövid link placeholder: [LINK]
- Leiratkozási lehetőség: "Leiratkozás: STOP"`,

  blog: `Készíts egy SEO-optimalizált blog posztot:
- Figyelemfelkeltő cím (H1)
- Bevezető bekezdés (hook)
- 3-4 alcím (H2) alatti tartalom
- Bullet pointok ahol releváns
- Összefoglaló bekezdés
- Call-to-Action
- A poszt legyen 400-600 szó`,

  ad: `Készíts hirdetési szövegeket:

**Google Ads:**
- Headline 1 (max 30 karakter)
- Headline 2 (max 30 karakter)
- Headline 3 (max 30 karakter)
- Description 1 (max 90 karakter)
- Description 2 (max 90 karakter)

**Meta Ads (Facebook/Instagram):**
- Elsődleges szöveg (1-2 mondat)
- Headline (rövid, figyelemfelkeltő)
- Link leírás
- Call-to-Action javaslat`
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, tone, topic, targetAudience, product, promotion, language } = await request.json()

    if (!type || !tone || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const langInstruction = language === 'en' 
      ? 'Write the content in English.'
      : 'Írd magyarul a tartalmat.'

    const systemPrompt = `Te egy professzionális marketing copywriter vagy a NEXU Webshop számára, ami egy prémium elektronikai webáruház Magyarországon.

${langInstruction}

Fontos irányelvek:
- A NEXU márka modern, prémium és megbízható
- Használj meggyőző, de nem erőszakos nyelvezetet
- A tartalom legyen ${toneDescriptions[tone as Tone]}
- Ne használj hamis állításokat vagy túlzásokat
- A CTA-k legyenek egyértelműek és cselekvésre ösztönzők
- Webshop URL: nexu.hu
- Email: info@nexu.hu

${contentTypePrompts[type as ContentType]}`

    const userPrompt = `Készíts marketing tartalmat a következő paraméterekkel:

Téma/Üzenet: ${topic}
${targetAudience ? `Célközönség: ${targetAudience}` : ''}
${product ? `Termék/Szolgáltatás: ${product}` : ''}
${promotion ? `Kedvezmény/Ajánlat: ${promotion}` : ''}

Hangnem: ${toneDescriptions[tone as Tone]}`

    const response = await openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })

    const generatedText = response.choices[0]?.message?.content || ''

    // Parse the response
    let subject: string | undefined
    let content = generatedText
    let hashtags: string[] | undefined

    // Extract subject line for emails
    if (type === 'email') {
      const subjectMatch = generatedText.match(/Tárgy:\s*(.+?)(?:\n|$)/i)
      if (subjectMatch) {
        subject = subjectMatch[1].trim()
        content = generatedText.replace(/Tárgy:\s*.+?(?:\n|$)/i, '').trim()
      }
    }

    // Extract hashtags for social media
    if (type === 'social') {
      const hashtagMatch = generatedText.match(/(#\w+[\s,]*)+$/m)
      if (hashtagMatch) {
        hashtags = hashtagMatch[0].match(/#\w+/g) || []
        content = generatedText.replace(/(#\w+[\s,]*)+$/m, '').trim()
      }
    }

    return NextResponse.json({
      type,
      content,
      subject,
      hashtags
    })
  } catch (error) {
    console.error('AI Marketing error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
