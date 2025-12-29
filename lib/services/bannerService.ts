import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const BannerSchema = z.object({
  title: z.string().min(1, "Cím megadása kötelező"),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1, "Kép megadása kötelező"),
  link: z.string().optional().nullable(),
  location: z.string().default('HOME'),
  linkType: z.string().default('BUTTON'),
  showButton: z.boolean().default(true),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

export async function getBannersService(location?: string) {
  const where = location ? { location } : {}
  return await prisma.banner.findMany({
    where,
    orderBy: { order: 'asc' }
  })
}

export async function createBannerService(data: z.infer<typeof BannerSchema>) {
  const validatedData = BannerSchema.parse(data)
  return await prisma.banner.create({
    data: validatedData
  })
}

export async function updateBannerService(id: string, data: Partial<z.infer<typeof BannerSchema>>) {
  const validatedData = BannerSchema.partial().parse(data)
  return await prisma.banner.update({
    where: { id },
    data: validatedData
  })
}

export async function deleteBannerService(id: string) {
  return await prisma.banner.delete({
    where: { id }
  })
}
