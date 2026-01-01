import { validateCouponService } from '@/lib/services/couponService'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { enforceRateLimit, rateLimitExceededResponse } from '@/lib/enforceRateLimit'

export async function POST(req: Request) {
  try {
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1'
    const rl = await enforceRateLimit(ip, 30, 60, 'coupons.validate')
    if (!rl.success) return rateLimitExceededResponse(undefined, rl.reset)

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
