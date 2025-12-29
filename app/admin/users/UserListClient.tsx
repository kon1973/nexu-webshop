'use client'

import { useState } from 'react'
import { Users, Mail, Search } from 'lucide-react'
import Link from 'next/link'
import RoleSelect from './RoleSelect'
import BanButton from './BanButton'
import type { User } from '@prisma/client'

type UserWithCount = User & {
  _count: {
    orders: number
  }
}

export default function UserListClient({ users }: { users: UserWithCount[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-blue-500" />
            Felhasználók kezelése ({filteredUsers.length})
          </h1>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Keresés (Név, Email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] text-gray-400 text-sm border-b border-white/5">
                <th className="p-4 font-medium">Felhasználó</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Rendelések</th>
                <th className="p-4 font-medium">Szerepkör</th>
                <th className="p-4 font-medium">Státusz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold border border-white/10 overflow-hidden group-hover:border-purple-500 transition-colors">
                        {user.image ? (
                          <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                        ) : (
                          (user.name?.[0] || 'U').toUpperCase()
                        )}
                      </div>
                      <span className="font-medium text-white group-hover:text-purple-400 transition-colors">{user.name || 'Névtelen'}</span>
                    </Link>
                  </td>
                  <td className="p-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">
                    <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5">
                      {user._count.orders} db
                    </span>
                  </td>
                  <td className="p-4">
                    <RoleSelect userId={user.id} currentRole={user.role} />
                  </td>
                  <td className="p-4">
                    <BanButton userId={user.id} isBanned={user.isBanned} />
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    {searchTerm ? 'Nincs találat a keresésre.' : 'Még nincsenek felhasználók.'}
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
