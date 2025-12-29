import { NextResponse } from 'next/server'
import { sendContactMessageService } from '@/lib/services/contactService'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
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
