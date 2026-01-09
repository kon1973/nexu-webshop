import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const createAlertSchema = z.object({
  productId: z.number(),
  targetPrice: z.number().positive(),
  email: z.string().email()
})

// GET - Fetch user's price alerts
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const email = request.nextUrl.searchParams.get('email')
    
    if (!session?.user?.email && !email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = session?.user?.email || email

    const alerts = await prisma.priceAlert.findMany({
      where: { email: userEmail! },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching price alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new price alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createAlertSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { productId, targetPrice, email } = validation.data

    // Verify product exists and get current price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        image: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const currentPrice = product.salePrice || product.price

    // Validate target price is less than current price
    if (targetPrice >= currentPrice) {
      return NextResponse.json(
        { success: false, error: 'Target price must be less than current price' },
        { status: 400 }
      )
    }

    // Get session for userId
    const session = await auth()

    // Upsert the alert (update if exists, create if not)
    const alert = await prisma.priceAlert.upsert({
      where: {
        email_productId: {
          email,
          productId
        }
      },
      update: {
        targetPrice,
        currentPrice,
        productName: product.name,
        productImage: product.image,
        triggered: false,
        triggeredAt: null,
        notifiedAt: null
      },
      create: {
        email,
        productId,
        productName: product.name,
        productImage: product.image,
        currentPrice,
        targetPrice,
        userId: session?.user?.id || null
      }
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Error creating price alert:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
