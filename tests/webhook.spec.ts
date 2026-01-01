import { test, expect } from '@playwright/test'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

test.describe('Stripe webhook', () => {
  let orderId: string | null = null

  test.beforeEach(async () => {
    // Ensure env vars for test signing
    process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_123'

    const order = await prisma.order.create({
      data: {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerAddress: '1234 Test St',
        totalPrice: 1000,
        status: 'pending',
      },
    })

    orderId = order.id
  })

  test.afterEach(async () => {
    if (orderId) {
      await prisma.order.delete({ where: { id: orderId } })
      orderId = null
    }
  })

  test('marks order as paid when receiving payment_intent.succeeded', async ({ request }) => {
    // Build a stripe test event and signature
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-12-15.clover' as any })
    const eventPayload = {
      id: 'evt_test_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_1', metadata: { orderId } } },
    }
    const body = JSON.stringify(eventPayload)

    // generate test header (Stripe SDK helper)
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    })

    const res = await request.post('/api/webhooks/stripe', {
      data: body,
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature,
      },
    })

    expect(res.ok()).toBeTruthy()

    const updated = await prisma.order.findUnique({ where: { id: orderId! } })
    expect(updated?.status).toBe('paid')
  })
})