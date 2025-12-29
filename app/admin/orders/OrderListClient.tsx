'use client'

import Link from 'next/link'
import { Eye, Search } from 'lucide-react'
import { useState } from 'react'
import type { Order, OrderItem, Product, User } from '@prisma/client'
import ExportOrdersButton from '../ExportOrdersButton'
import ExportGLSButton from '../ExportGLSButton'

type OrderWithDetails = Order & {
  user: User | null
  items: (OrderItem & { product: Product | null })[]
}

export default function OrderListClient({ orders }: { orders: OrderWithDetails[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/20">Függőben</span>
      case 'paid':
        return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20">Fizetve</span>
      case 'shipped':
        return <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs border border-purple-500/20">Szállítva</span>
      case 'completed':
        return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs border border-green-500/20">Teljesítve</span>
      case 'cancelled':
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs border border-red-500/20">Törölve</span>
      default:
        return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs border border-gray-500/20">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-6xl">


        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">
            Rendelések kezelése ({filteredOrders.length})
          </h1>
          
          <div className="flex gap-4 w-full md:w-auto items-center">
            <ExportGLSButton />
            <ExportOrdersButton />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
            >
              <option value="all">Összes státusz</option>
              <option value="pending">Függőben</option>
              <option value="paid">Fizetve</option>
              <option value="shipped">Szállítva</option>
              <option value="completed">Teljesítve</option>
              <option value="cancelled">Törölve</option>
            </select>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Keresés (ID, Név, Email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] text-gray-400 text-sm border-b border-white/5">
                <th className="p-4 font-medium">Rendelés ID</th>
                <th className="p-4 font-medium">Dátum</th>
                <th className="p-4 font-medium">Vásárló</th>
                <th className="p-4 font-medium">Összeg</th>
                <th className="p-4 font-medium">Státusz</th>
                <th className="p-4 font-medium text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono text-sm text-gray-400">#{order.id.slice(-6)}</td>
                  
                  <td className="p-4 text-sm text-gray-300">
                    {new Date(order.createdAt).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  <td className="p-4">
                    <div className="font-medium text-white">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
                  </td>

                  <td className="p-4 font-mono text-purple-400 font-bold">
                    {order.totalPrice.toLocaleString('hu-HU')} Ft
                  </td>

                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>

                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Részletek"
                    >
                      <Eye size={20} />
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'Nincs találat a szűrésre.' : 'Még nincsenek rendelések.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
