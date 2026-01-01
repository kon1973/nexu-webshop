'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteCoupon } from './actions'

export default function DeleteCouponButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a kupont?')) return

    setIsDeleting(true)
    try {
      await deleteCoupon(id)
      toast.success('Kupon törölve')
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
