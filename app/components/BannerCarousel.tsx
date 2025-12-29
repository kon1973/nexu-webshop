'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Banner } from '@prisma/client'

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  if (banners.length === 0) return null

  return (
    <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
      {banners.map((banner, index) => {
        const isFullLink = banner.linkType === 'FULL' && banner.link

        const Content = ({ isInsideLink }: { isInsideLink: boolean }) => (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent z-10" />
            {banner.image.startsWith('http') || banner.image.startsWith('/') ? (
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            ) : (
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-20 flex flex-col items-start justify-end h-full">
              <h2 className="text-2xl md:text-6xl font-extrabold mb-2 md:mb-4 drop-shadow-xl text-white leading-tight max-w-3xl">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="text-sm md:text-2xl text-gray-200 mb-4 md:mb-8 drop-shadow-lg max-w-2xl line-clamp-2 md:line-clamp-none">
                  {banner.subtitle}
                </p>
              )}
              {banner.link && banner.showButton && (
                isInsideLink ? (
                  <span className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-2 md:px-8 md:py-4 rounded-full text-sm md:text-base font-bold transition-all shadow-lg hover:scale-105 cursor-pointer">
                    Megnézem
                  </span>
                ) : (
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-2 md:px-8 md:py-4 rounded-full text-sm md:text-base font-bold transition-all shadow-lg hover:scale-105"
                  >
                    Megnézem
                  </Link>
                )
              )}
            </div>
          </>
        )

        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentBanner ? 'opacity-100' : 'opacity-0'
            } ${index !== currentBanner ? 'pointer-events-none' : ''}`}
          >
            {isFullLink ? (
              <Link href={banner.link!} className="block w-full h-full relative">
                <Content isInsideLink={true} />
              </Link>
            ) : (
              <Content isInsideLink={false} />
            )}
          </div>
        )
      })}
      
      {banners.length > 1 && (
        <div className="absolute bottom-8 right-8 z-30 flex gap-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentBanner ? 'bg-white w-8' : 'bg-white/30 w-2 hover:bg-white/50'
              }`}
              aria-label={`Ugrás a ${idx + 1}. bannerre`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
