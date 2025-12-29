'use server'

import { auth } from '@/lib/auth'
import { createOrderService, CreateOrderSchema, CreateOrderInput } from '@/lib/services/orderService'
import { sendOrderEmails } from '@/lib/email'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'

export async function createOrder(data: CreateOrderInput) {
  try {
    const session = await auth()
    
    const result = CreateOrderSchema.safeParse(data)
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message }
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

    // Side effects
    try {
      if (paymentMethod === 'stripe' && paymentIntentId) {
        if (process.env.STRIPE_SECRET_KEY) {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-15.clover' as any,
          })
          await stripe.paymentIntents.update(paymentIntentId, {
            metadata: { orderId: order.id }
          })
        }
      } else if (paymentMethod === 'cod') {
        // Send emails
        await sendOrderEmails({
          orderId: order.id,
          customerName,
          customerEmail,
          customerAddress,
          items: order.items.map((item: any) => {
            const product = productById.get(item.productId!) as any
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
              unitPrice: item.price,
              image: image
            }
          }),
          subtotal,
          shippingCost,
          totalPrice,
        })
      }
    } catch (sideEffectError) {
      logger.error('Order side effect error:', sideEffectError)
      // Don't fail the order if email/stripe update fails, but log it
    }

    return { success: true, orderId: order.id, emailSent: true } // Assuming email sent if no error caught
  } catch (error: any) {
    logger.error('Order creation error', error)
    if (error.message?.startsWith('OUT_OF_STOCK')) {
      return { success: false, error: 'Egy vagy több termék elfogyott a tranzakció közben.' }
    }
    if (error.message === 'COUPON_LIMIT_REACHED' || error.message === 'INVALID_COUPON') {
      return { success: false, error: 'A kupon érvénytelen vagy elérte a limitet.' }
    }
    return { success: false, error: error.message || 'Szerverhiba történt.' }
  }
}
