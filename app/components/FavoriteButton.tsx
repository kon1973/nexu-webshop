'use client'

import { useFavorites, type FavoriteProduct } from '@/context/FavoritesContext'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { memo, useCallback } from 'react'

interface FavoriteButtonProps {
  product: FavoriteProduct
  size?: 'sm' | 'md'
}

const FavoriteButton = memo(function FavoriteButton({ product, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(product.id)
  const label = active ? 'Törlés a kedvencek közül' : 'Hozzáadás a kedvencekhez'

  const sizeClasses = size === 'sm' 
    ? 'w-8 h-8 md:w-10 md:h-10' 
    : 'w-10 h-10'
  
  const iconSize = size === 'sm' ? 16 : 20

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
    if (active) {
      toast.info(`${product.name} eltávolítva a kedvencek közül`)
    } else {
      toast.success(`${product.name} hozzáadva a kedvencekhez`)
    }
  }, [product, active, toggleFavorite])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${sizeClasses} flex items-center justify-center rounded-full transition-all duration-300 group ${
        active
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white backdrop-blur-md'
          : 'bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-red-500 border border-white/10'
      }`}
      title={label}
      aria-label={label}
    >
      <Heart
        size={iconSize}
        className={`transition-transform duration-300 ${active ? 'fill-current scale-110' : 'group-hover:scale-110'} md:w-5 md:h-5`}
      />
    </button>
  )
})

export default FavoriteButton

