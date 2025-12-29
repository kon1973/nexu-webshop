import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logger } from '@/lib/logger'
import { handleStripeWebhookService } from '@/lib/services/webhookService'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  try {
    const result = await handleStripeWebhookService(body, signature)
    return NextResponse.json(result)
  } catch (error: any) {
    logger.error(`Webhook Error: ${error.message}`)
    if (error.message.includes('Missing Stripe configuration')) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    if (error.message.includes('Webhook signature verification failed')) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
    }
    if (error.message === 'Order not found') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
