import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Redeem gift card (use during checkout)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, amount, orderId } = body

    if (!code || !amount) {
      return NextResponse.json({ 
        error: 'Kód és összeg szükséges' 
      }, { status: 400 })
    }

    const normalizedCode = code.toUpperCase().trim()

    // Find and validate gift card
    const giftCard = await prisma.giftCard.findUnique({
      where: { code: normalizedCode }
    })

    if (!giftCard) {
      return NextResponse.json({ error: 'Érvénytelen kód' }, { status: 404 })
    }

    if (giftCard.status !== 'active') {
      return NextResponse.json({ 
        error: 'Ez az ajándékkártya nem használható' 
      }, { status: 400 })
    }

    if (new Date() > giftCard.expiresAt) {
      return NextResponse.json({ error: 'Lejárt ajándékkártya' }, { status: 400 })
    }

    if (giftCard.balance < amount) {
      return NextResponse.json({ 
        error: `Nincs elegendő egyenleg. Elérhető: ${giftCard.balance.toLocaleString('hu-HU')} Ft` 
      }, { status: 400 })
    }

    // Create redemption record and update balance
    const [redemption, updatedCard] = await prisma.$transaction([
      prisma.giftCardRedemption.create({
        data: {
          giftCardId: giftCard.id,
          orderId: orderId || null,
          amount
        }
      }),
      prisma.giftCard.update({
        where: { id: giftCard.id },
        data: {
          balance: giftCard.balance - amount,
          status: giftCard.balance - amount === 0 ? 'redeemed' : 'active',
          activatedAt: giftCard.activatedAt || new Date()
        }
      })
    ])

    return NextResponse.json({
      success: true,
      redemption: {
        id: redemption.id,
        amount: redemption.amount
      },
      giftCard: {
        code: updatedCard.code,
        previousBalance: giftCard.balance,
        newBalance: updatedCard.balance,
        status: updatedCard.status
      }
    })
  } catch (error) {
    console.error('Gift card redemption error:', error)
    return NextResponse.json({ error: 'Hiba történt a beváltás során' }, { status: 500 })
  }
}
