import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createInvoice } from '@/lib/invoice'
import type { OrderItem } from '@prisma/client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if SZAMLAZZ_TOKEN is configured
    if (!process.env.SZAMLAZZ_TOKEN) {
      return NextResponse.json(
        { error: 'Számlázás nincs konfigurálva. Állítsd be a SZAMLAZZ_TOKEN környezeti változót.' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Rendelés nem található' }, { status: 404 })
    }

    if (order.invoiceUrl) {
      return NextResponse.json(
        { error: 'Ehhez a rendeléshez már van kiállított számla.' },
        { status: 400 }
      )
    }

    // Prepare invoice items
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

    // Add discount if applicable
    if (order.discountAmount > 0) {
      invoiceItems.push({
        label: 'Kedvezmény',
        quantity: 1,
        unit: 'db',
        vat: 27,
        netUnitPrice: -Math.round(order.discountAmount / 1.27),
      })
    }

    // Add shipping if applicable
    const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingCost = order.totalPrice - itemsTotal + (order.discountAmount || 0) + (order.loyaltyDiscount || 0)
    if (shippingCost > 0) {
      invoiceItems.push({
        label: 'Szállítási költség',
        quantity: 1,
        unit: 'db',
        vat: 27,
        netUnitPrice: Math.round(shippingCost / 1.27),
      })
    }

    // Parse address
    let zip = '', city = '', street = '', country = 'Magyarország'
    try {
      const parts = order.customerAddress.split(',')
      if (parts.length >= 2) {
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

    // Generate invoice
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
      paid: order.status === 'paid' || order.status === 'completed' || order.status === 'shipped',
      fulfillmentDate: new Date(),
      dueDate: new Date(),
    })

    if (invoiceResult?.invoiceUrl) {
      await prisma.order.update({
        where: { id: order.id },
        data: { invoiceUrl: invoiceResult.invoiceUrl },
      })

      return NextResponse.json({
        success: true,
        invoiceUrl: invoiceResult.invoiceUrl,
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Számla generálva (URL nem elérhető)' 
    })
  } catch (error: any) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Hiba történt a számla generálásakor' },
      { status: 500 }
    )
  }
}
