import { getCouponsService } from '@/lib/services/couponService'
import CouponListClient from './CouponListClient'

export const dynamic = 'force-dynamic'

export default async function CouponsPage() {
  const coupons = await getCouponsService()

  return <CouponListClient coupons={coupons} />
}
