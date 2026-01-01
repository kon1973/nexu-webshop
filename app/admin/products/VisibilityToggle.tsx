'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { toggleProductVisibilityAction } from './actions'

type Props = {
  id: number
  initialIsArchived: boolean
  product: any // Using any to avoid strict type checking issues if types aren't updated yet
}

export default function VisibilityToggle({ id, initialIsArchived, product }: Props) {
  const [isArchived, setIsArchived] = useState(initialIsArchived)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleVisibility = async () => {
    setIsLoading(true)
    try {
      const newState = !isArchived
      const res = await toggleProductVisibilityAction(id, newState)

      if (!res.success) {
        throw new Error(res.error || 'Hiba történt')
      }

      setIsArchived(newState)
      toast.success(newState ? 'Termék archiválva' : 'Termék közzétéve')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Nem sikerült módosítani a láthatóságot')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleVisibility}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors ${
        isArchived 
          ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' 
          : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
      }`}
      title={isArchived ? 'Jelenleg rejtett (Kattints a megjelenítéshez)' : 'Jelenleg látható (Kattints az elrejtéshez)'}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isArchived ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  )
}
