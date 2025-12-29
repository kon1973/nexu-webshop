import { NextResponse } from 'next/server'
import { validateCartService } from '@/lib/services/cartService'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items } = body

    const result = await validateCartService(items)

    if (!result.valid) {
      return NextResponse.json({ valid: false, errors: result.errors }, { status: 409 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Cart validation error:', error)
    return NextResponse.json({ valid: false, error: 'Szerverhiba' }, { status: 500 })
  }
}
