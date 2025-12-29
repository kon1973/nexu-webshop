'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product, // We need to send other required fields because the PUT handler validates them
          // Wait, the PUT handler validates name, category, price. 
          // If I only send isArchived, it might fail if I don't send the others.
          // Let's check the PUT handler again.
          // It says: if (!name || !category || !Number.isFinite(price) || price <= 0) return 400
          // So I MUST send these fields.
          // This is not ideal for a simple toggle.
          // I should probably create a specific PATCH endpoint or update the PUT to allow partial updates.
          // But for now, I'll just send the required fields if I have them.
          // The 'product' prop should contain them.
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          isArchived: newState
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Hiba történt')
      }

      setIsArchived(newState)
      toast.success(newState ? 'Termék elrejtve' : 'Termék látható')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Nem sikerült módosítani a láthatóságot')
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
