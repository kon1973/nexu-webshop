'use server'

import { validateCouponService } from '@/lib/services/couponService'

export async function validateCoupon(code: string, cartTotal: number, cartItems: { id: number }[]) {
  try {
    const coupon = await validateCouponService({ code, cartTotal, cartItems })
    return { success: true, coupon }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
