'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, MapPin, Package, Star, User as UserIcon, Calendar, Shield } from 'lucide-react'
import type { User, Address, Order, Review, Product, OrderItem } from '@prisma/client'

type UserWithDetails = User & {
  addresses: Address[]
  orders: (Order & { items: (OrderItem & { product: Product | null })[] })[]
  reviews: (Review & { product: Product })[]
  _count: {
    orders: number
    reviews: number
  }
}

export default function UserDetailsClient({ user }: { user: UserWithDetails }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft size={20} /> Vissza a felhasználókhoz
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold mb-4 border-4 border-[#121212] shadow-xl">
                  {user.image ? (
                    <img src={user.image} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (user.name?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <h1 className="text-2xl font-bold">{user.name || 'Névtelen'}</h1>
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <Mail size={14} /> {user.email}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    user.role === 'admin' 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                      : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {user.role === 'admin' ? 'Adminisztrátor' : 'Felhasználó'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2"><Calendar size={16} /> Regisztrált</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('hu-HU')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2"><Package size={16} /> Rendelések</span>
                  <span className="font-medium">{user._count.orders} db</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2"><Star size={16} /> Értékelések</span>
                  <span className="font-medium">{user._count.reviews} db</span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-blue-400" /> Mentett címek
              </h2>
              {user.addresses.length > 0 ? (
                <div className="space-y-4">
                  {user.addresses.map((addr: Address) => (
                    <div key={addr.id} className="bg-white/5 p-3 rounded-xl text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                            Alapértelmezett
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300">{addr.street}</p>
                      <p className="text-gray-400">{addr.zipCode} {addr.city}, {addr.country}</p>
                      {addr.phoneNumber && <p className="text-gray-500 mt-1">{addr.phoneNumber}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">Nincs mentett cím.</p>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package className="text-purple-400" /> Legutóbbi rendelések
                </h2>
                <Link href={`/admin/orders?search=${user.email}`} className="text-sm text-purple-400 hover:underline">
                  Összes megtekintése
                </Link>
              </div>
              
              {user.orders.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {user.orders.map((order: Order & { items: (OrderItem & { product: Product | null })[] }) => (
                    <div key={order.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link href={`/admin/orders/${order.id}`} className="font-mono font-bold hover:text-purple-400 transition-colors">
                            #{order.id.slice(-6)}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('hu-HU', { 
                              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{order.totalPrice.toLocaleString('hu-HU')} Ft</p>
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            order.status === 'completed' ? 'text-green-400 border-green-500/20 bg-green-500/10' :
                            order.status === 'cancelled' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                            'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {order.items.map((item: OrderItem & { product: Product | null }) => (
                          <div key={item.id} className="flex-shrink-0 w-10 h-10 bg-white/5 rounded flex items-center justify-center text-lg" title={item.product?.name}>
                            {item.product?.image || '📦'}
                          </div>
                        ))}
                        {order.items.length > 5 && (
                          <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded flex items-center justify-center text-xs text-gray-400">
                            +{order.items.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Még nem rendelt semmit.
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Star className="text-yellow-500" /> Értékelések
                </h2>
              </div>
              
              {user.reviews.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {user.reviews.map((review: Review & { product: Product }) => (
                    <div key={review.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          {review.product.image}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-sm">{review.product.name}</h3>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('hu-HU')}
                            </span>
                          </div>
                          <div className="flex text-yellow-500 my-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-700'} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-300">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Még nem írt értékelést.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
