import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCouponService, getCouponsService, CouponSchema } from '@/lib/services/couponService'

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupons = await getCouponsService()
    return NextResponse.json(coupons)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const result = CouponSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  try {
    const coupon = await createCouponService(result.data)
    return NextResponse.json(coupon)
  } catch (error) {
    return NextResponse.json({ error: 'Már létezik ilyen kód' }, { status: 400 })
  }
}
