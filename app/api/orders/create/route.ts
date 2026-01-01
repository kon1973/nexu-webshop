import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'
import { logger } from '@/lib/logger'
import { sendOrderEmails } from '@/lib/email'
import { headers } from 'next/headers'
import { enforceRateLimit, rateLimitExceededResponse } from '@/lib/enforceRateLimit' 
import { createOrderService, CreateOrderSchema } from '@/lib/services/orderService'
import type { OrderItem } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1"
    const identifier = session?.user?.id ?? ip
    const rl = await enforceRateLimit(identifier, 20, 60, 'orders.create')
    if (!rl.success) return rateLimitExceededResponse(undefined, rl.reset)

    const body = await request.json()
    
    const result = CreateOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 })
    }
    
    const { 
      customerName, 
      customerEmail, 
      customerAddress, 
      paymentMethod,
      paymentIntentId 
    } = result.data

    const { order, subtotal, shippingCost, totalPrice, productById, variantById } = await createOrderService({
      ...result.data,
      userId: session?.user?.id
    })

    // If Stripe, update PaymentIntent metadata
    if (paymentMethod === 'stripe' && paymentIntentId) {
        if (!process.env.STRIPE_SECRET_KEY) {
            logger.error('STRIPE_SECRET_KEY missing')
        } else {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2025-12-15.clover' as any,
            })
            await stripe.paymentIntents.update(paymentIntentId, {
                metadata: {
                    orderId: order.id
                }
            })
        }
    } else if (paymentMethod === 'cod') {
        // Send emails (non-blocking)
        sendOrderEmails({
          orderId: order.id,
          customerName,
          customerEmail,
          customerAddress,
          paymentMethod: 'cod',
          items: order.items.map((item: OrderItem) => {
            const product = productById.get(item.productId!)! as any
              let name = product.name
              let image = product.image
              
              if (item.variantId) {
                  const variant = variantById.get(item.variantId) as any
                  if (variant && variant.images && variant.images.length > 0) {
                      image = variant.images[0]
                  }
              }
              
              if (item.selectedOptions && typeof item.selectedOptions === 'object') {
                 const options = Object.entries(item.selectedOptions as Record<string, string>)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')
                 if (options) {
                     name += ` (${options})`
                 }
              }

              return {
                name: name,
                quantity: item.quantity,
                unitPrice: item.price, // Price from DB
                image: image
              }
          }),
          subtotal,
          shippingCost,
          totalPrice,
        }).catch((err) => logger.error('Email sending failed:', err))
    }

    return NextResponse.json({ success: true, orderId: order.id })

  } catch (error: any) {
    logger.error('Order creation error', error)
    if (error.message?.startsWith('OUT_OF_STOCK')) {
      return NextResponse.json(
        { success: false, error: 'Egy vagy több termék elfogyott a tranzakció közben.' },
        { status: 409 }
      )
    }
    if (error.message === 'COUPON_LIMIT_REACHED' || error.message === 'INVALID_COUPON') {
      return NextResponse.json(
        { success: false, error: 'A kupon érvénytelen vagy elérte a limitet.' },
        { status: 409 }
      )
    }
    // Handle generic service errors
    if (error.message && !error.message.includes('Szerverhiba')) {
       return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: 'Szerverhiba történt.' }, { status: 500 })
  }
}
