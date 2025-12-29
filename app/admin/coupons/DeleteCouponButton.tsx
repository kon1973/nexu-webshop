'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function DeleteCouponButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a kupont?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Kupon törölve')
        router.refresh()
      } else {
        toast.error('Hiba a törlés során')
      }
    } catch (error) {
      toast.error('Hiba történt')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Törlés"
    >
      <Trash2 size={18} />
    </button>
  )
}
