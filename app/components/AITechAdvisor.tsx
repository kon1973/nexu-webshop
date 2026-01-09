'use client'

import { useState, useTransition, useEffect } from 'react'
import { Cpu, Sparkles, Loader2, Monitor, Gamepad2, Briefcase, Video, Music, Home, Smartphone, Check, ArrowRight, Zap, Battery, Wifi, BarChart2, Scale, Trophy, History, RefreshCw, Copy, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getTechRecommendations } from '@/lib/actions/user-actions'
import { getImageUrl } from '@/lib/image'
import { toast } from 'sonner'

interface TechPreferences {
  useCase: string
  priority: string[]
  budget: string
  experienceLevel: string
  ecosystem?: string
}

interface TechProduct {
  id: number
  name: string
  slug: string
  price: number
  image: string | null
  category: string
  matchScore: number
  techReason: string
}

interface TechResult {
  profile: string
  setupType: string
  recommendations: TechProduct[]
  bundles: Array<{
    name: string
    items: TechProduct[]
    totalPrice: number
    savings: number
    description: string
  }>
  tips: string[]
  futureUpgrades: string[]
}

interface SetupHistory {
  id: string
  preferences: TechPreferences
  result: TechResult
  timestamp: number
}

const HISTORY_KEY = 'nexu-tech-advisor-history'

const USE_CASE_OPTIONS = [
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, desc: 'Játékhoz optimalizált teljesítmény', color: 'from-purple-500 to-pink-500' },
  { id: 'office', label: 'Home Office', icon: Briefcase, desc: 'Produktivitás és távmunka', color: 'from-blue-500 to-cyan-500' },
  { id: 'content', label: 'Tartalomgyártás', icon: Video, desc: 'Videó, fotó, streaming', color: 'from-red-500 to-orange-500' },
  { id: 'music', label: 'Zenélés', icon: Music, desc: 'Zenei produkció és hallgatás', color: 'from-green-500 to-teal-500' },
  { id: 'smarthome', label: 'Okosotthon', icon: Home, desc: 'Otthon automatizálás', color: 'from-yellow-500 to-amber-500' },
  { id: 'mobile', label: 'Mobilitás', icon: Smartphone, desc: 'Hordozhatóság, utazás', color: 'from-indigo-500 to-violet-500' }
]

const PRIORITY_OPTIONS = [
  { id: 'performance', label: 'Teljesítmény', icon: Zap, desc: 'Maximális erő' },
  { id: 'battery', label: 'Akkumulátor', icon: Battery, desc: 'Hosszú üzemidő' },
  { id: 'connectivity', label: 'Kapcsolódás', icon: Wifi, desc: 'Vezetéknélküli szabadság' },
  { id: 'display', label: 'Kijelző', icon: Monitor, desc: 'Vizuális élmény' },
  { id: 'portability', label: 'Hordozhatóság', icon: Smartphone, desc: 'Könnyű, kompakt' },
  { id: 'value', label: 'Ár-érték', icon: Check, desc: 'Legjobb a pénzért' }
]

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'Belépő szint', range: '0 - 100.000 Ft', desc: 'Alapvető igényekhez' },
  { id: 'mid', label: 'Középkategória', range: '100.000 - 300.000 Ft', desc: 'Kiegyensúlyozott választás' },
  { id: 'premium', label: 'Prémium', range: '300.000 - 500.000 Ft', desc: 'Magas minőség' },
  { id: 'flagship', label: 'Csúcskategória', range: '500.000+ Ft', desc: 'A legjobb a piacon' }
]

const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'Kezdő', desc: 'Most ismerkedem a tech világgal' },
  { id: 'intermediate', label: 'Haladó', desc: 'Ismerem az alapokat' },
  { id: 'expert', label: 'Profi', desc: 'Részletes specifikációkat keresek' }
]

