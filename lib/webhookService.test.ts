// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleStripeWebhookService } from './services/webhookService'

vi.mock('server-only', () => { return {} })

// Mock Stripe so that constructEvent returns a predictable event
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      webhooks = {
        constructEvent: vi.fn((body: string, signature: string, secret: string) => {
          return {
            id: 'evt_1',
            type: 'payment_intent.succeeded',
            data: { object: { id: 'pi_1', metadata: { orderId: 'order_1' } } },
          }
        }),
      }
    },
  }
})

// Partial mock for prisma
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      webhookEvent: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      order: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      product: { findMany: vi.fn() },
      productVariant: { findMany: vi.fn() },
    },
  }
})

// Mock other side-effectful libs
vi.mock('@/lib/email', () => ({ sendOrderEmails: vi.fn() }))
vi.mock('@/lib/invoice', () => ({ createInvoice: vi.fn().mockResolvedValue({ success: false }) }))
vi.mock('@/lib/loyalty', () => ({ updateUserSpending: vi.fn() }))
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

describe('handleStripeWebhookService', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    vi.clearAllMocks()
  })

  it('returns early when event already processed', async () => {
    const { prisma } = await import('@/lib/prisma')
    const p = prisma as any
    p.webhookEvent = p.webhookEvent || {}
    p.webhookEvent.findUnique = p.webhookEvent.findUnique || (async () => ({}))
    p.webhookEvent.findUnique = vi.fn().mockResolvedValue({ id: '1', processed: true })

    const res = await handleStripeWebhookService('{}', 'sig')
    expect(res).toEqual({ received: true })
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('creates event, processes order and marks event processed', async () => {
    const { prisma } = await import('@/lib/prisma')
    const p = prisma as any
    p.webhookEvent = p.webhookEvent || {}
    p.webhookEvent.findUnique = vi.fn().mockResolvedValue(null)
    p.order.findUnique = vi.fn().mockResolvedValue({ id: 'order_1', items: [], status: 'pending', userId: null, totalPrice: 1000, customerName: 'Test', customerEmail: 'a@b.com', customerAddress: '1234 City Street' })
    p.webhookEvent.create = vi.fn().mockResolvedValue({ id: '1' })
    p.webhookEvent.update = vi.fn().mockResolvedValue({})
    p.product.findMany = vi.fn().mockResolvedValue([])
    p.productVariant.findMany = vi.fn().mockResolvedValue([])

    const res = await handleStripeWebhookService('{}', 'sig')
    expect(res).toEqual({ received: true })
    expect(p.webhookEvent.create).toHaveBeenCalled()
    expect(prisma.order.update).toHaveBeenCalledWith({ where: { id: 'order_1' }, data: { status: 'paid' } })
    expect(p.webhookEvent.update).toHaveBeenCalled()
  })
})