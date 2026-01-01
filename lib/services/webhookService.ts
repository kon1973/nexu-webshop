import 'server-only'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { OrderItem } from '@prisma/client'
import { sendOrderEmails } from '@/lib/email'
import { createInvoice } from '@/lib/invoice'
import { logger } from '@/lib/logger'
import { updateUserSpending } from '@/lib/loyalty'

export async function handleStripeWebhookService(body: string, signature: string) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing Stripe configuration')
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover' as any,
  })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: any) {
    throw new Error(`Webhook signature verification failed: ${error.message}`)
  }

  // Idempotency: record or check event to prevent double processing
  try {
    const existing = await (prisma as any).webhookEvent.findUnique({ where: { eventId: event.id } })
    if (existing) {
      if (existing.processed) {
        logger.info('Stripe webhook event already processed', { eventId: event.id, type: event.type })
        return { received: true }
      } else {
        await (prisma as any).webhookEvent.update({
          where: { id: existing.id },
          data: { retryCount: existing.retryCount + 1, receivedAt: new Date() },
        })
      }
    } else {
      await (prisma as any).webhookEvent.create({
        data: {
          provider: 'stripe',
          eventId: event.id,
          type: event.type,
          payload: event as any,
        },
      })
    }
  } catch (err) {
    logger.error('Failed to record webhook event', { error: String(err) })
    // Continue processing to avoid losing event handling when DB write fails
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const orderId = paymentIntent.metadata.orderId

    if (!orderId) {
      logger.warn('PaymentIntent succeeded but no orderId in metadata', { paymentIntentId: paymentIntent.id })
      return { received: true }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      logger.error('Order not found for paymentIntent', { orderId, paymentIntentId: paymentIntent.id })
      throw new Error('Order not found')
    }

    if (order.status === 'paid') {
      logger.info('Order already paid', { orderId })
      // mark processed if not marked
      try {
        await (prisma as any).webhookEvent.update({ where: { eventId: event.id }, data: { processed: true, processedAt: new Date() } })
      } catch (err) {
        logger.warn('Failed to mark webhook event processed', { error: String(err) })
      }
      return { received: true }
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid' },
    })

    // Update user spending
    if (order.userId) {
      await updateUserSpending(order.userId)
    }

    // Fetch product details for email/invoice
    const productIds = order.items.map((item: OrderItem) => item.productId).filter((id: number | null): id is number => id !== null)
    const variantIds = order.items.map((item: OrderItem) => item.variantId).filter((id: string | null): id is string => id !== null)

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true },
    })

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, images: true },
    })

    const productById = new Map(products.map((p: any) => [p.id, p]))
    const variantById = new Map(variants.map((v: any) => [v.id, v]))

    // Generate Invoice
    let invoiceUrl = null
    try {
      // Parse address (simplified)
      // Robust parsing with fallbacks
      let zip = '0000'
      let city = 'Ismeretlen'
      let street = order.customerAddress

      try {
        const parts = order.customerAddress.split(',')
        if (parts.length > 1) {
            const zipCity = parts[0].trim().split(' ')
            if (zipCity.length > 1) {
                zip = zipCity[0]
                city = zipCity.slice(1).join(' ')
                street = parts.slice(1).join(',').trim()
            }
        } else {
            // Try regex for "1234 City Street..."
            const match = order.customerAddress.match(/^(\d{4})\s+([^\s]+)\s+(.+)$/)
            if (match) {
                zip = match[1]
                city = match[2]
                street = match[3]
            }
        }
      } catch (e) {
          logger.warn('Address parsing failed, using fallback', { address: order.customerAddress })
      }

      const invoiceResult = await createInvoice({
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerAddress: {
          country: 'Magyarország',
          postalCode: zip,
          city: city,
          street: street,
        },
        items: order.items.map((item: OrderItem) => {
            const product: any = productById.get(item.productId!)
            let name = product?.name || 'Termék'
            if (item.selectedOptions) {
                // ... format options
            }
            return {
                label: name,
                quantity: item.quantity,
                unit: 'db',
                vat: 27,
                netUnitPrice: Math.round(item.price / 1.27),
            }
        }),
        paymentMethod: 'Stripe',
        paid: true,
        fulfillmentDate: new Date(),
        dueDate: new Date()
      })
      
      if (invoiceResult.success) {
          invoiceUrl = invoiceResult.invoiceUrl
      }
    } catch (err) {
        logger.error('Invoice generation failed', err)
    }

    // Send emails
    try {
        await sendOrderEmails({
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerAddress: order.customerAddress,
          paymentMethod: 'stripe',
          items: order.items.map((item: OrderItem) => {
              const product: any = productById.get(item.productId!)
              let name = product?.name || 'Termék'
              let image = product?.image
              
              if (item.variantId) {
                  const variant: any = variantById.get(item.variantId)
                  if (variant && variant.images && variant.images.length > 0) {
                      image = variant.images[0]
                  }
              }
              
              return {
                name: name,
                quantity: item.quantity,
                unitPrice: item.price, // Price from DB
                image: image
              }
          }),
          subtotal: order.totalPrice, // Simplified
          shippingCost: 0, 
          totalPrice: order.totalPrice,
          invoiceUrl: invoiceUrl || undefined
        })
    } catch (err) {
        logger.error('Email sending failed', err)
    }

    // mark processed
    try {
      await (prisma as any).webhookEvent.update({ where: { eventId: event.id }, data: { processed: true, processedAt: new Date() } })
    } catch (err) {
      logger.warn('Failed to mark webhook event processed', { error: String(err) })
    }
  }

  return { received: true }
}
