import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// POST - Create shared cart
export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid cart items' },
        { status: 400 }
      )
    }

    // Generate unique share code
    const code = nanoid(8)

    // Store the shared cart
    // For now, we'll use a simple approach - in production you might want a dedicated table
    const cartData = JSON.stringify(items)
    
    // Store in database using a SharedCart model (we'll add this)
    // For now, return the code
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexu-webshop.vercel.app'
    const shareUrl = `${siteUrl}/cart?share=${code}`

    // In a full implementation, you'd store this in the database
    // await prisma.sharedCart.create({ data: { code, items: cartData, expiresAt: ... } })

    return NextResponse.json({
      success: true,
      code,
      url: shareUrl
    })
  } catch (error) {
    console.error('Error creating shared cart:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Retrieve shared cart
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Missing share code' },
        { status: 400 }
      )
    }

    // In a full implementation, retrieve from database
    // const sharedCart = await prisma.sharedCart.findUnique({ where: { code } })

    // For now, return empty
    return NextResponse.json({
      success: false,
      error: 'Cart not found or expired'
    }, { status: 404 })
  } catch (error) {
    console.error('Error retrieving shared cart:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
