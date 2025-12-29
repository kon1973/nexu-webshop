import { validateCouponService } from '@/lib/services/couponService'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { code, cartTotal, cartItems } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Hiányzó kód' }, { status: 400 })
    }

    const coupon = await validateCouponService({ code, cartTotal, cartItems })

    return NextResponse.json(coupon)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
