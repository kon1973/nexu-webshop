import { prisma } from '@/lib/prisma'
import { NewsletterSubscriber } from '@prisma/client'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'

export const NewsletterSchema = z.object({
  email: z.string().email("Érvénytelen email cím"),
  website: z.string().optional(), // Honeypot
})

export const SendNewsletterSchema = z.object({
  subject: z.string().min(1, "Tárgy megadása kötelező"),
  content: z.string().min(1, "Tartalom megadása kötelező"),
})

export async function subscribeToNewsletterService(data: z.infer<typeof NewsletterSchema>) {
  const { email, website } = NewsletterSchema.parse(data)

  // Honeypot check
  if (website) {
    // Silently fail (pretend success) to fool bots
    return { message: 'Sikeres feliratkozás!', status: 201 }
  }

  // Check if already subscribed
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  })

  if (existing) {
    return { message: 'Már feliratkoztál!', status: 200 }
  }

  await prisma.newsletterSubscriber.create({
    data: { email },
  })

  return { message: 'Sikeres feliratkozás!', status: 201 }
}

export async function exportSubscribersService() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const csvHeader = 'Email,Feliratkozás dátuma\n'
  const csvRows = subscribers
    .map((sub: NewsletterSubscriber) => `${sub.email},${sub.createdAt.toISOString()}`)
    .join('\n')

  return csvHeader + csvRows
}

export async function sendNewsletterService(data: z.infer<typeof SendNewsletterSchema>) {
  const { subject, content } = SendNewsletterSchema.parse(data)

  const subscribers = await prisma.newsletterSubscriber.findMany()

  if (subscribers.length === 0) {
    throw new Error('Nincsenek feliratkozók')
  }

  // Send emails in batches to avoid rate limits
  const batchSize = 50
  const chunks = []
  for (let i = 0; i < subscribers.length; i += batchSize) {
    chunks.push(subscribers.slice(i, i + batchSize))
  }

  let successCount = 0
  let failCount = 0

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (sub: NewsletterSubscriber) => {
        try {
          await sendEmail({
            to: sub.email,
            subject: subject,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                ${content}
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #666; text-align: center;">
                  Azért kaptad ezt az emailt, mert feliratkoztál a hírlevelünkre.<br>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color: #666;">Leiratkozás</a>
                </p>
              </div>
            `,
          })
          successCount++
        } catch (error) {
          console.error(`Failed to send newsletter to ${sub.email}:`, error)
          failCount++
        }
      })
    )
  }

  return { successCount, failCount, total: subscribers.length }
}

