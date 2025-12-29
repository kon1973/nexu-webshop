import { prisma } from '@/lib/prisma'
import AnalyticsClient from './AnalyticsClient'
import { startOfMonth, subMonths, endOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  // 1. Cart Statistics
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const activeCartsCount = await prisma.cart.count({
    where: { updatedAt: { gte: oneDayAgo } }
  })

  const abandonedCartsCount = await prisma.cart.count({
    where: { updatedAt: { lt: oneDayAgo } }
  })

  // Calculate potential revenue in carts
  const cartsWithItems = await prisma.cart.findMany({
    include: {
      items: {
        include: { product: true, variant: true }
      }
    }
  })

  let potentialRevenue = 0
  cartsWithItems.forEach((cart: any) => {
    cart.items.forEach((item: any) => {
      const price = item.variant ? item.variant.price : item.product.price
      potentialRevenue += price * item.quantity
    })
  })

  // 2. Order Statistics (Monthly)
  const currentMonthStart = startOfMonth(new Date())
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1))
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1))

  const currentMonthRevenueAgg = await prisma.order.aggregate({
    where: { 
      createdAt: { gte: currentMonthStart },
      status: { not: 'cancelled' }
    },
    _sum: { totalPrice: true },
    _count: { id: true }
  })

  const lastMonthRevenueAgg = await prisma.order.aggregate({
    where: { 
      createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      status: { not: 'cancelled' }
    },
    _sum: { totalPrice: true },
    _count: { id: true }
  })

  const currentRevenue = currentMonthRevenueAgg._sum.totalPrice || 0
  const lastRevenue = lastMonthRevenueAgg._sum.totalPrice || 0
  
  const revenueGrowth = lastRevenue === 0 ? 100 : ((currentRevenue - lastRevenue) / lastRevenue) * 100

  // 3. Top Products by Revenue
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  })

  // Fetch product details
  const productIds = topProducts.map((p: any) => p.productId).filter((id: any): id is number => id !== null)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true }
  })

  const topProductsWithDetails = topProducts.map((tp: any) => {
    const product = products.find((p: any) => p.id === tp.productId)
    return {
      name: product?.name || 'Ismeretlen',
      quantity: tp._sum.quantity || 0,
      revenue: (product?.price || 0) * (tp._sum.quantity || 0)
    }
  })

  return (
    <AnalyticsClient 
      data={{
        activeCartsCount,
        abandonedCartsCount,
        potentialRevenue,
        currentRevenue,
        revenueGrowth,
        currentOrders: currentMonthRevenueAgg._count.id,
        topProducts: topProductsWithDetails
      }}
    />
  )
}
