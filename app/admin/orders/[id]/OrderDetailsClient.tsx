'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, CreditCard, Mail, MapPin, Package, Truck, User } from 'lucide-react'
import type { Order, OrderItem, Product, User as PrismaUser, OrderNote } from '@prisma/client'
import { useRouter } from 'next/navigation'
import OrderNotes from './OrderNotes'

type OrderWithDetails = Order & {
  user: PrismaUser | null
  items: (OrderItem & { product: Product | null })[]
  notes: OrderNote[]
}

export default function OrderDetailsClient({ order }: { order: OrderWithDetails }) {
  const router = useRouter()
  const [status, setStatus] = useState(order.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return
    
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      setStatus(newStatus)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Hiba történt a státusz frissítésekor')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'
      case 'paid': return 'text-blue-400 border-blue-500/20 bg-blue-500/10'
      case 'shipped': return 'text-purple-400 border-purple-500/20 bg-purple-500/10'
      case 'completed': return 'text-green-400 border-green-500/20 bg-green-500/10'
      case 'cancelled': return 'text-red-400 border-red-500/20 bg-red-500/10'
      default: return 'text-gray-400 border-gray-500/20 bg-gray-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4">
            <ArrowLeft size={20} /> Vissza a rendelésekhez
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Rendelés #{order.id.slice(-6)}
                <span className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
                  {status.toUpperCase()}
                </span>
              </h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <Calendar size={14} />
                {new Date(order.createdAt).toLocaleString('hu-HU')}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#121212] p-2 rounded-xl border border-white/10">
              <span className="text-sm text-gray-400 pl-2">Státusz módosítása:</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="bg-[#1a1a1a] text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:border-purple-500 outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="pending">Függőben (Pending)</option>
                <option value="paid">Fizetve (Paid)</option>
                <option value="shipped">Szállítva (Shipped)</option>
                <option value="completed">Teljesítve (Completed)</option>
                <option value="cancelled">Törölve (Cancelled)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Customer Info */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
              <User size={20} /> Vásárló adatai
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Név</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Email</span>
                <span className="font-medium flex items-center gap-2">
                  <Mail size={14} /> {order.customerEmail}
                </span>
              </div>
              {order.customerPhone && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Telefonszám</span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
              )}
              {order.user && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Fiók</span>
                  <Link href={`/admin/users/${order.user.id}`} className="text-blue-400 hover:underline">
                    Megtekintés
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
              <Truck size={20} /> Szállítási adatok
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Cím</span>
                <span className="font-medium text-right max-w-[200px] flex items-start gap-2 justify-end">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  {order.customerAddress}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Fizetési mód</span>
                <span className="font-medium text-right">
                  {order.paymentMethod === 'cod' ? 'Utánvét' : order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <OrderNotes orderId={order.id} notes={order.notes} />
        </div>

        {/* Order Items */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-bold flex items-center gap-2 text-green-400">
              <Package size={20} /> Rendelt termékek
            </h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1a1a] text-gray-400 text-sm">
              <tr>
                <th className="p-4 font-medium">Termék</th>
                <th className="p-4 font-medium text-center">Mennyiség</th>
                <th className="p-4 font-medium text-right">Egységár</th>
                <th className="p-4 font-medium text-right">Összesen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {order.items.map((item: OrderItem & { product: Product | null }) => (
                <tr key={item.id}>
                  <td className="p-4">
                    <div className="font-medium text-white">
                      {item.name || item.product?.name || <span className="text-red-400 italic">Törölt termék</span>}
                    </div>
                    {item.selectedOptions && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.selectedOptions as Record<string, string>).map(([key, value]) => (
                          <span key={key} className="mr-2 bg-white/5 px-1.5 py-0.5 rounded">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center text-gray-300">{item.quantity} db</td>
                  <td className="p-4 text-right text-gray-400">{item.price.toLocaleString('hu-HU')} Ft</td>
                  <td className="p-4 text-right font-medium text-white">{(item.price * item.quantity).toLocaleString('hu-HU')} Ft</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#1a1a1a]">
              <tr>
                <td colSpan={3} className="p-4 text-right text-gray-400 font-medium">Részösszeg:</td>
                <td className="p-4 text-right font-medium text-white">
                  {order.items.reduce((sum: number, item: OrderItem & { product: Product | null }) => sum + (item.price * item.quantity), 0).toLocaleString('hu-HU')} Ft
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="p-4 text-right text-gray-400 font-medium">Szállítás:</td>
                <td className="p-4 text-right font-medium text-white">
                  {(order.totalPrice - order.items.reduce((sum: number, item: OrderItem & { product: Product | null }) => sum + (item.price * item.quantity), 0) + (order.discountAmount || 0) + (order.loyaltyDiscount || 0)).toLocaleString('hu-HU')} Ft
                </td>
              </tr>
              {(order.discountAmount > 0 || order.loyaltyDiscount > 0) && (
                <tr>
                  <td colSpan={3} className="p-4 text-right text-gray-400 font-medium">Kedvezmények:</td>
                  <td className="p-4 text-right font-medium text-green-400">
                    -{(order.discountAmount + order.loyaltyDiscount).toLocaleString('hu-HU')} Ft
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="p-4 text-right text-gray-400 font-medium">Végösszeg:</td>
                <td className="p-4 text-right text-xl font-bold text-purple-400">
                  {order.totalPrice.toLocaleString('hu-HU')} Ft
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
