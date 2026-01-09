import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendGiftCardEmail } from '@/lib/email'

// Generate unique gift card code
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I, O, 1, 0 to avoid confusion
  let code = 'NEXU-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += '-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET: List user's gift cards (purchased and received)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Bejelentkezés szükséges' }, { status: 401 })
    }

    const email = session.user.email
    const userId = session.user.id

    // Get gift cards purchased by user
    const purchased = await prisma.giftCard.findMany({
      where: { buyerId: userId },
      include: {
        redemptions: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get gift cards received by user
    const received = await prisma.giftCard.findMany({
      where: { 
        recipientEmail: email,
        status: { in: ['active', 'redeemed'] }
      },
      include: {
        redemptions: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      purchased,
      received
    })
  } catch (error) {
    console.error('Gift cards fetch error:', error)
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 })
  }
}

// POST: Purchase a new gift card
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const body = await req.json()

    const { 
      amount, 
      recipientName, 
      recipientEmail, 
      senderName, 
      message, 
      deliveryDate, 
      design 
    } = body

    // Validation
    if (!amount || amount < 5000 || amount > 500000) {
      return NextResponse.json({ 
        error: 'Az összegnek 5.000 és 500.000 Ft között kell lennie' 
      }, { status: 400 })
    }

    if (!recipientName || !recipientEmail) {
      return NextResponse.json({ 
        error: 'A címzett neve és email címe kötelező' 
      }, { status: 400 })
    }

    if (!recipientEmail.includes('@')) {
      return NextResponse.json({ 
        error: 'Érvénytelen email cím' 
      }, { status: 400 })
    }

    // Generate unique code
    let code: string
    let attempts = 0
    do {
      code = generateGiftCardCode()
      const existing = await prisma.giftCard.findUnique({ where: { code } })
      if (!existing) break
      attempts++
    } while (attempts < 10)

    if (attempts >= 10) {
      return NextResponse.json({ 
        error: 'Nem sikerült egyedi kódot generálni' 
      }, { status: 500 })
    }

    // Calculate expiration (1 year from now)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Parse delivery date
    const deliveryDateParsed = deliveryDate ? new Date(deliveryDate) : new Date()

    // Create gift card
    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        amount,
        balance: amount,
        design: design || 'classic',
        buyerId: session?.user?.id || null,
        senderName: senderName || null,
        senderEmail: session?.user?.email || null,
        recipientName,
        recipientEmail,
        message: message || null,
        deliveryDate: deliveryDateParsed,
        status: 'pending', // Will be activated after payment
        expiresAt
      }
    })

    // TODO: Integrate with Stripe for payment
    // For now, we'll mark it as active immediately (demo mode)
    const activatedCard = await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: {
        status: 'active',
        activatedAt: new Date(),
        deliveredAt: deliveryDateParsed <= new Date() ? new Date() : null
      }
    })

    // Send email to recipient if delivery date is today or in past
    const shouldSendNow = deliveryDateParsed <= new Date()
    if (shouldSendNow) {
      try {
        await sendGiftCardEmail({
          recipientEmail,
          recipientName,
          senderName: senderName || undefined,
          amount,
          code,
          message: message || undefined,
          design: design || 'classic',
          expiresAt
        })
        
        // Update deliveredAt
        await prisma.giftCard.update({
          where: { id: activatedCard.id },
          data: { deliveredAt: new Date() }
        })
      } catch (emailError) {
        console.error('Failed to send gift card email:', emailError)
        // Don't fail the request, the gift card is still created
      }
    }
    // TODO: For future delivery dates, set up a cron job to send scheduled emails

    return NextResponse.json({
      success: true,
      giftCard: {
        id: activatedCard.id,
        code: activatedCard.code,
        amount: activatedCard.amount,
        recipientEmail: activatedCard.recipientEmail,
        expiresAt: activatedCard.expiresAt
      }
    })
  } catch (error) {
    console.error('Gift card purchase error:', error)
    return NextResponse.json({ error: 'Hiba történt a vásárlás során' }, { status: 500 })
  }
}
