import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { syncCartService, getCartService, SyncCartSchema } from '@/lib/services/cartService'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = SyncCartSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 })
    }

    const { items } = result.data
    await syncCartService(session.user.id, items)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sync cart error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const items = await getCartService(session.user.id)
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