const ECOSYSTEM_OPTIONS = [
  { id: 'apple', label: 'Apple', color: '#999999' },
  { id: 'android', label: 'Android', color: '#3DDC84' },
  { id: 'windows', label: 'Windows', color: '#0078D4' },
  { id: 'mixed', label: 'Vegyes', color: '#6366F1' }
]

export default function AITechAdvisor() {
  const [step, setStep] = useState(1)
  const [preferences, setPreferences] = useState<TechPreferences>({
    useCase: '',
    priority: [],
    budget: '',
    experienceLevel: '',
    ecosystem: ''
  })
  const [result, setResult] = useState<TechResult | null>(null)
  const [isAnalyzing, startAnalysis] = useTransition()
  const [history, setHistory] = useState<SetupHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<SetupHistory | null>(null)

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  // Save to history
  const saveToHistory = (prefs: TechPreferences, res: TechResult) => {
    const entry: SetupHistory = {
      id: Date.now().toString(),
      preferences: prefs,
      result: res,
      timestamp: Date.now()
    }
    const newHistory = [entry, ...history].slice(0, 5)
    setHistory(newHistory)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  }

  // Delete from history
  const deleteFromHistory = (id: string) => {
    const newHistory = history.filter(h => h.id !== id)
    setHistory(newHistory)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    if (selectedForCompare?.id === id) setSelectedForCompare(null)
    toast.success('Törölve')
  }

  // Load from history
  const loadFromHistory = (entry: SetupHistory) => {
    setPreferences(entry.preferences)
    setResult(entry.result)
    setStep(5)
    setShowHistory(false)
    toast.success('Korábbi eredmény betöltve')
  }

  // Export result
  const exportResult = () => {
    if (!result) return
    const text = `NEXU Tech Setup Tanácsadó\n${'='.repeat(30)}\n\nProfil: ${result.profile}\nSetup típus: ${result.setupType}\n\nAjánlott termékek:\n${result.recommendations.map(r => `- ${r.name}: ${r.price.toLocaleString('hu-HU')} Ft (${r.matchScore}% egyezés)`).join('\n')}\n\nTippek:\n${result.tips.map(t => `- ${t}`).join('\n')}\n\nJövőbeli upgradeek:\n${result.futureUpgrades.map(u => `- ${u}`).join('\n')}`
    navigator.clipboard.writeText(text)
    toast.success('Vágólapra másolva!')
  }

  // Share result
  const shareResult = async () => {
    if (!result) return
    const shareData = {
      title: 'NEXU Tech Setup',
      text: `${result.profile} - ${result.setupType}`,
      url: window.location.href
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { exportResult() }
    } else {
      exportResult()
    }
  }

  const updatePreference = <K extends keyof TechPreferences>(key: K, value: TechPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const togglePriority = (priorityId: string) => {
    setPreferences(prev => ({
      ...prev,
      priority: prev.priority.includes(priorityId)
        ? prev.priority.filter(p => p !== priorityId)
        : prev.priority.length < 3 
          ? [...prev.priority, priorityId]
          : prev.priority
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 1: return preferences.useCase !== ''
      case 2: return preferences.priority.length > 0
      case 3: return preferences.budget !== ''
      case 4: return preferences.experienceLevel !== ''
      default: return false
    }
  }

  const handleAnalyze = () => {
    startAnalysis(async () => {
      try {
        const res = await getTechRecommendations(preferences)
        if (res.success && res.result) {
          setResult(res.result)
          saveToHistory(preferences, res.result)
          setStep(5)
        } else {
          toast.error(res.error || 'Hiba az elemzés során')
        }
      } catch {
        toast.error('Váratlan hiba történt')
      }
    })
  }

  const resetWizard = () => {
    setStep(1)
    setPreferences({
      useCase: '',
      priority: [],
      budget: '',
      experienceLevel: '',
      ecosystem: ''
    })
    setResult(null)
  }

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tech Setup Tanácsadó</h2>
            <p className="text-sm text-white/60">AI-alapú eszközajánlások az igényeid szerint</p>
          </div>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <button
              onClick={() => { setShowHistory(!showHistory); setCompareMode(false) }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showHistory ? 'bg-cyan-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <History size={16} />
              <span className="hidden sm:inline">Előzmények</span>
              <span className="text-xs bg-white/20 px-1.5 rounded">{history.length}</span>
            </button>
          )}
          {result && (
            <>
              <button
                onClick={exportResult}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={shareResult}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors"
              >
                <Share2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-cyan-900/20 rounded-xl border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <History size={18} className="text-cyan-400" />
                  Korábbi elemzések
                </h3>
                {history.length > 1 && (
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      compareMode ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Scale size={12} className="inline mr-1" />
                    Összehasonlítás
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {history.map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`p-3 rounded-lg transition-all ${
                      selectedForCompare?.id === entry.id 
                        ? 'bg-purple-500/20 border-2 border-purple-500' 
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white text-sm font-medium">
                          {USE_CASE_OPTIONS.find(u => u.id === entry.preferences.useCase)?.label}
                        </h4>
                        <p className="text-cyan-400 text-xs">{entry.result.setupType}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {entry.result.recommendations.length} termék
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {compareMode ? (
                          <button
                            onClick={() => setSelectedForCompare(selectedForCompare?.id === entry.id ? null : entry)}
                            className={`p-1.5 rounded transition-colors ${
                              selectedForCompare?.id === entry.id ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
                            }`}
                          >
                            <Scale size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => loadFromHistory(entry)}
                            className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      {new Date(entry.timestamp).toLocaleDateString('hu-HU')}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Comparison View */}
              {compareMode && selectedForCompare && result && (
                <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                    <BarChart2 size={16} />
                    Összehasonlítás
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white text-sm font-medium mb-2">Jelenlegi</p>
                      <div className="space-y-1 text-xs text-gray-400">
                        <p>Setup: {result.setupType}</p>
                        <p>Termékek: {result.recommendations.length}</p>
                        <p>Össz ár: {result.recommendations.reduce((s, r) => s + r.price, 0).toLocaleString('hu-HU')} Ft</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium mb-2">Korábbi</p>
                      <div className="space-y-1 text-xs text-gray-400">
                        <p>Setup: {selectedForCompare.result.setupType}</p>
                        <p>Termékek: {selectedForCompare.result.recommendations.length}</p>
                        <p>Össz ár: {selectedForCompare.result.recommendations.reduce((s, r) => s + r.price, 0).toLocaleString('hu-HU')} Ft</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {step < 5 && (
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                s < step ? 'bg-cyan-500 text-white' : 
                s === step ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500' : 
                'bg-white/5 text-white/40'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-0.5 mx-2 ${s < step ? 'bg-cyan-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Use Case */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Mire használnád leginkább?</h3>
              <p className="text-sm text-white/60">Válaszd ki a fő felhasználási területet</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {USE_CASE_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = preferences.useCase === option.id
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updatePreference('useCase', option.id)}
                    className={`group relative p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-gradient-to-br ' + option.color + ' border-transparent shadow-lg'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-white/60'}`} />
                    <div className={`font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                      {option.label}
                    </div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-white/50'}`}>
                      {option.desc}
                    </div>
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Priorities */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Mi a legfontosabb számodra?</h3>
              <p className="text-sm text-white/60">Válassz max. 3 prioritást</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRIORITY_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = preferences.priority.includes(option.id)
                const isDisabled = !isSelected && preferences.priority.length >= 3
                return (
                  <button
                    key={option.id}
                    onClick={() => togglePriority(option.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500'
                        : isDisabled
                          ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-white/60'}`} />
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div className={`font-medium text-sm ${isSelected ? 'text-cyan-400' : 'text-white/80'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-white/50 mt-1">{option.desc}</div>
                  </button>
                )
              })}
            </div>

            <div className="text-center text-sm text-white/40">
              {preferences.priority.length}/3 kiválasztva
            </div>
          </motion.div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Mekkora a keretösszeg?</h3>
              <p className="text-sm text-white/60">Ez segít a megfelelő árkategóriában keresni</p>
            </div>

            <div className="space-y-3">
              {BUDGET_OPTIONS.map((option) => {
                const isSelected = preferences.budget === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => updatePreference('budget', option.id)}
                    className={`w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${isSelected ? 'text-cyan-400' : 'text-white/80'}`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-white/50">{option.desc}</div>
                    </div>
                    <div className={`text-sm font-mono ${isSelected ? 'text-cyan-400' : 'text-white/60'}`}>
                      {option.range}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 4: Experience & Ecosystem */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Tapasztalati szint</h3>
              <p className="text-sm text-white/60">Ez befolyásolja az ajánlások részletességét</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_OPTIONS.map((option) => {
                const isSelected = preferences.experienceLevel === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => updatePreference('experienceLevel', option.id)}
                    className={`p-4 rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`font-medium ${isSelected ? 'text-cyan-400' : 'text-white/80'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-white/50 mt-1">{option.desc}</div>
                  </button>
                )
              })}
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium text-white/80 mb-3">Preferált ökoszisztéma (opcionális)</h4>
              <div className="flex gap-2">
                {ECOSYSTEM_OPTIONS.map((option) => {
                  const isSelected = preferences.ecosystem === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => updatePreference('ecosystem', isSelected ? '' : option.id)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-transparent'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                      style={isSelected ? { backgroundColor: option.color + '30', borderColor: option.color } : {}}
                    >
                      <span className={isSelected ? 'text-white' : 'text-white/70'}>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5: Results */}
        {step === 5 && result && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Profile Summary */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl p-6 border border-cyan-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm text-cyan-400">A te tech profilod</div>
                  <div className="font-semibold text-white">{result.setupType}</div>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{result.profile}</p>
            </div>

            {/* Recommended Products */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Ajánlott eszközök
              </h3>
              <div className="grid gap-4">
                {result.recommendations.slice(0, 6).map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug || product.id}`}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-white/5 shrink-0">
                      {product.image ? (
                        <Image
                          src={getImageUrl(product.image) || ''}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Cpu className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-white/50">{product.category}</div>
                      <div className="text-xs text-cyan-400/80 mt-1">{product.techReason}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-white">
                        {product.price.toLocaleString('hu-HU')} Ft
                      </div>
                      <div className="flex items-center gap-1 text-xs text-cyan-400">
                        <Zap className="w-3 h-3" />
                        {product.matchScore}% egyezés
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bundles */}
            {result.bundles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  Komplett setup csomagok
                </h3>
                <div className="space-y-4">
                  {result.bundles.map((bundle, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium text-white">{bundle.name}</div>
                          <div className="text-sm text-white/50">{bundle.description}</div>
                        </div>
                        {bundle.savings > 0 && (
                          <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                            -{bundle.savings.toLocaleString('hu-HU')} Ft
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bundle.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                            {item.image && (
                              <div className="w-6 h-6 relative rounded overflow-hidden">
                                <Image
                                  src={getImageUrl(item.image) || ''}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="text-sm text-white/80">{item.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-white">
                          {bundle.totalPrice.toLocaleString('hu-HU')} Ft
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Tippek
                </h4>
                <ul className="space-y-2">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                  Jövőbeli fejlesztések
                </h4>
                <ul className="space-y-2">
                  {result.futureUpgrades.map((upgrade, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                      <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      {upgrade}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reset button */}
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
      {step < 5 && (
        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Vissza
          </motion.button>

          {step < 4 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all group"
            >
              Tovább
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={!canProceed() || isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-xl hover:shadow-cyan-500/30 transition-all group"
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
                  Ajánlások kérése
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}
