import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, User, Clock, CheckCircle, XCircle, ShoppingBag, Calendar, MapPin, Truck, AlertTriangle, Star, FileText } from "lucide-react"
import ResendVerification from "./ResendVerification"
import { getLoyaltyTier } from "@/lib/loyalty"
import ReorderButton from "@/components/ReorderButton"
import { Order } from "@prisma/client"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect("/login")
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  })

  // Use stored totalSpent, fallback to calculation if 0 (for migration)
  // Filter for valid orders if calculating manually
  const calculatedTotalSpent = orders
    .filter((o: Order) => ['paid', 'completed', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum: number, order: Order) => sum + order.totalPrice, 0)
    
  const displayTotalSpent = user.totalSpent > 0 ? user.totalSpent : calculatedTotalSpent
  const currentTier = getLoyaltyTier(displayTotalSpent)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              Szia, {user.name}!
            </h1>
            <p className="text-gray-400">Üdvözlünk a profilodban. Itt követheted nyomon a rendeléseidet.</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-[#121212] border border-white/10 px-6 py-3 rounded-2xl text-center min-w-[120px]">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Rendelések</p>
              <p className="text-2xl font-bold text-white">{orders.length} db</p>
            </div>
            <div className="bg-[#121212] border border-white/10 px-6 py-3 rounded-2xl text-center min-w-[120px]">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Összesen költöttél</p>
              <p className="text-2xl font-bold text-purple-400">{displayTotalSpent.toLocaleString('hu-HU')} Ft</p>
            </div>
            <Link href="/profile/loyalty" className="bg-[#121212] border border-white/10 px-6 py-3 rounded-2xl text-center min-w-[120px] hover:bg-white/5 transition-colors group">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider group-hover:text-blue-400 transition-colors">Hűségszint</p>
              <p className={`text-2xl font-bold ${currentTier.color}`}>{currentTier.name}</p>
            </Link>
          </div>
        </div>

        {/* Email Verification Warning */}
        {!user.emailVerified && (
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-4">
            <AlertTriangle className="text-yellow-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-500">Az email címed még nincs megerősítve!</h3>
              <p className="text-sm text-gray-400 mt-1">
                Kérjük, erősítsd meg az email címedet a teljes funkcionalitás eléréséhez.
                Ellenőrizd a bejövő üzeneteidet (és a spam mappát is).
              </p>
              <ResendVerification email={user.email!} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / User Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="text-blue-400" /> Adataim
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Név</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-xl">@</span>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs text-gray-400">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{user.email}</p>
                      {user.emailVerified ? (
                        <span title="Megerősítve">
                          <CheckCircle size={14} className="text-green-500 shrink-0" />
                        </span>
                      ) : (
                        <span title="Nincs megerősítve">
                          <AlertTriangle size={14} className="text-yellow-500 shrink-0" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Link 
                  href="/profile/addresses"
                  className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Címek</p>
                    <p className="font-medium group-hover:text-purple-400 transition-colors">Szállítási és számlázási címek</p>
                  </div>
                </Link>

                <Link 
                  href="/profile/settings"
                  className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Fiók</p>
                    <p className="font-medium group-hover:text-blue-400 transition-colors">Beállítások</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/5 rounded-3xl p-6">
              <h3 className="font-bold mb-2">Segítségre van szükséged?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Ha kérdésed van a rendeléseiddel kapcsolatban, ügyfélszolgálatunk készséggel áll rendelkezésedre.
              </p>
              <Link href="/contact" className="text-sm font-bold text-blue-400 hover:text-blue-300">
                Kapcsolatfelvétel &rarr;
              </Link>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="text-purple-400" /> Korábbi rendelések
            </h2>

            {orders.length === 0 ? (
              <div className="bg-[#121212] border border-white/5 rounded-3xl p-12 text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Még nincs rendelésed</h3>
                <p className="text-gray-400 mb-6">Nézz körül a boltban és csapj le a legjobb ajánlatokra!</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Vásárlás
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-colors group">
                    <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          order.status === 'paid' ? 'bg-blue-500/10 text-blue-500' :
                          order.status === 'shipped' ? 'bg-purple-500/10 text-purple-500' :
                          order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {order.status === 'pending' ? <Clock size={20} /> :
                           order.status === 'paid' ? <CheckCircle size={20} /> :
                           order.status === 'shipped' ? <Truck size={20} /> :
                           order.status === 'completed' ? <CheckCircle size={20} /> :
                           <XCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            {new Date(order.createdAt).toLocaleDateString('hu-HU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{order.totalPrice.toLocaleString('hu-HU')} Ft</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          order.status === 'pending' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10' :
                          order.status === 'paid' ? 'text-blue-500 border-blue-500/20 bg-blue-500/10' :
                          order.status === 'completed' ? 'text-green-500 border-green-500/20 bg-green-500/10' :
                          'text-gray-500 border-gray-500/20 bg-gray-500/10'
                        }`}>
                          {order.status === 'pending' ? 'Feldolgozás alatt' :
                           order.status === 'paid' ? 'Fizetve' :
                           order.status === 'shipped' ? 'Szállítás alatt' :
                           order.status === 'completed' ? 'Teljesítve' :
                           order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-xl border border-white/5">
                              {item.product?.image || '📦'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{item.product?.name || 'Törölt termék'}</p>
                              <p className="text-xs text-gray-500">{item.quantity} db x {item.price.toLocaleString('hu-HU')} Ft</p>
                            </div>
                            <p className="font-mono text-sm text-gray-300">{(item.quantity * item.price).toLocaleString('hu-HU')} Ft</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={14} />
                          <span className="truncate max-w-[200px]">{order.customerAddress}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {order.invoiceUrl && (
                            <a 
                              href={order.invoiceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                              <FileText size={14} /> Számla
                            </a>
                          )}
                          <ReorderButton items={order.items} />
                          <Link href={`/orders/${order.id}`} className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors">
                            Részletek &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
