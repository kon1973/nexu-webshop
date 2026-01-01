'use server'

import { setRateLimitSetting } from '@/lib/settingsService'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function saveRateLimits(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Forbidden')
  }

  const payload = JSON.parse(formData.get('payload') as string)
  const ip = ((await headers())?.get('x-forwarded-for') as string | null) ?? undefined

  for (const item of payload) {
    if (!item.key || !item.cfg) continue
    await setRateLimitSetting(item.key, item.cfg, { id: session.user.id, email: session.user.email ?? undefined }, ip)
  }

  return { success: true }
}
