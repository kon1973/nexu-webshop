'use client'

import { useFavorites, type FavoriteProduct } from '@/context/FavoritesContext'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

export default function FavoriteButton({ product }: { product: FavoriteProduct }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(product.id)
  const label = active ? 'Törlés a kedvencek közül' : 'Hozzáadás a kedvencekhez'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(product)
        if (active) {
          toast.info(`${product.name} eltávolítva a kedvencek közül`)
        } else {
          toast.success(`${product.name} hozzáadva a kedvencekhez`)
        }
      }}
      className={`p-2 rounded-full transition-all duration-300 group ${
        active
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
          : 'bg-black/40 text-gray-400 hover:bg-white hover:text-red-500'
      }`}
      title={label}
      aria-label={label}
    >
      <Heart
        size={20}
        className={`transition-transform duration-300 ${active ? 'fill-current scale-110' : 'group-hover:scale-110'}`}
      />
    </button>
  )
}

