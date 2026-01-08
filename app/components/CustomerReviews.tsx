'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

interface Review {
  id: string
  userName: string
  text: string
  rating: number
  user?: {
    name: string | null
    image: string | null
  } | null
}

export default function CustomerReviews({ reviews }: { reviews: Review[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance
  const minSwipeDistance = 50

  // Fallback reviews if none exist in DB
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: '1',
      userName: 'Kovács Péter',
      text: 'Hihetetlenül gyors szállítás és kiváló minőségű termékek. A MacBook Air, amit rendeltem, tökéletes állapotban érkezett.',
      rating: 5,
      user: null
    },
    {
      id: '2',
      userName: 'Nagy Anna',
      text: 'A legjobb webshop, ahonnan valaha rendeltem. Az ügyfélszolgálat segítőkész, a garanciális ügyintézés pedig zökkenőmentes.',
      rating: 5,
      user: null
    },
    {
      id: '3',
      userName: 'Szabó Gábor',
      text: 'Nagyon elégedett vagyok a Sony fejhallgatóval. Pontosan azt kaptam, amit vártam, sőt, még hamarabb is megérkezett!',
      rating: 5,
      user: null
    }
  ]

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayReviews.length)
  }, [displayReviews.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length)
  }, [displayReviews.length])

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsAutoPlaying(false)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
    
    // Resume auto-play after a delay
    setTimeout(() => setIsAutoPlaying(true), 3000)
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]" />
      
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold mb-6 border border-purple-500/20">
            <Star size={16} className="fill-purple-400" />
            Vásárlói vélemények
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Vásárlóink mondták</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Büszkék vagyunk rá, hogy több ezer elégedett vásárlót szolgáltunk már ki.
          </p>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {displayReviews.slice(0, 3).map((review, index) => (
            <div 
              key={review.id}
              className={`bg-[#121212] border border-white/5 p-8 rounded-3xl relative group hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2 animate-fade-in stagger-${index + 1}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <Quote className="absolute top-6 right-6 text-purple-500/10 group-hover:text-purple-500/20 transition-colors duration-500" size={48} />
              
              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={`transition-all duration-300 ${i < review.rating ? 'text-yellow-500 fill-yellow-500 group-hover:scale-110' : 'text-gray-700'}`}
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>

                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                    {review.user?.image ? (
                      <img src={review.user.image} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (review.userName || 'V').charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{review.userName}</p>
                    <p className="text-sm text-purple-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Ellenőrzött vásárló
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div 
          ref={carouselRef}
          className="md:hidden relative touch-pan-y"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {displayReviews.map((review) => (
                <div 
                  key={review.id}
                  className="w-full flex-shrink-0 px-2"
                >
                  <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl relative">
                    <Quote className="absolute top-4 right-4 text-purple-500/10" size={32} />
                    
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`} 
                        />
                      ))}
                    </div>

                    <p className="text-gray-300 mb-6 leading-relaxed line-clamp-3">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                        {(review.userName || 'V').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{review.userName}</p>
                        <p className="text-xs text-purple-400">Ellenőrzött vásárló</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
            aria-label="Előző vélemény"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
            aria-label="Következő vélemény"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {displayReviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-6 bg-purple-500' 
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Ugrás a ${index + 1}. véleményhez`}
              />
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">1000+ elégedett vásárló</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <span className="font-medium">4.9/5 átlag értékelés</span>
          </div>
        </div>
      </div>
    </section>
  )
}
