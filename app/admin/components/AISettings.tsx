'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, Bot, Sliders, Key, Zap, RefreshCw, Save, 
  Check, AlertTriangle, Brain, MessageSquare, Wand2,
  Sparkles, ToggleLeft, ToggleRight, Info, TestTube
} from 'lucide-react'
import { toast } from 'sonner'

interface AIConfig {
  // General
  enabled: boolean
  chatbotModel: string
  contentModel: string
  maxTokens: number
  temperature: number
  
  // Features
  features: {
    productSearch: boolean
    orderTracking: boolean
    cartManagement: boolean
    recommendations: boolean
    faq: boolean
    pricing: boolean
    inventory: boolean
  }
  
  // Behavior
  behavior: {
    greeting: string
    fallbackMessage: string
    maxConversationTurns: number
    responseTimeoutMs: number
    enableSmallTalk: boolean
    rememberContext: boolean
  }
  
  // Limits
  limits: {
    maxDailyConversations: number
    maxMessagesPerConversation: number
    rateLimitPerMinute: number
  }
}

const defaultConfig: AIConfig = {
  enabled: true,
  chatbotModel: 'gpt-4o-mini',
  contentModel: 'gpt-4o',
  maxTokens: 1500,
  temperature: 0.7,
  features: {
    productSearch: true,
    orderTracking: true,
    cartManagement: true,
    recommendations: true,
    faq: true,
    pricing: true,
    inventory: true
  },
  behavior: {
    greeting: 'Szia! 👋 Miben segíthetek ma?',
    fallbackMessage: 'Elnézést, nem értem a kérdést. Kérlek, próbáld meg másképp megfogalmazni.',
    maxConversationTurns: 20,
    responseTimeoutMs: 30000,
    enableSmallTalk: true,
    rememberContext: true
  },
  limits: {
    maxDailyConversations: 1000,
    maxMessagesPerConversation: 50,
    rateLimitPerMinute: 20
  }
}

const models = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Gyors és költséghatékony' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Legújabb és legerősebb' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Fejlett képességek' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic legjobbja' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Kiegyensúlyozott' }
]

