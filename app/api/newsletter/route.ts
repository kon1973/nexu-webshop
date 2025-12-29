import { NextResponse } from 'next/server'
import { subscribeToNewsletterService, NewsletterSchema } from '@/lib/services/newsletterService'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate first to catch format errors before service call if needed, 
    // but service also validates. 
    // However, service throws error on validation fail if using .parse().
    // Let's use safeParse here or handle error from service.
    // The service uses .parse() so it throws ZodError.
    
    try {
        const result = await subscribeToNewsletterService(body)
        return NextResponse.json({ message: result.message }, { status: result.status })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }
        throw error
    }

  } catch (error) {
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: 'Hiba történt a feliratkozás során' }, { status: 500 })
  }
}
