'use client'

import { useMemo } from 'react'
import { useCompare } from '@/context/CompareContext'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { Trash2, ShoppingCart, X, ArrowLeft, Check, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { getImageUrl } from '@/lib/image'

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()
  const { addToCart } = useCart()

  // Collect all unique specs with their types
  const allSpecs = useMemo(() => {
    const specs = new Map<string, 'text' | 'boolean' | 'header'>();
    
    compareList.forEach(p => {
      const rawSpecs = (p as any).specifications;
      const pSpecs = Array.isArray(rawSpecs) ? rawSpecs : [];
      pSpecs.forEach((s: any) => {
        if (!specs.has(s.key)) {
          specs.set(s.key, s.type || 'text');
        }
      });
    });

    return Array.from(specs.entries()).map(([key, type]) => ({ key, type }));
  }, [compareList]);

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Az összehasonlítás üres</h1>
          <p className="text-gray-400 mb-8">
            Még nem adtál hozzá termékeket az összehasonlításhoz. Böngéssz a termékek között és válaszd ki azokat, amelyeket össze szeretnél hasonlítani.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Vissza a vásárláshoz
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Termék összehasonlítás</h1>
        <button
          onClick={clearCompare}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          Összes törlése
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 min-w-[200px] bg-[#121212] sticky left-0 z-10 border-b border-white/10">
                Tulajdonságok
              </th>
              {compareList.map((product) => (
                <th key={product.id} className="p-4 min-w-[250px] border-b border-white/10 align-top">
                  <div className="relative group">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eltávolítás"
                    >
                      <X size={14} />
                    </button>
                    <div className="aspect-square bg-[#1a1a1a] rounded-xl mb-4 flex items-center justify-center text-4xl overflow-hidden">
                      {getImageUrl(product.image) ? (
                        <img src={getImageUrl(product.image)!} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={48} className="text-gray-500" />
                      )}
                    </div>
                    <Link href={`/shop/${product.id}`} className="block hover:text-purple-400 transition-colors">
                      <h3 className="font-bold text-white mb-1 line-clamp-2">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-purple-400">
                        {product.price.toLocaleString('hu-HU')} Ft
                      </span>
                      {product.stock <= 0 && (
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                          Elfogyott
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                    >
                      <ShoppingCart size={18} />
                      Kosárba
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="p-4 font-medium text-white bg-[#121212] sticky left-0 z-10">Kategória</td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4">
                  {product.category}
                </td>
              ))}
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="p-4 font-medium text-white bg-[#121212] sticky left-0 z-10">Értékelés</td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-sm text-gray-500">/ 5</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="p-4 font-medium text-white bg-[#121212] sticky left-0 z-10">Készlet</td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4">
                  {product.stock > 0 ? (
                    <span className="text-green-400">{product.stock} db</span>
                  ) : (
                    <span className="text-red-400">Nincs készleten</span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="p-4 font-medium text-white bg-[#121212] sticky left-0 z-10">Leírás</td>
              {compareList.map((product) => (
                <td key={product.id} className="p-4 text-sm leading-relaxed min-w-[250px]">
                  {product.description}
                </td>
              ))}
            </tr>
            {allSpecs.map(({ key, type }) => {
              if (type === 'header') {
                return (
                  <tr key={key} className="bg-white/5">
                    <td className="p-4 font-bold text-purple-400 uppercase tracking-wider text-sm bg-[#121212] sticky left-0 z-10">
                      {key}
                    </td>
                    {compareList.map(product => (
                      <td key={product.id} className="p-4 bg-white/5"></td>
                    ))}
                  </tr>
                )
              }

              return (
                <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white bg-[#121212] sticky left-0 z-10">{key}</td>
                  {compareList.map(product => {
                    const rawSpecs = (product as any).specifications;
                    const pSpecs = Array.isArray(rawSpecs) ? rawSpecs : [];
                    const spec = pSpecs.find((s: any) => s.key === key)
                    
                    let content: any = '-';
                    
                    if (spec) {
                      if (spec.type === 'boolean') {
                         content = spec.value ? <Check className="text-green-500" size={20} /> : <X className="text-red-500" size={20} />;
                      } else {
                         content = spec.value;
                      }
                    }

                    return (
                      <td key={product.id} className="p-4 text-sm">
                        {content}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
