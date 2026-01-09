'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Radar, TrendingUp, TrendingDown, ExternalLink, Eye, 
  Package, DollarSign, RefreshCw, AlertTriangle, Search,
  BarChart3, Globe, Sparkles, ArrowUp, ArrowDown, Minus
} from 'lucide-react'
import { toast } from 'sonner'

interface Competitor {
  id: string
  name: string
  logo: string
  website: string
  lastUpdated: string
  products: number
  avgPrice: number
  priceIndex: number // 100 = same as us, >100 = more expensive
  marketShare: number
  strengths: string[]
  weaknesses: string[]
}

interface PriceComparison {
  productName: string
  ourPrice: number
  competitors: {
    name: string
    price: number
    diff: number
    inStock: boolean
  }[]
  recommendation: string
}

const mockCompetitors: Competitor[] = [
  {
    id: '1',
    name: 'TechWorld',
    logo: '🌐',
    website: 'techworld.hu',
    lastUpdated: new Date().toISOString(),
    products: 2450,
    avgPrice: 85000,
    priceIndex: 95,
    marketShare: 23,
    strengths: ['Nagy választék', 'Gyors szállítás', 'Jó SEO'],
    weaknesses: ['Drágább árak', 'Gyenge ügyfélszolgálat']
  },
  {
    id: '2',
    name: 'MediaMarkt',
    logo: '🔴',
    website: 'mediamarkt.hu',
    lastUpdated: new Date().toISOString(),
    products: 5200,
    avgPrice: 92000,
    priceIndex: 108,
    marketShare: 35,
    strengths: ['Márkaismertség', 'Fizikai boltok', 'Garancia'],
    weaknesses: ['Magasabb árak', 'Lassú online']
  },
  {
    id: '3',
    name: 'Alza',
    logo: '🟢',
    website: 'alza.hu',
    lastUpdated: new Date().toISOString(),
    products: 8500,
    avgPrice: 78000,
    priceIndex: 92,
    marketShare: 28,
    strengths: ['Alacsony árak', 'Hatalmas választék', 'Gyors kiszállítás'],
    weaknesses: ['Komplex weboldal', 'Személytelen']
  }
]

const mockPriceComparisons: PriceComparison[] = [
  {
    productName: 'iPhone 15 Pro Max 256GB',
    ourPrice: 549990,
    competitors: [
      { name: 'TechWorld', price: 559990, diff: 1.8, inStock: true },
      { name: 'MediaMarkt', price: 569990, diff: 3.6, inStock: true },
      { name: 'Alza', price: 539990, diff: -1.8, inStock: false }
    ],
    recommendation: 'Árunk versenyképes. Az Alza-nál olcsóbb, de náluk nincs készleten. Tartsuk a jelenlegi árat.'
  },
  {
    productName: 'Samsung Galaxy S24 Ultra',
    ourPrice: 499990,
    competitors: [
      { name: 'TechWorld', price: 489990, diff: -2.0, inStock: true },
      { name: 'MediaMarkt', price: 519990, diff: 4.0, inStock: true },
      { name: 'Alza', price: 479990, diff: -4.0, inStock: true }
    ],
    recommendation: '⚠️ Árunk magasabb a piacnál. Javasolt 10.000 Ft-os árcsökkentés a versenyképesség érdekében.'
  },
  {
    productName: 'MacBook Air M3',
    ourPrice: 449990,
    competitors: [
      { name: 'TechWorld', price: 459990, diff: 2.2, inStock: true },
      { name: 'MediaMarkt', price: 469990, diff: 4.4, inStock: false },
      { name: 'Alza', price: 454990, diff: 1.1, inStock: true }
    ],
    recommendation: '✅ A piacon mi vagyunk a legolcsóbbak! Lehet áremelésre tér, de óvatosan.'
  }
]

