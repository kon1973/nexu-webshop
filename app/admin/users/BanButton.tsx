'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Ban, CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BanButton({ userId, isBanned }: { userId: string; isBanned: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleBan = async () => {
    if (!confirm(isBanned ? 'Biztosan feloldod a tiltást?' : 'Biztosan kitiltod ezt a felhasználót?')) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBanned: !isBanned }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(isBanned ? 'Felhasználó tiltása feloldva' : 'Felhasználó kitiltva')
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
    <button
      onClick={toggleBan}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors ${
        isBanned
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
      }`}
      title={isBanned ? 'Tiltás feloldása' : 'Felhasználó kitiltása'}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : isBanned ? (
        <Ban size={16} />
      ) : (
        <CheckCircle size={16} />
      )}
    </button>
  )
}
