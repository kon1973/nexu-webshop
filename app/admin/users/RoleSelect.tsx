'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = async (newRole: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Felhasználói szerepkör frissítve')
        router.refresh()
      } else {
        toast.error(data.error || 'Hiba történt')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative inline-block">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded z-10">
          <Loader2 className="animate-spin w-4 h-4 text-white" />
        </div>
      )}
      <select
        value={currentRole}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isLoading}
        className={`appearance-none px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          currentRole === 'admin'
            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }`}
      >
        <option value="user" className="bg-[#1a1a1a]">Felhasználó</option>
        <option value="admin" className="bg-[#1a1a1a]">Adminisztrátor</option>
      </select>
    </div>
  )
}
