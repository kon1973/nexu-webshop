'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOrderService, CreateOrderSchema, CreateOrderInput } from '@/lib/services/orderService'
import { getUserAddressesService, getUserLoyaltyService } from '@/lib/services/userService'
import { validateCartService } from '@/lib/services/cartService'
import { sendOrderEmails } from '@/lib/email'
import { logger } from '@/lib/logger'
import Stripe from 'stripe'
import { unstable_cache } from 'next/cache'

// ====================
// User Addresses
// ====================
export async function getUserAddresses() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, addresses: [] }
  }

  try {
    const addresses = await getUserAddressesService(session.user.id)
    return { success: true, addresses }
  } catch (error) {
    logger.error('Error fetching addresses:', error)
    return { success: false, addresses: [], error: 'Hiba a címek betöltésekor' }
  }
}

// ====================
// User Loyalty Info
// ====================
export async function getUserLoyalty() {
  const session = await auth()
  if (!session?.user?.id) {
    return { 
      success: true, 
      totalSpent: 0, 
      discountPercentage: 0, 
      tierName: 'Bronz',
      nextTier: 'Ezüst' as string | null,
      nextTierThreshold: 100000 as number | null,
      progress: 0
    }
  }

  try {
    const loyalty = await getUserLoyaltyService(session.user.id)
    
    // Calculate progress to next tier
    const tiers = [
      { name: 'Bronz', minSpent: 0, discount: 0 },
      { name: 'Ezüst', minSpent: 100000, discount: 0.03 },
      { name: 'Arany', minSpent: 300000, discount: 0.05 },
      { name: 'Platina', minSpent: 500000, discount: 0.07 },
      { name: 'Gyémánt', minSpent: 1000000, discount: 0.10 },
    ]
    
    const currentTierIndex = tiers.findIndex(t => t.name === loyalty.tierName)
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null
    
    return { 
      success: true, 
      ...loyalty,
      nextTier: nextTier?.name || null as string | null,
      nextTierThreshold: nextTier?.minSpent || null as number | null,
      progress: nextTier 
        ? Math.min((loyalty.totalSpent / nextTier.minSpent) * 100, 100)
        : 100
    }
  } catch (error) {
    logger.error('Error fetching loyalty:', error)
    return { 
      success: false, 
      totalSpent: 0, 
      discountPercentage: 0, 
      tierName: 'Bronz',
      nextTier: null as string | null,
      nextTierThreshold: null as number | null,
      progress: 0,
      error: 'Hiba a hűségprogram adatok betöltésekor'
    }
  }
}

// ====================
// Cart Validation
// ====================
export async function validateCart(items: Array<{ id: number; quantity: number; variantId?: string | null; selectedOptions?: Record<string, string> }>) {
  try {
    const result = await validateCartService(items.map(item => ({
      ...item,
      variantId: item.variantId || undefined
    })))
    return result
  } catch (error) {
    logger.error('Cart validation error:', error)
    return { valid: false, errors: ['Szerverhiba a kosár ellenőrzésekor'] }
  }
}

// ====================
// Delivery Time Estimate
// ====================
const getCachedDeliveryEstimate = unstable_cache(
  async () => {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    
    // Hétvégén + 2 nap, délután 14 óra után + 1 nap
    let daysToAdd = 2
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      daysToAdd = dayOfWeek === 0 ? 2 : 3
    } else if (hour >= 14) {
      daysToAdd = 3
    }
    
    const estimatedDate = new Date(now)
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd)
    
    // Skip weekends
    while (estimatedDate.getDay() === 0 || estimatedDate.getDay() === 6) {
      estimatedDate.setDate(estimatedDate.getDate() + 1)
    }
    
    return {
      date: estimatedDate.toLocaleDateString('hu-HU', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }),
      isExpressAvailable: hour < 12 && dayOfWeek >= 1 && dayOfWeek <= 5
    }
  },
  ['delivery-estimate'],
  { revalidate: 3600 }
)

export async function getDeliveryEstimate() {
  try {
    return await getCachedDeliveryEstimate()
  } catch (error) {
    return { date: '2-3 munkanap', isExpressAvailable: false }
  }
}

// ====================
// Create Order
// ====================
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

          // Verify amount
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
          const expectedAmount = Math.round(totalPrice * 100)

          if (paymentIntent.amount !== expectedAmount) {
            logger.error(`Payment amount mismatch: expected ${expectedAmount}, got ${paymentIntent.amount}`)
            
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'cancelled' }
            })
            
            return { success: false, error: 'Fizetési hiba: Az összeg nem egyezik.' }
          }

          await stripe.paymentIntents.update(paymentIntentId, {
            metadata: { orderId: order.id }
          })
        }
      }
      
      // Send order confirmation emails for all payment methods
      const emailItems = order.items.map((item: any) => {
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
      })
      
      await sendOrderEmails({
        orderId: order.id,
        customerName,
        customerEmail,
        customerAddress,
        paymentMethod: paymentMethod,
        items: emailItems,
        subtotal,
        shippingCost,
        totalPrice,
      })
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
