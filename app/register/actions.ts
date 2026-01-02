'use server'

import { z } from 'zod'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { nanoid } from 'nanoid'

const RegisterSchema = z.object({
  name: z.string().min(2, 'A név legalább 2 karakter legyen').max(100),
  email: z.string().email('Érvénytelen email cím'),
  password: z.string().min(6, 'A jelszó legalább 6 karakter legyen').max(100)
})

export async function registerUser(data: { name: string; email: string; password: string }) {
  // Validate input
  const result = RegisterSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { name, email, password } = result.data

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return { success: false, error: 'Ez az email cím már regisztrálva van.' }
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: null
      }
    })

    // Generate verification token
    const token = nanoid(32)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires
      }
    })

    // Send verification email
    try {
      await sendVerificationEmail({ email: email.toLowerCase(), token })
    } catch (emailError) {
      console.error('Verification email failed:', emailError)
      // Don't fail registration if email fails
    }

    return { 
      success: true, 
      message: 'Sikeres regisztráció! Kérjük, erősítsd meg az email címedet.' 
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Hiba történt a regisztráció során.' }
  }
}
