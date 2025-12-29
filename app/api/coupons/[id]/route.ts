import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { updateCouponService, deleteCouponService, CouponSchema } from '@/lib/services/couponService'

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    
    const result = CouponSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    try {
      const coupon = await updateCouponService(id, result.data)
      return NextResponse.json(coupon)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Ez a kuponkód már létezik' }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteCouponService(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba a törlés során' }, { status: 500 })
  }
}
