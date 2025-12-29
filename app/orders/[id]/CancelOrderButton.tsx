'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Biztosan lemondod a rendelést?')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Hiba történt')
      }

      toast.success('Rendelés lemondva')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isLoading}
      className="text-red-400 hover:text-red-300 text-sm font-medium underline disabled:opacity-50"
    >
      {isLoading ? 'Lemondás...' : 'Rendelés lemondása'}
    </button>
  )
}
