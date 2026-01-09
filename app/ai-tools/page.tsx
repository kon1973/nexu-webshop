import { Metadata } from 'next'
import AIGiftFinder from '@/app/components/AIGiftFinder'
import AIDealHunter from '@/app/components/AIDealHunter'
import { Sparkles, Gift, Zap, Brain, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Vásárlási Asszisztens | NEXU',
  description: 'Fedezd fel az AI-alapú vásárlási eszközeinket: ajándékkereső, akcióvadász és személyre szabott ajánlások.',
  openGraph: {
    title: 'AI Vásárlási Asszisztens | NEXU',
    description: 'Okos vásárlás mesterséges intelligenciával'
  }
}

export default function AIToolsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full mb-6">
            <Brain size={18} />
            <span className="text-sm font-medium">Mesterséges Intelligencia</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              AI Vásárlási Asszisztens
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Használd ki a mesterséges intelligencia erejét a vásárláshoz! Ajándékötletek, 
            akcióvadászat és személyre szabott termékajánlások egy helyen.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-2xl hover:border-pink-500/50 transition-colors">
            <div className="p-3 bg-pink-500/20 rounded-xl w-fit mb-4">
              <Gift size={24} className="text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ajándék Kereső</h3>
            <p className="text-gray-400 text-sm mb-4">
              Találd meg a tökéletes ajándékot bármilyen alkalomra. Az AI segít kiválasztani 
              a legjobb termékeket a megadott költségkeret és érdeklődési körök alapján.
            </p>
            <div className="flex items-center gap-1 text-pink-400 text-sm font-medium">
              <Sparkles size={14} />
              Személyre szabott ajánlások
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl hover:border-orange-500/50 transition-colors">
            <div className="p-3 bg-orange-500/20 rounded-xl w-fit mb-4">
              <Zap size={24} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Akcióvadász</h3>
            <p className="text-gray-400 text-sm mb-4">
              Ne maradj le a legjobb ajánlatokról! Az AI elemzi az árakat és megmondja, 
              mikor érdemes vásárolni és mely termékek jelentik a legjobb értéket.
            </p>
            <div className="flex items-center gap-1 text-orange-400 text-sm font-medium">
              <Star size={14} />
              Ár előrejelzés
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl hover:border-blue-500/50 transition-colors">
            <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
              <Brain size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Okos Összehasonlítás</h3>
            <p className="text-gray-400 text-sm mb-4">
              Hasonlítsd össze a termékeket részletesen! Az AI kiemeli a különbségeket 
              és segít a döntésben személyre szabott tanácsokkal.
            </p>
            <Link 
              href="/compare" 
              className="inline-flex items-center gap-1 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Összehasonlítás
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Gift Finder Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Gift size={28} className="text-pink-400" />
            <h2 className="text-2xl font-bold text-white">AI Ajándék Kereső</h2>
          </div>
          <AIGiftFinder />
        </section>

        {/* Deal Hunter Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={28} className="text-orange-400" />
            <h2 className="text-2xl font-bold text-white">AI Akcióvadász</h2>
          </div>
          <AIDealHunter />
        </section>

        {/* More AI Features */}
        <section className="text-center py-12 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20 rounded-2xl border border-white/10">
          <Sparkles size={40} className="mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Fedezd fel a többi AI funkciót!</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Az AI asszisztens minden termékoldaon elérhető. Kérdezd meg bármit a termékekről, 
            nézd meg az értékelések összefoglalóját, vagy hasonlítsd össze a variánsokat.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
            >
              Termékek böngészése
            </Link>
            <Link
              href="/compare"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              Összehasonlítás
            </Link>
            <Link
              href="/favorites"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              Kedvencek elemzése
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
