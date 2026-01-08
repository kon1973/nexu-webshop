import Link from 'next/link'
import { Home, Search, ShoppingBag, HelpCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Oldal nem található (404)',
  description: 'A keresett oldal nem található. Böngészd termékeinket vagy térj vissza a főoldalra.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  const siteUrl = getSiteUrl()

  // Breadcrumb JSON-LD for 404 page
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kezdőlap', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Oldal nem található' }
    ]
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 text-center font-sans selection:bg-purple-500/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />
        <h1 className="relative text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10">
          404
        </h1>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-4">Az oldal nem található</h2>
      <p className="text-gray-400 max-w-md mb-8 text-lg">
        Sajnáljuk, de a keresett oldal nem létezik, vagy áthelyezésre került.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
        >
          <Home size={20} /> Vissza a főoldalra
        </Link>
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10"
        >
          <Search size={20} /> Termékek böngészése
        </Link>
      </div>

      {/* Helpful links section */}
      <div className="w-full max-w-2xl border-t border-white/10 pt-8">
        <h3 className="text-lg font-semibold mb-6 text-gray-300">Hasznos linkek</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/shop" 
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ShoppingBag size={24} className="text-purple-400" />
            <span className="text-sm">Termékek</span>
          </Link>
          <Link 
            href="/faq" 
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <HelpCircle size={24} className="text-blue-400" />
            <span className="text-sm">GYIK</span>
          </Link>
          <Link 
            href="/contact" 
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Search size={24} className="text-green-400" />
            <span className="text-sm">Kapcsolat</span>
          </Link>
          <Link 
            href="/about" 
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Home size={24} className="text-orange-400" />
            <span className="text-sm">Rólunk</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
