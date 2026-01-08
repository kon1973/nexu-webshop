import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Package, Clock, CheckCircle, XCircle, Truck, 
  CreditCard, ChevronRight, ArrowLeft, Search,
  Calendar, MapPin, Eye, RotateCcw, Filter
} from "lucide-react"
import { getImageUrl } from "@/lib/image"
import ReorderButton from "@/components/ReorderButton"
import ProfileSidebar from "../ProfileSidebar"
import type { Order, OrderItem, Product } from "@prisma/client"

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { label: 'Feldolgozás alatt', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  paid: { label: 'Fizetve', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20', icon: CreditCard },
  shipped: { label: 'Szállítás alatt', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20', icon: Truck },
  completed: { label: 'Teljesítve', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
  cancelled: { label: 'Törölve', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20', icon: XCircle },
  delivered: { label: 'Kézbesítve', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
}

type OrderWithItems = Order & {
  items: (OrderItem & { product: Product | null })[]
}

export const metadata = {
  title: 'Rendeléseim - NEXU Webshop',
  description: 'Tekintsd meg és kövesd nyomon rendeléseidet',
}

export default async function OrdersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const session = await auth()
  const params = await searchParams

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile/orders")
  }

  const statusFilter = params.status
  const page = parseInt(params.page || '1')
  const perPage = 10

  const where = {
    userId: session.user.id,
    ...(statusFilter && statusFilter !== 'all' ? { status: statusFilter } : {})
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { 
        items: { 
          include: { product: true },
          take: 4 
        } 
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.order.count({ where })
  ])

  // Get status counts for filter badges
  const statusCounts = await prisma.order.groupBy({
    by: ['status'],
    where: { userId: session.user.id },
    _count: true,
  })

  const totalPages = Math.ceil(totalCount / perPage)

  const getStatusCount = (status: string) => {
    return statusCounts.find(s => s.status === status)?._count || 0
  }

  const allOrdersCount = statusCounts.reduce((sum, s) => sum + s._count, 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 md:pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - hidden on mobile */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">
                  Fiókom
                </h2>
                <ProfileSidebar />
              </div>
            </div>
          </aside>
          
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href="/profile" 
                className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Rendeléseim</h1>
                <p className="text-gray-400 text-sm mt-1">{allOrdersCount} rendelés összesen</p>
              </div>
            </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <Link
            href="/profile/orders"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              !statusFilter || statusFilter === 'all'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Package size={16} />
            Mind ({allOrdersCount})
          </Link>
          
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = getStatusCount(status)
            if (count === 0) return null
            const Icon = config.icon
            return (
              <Link
                key={status}
                href={`/profile/orders?status=${status}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? `${config.bgColor} ${config.color} border`
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon size={16} />
                {config.label} ({count})
              </Link>
            )
          })}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-[#121212] border border-white/5 rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Package className="text-purple-400" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Még nincsenek rendeléseid</h3>
            <p className="text-gray-400 mb-6">Fedezd fel kínálatunkat és rendelj most!</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all"
            >
              Böngészés
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(orders as OrderWithItems[]).map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = status.icon
              const orderDate = new Date(order.createdAt)
              
              return (
                <div 
                  key={order.id} 
                  className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group"
                >
                  {/* Order Header */}
                  <div className="p-4 md:p-5 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${status.bgColor} border flex items-center justify-center ${status.color}`}>
                          <StatusIcon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">#{order.id.slice(-8).toUpperCase()}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bgColor} ${status.color} border`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {orderDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {orderDate.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{order.totalPrice.toLocaleString('hu-HU')} Ft</p>
                          <p className="text-xs text-gray-500">{order.items.length} termék</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4 md:p-5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div 
                          key={idx}
                          className="flex-shrink-0 w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group/item"
                        >
                          {item.product?.image ? (
                            <Image
                              src={getImageUrl(item.product.image) || ''}
                              alt={item.product.name}
                              fill
                              className="object-contain p-1"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-600" />
                            </div>
                          )}
                          {item.quantity > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {item.quantity}×
                            </span>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <span className="text-gray-400 text-sm font-bold">+{order.items.length - 4}</span>
                        </div>
                      )}
                      
                      {/* Spacer */}
                      <div className="flex-1" />
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">Részletek</span>
                        </Link>
                        
                        {['completed', 'delivered'].includes(order.status) && (
                          <ReorderButton items={order.items} />
                        )}
                      </div>
                    </div>
                    
                    {/* Shipping Address */}
                    {order.customerAddress && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <MapPin size={12} />
                          <span className="truncate">{order.customerAddress}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/profile/orders?${statusFilter ? `status=${statusFilter}&` : ''}page=${page - 1}`}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                Előző
              </Link>
            )}
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <Link
                    key={pageNum}
                    href={`/profile/orders?${statusFilter ? `status=${statusFilter}&` : ''}page=${pageNum}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                      page === pageNum 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
            </div>
            
            {page < totalPages && (
              <Link
                href={`/profile/orders?${statusFilter ? `status=${statusFilter}&` : ''}page=${page + 1}`}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                Következő
              </Link>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}