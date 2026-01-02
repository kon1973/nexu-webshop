'use server'

import { headers } from 'next/headers'
import { sendContactMessageService } from '@/lib/services/contactService'
import { enforceRateLimit } from '@/lib/enforceRateLimit'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2, 'A név legalább 2 karakter legyen'),
  email: z.string().email('Érvénytelen email cím'),
  subject: z.string().min(5, 'A tárgy legalább 5 karakter legyen'),
  message: z.string().min(10, 'Az üzenet legalább 10 karakter legyen')
})

export async function sendContactMessage(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  try {
    // Rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1'
    const rl = await enforceRateLimit(ip, 10, 3600, 'contact.send')
    
    if (!rl.success) {
      return { 
        success: false, 
        error: 'Túl sok üzenet. Próbáld újra később.' 
      }
    }

    // Validate input
    const validated = ContactSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Send message
    const result = await sendContactMessageService(validated.data)
    
    return { 
      success: true, 
      message: result.message || 'Üzenet sikeresen elküldve!' 
    }
  } catch (error) {
    console.error('Contact message error:', error)
    return { success: false, error: 'Hiba történt az üzenet küldése során.' }
  }
}
