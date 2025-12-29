'use client'

import { useState } from 'react'
import { TicketPercent, Plus, Search, Edit } from 'lucide-react'
import Link from 'next/link'
import DeleteCouponButton from './DeleteCouponButton'
import type { Coupon } from '@prisma/client'

export default function CouponListClient({ coupons }: { coupons: Coupon[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TicketPercent className="text-purple-500" />
            Kuponok kezelése ({filteredCoupons.length})
          </h1>

          <div className="flex gap-3 w-full md:w-auto items-center">
            <Link
              href="/admin/coupons/new"
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg shadow-purple-500/20 whitespace-nowrap"
            >
              <Plus size={18} /> Új kupon
            </Link>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Keresés (Kód)..."
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
                <th className="p-4 font-medium">Kód</th>
                <th className="p-4 font-medium">Kedvezmény</th>
                <th className="p-4 font-medium">Használat</th>
                <th className="p-4 font-medium">Státusz</th>
                <th className="p-4 font-medium text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-400">{coupon.code}</td>
                  <td className="p-4">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}%`
                      : `${coupon.discountValue.toLocaleString('hu-HU')} Ft`}
                  </td>
                  <td className="p-4">
                    {coupon.usedCount} / {coupon.usageLimit === null ? '∞' : coupon.usageLimit}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold border ${
                        coupon.isActive 
                          ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                          : 'bg-red-500/20 text-red-400 border-red-500/20'
                      }`}
                    >
                      {coupon.isActive ? 'Aktív' : 'Inaktív'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/coupons/edit/${coupon.id}`}
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Szerkesztés"
                    >
                      <Edit size={18} />
                    </Link>
                    <DeleteCouponButton id={coupon.id} />
                  </td>
                </tr>
              ))}
              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    {searchTerm ? 'Nincs találat a keresésre.' : 'Még nincsenek kuponok.'}
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
