import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  Package, User, Clock, CheckCircle, XCircle, ShoppingBag, Calendar, 
  MapPin, Truck, AlertTriangle, FileText, Heart, ArrowRight,
  TrendingUp, Award, CreditCard, Gift, Settings, ChevronRight, Star
} from "lucide-react"
import ResendVerification from "./ResendVerification"
import { getLoyaltyTier, getNextLoyaltyTier } from "@/lib/loyalty"
import ReorderButton from "@/components/ReorderButton"
import { Order } from "@prisma/client"
import { getImageUrl } from "@/lib/image"
import ProfileActions from "./ProfileActions"

const statusConfig = {
  pending: { label: 'Feldolgozás alatt', color: 'yellow', icon: Clock },
  paid: { label: 'Fizetve', color: 'blue', icon: CreditCard },
  shipped: { label: 'Szállítás alatt', color: 'purple', icon: Truck },
  completed: { label: 'Teljesítve', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Törölve', color: 'red', icon: XCircle },
  delivered: { label: 'Kézbesítve', color: 'green', icon: CheckCircle },
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      favorites: { take: 4, include: { product: true } },
      reviews: { take: 5, orderBy: { createdAt: 'desc' }, include: { product: true } },
    }
  })

  if (!user) {
    redirect("/login")
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  })

  // Calculate statistics
  const validOrders = orders.filter((o: Order) => ['paid', 'completed', 'shipped', 'delivered'].includes(o.status))
  const calculatedTotalSpent = validOrders.reduce((sum: number, order: Order) => sum + order.totalPrice, 0)
  const displayTotalSpent = user.totalSpent > 0 ? user.totalSpent : calculatedTotalSpent
  
  const currentTier = getLoyaltyTier(displayTotalSpent)
  const nextTier = getNextLoyaltyTier(displayTotalSpent)
  
  // Calculate progress to next tier
  let progress = 100
  let amountToNextTier = 0
  if (nextTier) {
    const tierRange = nextTier.minSpent - currentTier.minSpent
    const spentInTier = displayTotalSpent - currentTier.minSpent
    progress = Math.min(100, (spentInTier / tierRange) * 100)
    amountToNextTier = nextTier.minSpent - displayTotalSpent
  }

  // Order stats
  const pendingOrders = orders.filter((o: Order) => ['pending', 'paid', 'shipped'].includes(o.status)).length
  const completedOrders = validOrders.length
  const avgOrderValue = completedOrders > 0 ? Math.round(displayTotalSpent / completedOrders) : 0

  // Recent activity - combine orders and reviews
  type ActivityItem = {
    type: 'order' | 'review'
    id: string
    title: string
    subtitle: string
    status: string
    date: Date
  }
  
  const recentActivity: ActivityItem[] = [
    ...orders.slice(0, 5).map(o => ({
      type: 'order' as const,
      id: o.id,
      title: `Rendelés #${o.id.slice(-6).toUpperCase()}`,
      subtitle: `${o.totalPrice.toLocaleString('hu-HU')} Ft`,
      status: o.status,
      date: o.createdAt,
    })),
    ...user.reviews.map(r => ({
      type: 'review' as const,
      id: r.id,
      title: `Értékelés: ${r.product.name.slice(0, 20)}...`,
      subtitle: `${r.rating}★`,
      status: 'completed',
      date: r.createdAt,
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 md:pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-[#121212] to-blue-900/30 rounded-3xl p-6 md:p-10 mb-6 border border-white/10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg shadow-purple-500/30">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Szia, {user.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base flex items-center gap-2">
                    {user.email}
                    {user.emailVerified ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={14} className="text-yellow-500" />
                    )}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3 md:gap-4 flex-wrap">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[90px]">
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Rendelések</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{orders.length}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[90px]">
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Költés</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-400">{displayTotalSpent >= 1000 ? `${(displayTotalSpent / 1000).toFixed(0)}k` : displayTotalSpent}</p>
                </div>
                <Link 
                  href="/profile/loyalty"
                  className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-2xl text-center min-w-[90px] hover:bg-white/10 transition-colors group"
                >
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Szint</p>
                  <p className={`text-xl md:text-2xl font-bold ${currentTier.color}`}>{currentTier.name}</p>
                </Link>
              </div>
            </div>

            {/* Loyalty Progress Bar */}
            {nextTier && (
              <div className="mt-6 md:mt-8">
                <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                  <span className={`font-bold ${currentTier.color}`}>{currentTier.name}</span>
                  <span className="text-gray-400">
                    Még <span className="font-bold text-white">{amountToNextTier.toLocaleString('hu-HU')} Ft</span> a(z) <span className={nextTier.color}>{nextTier.name}</span> szintig
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Verification Warning */}
        {!user.emailVerified && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-4">
            <AlertTriangle className="text-yellow-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-500">Az email címed még nincs megerősítve!</h3>
              <p className="text-sm text-gray-400 mt-1">
                Kérjük, erősítsd meg az email címedet a teljes funkcionalitás eléréséhez.
              </p>
              <ResendVerification email={user.email!} />
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">Összesen</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-white">{displayTotalSpent.toLocaleString('hu-HU')} Ft</p>
            <p className="text-xs text-gray-500 mt-1">{completedOrders} rendelésből</p>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <ShoppingBag size={20} />
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">Átlag</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-white">{avgOrderValue.toLocaleString('hu-HU')} Ft</p>
            <p className="text-xs text-gray-500 mt-1">rendelésenként</p>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Gift size={20} />
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">Kedvezmény</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-white">{currentTier.discount * 100}%</p>
            <p className="text-xs text-gray-500 mt-1">állandó</p>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Clock size={20} />
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">Aktív</span>
            </div>
            <p className="text-lg md:text-xl font-bold text-white">{pendingOrders}</p>
            <p className="text-xs text-gray-500 mt-1">folyamatban</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Links */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Settings size={18} className="text-purple-400" /> Gyors elérés
                </h2>
              </div>
              <div className="divide-y divide-white/5">
                <Link 
                  href="/profile/settings"
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-blue-400 transition-colors">Fiók beállítások</p>
                      <p className="text-xs text-gray-500">Név, jelszó módosítás</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                </Link>

                <Link 
                  href="/profile/addresses"
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-purple-400 transition-colors">Címeim</p>
                      <p className="text-xs text-gray-500">Szállítási, számlázási</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                </Link>

                <Link 
                  href="/profile/loyalty"
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-yellow-400 transition-colors">Hűségprogram</p>
                      <p className="text-xs text-gray-500">{currentTier.discount * 100}% kedvezmény</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                </Link>

                <Link 
                  href="/favorites"
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                      <Heart size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-red-400 transition-colors">Kedvencek</p>
                      <p className="text-xs text-gray-500">{user.favorites.length} termék</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Clock size={18} className="text-blue-400" /> Aktivitás
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    const statusColor = statusConfig[activity.status as keyof typeof statusConfig]?.color || 'gray'
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.type === 'order' 
                            ? `bg-${statusColor}-500/20 text-${statusColor}-400`
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {activity.type === 'order' ? <Package size={14} /> : <Star size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
                        </div>
                        <span className="text-[10px] text-gray-600">
                          {new Date(activity.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Még nincs aktivitás</p>
                )}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-2">Segítségre van szükséged?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Ügyfélszolgálatunk készséggel áll rendelkezésedre.
              </p>
              <Link href="/contact" className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                Kapcsolatfelvétel <ArrowRight size={14} />
              </Link>
            </div>

            <ProfileActions role={user.role} />
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Package className="text-purple-400" /> Rendeléseim
              </h2>
              {orders.length > 5 && (
                <span className="text-sm text-gray-500">{orders.length} rendelés</span>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={40} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Még nincs rendelésed</h3>
                <p className="text-gray-400 mb-6 text-sm md:text-base">Nézz körül a boltban és csapj le a legjobb ajánlatokra!</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  Vásárlás <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                  const StatusIcon = status.icon

                  return (
                    <div key={order.id} className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
                      {/* Order Header */}
                      <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex flex-wrap gap-3 md:gap-4 justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                              ${status.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                              ${status.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : ''}
                              ${status.color === 'purple' ? 'bg-purple-500/10 text-purple-500' : ''}
                              ${status.color === 'green' ? 'bg-green-500/10 text-green-500' : ''}
                              ${status.color === 'red' ? 'bg-red-500/10 text-red-500' : ''}
                            `}>
                              <StatusIcon size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">#{order.id.slice(-8).toUpperCase()}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar size={12} />
                                {new Date(order.createdAt).toLocaleDateString('hu-HU', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-lg md:text-xl font-bold text-white">{order.totalPrice.toLocaleString('hu-HU')} Ft</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                ${status.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : ''}
                                ${status.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                                ${status.color === 'purple' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : ''}
                                ${status.color === 'green' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''}
                                ${status.color === 'red' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                              `}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="p-4 md:p-5">
                        <div className="space-y-3">
                          {order.items.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 overflow-hidden flex-shrink-0">
                                {getImageUrl(item.product?.image) ? (
                                  <img src={getImageUrl(item.product?.image)!} alt={item.product?.name || ''} className="w-full h-full object-cover" />
                                ) : (
                                  <Package size={20} className="text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-sm truncate">{item.product?.name || 'Törölt termék'}</p>
                                <p className="text-xs text-gray-500">{item.quantity} db × {item.price.toLocaleString('hu-HU')} Ft</p>
                              </div>
                              <p className="font-mono text-sm text-gray-400 hidden md:block">{(item.quantity * item.price).toLocaleString('hu-HU')} Ft</p>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-xs text-gray-500 text-center pt-2">+{order.items.length - 3} további termék</p>
                          )}
                        </div>
                        
                        {/* Order Footer */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-3 justify-between items-center">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={14} />
                            <span className="truncate max-w-[150px] md:max-w-[250px]">{order.customerAddress}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {order.invoiceUrl && (
                              <a 
                                href={order.invoiceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                              >
                                <FileText size={14} /> Számla
                              </a>
                            )}
                            <ReorderButton items={order.items} />
                            <Link 
                              href={`/orders/${order.id}`} 
                              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                            >
                              Részletek <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
