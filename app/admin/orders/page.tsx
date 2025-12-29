import { getOrdersService } from '@/lib/services/orderService'
import OrderListClient from './OrderListClient'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await getOrdersService()

  return <OrderListClient orders={orders} />
}
