import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Validate and check gift card balance
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ 
        error: 'Ajándékkártya kód szükséges',
        valid: false 
      }, { status: 400 })
    }

    // Normalize code (uppercase, trim)
    const normalizedCode = code.toUpperCase().trim()

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: normalizedCode }
    })

    if (!giftCard) {
      return NextResponse.json({ 
        error: 'Érvénytelen ajándékkártya kód',
        valid: false 
      }, { status: 404 })
    }

    // Check status
    if (giftCard.status === 'pending') {
      return NextResponse.json({ 
        error: 'Ez az ajándékkártya még nincs aktiválva',
        valid: false 
      }, { status: 400 })
    }

    if (giftCard.status === 'expired') {
      return NextResponse.json({ 
        error: 'Ez az ajándékkártya lejárt',
        valid: false 
      }, { status: 400 })
    }

    // Check expiration
    if (new Date() > giftCard.expiresAt) {
      // Update status to expired
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { status: 'expired' }
      })
      return NextResponse.json({ 
        error: 'Ez az ajándékkártya lejárt',
        valid: false 
      }, { status: 400 })
    }

    // Check balance
    if (giftCard.balance <= 0) {
      return NextResponse.json({ 
        error: 'Ez az ajándékkártya már fel lett használva',
        valid: false 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      valid: true,
      giftCard: {
        code: giftCard.code,
        balance: giftCard.balance,
        originalAmount: giftCard.amount,
        expiresAt: giftCard.expiresAt
      }
    })
  } catch (error) {
    console.error('Gift card validation error:', error)
    return NextResponse.json({ 
      error: 'Hiba történt az ellenőrzés során',
      valid: false 
    }, { status: 500 })
  }
}
