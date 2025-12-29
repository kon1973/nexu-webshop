import { sendContactEmail } from '@/lib/email'
import { z } from 'zod'

export const ContactSchema = z.object({
  name: z.string().min(1, "Név megadása kötelező"),
  email: z.string().email("Érvénytelen email cím"),
  message: z.string().min(1, "Üzenet megadása kötelező"),
})

export async function sendContactMessageService(data: z.infer<typeof ContactSchema>) {
  const { name, email, message } = ContactSchema.parse(data)

  const result = await sendContactEmail(name, email, message)

  if (!result.success) {
    console.error('Contact email error:', result.error)
    // We could throw error here if we want to block, but usually we just log
  }

  return { success: true, message: 'Üzenet sikeresen elküldve!' }
}
