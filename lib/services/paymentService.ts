import Stripe from 'stripe'
import { calculateCartTotalsService, CartItemSchema } from '@/lib/services/cartService'
import { z } from 'zod'

export const PaymentIntentSchema = z.object({
  cartItems: z.array(CartItemSchema),
  couponCode: z.string().optional().nullable(),
})

export async function createPaymentIntentService(data: z.infer<typeof PaymentIntentSchema>, userId?: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Server configuration error: Missing Stripe Key')
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
    apiVersion: '2025-12-15.clover' as any,
  })

  const { cartItems, couponCode } = data

  if (cartItems.length === 0) {
    throw new Error('Empty cart')
  }

  const totals = await calculateCartTotalsService(cartItems, userId, couponCode || undefined)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totals.total * 100), // HUF is 2-decimal in Stripe
    currency: 'huf',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      userId: userId || 'guest',
      couponCode: couponCode || '',
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
    totals
  }
}
