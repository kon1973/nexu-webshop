import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PackageSearch, Truck, MapPin, CreditCard, Receipt } from 'lucide-react'
import { auth } from '@/lib/auth'
import CancelOrderButton from './CancelOrderButton'
import OrderTimeline from './OrderTimeline'
import ReorderButton from '@/components/ReorderButton'
import { getOrderByIdService } from '@/lib/services/orderService'
import { OrderItem } from '@prisma/client'

function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'F\u00FCgg\u0151ben',
      className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    },
    paid: {
      label: 'Fizetve',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    shipped: {
      label: 'Sz\u00E1ll\u00EDt\u00E1s alatt',
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    delivered: {
      label: 'K\u00E9zbes\u00EDtve',
      className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    cancelled: {
      label: 'T\u00F6r\u00F6lve',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  }

  return (
    map[status] || {
      label: status,
      className: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    }
  )
}

export default async function OrderTrackingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const orderId = params.id
  const session = await auth()

  if (!orderId) return notFound()

  const order = await getOrderByIdService(orderId)

  if (!order) return notFound()

  // Security check: If order belongs to a user, only that user can view it
  if (order.userId) {
    if (!session?.user?.id || session.user.id !== order.userId) {
      return notFound()
    }
  }

  const { label, className } = statusBadge(order.status)

  // Calculate subtotal
  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  // Assuming shipping cost is the difference between total and (subtotal - discounts)
  // Or we can try to infer it. 
  // Total = Subtotal + Shipping - Discount - Loyalty
  // Shipping = Total - Subtotal + Discount + Loyalty
  const shippingCost = order.totalPrice - subtotal + (order.discountAmount || 0) + (order.loyaltyDiscount || 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft size={20} /> {'Vissza a profilhoz'}
        </Link>

        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
                <PackageSearch className="text-purple-400" />
                {'Rendel\u00E9s k\u00F6vet\u00E9se'}
              </h1>
              <p className="text-gray-400 text-sm">
                {'Rendel\u00E9ssz\u00E1m'}:{' '}
                <span className="font-mono text-gray-300">#{order.id.slice(-6).toUpperCase()}</span>
              </p>
              <p className="text-gray-500 text-xs font-mono break-all mt-2">{order.id}</p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${className}`}
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                {label}
              </span>
              <ReorderButton items={order.items} />
            </div>
          </div>

          <OrderTimeline status={order.status} createdAt={order.createdAt} />

          {order.status === 'pending' && (
            <div className="flex justify-end mb-6">
              <CancelOrderButton orderId={order.id} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
              <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                <MapPin size={16} /> Szállítási adatok
              </h3>
              <p className="font-bold text-white mb-1">{order.customerName}</p>
              <p className="text-gray-300 text-sm mb-1">{order.customerAddress}</p>
              <p className="text-gray-400 text-xs">{order.customerEmail}</p>
              {order.customerPhone && <p className="text-gray-400 text-xs">{order.customerPhone}</p>}
            </div>

            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
              <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                <CreditCard size={16} /> Fizetési információk
              </h3>
              <p className="font-bold text-white mb-1">
                {order.paymentMethod === 'cod' ? 'Utánvét' : 
                 order.paymentMethod === 'stripe' ? 'Bankkártya' : 
                 order.paymentMethod === 'transfer' ? 'Előre utalás' : order.paymentMethod}
              </p>
              <p className="text-gray-400 text-xs">
                A fizetés {order.status === 'paid' || order.status === 'completed' || order.status === 'shipped' ? 'sikeresen megtörtént' : 'még nem történt meg'}.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Receipt className="text-purple-400" /> Rendelés részletei
          </h2>
          
          <div className="space-y-4 mb-8">
            {order.items.map((item: any) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#0a0a0a] rounded-xl border border-white/10 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {item.product?.image && (item.product.image.startsWith('http') || item.product.image.startsWith('/')) ? (
                      <img src={item.product.image} alt={item.name || ''} className="w-full h-full object-cover" />
                    ) : (
                      item.product?.image || '\u{1f4e6}'
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white leading-tight mb-1">{item.name || item.product?.name || 'Ismeretlen term\u00E9k'}</p>
                    {item.selectedOptions && (
                      <div className="text-xs text-gray-500 mb-1 flex flex-wrap gap-2">
                        {Object.entries(item.selectedOptions as Record<string, string>).map(([key, value]) => (
                          <span key={key} className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      {item.quantity} db x {item.price.toLocaleString('hu-HU')} Ft
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-mono text-white font-bold">
                    {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0a0a0a] rounded-xl p-6 border border-white/5 space-y-3">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Részösszeg</span>
              <span>{subtotal.toLocaleString('hu-HU')} Ft</span>
            </div>
            
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Szállítási költség</span>
              <span>{shippingCost > 0 ? `${shippingCost.toLocaleString('hu-HU')} Ft` : 'Ingyenes'}</span>
            </div>

            {(order.discountAmount > 0 || order.loyaltyDiscount > 0) && (
              <div className="flex justify-between text-green-400 text-sm">
                <span>Kedvezmények</span>
                <span>-{(order.discountAmount + order.loyaltyDiscount).toLocaleString('hu-HU')} Ft</span>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
              <span className="font-bold text-white">Végösszeg</span>
              <span className="text-2xl font-extrabold text-purple-400 font-mono">
                {order.totalPrice.toLocaleString('hu-HU')} Ft
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

