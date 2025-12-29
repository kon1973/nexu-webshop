'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DeleteReviewButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt az értékelést?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Értékelés törölve')
        router.refresh()
      } else {
        toast.error('Hiba történt a törléskor')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
      title="Törlés"
    >
      {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
    </button>
  )
}
