import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email cím megadása kötelező!" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nincs ilyen felhasználó." },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: "Ez az email cím már meg van erősítve." },
        { status: 400 }
      )
    }

    // Delete existing tokens for this email to keep it clean
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Generate new verification token
    const token = crypto.randomUUID()
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send verification email
    await sendVerificationEmail({ email, token })

    return NextResponse.json({ 
      success: true, 
      message: "Megerősítő email elküldve." 
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { success: false, error: "Szerver hiba történt." },
      { status: 500 }
    )
  }
}
