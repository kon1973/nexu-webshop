import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createPaymentIntentService, PaymentIntentSchema } from '@/lib/services/paymentService'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()
    
    // Normalize cart items if needed (handling string/number conversions)
    // But Zod schema expects specific types.
    // The existing code had a `normalizeCartItems` function.
    // I should probably keep it or rely on Zod's coerce.
    // Let's try to use Zod's coerce in the schema if possible, or just map it before validation.
    
    // Let's look at the body structure.
    // If the frontend sends strings for numbers, Zod will fail unless I use coerce.
    // CartItemSchema uses `z.number()`.
    // I should update CartItemSchema in cartService to use coerce if needed, or handle it here.
    // The existing code handled it manually.
    
    // Let's assume the frontend sends correct types or we fix it.
    // But to be safe, let's map it.
    
    const cartItems = Array.isArray(body.cartItems) ? body.cartItems.map((item: any) => ({
        id: Number(item.id),
        variantId: item.variantId,
        quantity: Number(item.quantity),
        selectedOptions: item.selectedOptions,
        name: item.name
    })) : []

    const payload = {
        cartItems,
        couponCode: body.couponCode
    }

    const result = PaymentIntentSchema.safeParse(payload)

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { clientSecret } = await createPaymentIntentService(result.data, session?.user?.id)

    return NextResponse.json({
      clientSecret,
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
