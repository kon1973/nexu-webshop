import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sendOrderStatusEmail } from '@/lib/email'
import { createInvoice } from '@/lib/invoice'
import type { OrderItem } from '@prisma/client'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Handle stock and coupon restoration if cancelling
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await prisma.$transaction(async (tx: any) => {
        // Restore stock
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } }
            })
          } else if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            })
          }
        }

        // Restore coupon usage
        if (order.couponCode) {
          await tx.coupon.update({
            where: { code: order.couponCode },
            data: { usedCount: { decrement: 1 } }
          })
        }

        // Update order status
        await tx.order.update({
          where: { id },
          data: { status }
        })
      })

      // Update user spending
      if (order.userId) {
          const { updateUserSpending } = await import('@/lib/loyalty')
          await updateUserSpending(order.userId)
      }

      // Send email
      if (status === 'cancelled') {
        sendOrderStatusEmail({
          email: order.customerEmail,
          orderId: order.id,
          customerName: order.customerName,
          status: 'cancelled'
        }).catch(console.error)
      }
      
      return NextResponse.json({ success: true, message: 'Order cancelled and stock restored' })
    }

    // Normal status update
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    })

    // Update user spending
    if (updatedOrder.userId) {
        const { updateUserSpending } = await import('@/lib/loyalty')
        await updateUserSpending(updatedOrder.userId)
    }

    // Generate invoice if status is changed to 'completed'
    if (status === 'completed' && process.env.SZAMLAZZ_TOKEN) {
      try {
        const invoiceItems = order.items.map((item: OrderItem) => {
          let name = item.name || 'Termék'
          if (item.selectedOptions && typeof item.selectedOptions === 'object') {
            const options = Object.entries(item.selectedOptions as Record<string, string>)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')
            if (options) {
              name += ` (${options})`
            }
          }
          // Calculate net price (assuming 27% VAT included)
          const netPrice = Math.round(item.price / 1.27)
          return {
            label: name,
            quantity: item.quantity,
            unit: 'db',
            vat: 27,
            netUnitPrice: netPrice,
          }
        })

        if (order.discountAmount > 0) {
             invoiceItems.push({
                label: 'Kedvezmény',
                quantity: 1,
                unit: 'db',
                vat: 27,
                netUnitPrice: -Math.round(order.discountAmount / 1.27),
             })
        }

        let zip = '', city = '', street = '', country = 'Magyarország'
        try {
            const parts = order.customerAddress.split(',')
            if (parts.length >= 3) {
                const firstPart = parts[0].trim()
                const spaceIndex = firstPart.indexOf(' ')
                if (spaceIndex > 0) {
                    zip = firstPart.substring(0, spaceIndex)
                    city = firstPart.substring(spaceIndex + 1)
                } else {
                    city = firstPart
                }
                street = parts[1].trim()
                if (parts[2]) country = parts[2].trim()
            } else {
                street = order.customerAddress
            }
        } catch (e) {
            console.error('Address parsing error:', e)
            street = order.customerAddress
        }

        const invoiceResult = await createInvoice({
            orderId: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerAddress: {
                country,
                postalCode: zip || '0000',
                city: city || 'Ismeretlen',
                street: street || order.customerAddress,
            },
            items: invoiceItems,
            paymentMethod: order.paymentMethod === 'stripe' ? 'Stripe' : 'Utánvét',
            paid: true,
            fulfillmentDate: new Date(),
            dueDate: new Date(),
        })

        if (invoiceResult?.invoiceUrl) {
            await prisma.order.update({
                where: { id: order.id },
                data: { invoiceUrl: invoiceResult.invoiceUrl }
            })
        }
        console.log(`Invoice generated for order ${order.id}`)
      } catch (err) {
        console.error('Invoice generation failed during status update:', err)
      }
    }

    if (status === 'shipped') {
      sendOrderStatusEmail({
        email: order.customerEmail,
        orderId: order.id,
        customerName: order.customerName,
        status: 'shipped'
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
