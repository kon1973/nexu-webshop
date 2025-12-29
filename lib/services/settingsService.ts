import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const SettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional(),
})

export const UpdateSettingsSchema = z.array(z.object({
  key: z.string().min(1),
  value: z.string(),
}))

export async function getSettingsService() {
  return await prisma.setting.findMany({
    orderBy: { key: 'asc' }
  })
}

export async function updateSettingsService(updates: z.infer<typeof UpdateSettingsSchema>) {
  // Use transaction for atomic updates
  await prisma.$transaction(
    updates.map((update) =>
      prisma.setting.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: { key: update.key, value: update.value },
      })
    )
  )
}
