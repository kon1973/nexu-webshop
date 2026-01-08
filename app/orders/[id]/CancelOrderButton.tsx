'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cancelOrder } from '@/lib/actions/user-actions'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Biztosan lemondod a rendelést?')) return

    setIsLoading(true)
    try {
      const result = await cancelOrder(orderId)

      if (!result.success) {
        throw new Error(result.error || 'Hiba történt')
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
