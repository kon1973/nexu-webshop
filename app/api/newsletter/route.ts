import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { subscribeToNewsletterService, NewsletterSchema } from '@/lib/services/newsletterService'
import { z } from 'zod'
import { enforceRateLimit, rateLimitExceededResponse } from '@/lib/enforceRateLimit' 
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1'
    const rl = await enforceRateLimit(ip, 10, 3600, 'newsletter.subscribe') // 10 per hour
    if (!rl.success) return rateLimitExceededResponse(undefined, rl.reset)

    const body = await req.json()
    
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

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Newsletter fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
