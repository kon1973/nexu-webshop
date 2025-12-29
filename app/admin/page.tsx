import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import OrderStatus from './OrderStatus'
import SalesChart from './SalesChart'
import OrderStatusChart from './OrderStatusChart'
import ExportOrdersButton from './ExportOrdersButton'
import { Calendar, Mail, MapPin, Plus, Star, ArrowRight } from 'lucide-react'
import type { Product, Review, Order, User as PrismaUser, OrderItem } from '@prisma/client'

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminPage() {
  // 1. Total Revenue & Orders
  const revenueAgg = await prisma.order.aggregate({
    where: { status: { not: 'cancelled' } },
    _sum: { totalPrice: true },
    _count: { id: true },
  })
  const totalRevenue = revenueAgg._sum.totalPrice || 0
  const totalOrders = revenueAgg._count.id

  // 2. Pending Orders
  const pendingOrders = await prisma.order.count({
    where: { status: { in: ['pending', 'paid'] } },
  })

  // 3. Recent Orders (Limit to 10)
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: {
        include: { product: true },
      },
    },
  })

  // 4. Low Stock
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lt: 5 } },
    orderBy: { stock: 'asc' },
    take: 5,
  })

  // 5. Recent Reviews
  const recentReviews = await prisma.review.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { product: true },
  })

  // 6. Chart Data (Last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const chartOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      status: { in: ['pending', 'paid', 'shipped', 'completed'] }
    },
    select: { createdAt: true, totalPrice: true }
  })

  const salesByDate = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
    salesByDate.set(dateStr, 0)
  }

  chartOrders.forEach((order: { createdAt: Date, totalPrice: number }) => {
    const dateStr = new Date(order.createdAt).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
    if (salesByDate.has(dateStr)) {
      salesByDate.set(dateStr, (salesByDate.get(dateStr) || 0) + order.totalPrice)
    }
  })

  const chartData = Array.from(salesByDate.entries()).map(([date, amount]) => ({
    date,
    amount,
  }))

  // 7. Top Products
  const topSellingItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { order: { status: { not: 'cancelled' } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  })

  // Fetch product names for the top selling items
  // Note: productId in OrderItem might be null if product was deleted, but schema says Int (not optional?)
  // Let's check schema. OrderItem: product Product @relation... productId Int. It is not optional.
  // However, if we want to be safe, we filter nulls if any.
  
  const productIds = topSellingItems
    .map((item: { productId: number | null, _sum: { quantity: number | null } }) => item.productId)
    .filter((id: number | null): id is number => id !== null)

  const productsInfo = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true }
  })

  const topProducts = topSellingItems.map((item: { productId: number | null, _sum: { quantity: number | null } }) => {
    const product = productsInfo.find((p) => p.id === item.productId)
    return [product?.name || 'Ismeretlen', item._sum.quantity || 0] as [string, number]
  })

  // 8. User Stats
  const totalUsers = await prisma.user.count()
  const newUsers = await prisma.user.count({
    where: {
      createdAt: { gte: sevenDaysAgo }
    }
  })

  // 9. Order Status Distribution
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { id: true },
  })

  const orderStatusData = ordersByStatus.map((item: { status: string, _count: { id: number } }) => ({
    status: item.status,
    count: item._count.id
  }))

  // 10. Average Order Value
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24 selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Admin vezérlőpult
          </h1>

          <div className="flex gap-3 items-center flex-wrap justify-center">
            <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/20 inline-flex items-center gap-2">
              <Calendar size={16} className="opacity-80" /> {new Date().toLocaleDateString('hu-HU')}
            </span>

            <ExportOrdersButton />

            <Link
              href="/admin/add-product"
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 text-sm"
            >
              <Plus size={16} /> Új termék
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Összes bevétel</h3>
            <p className="text-3xl font-bold text-green-400">{totalRevenue.toLocaleString('hu-HU')} Ft</p>
          </div>

          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Összes rendelés</h3>
            <p className="text-3xl font-bold text-blue-400">{totalOrders} db</p>
          </div>


          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Aktív rendelések</h3>
            <p className="text-3xl font-bold text-yellow-400">{pendingOrders} db</p>
          </div>

          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Felhasználók</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-purple-400">{totalUsers}</p>
              <span className="text-sm text-green-400 font-medium">+{newUsers} új</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-white">Bevétel alakulása (utolsó 7 nap)</h2>
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 h-[350px]">
              <SalesChart data={chartData} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6 text-white">Rendelések státusz szerint</h2>
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 h-[350px]">
              <OrderStatusChart data={orderStatusData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6 text-white">Legnépszerűbb termékek</h2>
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 h-full">
              <div className="space-y-6">
                {topProducts.map(([name, count]: [string, number], index: number) => {
                  const maxCount = topProducts[0]?.[1] || 1
                  const percentage = (count / maxCount) * 100
                  
                  return (
                    <div key={name} className="relative">
                      <div className="flex justify-between items-end mb-2 text-sm">
                        <span className="font-medium text-white truncate max-w-[70%]">{name}</span>
                        <span className="font-bold text-purple-400">{count} db</span>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                {topProducts.length === 0 && <p className="text-gray-500 italic text-center py-4">Még nincs eladott termék.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6 text-white">Legutóbbi értékelések</h2>
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 h-full">
              <div className="space-y-4">
                {recentReviews.map((review: Review & { product: Product }) => (
                  <div key={review.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-sm font-bold">{review.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('hu-HU')}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2 mb-2 italic">"{review.text}"</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="truncate max-w-[150px]">{review.product.name}</span>
                      <span>•</span>
                      <span>{review.userName}</span>
                    </div>
                  </div>
                ))}
                {recentReviews.length === 0 && <p className="text-gray-500 italic text-center py-4">Még nincsenek értékelések.</p>}
                {recentReviews.length > 0 && (
                  <Link href="/admin/reviews" className="block text-center text-sm text-purple-400 hover:text-purple-300 mt-4">
                    Összes értékelés megtekintése
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6 text-red-400">Alacsony készlet</h2>
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 h-full">
              <div className="space-y-4">
                {lowStockProducts.map((product: Product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{product.image}</span>
                      <div>
                        <h3 className="font-bold text-white truncate max-w-[120px]">{product.name}</h3>
                        <p className="text-red-400 text-sm font-bold">Csak {product.stock} db!</p>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/edit-product/${product.id}`} 
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      Frissítés
                    </Link>
                  </div>
                ))}
                {lowStockProducts.length === 0 && <p className="text-gray-500 italic text-center py-4">Minden termékből van elég készlet.</p>}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Legutóbbi rendelések</h2>

        <div className="space-y-4">
          {recentOrders.map((order: Order & { user: PrismaUser | null, items: (OrderItem & { product: Product | null })[] }) => (
            <div
              key={order.id}
              className="bg-[#121212] border border-white/5 rounded-xl p-6 hover:bg-[#151515] transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-6 border-b border-white/5 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-gray-500">#{order.id.slice(-6).toUpperCase()}</span>
                    <span className="text-lg font-bold">{order.customerName}</span>
                  </div>
                  <div className="text-sm text-gray-400 flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <span className="inline-flex items-center gap-2">
                      <Mail size={14} className="opacity-70" /> {order.customerEmail}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={14} className="opacity-70" /> {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Végösszeg</p>
                    <p className="text-xl font-bold text-white">{order.totalPrice.toLocaleString('hu-HU')} Ft</p>
                  </div>

                  <OrderStatus orderId={order.id} initialStatus={order.status} />
                </div>
              </div>

              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase mb-3">Rendelt tételek</p>
                <div className="space-y-3">
                  {order.items.map((item: OrderItem & { product: Product | null }) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.product?.image || '\u{1f4e6}'}</span>
                        <span className="text-gray-300">
                          {item.product?.name || 'Ismeretlen termék'}{' '}
                          <span className="text-gray-600 ml-2">x{item.quantity}</span>
                        </span>
                      </div>
                      <span className="text-gray-400">{(item.price * item.quantity).toLocaleString('hu-HU')} Ft</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 flex gap-2">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={14} className="opacity-70" /> Szállítási cím:
                </span>
                <span className="text-gray-400">{order.customerAddress}</span>
              </div>
            </div>
          ))}

          {recentOrders.length === 0 && (
            <div className="text-center py-20 text-gray-500">Még nem érkezett rendelés.</div>
          )}
          
          {recentOrders.length > 0 && (
            <div className="text-center mt-8">
              <Link 
                href="/admin/orders" 
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Összes rendelés megtekintése <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

