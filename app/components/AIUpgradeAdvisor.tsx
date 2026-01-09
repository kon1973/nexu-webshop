'use client'

import { useState, useTransition } from 'react'
import { TrendingUp, Sparkles, Loader2, Cpu, Monitor, Gamepad2, Briefcase, ArrowRight, Check, AlertTriangle, Zap, Clock, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getUpgradeRecommendations } from '@/lib/actions/user-actions'
import { getImageUrl } from '@/lib/image'
import { toast } from 'sonner'
import { useCart } from '@/context/CartContext'

interface CurrentSetup {
  category: string
  description: string
}

interface UpgradeProduct {
  id: number
  name: string
  slug: string | null
  price: number
  image: string | null
  category: string
  improvementScore: number
  reason: string
}

interface UpgradeResult {
  analysis: string
  currentPerformance: number
  potentialPerformance: number
  priorityUpgrades: Array<{
    category: string
    urgency: 'high' | 'medium' | 'low'
    reason: string
    products: UpgradeProduct[]
    expectedImprovement: string
  }>
  budgetOptions: Array<{
    tier: string
    totalCost: number
    products: UpgradeProduct[]
    performanceGain: number
  }>
  tips: string[]
  timeline: string
}

const SETUP_CATEGORIES = [
  { id: 'cpu', label: 'Processzor (CPU)', icon: Cpu, placeholder: 'pl. Intel i5-10400, Ryzen 5 3600' },
  { id: 'gpu', label: 'Videokártya (GPU)', icon: Monitor, placeholder: 'pl. RTX 3060, RX 6700 XT' },
  { id: 'ram', label: 'Memória (RAM)', icon: Cpu, placeholder: 'pl. 16GB DDR4 3200MHz' },
  { id: 'storage', label: 'Tárhely', icon: Cpu, placeholder: 'pl. 500GB SSD, 1TB HDD' },
  { id: 'monitor', label: 'Monitor', icon: Monitor, placeholder: 'pl. 24" 1080p 60Hz' },
  { id: 'peripherals', label: 'Perifériák', icon: Gamepad2, placeholder: 'pl. alap billentyűzet, egér' }
]

const USE_CASE_OPTIONS = [
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, desc: 'Játékokhoz optimalizált' },
  { id: 'work', label: 'Munka / Produktivitás', icon: Briefcase, desc: 'Office, multitasking' },
  { id: 'content', label: 'Tartalomgyártás', icon: Monitor, desc: 'Videó, fotó szerkesztés' },
  { id: 'mixed', label: 'Vegyes használat', icon: Cpu, desc: 'Mindenre egy kicsit' }
]

const BUDGET_OPTIONS = [
  { id: 'minimal', label: 'Minimális', range: '50.000 Ft alatt', value: 50000 },
  { id: 'moderate', label: 'Mérsékelt', range: '50-150.000 Ft', value: 150000 },
  { id: 'generous', label: 'Bőséges', range: '150-300.000 Ft', value: 300000 },
  { id: 'unlimited', label: 'Nincs limit', range: '300.000+ Ft', value: 999999 }
]

