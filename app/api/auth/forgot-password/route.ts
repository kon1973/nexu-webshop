import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { enforceRateLimit, rateLimitExceededResponse } from '@/lib/enforceRateLimit' 

export async function POST(req: Request) {
  try {
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1'
    const rl = await enforceRateLimit(ip, 5, 60, 'auth.forgot-password')
    if (!rl.success) return rateLimitExceededResponse(undefined, rl.reset)

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email cím megadása kötelező' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // If user not found, we still return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // If user has no password (e.g. Google login), we can't reset password
    if (!user.password) {
      // Optionally send an email saying "You use Google login"
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

    // Delete existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    await sendPasswordResetEmail({ email, token })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 })
  }
}
