import 'server-only'
import { prisma } from '@/lib/prisma'
import { sendAbandonedCartEmail } from '@/lib/email'
import { logInventoryChange } from '@/lib/services/inventoryService'

export async function processAbandonedCartsService() {
  // Find carts updated > 1 hour ago and < 24 hours ago
  // And haven't received an email yet
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const abandonedCarts = await prisma.cart.findMany({
    where: {
      updatedAt: {
        lt: oneHourAgo,
        gt: twentyFourHoursAgo,
      },
      lastAbandonedEmailSentAt: null,
      items: {
        some: {}, // Must have items
      },
    },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  })

  console.log(`Found ${abandonedCarts.length} potential abandoned carts`)

  let emailsSent = 0

  for (const cart of abandonedCarts) {
    if (!cart.user.email) {
      continue
    }

    // Check if user has placed an order since the cart was updated
    const recentOrder = await prisma.order.findFirst({
      where: {
        userId: cart.userId,
        createdAt: {
          gt: cart.updatedAt,
        },
      },
    })

    if (recentOrder) {
      // User already bought something, ignore this cart
      continue
    }

    // Send email
    const emailItems = cart.items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.salePrice || item.product.price,
      image: item.product.image
    }))
    const result = await sendAbandonedCartEmail({ email: cart.user.email, name: cart.user.name || 'Vásárló', items: emailItems })

    if (result.success) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { lastAbandonedEmailSentAt: new Date() },
      })
      emailsSent++
    }
  }

  return { processed: abandonedCarts.length, sent: emailsSent }
}

export async function cleanupPendingOrdersService() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const pendingOrders = await prisma.order.findMany({
    where: {
      status: 'pending',
      createdAt: {
        lt: oneHourAgo,
      },
    },
    include: {
      items: true,
    },
  })

  console.log(`Found ${pendingOrders.length} pending orders to cleanup`)

  let cleanedUp = 0

  for (const order of pendingOrders) {
    try {
      await prisma.$transaction(async (tx) => {
        // Restore stock
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            })
          } else if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          }

          if (item.productId) {
            await logInventoryChange({
                productId: item.productId,
                variantId: item.variantId,
                change: item.quantity,
                reason: 'ORDER_CANCELLED',
                referenceId: order.id,
                tx: tx
            })
          }
        }

        // Restore coupon usage
        if (order.couponCode) {
            const coupon = await tx.coupon.findUnique({ where: { code: order.couponCode } })
            if (coupon) {
                await tx.coupon.update({
                    where: { id: coupon.id },
                    data: { usedCount: { decrement: 1 } }
                })
            }
        }

        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'cancelled' },
        })
      })
      cleanedUp++
    } catch (error) {
      console.error(`Failed to cleanup order ${order.id}:`, error)
    }
  }

  return { processed: pendingOrders.length, cleanedUp }
}
