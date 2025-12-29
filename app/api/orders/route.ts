import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrdersService, updateOrderService } from '@/lib/services/orderService'
import type { Order, OrderItem, Product } from '@prisma/client'

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const isExport = searchParams.get('export') === 'true'

  if (isExport) {
    const orders = await getOrdersService()

    const csvHeader = 'Order ID,Date,Customer Name,Email,Address,Total Price,Status,Items\n'
    const csvRows = orders.map((order: Order & { items: (OrderItem & { product: Product | null })[] }) => {
      const itemsStr = order.items
        .map((item: OrderItem & { product: Product | null }) => `${item.product?.name || 'Deleted'} (x${item.quantity})`)
        .join('; ')
      
      return [
        order.id,
        order.createdAt.toISOString(),
        `"${order.customerName}"`,
        order.customerEmail,
        `"${order.customerAddress}"`,
        order.totalPrice,
        order.status,
        `"${itemsStr}"`
      ].join(',')
    }).join('\n')

    return new NextResponse(csvHeader + csvRows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Hi\u00E1nyz\u00F3 adatok' }, { status: 400 })
    }

    const updatedOrder = await updateOrderService(orderId, { status })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ success: false, error: 'Szerver hiba' }, { status: 500 })
  }
}

