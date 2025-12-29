import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { cancelOrderService } from '@/lib/services/orderService'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    await cancelOrderService(id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error cancelling order:', error)
    if (error.message === 'Order not found') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error.message === 'Only pending orders can be cancelled') {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
