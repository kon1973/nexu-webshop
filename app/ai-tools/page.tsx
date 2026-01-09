import { Metadata } from 'next'
import AIGiftFinder from '@/app/components/AIGiftFinder'
import AIDealHunter from '@/app/components/AIDealHunter'
import AIVoiceSearch from '@/app/components/AIVoiceSearch'
import AIBudgetPlanner from '@/app/components/AIBudgetPlanner'
import AITechAdvisor from '@/app/components/AITechAdvisor'
import AIShoppingList from '@/app/components/AIShoppingList'
import AICompatibilityChecker from '@/app/components/AICompatibilityChecker'
import AIUpgradeAdvisor from '@/app/components/AIUpgradeAdvisor'
import { Sparkles, Gift, Zap, Brain, ArrowRight, Star, Mic, Wallet, Cpu, ListTodo, CircuitBoard, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Vásárlási Asszisztens | NEXU Tech',
  description: 'Fedezd fel az AI-alapú tech vásárlási eszközeinket: ajándékkereső, akcióvadász, setup tanácsadó és személyre szabott ajánlások.',
  openGraph: {
    title: 'AI Vásárlási Asszisztens | NEXU Tech',
    description: 'Okos tech vásárlás mesterséges intelligenciával'
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
            Használd ki a mesterséges intelligencia erejét a tech vásárláshoz! Személyre szabott 
            eszközajánlások, akcióvadászat és intelligens setup tervezés egy helyen.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-2xl hover:border-pink-500/50 transition-colors">
            <div className="p-3 bg-pink-500/20 rounded-xl w-fit mb-4">
              <Gift size={24} className="text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tech Ajándék Kereső</h3>
            <p className="text-gray-400 text-sm mb-4">
              Találd meg a tökéletes tech ajándékot bármilyen alkalomra és költségkeretre.
            </p>
            <div className="flex items-center gap-1 text-pink-400 text-sm font-medium">
              <Sparkles size={14} />
              Személyre szabott
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl hover:border-orange-500/50 transition-colors">
            <div className="p-3 bg-orange-500/20 rounded-xl w-fit mb-4">
              <Zap size={24} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tech Akcióvadász</h3>
            <p className="text-gray-400 text-sm mb-4">
              Ne maradj le a legjobb tech ajánlatokról! AI-alapú ár előrejelzés és akció riasztások.
            </p>
            <div className="flex items-center gap-1 text-orange-400 text-sm font-medium">
              <Star size={14} />
              Ár előrejelzés
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl hover:border-green-500/50 transition-colors">
            <div className="p-3 bg-green-500/20 rounded-xl w-fit mb-4">
              <Mic size={24} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Hangalapú Keresés</h3>
            <p className="text-gray-400 text-sm mb-4">
              Keress tech termékeket hangoddal! Az AI értelmezi a magyar beszédet.
            </p>
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
              <Brain size={14} />
              Magyar nyelvű
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl hover:border-blue-500/50 transition-colors">
            <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
              <Wallet size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tech Költségvetés</h3>
            <p className="text-gray-400 text-sm mb-4">
              Tervezd meg a tech beszerzéseidet! Az AI segít optimalizálni a költségkeretedet.
            </p>
            <Link 
              href="#budget-planner" 
              className="inline-flex items-center gap-1 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              Tervezés indítása
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-2xl hover:border-cyan-500/50 transition-colors">
            <div className="p-3 bg-cyan-500/20 rounded-xl w-fit mb-4">
              <Cpu size={24} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tech Setup Tanácsadó</h3>
            <p className="text-gray-400 text-sm mb-4">
              Gaming, home office vagy tartalomgyártás? Az AI összeállítja a tökéletes setupot.
            </p>
            <Link 
              href="#tech-advisor" 
              className="inline-flex items-center gap-1 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
            >
              Setup tervezése
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-2xl hover:border-emerald-500/50 transition-colors">
            <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-4">
              <ListTodo size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tech Kívánságlista</h3>
            <p className="text-gray-400 text-sm mb-4">
              Gyűjtsd össze a kívánt tech eszközöket és optimalizáld AI segítségével.
            </p>
            <Link 
              href="#shopping-list" 
              className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              Lista készítése
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-6 bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border border-violet-500/30 rounded-2xl hover:border-violet-500/50 transition-colors">
            <div className="p-3 bg-violet-500/20 rounded-xl w-fit mb-4">
              <CircuitBoard size={24} className="text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Kompatibilitás Ellenőrző</h3>
            <p className="text-gray-400 text-sm mb-4">
              Ellenőrizd, hogy a kiválasztott PC alkatrészek kompatibilisek-e egymással.
            </p>
            <Link 
              href="#compatibility-checker" 
              className="inline-flex items-center gap-1 text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
            >
              Ellenőrzés indítása
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-6 bg-gradient-to-br from-rose-900/20 to-pink-900/20 border border-rose-500/30 rounded-2xl hover:border-rose-500/50 transition-colors">
            <div className="p-3 bg-rose-500/20 rounded-xl w-fit mb-4">
              <TrendingUp size={24} className="text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upgrade Tanácsadó</h3>
            <p className="text-gray-400 text-sm mb-4">
              Elemezd a jelenlegi setupodat és kapj személyre szabott upgrade javaslatokat.
            </p>
            <Link 
              href="#upgrade-advisor" 
              className="inline-flex items-center gap-1 text-rose-400 text-sm font-medium hover:text-rose-300 transition-colors"
            >
              Upgrade terv
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Gift Finder Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Gift size={28} className="text-pink-400" />
            <h2 className="text-2xl font-bold text-white">AI Tech Ajándék Kereső</h2>
          </div>
          <AIGiftFinder />
        </section>

        {/* Deal Hunter Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={28} className="text-orange-400" />
            <h2 className="text-2xl font-bold text-white">AI Tech Akcióvadász</h2>
          </div>
          <AIDealHunter />
        </section>

        {/* Voice Search Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Mic size={28} className="text-green-400" />
            <h2 className="text-2xl font-bold text-white">AI Hangalapú Keresés</h2>
          </div>
          <AIVoiceSearch />
        </section>

        {/* Budget Planner Section */}
        <section id="budget-planner" className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Wallet size={28} className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">AI Tech Költségvetés Tervező</h2>
          </div>
          <AIBudgetPlanner />
        </section>

        {/* Tech Advisor Section */}
        <section id="tech-advisor" className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Cpu size={28} className="text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">AI Tech Setup Tanácsadó</h2>
          </div>
          <AITechAdvisor />
        </section>

        {/* Shopping List Section */}
        <section id="shopping-list" className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ListTodo size={28} className="text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">AI Tech Kívánságlista</h2>
          </div>
          <AIShoppingList />
        </section>

        {/* Compatibility Checker Section */}
        <section id="compatibility-checker" className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <CircuitBoard size={28} className="text-violet-400" />
            <h2 className="text-2xl font-bold text-white">AI Kompatibilitás Ellenőrző</h2>
          </div>
          <AICompatibilityChecker />
        </section>

        {/* Upgrade Advisor Section */}
        <section id="upgrade-advisor" className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={28} className="text-rose-400" />
            <h2 className="text-2xl font-bold text-white">AI Upgrade Tanácsadó</h2>
          </div>
          <AIUpgradeAdvisor />
        </section>

        {/* More AI Features */}
        <section className="text-center py-12 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20 rounded-2xl border border-white/10">
          <Sparkles size={40} className="mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Fedezd fel a többi AI funkciót!</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Az AI asszisztens minden termékoldaon elérhető. Kérdezd meg bármit a tech termékekről, 
            nézd meg a specifikációk összehasonlítását, vagy hasonlítsd össze a különböző modelleket.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
            >
              Tech termékek böngészése
            </Link>
            <Link
              href="/compare"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              Specifikációk összehasonlítása
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
