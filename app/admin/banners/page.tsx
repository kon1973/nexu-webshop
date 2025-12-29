import { prisma } from '@/lib/prisma'
import BannerListClient from './BannerListClient'

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: 'asc' },
  })

  return <BannerListClient banners={banners} />
}
