'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Flame, ArrowRight, Zap, Tag } from 'lucide-react'
import { getImageUrl } from '@/lib/image'
import type { Product } from '@prisma/client'

type FlashSaleProduct = Product & {
  variants?: { id: string }[]
}

interface FlashSaleSectionProps {
  products: FlashSaleProduct[]
}

function calculateTimeLeft(endDate: Date) {
  const difference = endDate.getTime() - new Date().getTime()
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  }
}

function CountdownDisplay({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  if (timeLeft.total <= 0) return null

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-400' : 'text-orange-400'}`}>
      {isUrgent ? <Flame size={18} className="animate-pulse" /> : <Clock size={18} />}
      <div className="flex items-center gap-1 font-mono font-bold">
        {timeLeft.days > 0 && (
          <span className="bg-black/50 px-2 py-1 rounded text-sm">{timeLeft.days}n</span>
        )}
        <span className="bg-black/50 px-2 py-1 rounded text-sm">
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter products that are currently on sale with an end date
  const saleProducts = useMemo(() => {
    const now = new Date()
    return products.filter(p => {
      if (!p.salePrice || !p.saleEndDate) return false
      const startDate = p.saleStartDate ? new Date(p.saleStartDate) : new Date(0)
      const endDate = new Date(p.saleEndDate)
      return startDate <= now && endDate > now
    }).slice(0, 6)
  }, [products])

  if (saleProducts.length === 0) return null

  // Get the earliest ending sale for the main countdown
  const earliestEndDate = useMemo(() => {
    const dates = saleProducts
      .map(p => p.saleEndDate ? new Date(p.saleEndDate) : null)
      .filter((d): d is Date => d !== null)
    return dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null
  }, [saleProducts])

  return (
    <section className="py-16 bg-gradient-to-b from-red-950/20 to-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <Zap size={28} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                Flash Sale
                <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </h2>
              <p className="text-gray-400 text-sm">Korlátozott idejű akciók!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {mounted && earliestEndDate && (
              <CountdownDisplay endDate={earliestEndDate} />
            )}
            <Link
              href="/shop?onSale=true"
              className="hidden md:flex items-center gap-2 text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              Összes akció <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {saleProducts.map((product) => {
            const discount = product.salePercentage || 
              (product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0)
            const imageUrl = getImageUrl(product.image)
            
            return (
              <Link
                key={product.id}
                href={`/shop/${product.slug || product.id}`}
                className="group bg-[#121212] rounded-2xl border border-white/5 hover:border-red-500/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-4">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Tag size={40} />
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                    -{discount}%
                  </div>
                  
                  {/* Urgent indicator if ending soon */}
                  {product.saleEndDate && mounted && (
                    (() => {
                      const timeLeft = calculateTimeLeft(new Date(product.saleEndDate))
                      if (timeLeft.days === 0 && timeLeft.hours < 12 && timeLeft.total > 0) {
                        return (
                          <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center justify-center gap-1">
                            <Flame size={12} className="text-red-400 animate-pulse" />
                            <span className="text-[10px] text-red-400 font-bold">
                              Még {timeLeft.hours}ó {timeLeft.minutes}p
                            </span>
                          </div>
                        )
                      }
                      return null
                    })()
                  )}
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">
                      {product.salePrice?.toLocaleString('hu-HU')} Ft
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      {product.price.toLocaleString('hu-HU')} Ft
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 md:hidden">
          <Link
            href="/shop?onSale=true"
            className="block w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl text-center hover:bg-red-500/20 transition-colors"
          >
            Összes akció megtekintése
          </Link>
        </div>
      </div>
    </section>
  )
}
