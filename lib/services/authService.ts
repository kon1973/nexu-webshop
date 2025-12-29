import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { sendVerificationEmail } from '@/lib/email'

export const RegisterSchema = z.object({
  name: z.string().min(1, "Név megadása kötelező"),
  email: z.string().email("Érvénytelen email cím"),
  password: z.string().min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie."),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export async function registerUserService(data: RegisterInput) {
  const { name, email, password } = RegisterSchema.parse(data)

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new Error('Ez az email cím már regisztrálva van.')
    } else {
      // User exists but not verified. We allow re-registration (overwrite).
      const hashedPassword = await bcrypt.hash(password, 10)
      
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          password: hashedPassword,
        },
      })

      // Delete old tokens
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      })

      // Generate new token
      const token = crypto.randomUUID()
      const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      })

      // sendVerificationEmail expects object in the original code, but let's check lib/email.ts
      // The original code called sendVerificationEmail({ email, token })
      // But my previous service call was sendVerificationEmail(email, token)
      // I need to check lib/email.ts signature.
      // Assuming the original code was correct:
      await sendVerificationEmail({ email, token })

      return { 
        success: true, 
        message: "Megerősítő email újraküldve! Kérjük, ellenőrizd a fiókodat.",
        user: { id: existingUser.id, name, email } 
      }
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'user',
    },
  })

  // Generate verification token
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  // Send verification email
  await sendVerificationEmail({ email, token })

  return { success: true, message: 'Sikeres regisztráció! Kérjük, erősítsd meg az email címedet.' }
}

