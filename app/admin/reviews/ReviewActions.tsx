'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ReviewActions({ id, status }: { id: string; status: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        toast.success(newStatus === 'approved' ? 'Értékelés jóváhagyva' : 'Értékelés elutasítva')
        router.refresh()
      } else {
        toast.error('Hiba történt')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    } finally {
      setIsLoading(false)
    }
  }

  if (status !== 'pending') {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        status === 'approved' 
          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
          : 'bg-red-500/10 text-red-400 border border-red-500/20'
      }`}>
        {status === 'approved' ? 'Jóváhagyva' : 'Elutasítva'}
      </span>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateStatus('approved')}
        disabled={isLoading}
        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
        title="Jóváhagyás"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      </button>
      <button
        onClick={() => updateStatus('rejected')}
        disabled={isLoading}
        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
        title="Elutasítás"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
      </button>
    </div>
  )
}