export default function AIUpgradeAdvisor() {
  const { addToCart } = useCart()
  const [step, setStep] = useState(1)
  const [currentSetup, setCurrentSetup] = useState<CurrentSetup[]>([])
  const [useCase, setUseCase] = useState('')
  const [budget, setBudget] = useState('')
  const [result, setResult] = useState<UpgradeResult | null>(null)
  const [isAnalyzing, startAnalyzing] = useTransition()

  const updateSetup = (category: string, description: string) => {
    setCurrentSetup(prev => {
      const existing = prev.findIndex(s => s.category === category)
      if (existing >= 0) {
        if (!description) {
          return prev.filter(s => s.category !== category)
        }
        const newSetup = [...prev]
        newSetup[existing] = { category, description }
        return newSetup
      }
      if (description) {
        return [...prev, { category, description }]
      }
      return prev
    })
  }

  const handleAnalyze = () => {
    if (currentSetup.length === 0) {
      toast.error('Adj meg legalább egy komponenst a jelenlegi setupodról!')
      return
    }

    startAnalyzing(async () => {
      const res = await getUpgradeRecommendations({
        currentSetup,
        useCase,
        maxBudget: BUDGET_OPTIONS.find(b => b.id === budget)?.value || 150000
      })

      if (res.success && res.result) {
        setResult(res.result)
        setStep(3)
      } else {
        toast.error(res.error || 'Hiba az elemzés során')
      }
    })
  }

  const addProductToCart = (product: UpgradeProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || undefined,
      category: product.category
    })
    toast.success('Kosárba téve!')
  }

  const getUrgencyStyles = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high': return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Sürgős' }
      case 'medium': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Közepes' }
      case 'low': return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Ráér' }
    }
  }

  const resetWizard = () => {
    setStep(1)
    setCurrentSetup([])
    setUseCase('')
    setBudget('')
    setResult(null)
  }

  return (
    <div className="bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-red-900/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Upgrade Tanácsadó</h2>
            <p className="text-gray-400 text-sm">Elemezd a jelenlegi setupod és kapj személyre szabott fejlesztési javaslatokat</p>
          </div>
        </div>

        {/* Progress */}
        {step < 3 && (
          <div className="flex items-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s < step ? 'bg-amber-500 text-white' :
                  s === step ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500' :
                  'bg-white/5 text-white/40'
                }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-0.5 mx-2 ${s < step ? 'bg-amber-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Current Setup */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Jelenlegi konfiguráció</h3>
                <p className="text-sm text-white/60">Írd le a jelenlegi eszközeidet (legalább 1 kötelező)</p>
              </div>

              <div className="space-y-4">
                {SETUP_CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const value = currentSetup.find(s => s.category === cat.id)?.description || ''
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-white/80 block mb-1">{cat.label}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateSetup(cat.id, e.target.value)}
                          placeholder={cat.placeholder}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Use Case & Budget */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Mire használod leginkább?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {USE_CASE_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isSelected = useCase === option.id
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setUseCase(option.id)}
                        className={`p-4 rounded-xl border text-left transition-all relative group ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 transition-transform group-hover:scale-110 ${isSelected ? 'text-amber-400' : 'text-white/60'}`} />
                        <div className={`font-medium ${isSelected ? 'text-amber-400' : 'text-white/80'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-white/50">{option.desc}</div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Költségkeret</h3>
                <div className="grid grid-cols-2 gap-3">
                  {BUDGET_OPTIONS.map((option) => {
                    const isSelected = budget === option.id
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setBudget(option.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className={`font-medium ${isSelected ? 'text-amber-400' : 'text-white/80'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-white/50">{option.range}</div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && result && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Performance Overview */}
              <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-amber-400">Teljesítmény elemzés</div>
                    <div className="text-white/80 text-sm mt-1">{result.analysis}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white/60">{result.currentPerformance}%</div>
                    <div className="text-xs text-white/40">Jelenlegi</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-amber-500" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{result.potentialPerformance}%</div>
                    <div className="text-xs text-white/40">Potenciális</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-bold">+{result.potentialPerformance - result.currentPerformance}%</span>
                  </div>
                </div>

                {result.timeline && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-white/60">
                    <Clock className="w-4 h-4" />
                    {result.timeline}
                  </div>
                )}
              </div>

              {/* Priority Upgrades */}
              {result.priorityUpgrades.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Priorizált fejlesztések</h3>
                  <div className="space-y-4">
                    {result.priorityUpgrades.map((upgrade, idx) => {
                      const urgencyStyle = getUrgencyStyles(upgrade.urgency)
                      return (
                        <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${urgencyStyle.bg} ${urgencyStyle.text}`}>
                                {urgencyStyle.label}
                              </span>
                              <span className="font-medium text-white">{upgrade.category}</span>
                            </div>
                            <span className="text-sm text-green-400">{upgrade.expectedImprovement}</span>
                          </div>
                          <p className="text-sm text-white/60 mb-3">{upgrade.reason}</p>
                          
                          <div className="space-y-2">
                            {upgrade.products.slice(0, 3).map((product) => (
                              <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-white/5">
                                  {product.image && (
                                    <Image
                                      src={getImageUrl(product.image) || ''}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/shop/${product.slug || product.id}`} className="text-sm text-white hover:text-amber-400 truncate block">
                                    {product.name}
                                  </Link>
                                  <div className="text-xs text-white/50">{product.reason}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-white">{product.price.toLocaleString('hu-HU')} Ft</div>
                                  <button
                                    onClick={() => addProductToCart(product)}
                                    className="text-xs text-amber-400 hover:text-amber-300"
                                  >
                                    Kosárba
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Budget Options */}
              {result.budgetOptions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Költségkeret opciók</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {result.budgetOptions.map((option, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-white">{option.tier}</span>
                          <span className="text-green-400 text-sm">+{option.performanceGain}%</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-400 mb-3">
                          {option.totalCost.toLocaleString('hu-HU')} Ft
                        </div>
                        <div className="space-y-1">
                          {option.products.map((p) => (
                            <div key={p.id} className="text-xs text-white/60 flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-400" />
                              {p.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {result.tips.length > 0 && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Tippek
                  </h4>
                  <ul className="space-y-2">
                    {result.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reset */}
              <button
                onClick={resetWizard}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                Új elemzés indítása
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 3 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 rounded-lg text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Vissza
            </motion.button>

            {step === 1 ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={currentSetup.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all group"
              >
                Tovább
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze}
                disabled={!useCase || !budget || isAnalyzing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all group"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                    </div>
                    <span>AI elemzi...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Elemzés indítása
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
