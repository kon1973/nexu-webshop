import { auth } from '@/lib/auth'
import { Product, Category } from '@prisma/client'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Star, Truck, Zap, Package } from 'lucide-react'
import BannerCarousel from './components/BannerCarousel'
import ProductCard from './components/ProductCard'
import NewsletterSection from './components/NewsletterSection'
import BrandMarquee from './components/BrandMarquee'
import LatestNews from './components/LatestNews'
import FlashSaleSection from './components/FlashSaleSection'
import SmartRecommendations from './components/SmartRecommendations'
import { getSettings, getBanners, getCategories, getFeaturedProducts, getNewArrivals, getPromoBanner, getLatestBlogPosts, getFlashSaleProducts } from '@/lib/cache'
import { getImageUrl } from '@/lib/image'
import { getSiteUrl } from '@/lib/site'
import type { Metadata } from 'next'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  alternates: { canonical: siteUrl },
}

export default async function HomePage() {
  const settings = await getSettings()

  if (settings.maintenance_mode === 'true') {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4 text-center z-50 relative">
          <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Zap className="text-purple-500" size={48} />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Karbantartás alatt
          </h1>
          <p className="text-gray-400 max-w-md text-lg">
            Webshopunk jelenleg fejlesztés alatt áll. Kérjük, látogass vissza később!
          </p>
        </div>
      )
    }
  }

  const freeShippingThreshold = settings.free_shipping_threshold ? parseInt(settings.free_shipping_threshold) : 20000

  const banners = await getBanners()
  const promoBanner = await getPromoBanner()
  const categories = await getCategories()
  const featuredProducts = await getFeaturedProducts()
  const newArrivals = await getNewArrivals()
  const latestPosts = await getLatestBlogPosts()
  const flashSaleProducts = await getFlashSaleProducts()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30">
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-6 border border-blue-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                TÉLI LEÁRAZÁS AKTÍV
              </div>

              <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                Minden tech <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Egy helyen.
                </span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
                Válogass a legújabb konzolok, okostelefonok és kiegészítők közül. Megbízható forrásból, raktárról.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="px-8 py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-gray-200 transition-all inline-flex items-center gap-2 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] justify-center"
                >
                  Vásárlás most <ArrowRight size={20} />
                </Link>
                <Link
                  href="#categories"
                  className="px-8 py-4 bg-[#1a1a1a] text-white font-bold rounded-xl text-lg hover:bg-[#252525] border border-white/10 transition-all inline-flex items-center justify-center"
                >
                  Kategóriák
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Prémium minőség
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Gyors kiszállítás
                </span>
              </div>
            </div>

            <div className={banners.length > 0 ? "block w-full" : "relative hidden lg:block h-[520px]"}>
              {banners.length > 0 ? (
                <BannerCarousel banners={banners} />
              ) : (
                <>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />

                  {featuredProducts.map((product: Product, index: number) => {
                    const positions = [
                      'top-10 left-4 rotate-[-3deg] animate-[bounce_6s_infinite]',
                      'top-44 right-0 rotate-[2deg] animate-[bounce_7s_infinite]',
                      'bottom-10 left-16 rotate-[1deg] animate-[bounce_8s_infinite]',
                    ]
                    const position = positions[index] ?? positions[0]

                    return (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        className={`absolute ${position} z-20 block`}
                      >
                        <div className="bg-[#121212]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 w-72 hover:border-purple-500/30 transition-colors">
                          <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden relative flex-shrink-0">
                            {getImageUrl(product.image) ? (
                              <img src={getImageUrl(product.image)!} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                              <Package size={32} className="text-gray-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-blue-400 font-bold uppercase truncate">{product.category}</p>
                            <p className="font-bold text-white truncate">{product.name}</p>
                            <p className="text-sm text-gray-400 font-mono">{product.price.toLocaleString('hu-HU')} Ft</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-[#121212] border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 group shadow-lg shadow-black/20">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <Truck size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Ingyenes szállítás</h3>
                <p className="text-sm text-gray-400 leading-tight">
                  {freeShippingThreshold.toLocaleString('hu-HU')} Ft feletti rendelés esetén
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 rounded-2xl bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 group shadow-lg shadow-black/20">
              <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Pénzvisszafizetés</h3>
                <p className="text-sm text-gray-400 leading-tight">
                  30 napos visszavásárlási garancia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 rounded-2xl bg-[#121212] border border-white/5 hover:border-pink-500/30 transition-all hover:-translate-y-1 group shadow-lg shadow-black/20">
              <div className="w-14 h-14 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Gyors kiszállítás</h3>
                <p className="text-sm text-gray-400 leading-tight">
                  Akár másnapi kézbesítéssel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <FlashSaleSection products={flashSaleProducts} />

      <BrandMarquee />

      <section id="categories" className="py-20 bg-[#0f0f0f]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Fedezd fel kategóriáinkat</h2>
          <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-3 lg:grid-cols-6 md:gap-6 snap-x scrollbar-hide">
            {categories.map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.name}`}
                className="min-w-[140px] md:min-w-0 snap-center group relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center bg-[#1a1a1a] border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color || 'from-gray-800 to-gray-900'} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                <span className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 relative z-10">{cat.icon || '📦'}</span>
                <span className="font-bold text-lg relative z-10">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 px-6 py-12 md:px-12 md:py-16 text-center md:text-left">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-purple-500/30 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-500/30 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-bold text-white mb-6 backdrop-blur-md">
                  🔥 {promoBanner ? 'Kiemelt ajánlat' : 'Korlátozott ideig'}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {promoBanner ? promoBanner.title : 'Gamer Kiegészítők'} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {promoBanner ? '' : 'Prémium Minőségben'}
                  </span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-md">
                  {promoBanner?.subtitle || 'Emeld új szintre a játékélményt! Billentyűzetek, egerek és fejhallgatók most bevezető áron.'}
                </p>
                <Link 
                  href={promoBanner?.link || '/shop'} 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  {promoBanner?.showButton ? 'Megnézem' : 'Megnézem az ajánlatokat'} <ArrowRight size={20} />
                </Link>
              </div>
              <div className="hidden md:flex justify-center items-center">
                 <div className="relative w-full max-w-md aspect-video rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden group">
                    {promoBanner?.image ? (
                      <img src={getImageUrl(promoBanner.image)!} alt={promoBanner.title} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="text-center p-8">
                            <div className="text-6xl mb-4">🎮</div>
                            <div className="font-bold text-xl text-white">Next Level Gaming</div>
                        </div>
                      </>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{'Legn\u00E9pszer\u0171bbek'}</h2>
              <p className="text-gray-400">{'A v\u00E1s\u00E1rl\u00F3ink kedvenc term\u00E9kei, most rakt\u00E1ron.'}</p>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-colors"
            >
              {'Mindent megn\u00E9zek'} <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {featuredProducts.map((product: Product, index: number) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link
              href="/shop"
              className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 inline-flex items-center justify-center"
            >
              {'\u00D6sszes term\u00E9k megtekint\u00E9se'}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0f0f0f]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Újdonságok</h2>
              <p className="text-gray-400">A legfrissebb termékeink, csak neked.</p>
            </div>
            <Link
              href="/shop?sort=newest"
              className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-colors"
            >
              Mindent megnézek <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {newArrivals.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Smart Recommendations - Personalized or Trending */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <SmartRecommendations maxItems={4} />
        </div>
      </section>

      <LatestNews posts={latestPosts} />
      <NewsletterSection />
    </div>
  )
}

