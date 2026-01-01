'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteProductAction } from './actions'

export default function DeleteButton({ id }: { id: number }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a terméket?')) return

    setIsDeleting(true)
    try {
      const res = await deleteProductAction(id)

      if (res.success) {
        toast.success('Termék véglegesen törölve.')
        router.refresh()
      } else {
        toast.error(res.error || 'Nem sikerült a törlés.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Hálózati hiba.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
      title="Törlés"
      aria-label="Törlés"
    >
      {isDeleting ? <Loader2 className="animate-spin w-5 h-5" /> : <Trash2 size={20} />}
    </button>
  )
}

