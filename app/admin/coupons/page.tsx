import { prisma } from '@/lib/prisma'
import CouponListClient from './CouponListClient'

export const dynamic = 'force-dynamic'

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <CouponListClient coupons={coupons} />
}
