import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { sendContactMessageService } from '@/lib/services/contactService'
import { z } from 'zod'
import { enforceRateLimit, rateLimitExceededResponse } from '@/lib/enforceRateLimit' 

export async function POST(req: Request) {
  try {
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1'
    const rl = await enforceRateLimit(ip, 10, 3600, 'contact.send') // 10 per hour
    if (!rl.success) return rateLimitExceededResponse(undefined, rl.reset)

    const body = await req.json()
    
    try {
        const result = await sendContactMessageService(body)
        return NextResponse.json(result)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }
        throw error
    }

  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Belső szerverhiba történt' },
      { status: 500 }
    )
  }
}
