'use client'

import { useEffect, useState } from 'react'

interface Brand {
  id: string
  name: string
}

export default function BrandMarquee() {
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands')
        if (res.ok) {
          const data: Brand[] = await res.json()
          if (data.length > 0) {
            setBrands(data.map(b => b.name))
          } else {
            // Fallback defaults if DB is empty
            setBrands([
              "Apple", "Samsung", "Sony", "Dell", "Asus", 
              "Lenovo", "HP", "LG", "Microsoft", "Razer",
              "Logitech", "Corsair", "MSI", "Acer"
            ])
          }
        }
      } catch (error) {
        console.error('Failed to fetch brands', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (loading) return null // Or a skeleton

  return (
    <section className="py-12 border-y border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
          Megbízható partnereink
        </p>
      </div>
      
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
          {brands.map((brand, index) => (
            <span 
              key={index} 
              className="text-2xl md:text-3xl font-bold text-white/20 hover:text-white/80 transition-colors cursor-default select-none"
            >
              {brand}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {brands.map((brand, index) => (
            <span 
              key={`dup-${index}`} 
              className="text-2xl md:text-3xl font-bold text-white/20 hover:text-white/80 transition-colors cursor-default select-none"
            >
              {brand}
            </span>
          ))}
        </div>

        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
      </div>
    </section>
  )
}