export default function AISettings() {
  const [config, setConfig] = useState<AIConfig>(defaultConfig)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; responseTime?: number } | null>(null)
  const [activeSection, setActiveSection] = useState<'general' | 'features' | 'behavior' | 'limits'>('general')

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Beállítások mentve!')
    setIsSaving(false)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    // Simulate API test
    await new Promise(r => setTimeout(r, 2000))
    
    const success = Math.random() > 0.1
    setTestResult({
      success,
      message: success ? 'Kapcsolat sikeres!' : 'Kapcsolódási hiba. Ellenőrizd az API kulcsot.',
      responseTime: success ? Math.floor(Math.random() * 500 + 200) : undefined
    })
    setIsTesting(false)
  }

  const toggleFeature = (feature: keyof AIConfig['features']) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }))
  }

  const updateBehavior = (key: keyof AIConfig['behavior'], value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        [key]: value
      }
    }))
  }

  const updateLimits = (key: keyof AIConfig['limits'], value: number) => {
    setConfig(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [key]: value
      }
    }))
  }

  const sections = [
    { id: 'general', label: 'Általános', icon: Settings },
    { id: 'features', label: 'Funkciók', icon: Zap },
    { id: 'behavior', label: 'Viselkedés', icon: Brain },
    { id: 'limits', label: 'Limitek', icon: Sliders }
  ]

  const featureList = [
    { id: 'productSearch', label: 'Termékkeresés', description: 'Termékek keresése és megjelenítése' },
    { id: 'orderTracking', label: 'Rendelés követés', description: 'Rendelések státuszának lekérdezése' },
    { id: 'cartManagement', label: 'Kosárkezelés', description: 'Termékek kosárba helyezése' },
    { id: 'recommendations', label: 'Ajánlások', description: 'Személyre szabott termékajánlások' },
    { id: 'faq', label: 'GYIK válaszok', description: 'Gyakori kérdések megválaszolása' },
    { id: 'pricing', label: 'Árinformációk', description: 'Árak és akciók közlése' },
    { id: 'inventory', label: 'Készletinfó', description: 'Készletállapot közlése' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            <Settings className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Beállítások</h2>
            <p className="text-gray-400 text-sm">Chatbot és AI rendszer konfigurálása</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
          >
            {isTesting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <TestTube size={16} />
            )}
            Kapcsolat tesztelése
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            {isSaving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Mentés
          </button>
        </div>
      </div>

      {/* Test Result */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border ${
              testResult.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              {testResult.success ? (
                <Check className="text-green-400" size={20} />
              ) : (
                <AlertTriangle className="text-red-400" size={20} />
              )}
              <div>
                <p className={testResult.success ? 'text-green-400' : 'text-red-400'}>
                  {testResult.message}
                </p>
                {testResult.responseTime && (
                  <p className="text-gray-400 text-sm">Válaszidő: {testResult.responseTime}ms</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Master Toggle */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="text-purple-400" size={24} />
            <div>
              <p className="text-white font-medium">AI Chatbot</p>
              <p className="text-gray-400 text-sm">Fő kapcsoló az AI chatbot engedélyezéséhez</p>
            </div>
          </div>
          <button
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`p-2 rounded-lg transition-colors ${
              config.enabled 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {config.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as typeof activeSection)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeSection === section.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <section.icon size={16} />
            {section.label}
          </button>
        ))}
      </div>

      {/* General Section */}
      {activeSection === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Model Selection */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain size={18} className="text-purple-400" />
              AI Modellek
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Chatbot Model</label>
                <select
                  value={config.chatbotModel}
                  onChange={(e) => setConfig(prev => ({ ...prev, chatbotModel: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Content Model</label>
                <select
                  value={config.contentModel}
                  onChange={(e) => setConfig(prev => ({ ...prev, contentModel: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sliders size={18} className="text-blue-400" />
              Paraméterek
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Max Tokens
                  <span className="ml-2 text-purple-400">{config.maxTokens}</span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={4000}
                  step={100}
                  value={config.maxTokens}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: Number(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>500</span>
                  <span>4000</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Temperature
                  <span className="ml-2 text-purple-400">{config.temperature}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={config.temperature}
                  onChange={(e) => setConfig(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 (Precíz)</span>
                  <span>1 (Kreatív)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features Section */}
      {activeSection === 'features' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            Funkciók kezelése
          </h3>
          <div className="space-y-3">
            {featureList.map(feature => (
              <div
                key={feature.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  config.features[feature.id as keyof AIConfig['features']]
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div>
                  <p className="text-white font-medium">{feature.label}</p>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
                <button
                  onClick={() => toggleFeature(feature.id as keyof AIConfig['features'])}
                  className={`p-2 rounded-lg transition-colors ${
                    config.features[feature.id as keyof AIConfig['features']]
                      ? 'text-green-400'
                      : 'text-gray-500'
                  }`}
                >
                  {config.features[feature.id as keyof AIConfig['features']] ? (
                    <ToggleRight size={28} />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Behavior Section */}
      {activeSection === 'behavior' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-400" />
              Üzenetek
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Üdvözlő üzenet</label>
                <textarea
                  value={config.behavior.greeting}
                  onChange={(e) => updateBehavior('greeting', e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Fallback üzenet</label>
                <textarea
                  value={config.behavior.fallbackMessage}
                  onChange={(e) => updateBehavior('fallbackMessage', e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              Képességek
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white">Small talk</p>
                  <p className="text-gray-400 text-sm">Kötetlen beszélgetés</p>
                </div>
                <button
                  onClick={() => updateBehavior('enableSmallTalk', !config.behavior.enableSmallTalk)}
                  className={config.behavior.enableSmallTalk ? 'text-green-400' : 'text-gray-500'}
                >
                  {config.behavior.enableSmallTalk ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white">Kontextus megjegyzése</p>
                  <p className="text-gray-400 text-sm">Előző üzenetek figyelembevétele</p>
                </div>
                <button
                  onClick={() => updateBehavior('rememberContext', !config.behavior.rememberContext)}
                  className={config.behavior.rememberContext ? 'text-green-400' : 'text-gray-500'}
                >
                  {config.behavior.rememberContext ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Limits Section */}
      {activeSection === 'limits' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sliders size={18} className="text-orange-400" />
            Korlátozások
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Max napi beszélgetés
                <span className="ml-2 text-orange-400">{config.limits.maxDailyConversations}</span>
              </label>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={config.limits.maxDailyConversations}
                onChange={(e) => updateLimits('maxDailyConversations', Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Max üzenet / beszélgetés
                <span className="ml-2 text-orange-400">{config.limits.maxMessagesPerConversation}</span>
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={config.limits.maxMessagesPerConversation}
                onChange={(e) => updateLimits('maxMessagesPerConversation', Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Rate limit (kérés/perc)
                <span className="ml-2 text-orange-400">{config.limits.rateLimitPerMinute}</span>
              </label>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={config.limits.rateLimitPerMinute}
                onChange={(e) => updateLimits('rateLimitPerMinute', Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-200 text-sm">
                A túl alacsony limitek ronthatják a felhasználói élményt. 
                Ajánlott értékek: 1000 napi beszélgetés, 50 üzenet/beszélgetés, 20 kérés/perc.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
