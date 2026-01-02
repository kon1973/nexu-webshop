'use server'

import { headers } from 'next/headers'
import { subscribeToNewsletterService } from '@/lib/services/newsletterService'
import { enforceRateLimit } from '@/lib/enforceRateLimit'
import { z } from 'zod'

const NewsletterSchema = z.object({
  email: z.string().email('Érvénytelen email cím'),
  name: z.string().optional()
})

export async function subscribeToNewsletter(data: { email: string; name?: string }) {
  try {
    // Rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1'
    const rl = await enforceRateLimit(ip, 10, 3600, 'newsletter.subscribe')
    
    if (!rl.success) {
      return { 
        success: false, 
        error: 'Túl sok feliratkozási kísérlet. Próbáld újra később.' 
      }
    }

    // Validate input
    const validated = NewsletterSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Subscribe
    const result = await subscribeToNewsletterService(validated.data)
    
    return { 
      success: result.status === 200 || result.status === 201,
      message: result.message 
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return { success: false, error: 'Hiba történt a feliratkozás során.' }
  }
}
