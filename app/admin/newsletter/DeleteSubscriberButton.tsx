'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function DeleteSubscriberButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a feliratkozót?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/newsletter/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Feliratkozó törölve')
        router.refresh()
      } else {
        toast.error('Hiba a törlés során')
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
      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Törlés"
    >
      {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
    </button>
  )
}