export default function AICompetitorMonitor() {
  const [competitors, setCompetitors] = useState<Competitor[]>(mockCompetitors)
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>(mockPriceComparisons)
  const [isScanning, setIsScanning] = useState(false)
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null)
  const [view, setView] = useState<'overview' | 'prices' | 'insights'>('overview')

  const runCompetitorScan = async () => {
    setIsScanning(true)
    toast.info('Versenytárs adatok frissítése...')
    await new Promise(r => setTimeout(r, 3000))
    toast.success('Adatok frissítve! 12 árváltozás észlelve.')
    setIsScanning(false)
  }

  const avgPriceIndex = competitors.reduce((sum, c) => sum + c.priceIndex, 0) / competitors.length
  const ourPosition = avgPriceIndex > 100 ? 'olcsóbbak' : avgPriceIndex < 100 ? 'drágábbak' : 'azonosak'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
            <Radar className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Versenytárs Monitor</h2>
            <p className="text-gray-400 text-sm">Piaci pozíció és árösszehasonlítás</p>
          </div>
        </div>
        <button
          onClick={runCompetitorScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
          Frissítés
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Globe size={14} />
            Figyelt versenytárs
          </div>
          <p className="text-2xl font-bold text-white">{competitors.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <BarChart3 size={14} />
            Átl. árindex
          </div>
          <p className="text-2xl font-bold text-white">{avgPriceIndex.toFixed(0)}</p>
          <p className="text-xs text-gray-500">Mi {ourPosition} vagyunk</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
            <TrendingUp size={14} />
            Árelőnyünk
          </div>
          <p className="text-2xl font-bold text-green-400">67%</p>
          <p className="text-xs text-gray-500">terméknél olcsóbbak</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
            <AlertTriangle size={14} />
            Árriasztás
          </div>
          <p className="text-2xl font-bold text-yellow-400">5</p>
          <p className="text-xs text-gray-500">termék drágább</p>
        </motion.div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[
          { id: 'overview', label: 'Áttekintés', icon: Eye },
          { id: 'prices', label: 'Árak', icon: DollarSign },
          { id: 'insights', label: 'AI Elemzés', icon: Sparkles }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as typeof view)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === tab.id
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-3 gap-4"
          >
            {competitors.map((competitor, index) => (
              <motion.div
                key={competitor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedCompetitor(competitor)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{competitor.logo}</div>
                  <div>
                    <h3 className="text-white font-medium">{competitor.name}</h3>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Globe size={10} />
                      {competitor.website}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Piaci részesedés</span>
                    <span className="text-white font-medium">{competitor.marketShare}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${competitor.marketShare}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Árindex</span>
                    <span className={`font-medium flex items-center gap-1 ${
                      competitor.priceIndex > 100 ? 'text-green-400' :
                      competitor.priceIndex < 100 ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {competitor.priceIndex > 100 ? <ArrowUp size={12} /> :
                       competitor.priceIndex < 100 ? <ArrowDown size={12} /> :
                       <Minus size={12} />}
                      {competitor.priceIndex}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Termékek</span>
                    <span className="text-white">{competitor.products.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap gap-1">
                    {competitor.strengths.slice(0, 2).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {view === 'prices' && (
          <motion.div
            key="prices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {priceComparisons.map((comparison, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">{comparison.productName}</h3>
                  <div className="text-xl font-bold text-white">
                    {comparison.ourPrice.toLocaleString('hu-HU')} Ft
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {comparison.competitors.map((c, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg ${
                        c.diff > 0 ? 'bg-green-500/10 border border-green-500/20' :
                        c.diff < 0 ? 'bg-red-500/10 border border-red-500/20' :
                        'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-sm">{c.name}</span>
                        {!c.inStock && (
                          <span className="text-xs text-yellow-400">Nincs készlet</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {c.price.toLocaleString('hu-HU')} Ft
                        </span>
                        <span className={`text-sm font-medium ${
                          c.diff > 0 ? 'text-green-400' : c.diff < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {c.diff > 0 ? '+' : ''}{c.diff.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-purple-400 mt-0.5" />
                    <p className="text-gray-300 text-sm">{comparison.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {view === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* AI Generated Insights */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Sparkles className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">AI Piaci Elemzés</h3>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-white">🎯 Piaci pozíció:</strong> A NEXU Store jelenleg 
                  a középmezőnyben helyezkedik el árversenyképesség szempontjából. A termékek 67%-án 
                  olcsóbbak vagyunk a versenytársaknál.
                </p>
                <p>
                  <strong className="text-white">📈 Lehetőségek:</strong> Az Alza árpolitikája agresszív, 
                  de készletproblémákkal küzdenek. A MediaMarkt prémium szegmensre fókuszál - van tér 
                  a középkategóriában.
                </p>
                <p>
                  <strong className="text-white">⚠️ Figyelmeztetések:</strong> 5 terméknél magasabb 
                  az árunk a piacátlagnál. Samsung telefonok és gaming monitorok esetében javasolt 
                  az árfelülvizsgálat.
                </p>
                <p>
                  <strong className="text-white">💡 Javaslat:</strong> Fókuszáljunk az Apple 
                  termékekre, ahol árelőnyünk van. Fontoljuk meg Samsung termékek akciózását 
                  a versenyképesség növelése érdekében.
                </p>
              </div>
            </div>

            {/* Competitor SWOT */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Versenyelőnyeink
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Versenyképes Apple árak</li>
                  <li>• AI-alapú ügyfélszolgálat</li>
                  <li>• Modern, gyors weboldal</li>
                  <li>• Személyre szabott ajánlatok</li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                  <TrendingDown size={16} />
                  Fejlesztendő területek
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Samsung árazás</li>
                  <li>• SEO láthatóság</li>
                  <li>• Fizikai jelenlét hiánya</li>
                  <li>• Márkaismertség</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Competitor Detail Modal */}
      <AnimatePresence>
        {selectedCompetitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCompetitor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">{selectedCompetitor.logo}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedCompetitor.name}</h3>
                  <a 
                    href={`https://${selectedCompetitor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 text-sm flex items-center gap-1 hover:underline"
                  >
                    {selectedCompetitor.website}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-xs">Piaci részesedés</p>
                  <p className="text-2xl font-bold text-white">{selectedCompetitor.marketShare}%</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-xs">Árindex</p>
                  <p className="text-2xl font-bold text-white">{selectedCompetitor.priceIndex}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-xs">Termékek száma</p>
                  <p className="text-2xl font-bold text-white">{selectedCompetitor.products.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-xs">Átlag ár</p>
                  <p className="text-2xl font-bold text-white">{(selectedCompetitor.avgPrice / 1000).toFixed(0)}k Ft</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-green-400 text-sm font-medium mb-2">Erősségek</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompetitor.strengths.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-red-400 text-sm font-medium mb-2">Gyengeségek</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompetitor.weaknesses.map((w, i) => (
                      <span key={i} className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
