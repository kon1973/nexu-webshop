'use client'

import { useFavorites } from '@/context/FavoritesContext'
import Link from 'next/link'
import { ArrowLeft, HeartCrack } from 'lucide-react'
import ProductCard from '@/app/components/ProductCard'

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/shop"
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"
            aria-label="Vissza a boltba"
            title="Vissza a boltba"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">
            Kedvenceim ({favorites.length})
          </h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] border border-white/5 rounded-2xl">
            <HeartCrack size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Még nincsenek kedvenceid</h2>
            <p className="text-gray-400 mb-6">Böngéssz a boltban, és mentsd el, ami tetszik!</p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-bold transition-all"
            >
              Irány a bolt
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
