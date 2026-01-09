'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gift, CreditCard, Copy, Send, Check, AlertCircle,
  Mail, User, Calendar, Sparkles, ChevronRight, X
} from 'lucide-react'
import { toast } from 'sonner'

interface GiftCardFormData {
  amount: number
  customAmount?: number
  recipientName: string
  recipientEmail: string
  senderName: string
  message: string
  deliveryDate: string
  design: string
}

const presetAmounts = [10000, 25000, 50000, 100000]
const designs = [
  { id: 'classic', name: 'Klasszikus', gradient: 'from-purple-600 to-blue-600' },
  { id: 'birthday', name: 'Születésnap', gradient: 'from-pink-500 to-orange-500' },
  { id: 'christmas', name: 'Karácsony', gradient: 'from-red-600 to-green-600' },
  { id: 'tech', name: 'Tech', gradient: 'from-cyan-500 to-purple-500' },
  { id: 'minimal', name: 'Minimál', gradient: 'from-gray-600 to-gray-800' }
]

interface GiftCardSystemProps {
  onPurchase?: (data: GiftCardFormData) => void
}

export default function GiftCardSystem({ onPurchase }: GiftCardSystemProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<GiftCardFormData>({
    amount: 25000,
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    message: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    design: 'classic'
  })
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [giftCardCode, setGiftCardCode] = useState<string | null>(null)

  const updateForm = (key: keyof GiftCardFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleAmountSelect = (amount: number) => {
    setIsCustomAmount(false)
    updateForm('amount', amount)
    updateForm('customAmount', undefined)
  }

  const handleCustomAmount = (value: string) => {
    const amount = parseInt(value) || 0
    updateForm('customAmount', amount)
    updateForm('amount', amount)
  }

  const nextStep = () => {
    if (step === 1 && formData.amount < 5000) {
      toast.error('Minimum összeg: 5000 Ft')
      return
    }
    if (step === 2 && (!formData.recipientName || !formData.recipientEmail)) {
      toast.error('Add meg a címzett adatait!')
      return
    }
    if (step === 2 && !formData.recipientEmail.includes('@')) {
      toast.error('Érvénytelen email cím!')
      return
    }
    setStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handlePurchase = async () => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock gift card code
      const code = `NEXU-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      setGiftCardCode(code)
      
      if (onPurchase) {
        onPurchase(formData)
      }
      
      setStep(4)
      toast.success('Ajándékkártya sikeresen megvásárolva!')
    } catch {
      toast.error('Hiba történt a vásárlás során')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyCode = () => {
    if (giftCardCode) {
      navigator.clipboard.writeText(giftCardCode)
      toast.success('Kód másolva!')
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('hu-HU') + ' Ft'
  }

  const selectedDesign = designs.find(d => d.id === formData.design) || designs[0]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {['Összeg', 'Címzett', 'Design', 'Összegzés'].map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > index + 1 ? 'bg-green-500 text-white' :
                step === index + 1 ? 'bg-purple-500 text-white' :
                'bg-white/10 text-gray-500'
              }`}>
                {step > index + 1 ? <Check size={16} /> : index + 1}
              </div>
              <span className={`text-xs mt-1 ${step >= index + 1 ? 'text-white' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Amount selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Ajándékkártya vásárlása</h2>
              <p className="text-gray-400 mt-2">Válassz összeget vagy adj meg egyéni értéket</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {presetAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !isCustomAmount && formData.amount === amount
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <p className="text-2xl font-bold text-white">{formatCurrency(amount)}</p>
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsCustomAmount(true)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  isCustomAmount
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                {isCustomAmount ? (
                  <input
                    type="number"
                    value={formData.customAmount || ''}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    placeholder="Add meg az összeget..."
                    className="w-full bg-transparent text-2xl font-bold text-white text-center focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-400">Egyéni összeg</p>
                )}
              </button>
              {isCustomAmount && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Ft</span>
              )}
            </div>

            {formData.amount > 0 && formData.amount < 5000 && (
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                Minimum összeg: 5000 Ft
              </p>
            )}
          </motion.div>
        )}

        {/* Step 2: Recipient details */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Címzett adatai</h2>
              <p className="text-gray-400 mt-2">Kinek szeretnéd küldeni az ajándékkártyát?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <User size={14} className="inline mr-2" />
                  Címzett neve
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => updateForm('recipientName', e.target.value)}
                  placeholder="pl. Kiss Péter"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <Mail size={14} className="inline mr-2" />
                  Címzett email címe
                </label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => updateForm('recipientEmail', e.target.value)}
                  placeholder="pl. kiss.peter@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <User size={14} className="inline mr-2" />
                  Küldő neve (opcionális)
                </label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => updateForm('senderName', e.target.value)}
                  placeholder="A te neved"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <Calendar size={14} className="inline mr-2" />
                  Küldés dátuma
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => updateForm('deliveryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <Sparkles size={14} className="inline mr-2" />
                  Személyes üzenet (opcionális)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => updateForm('message', e.target.value)}
                  placeholder="Boldog születésnapot kívánok!"
                  rows={3}
                  maxLength={200}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formData.message.length}/200
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Design selection */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Válassz designt</h2>
              <p className="text-gray-400 mt-2">Hogyan nézzen ki az ajándékkártya?</p>
            </div>

            {/* Preview card */}
            <div className={`bg-gradient-to-br ${selectedDesign.gradient} rounded-2xl p-6 aspect-[1.6/1] relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm">NEXU Ajándékkártya</p>
                    <p className="text-white text-3xl font-bold mt-1">
                      {formatCurrency(formData.amount)}
                    </p>
                  </div>
                  <Gift className="text-white/50" size={32} />
                </div>
                <div>
                  {formData.recipientName && (
                    <p className="text-white/80 text-sm">
                      Címzett: {formData.recipientName}
                    </p>
                  )}
                  {formData.message && (
                    <p className="text-white/60 text-xs mt-1 italic">
                      &quot;{formData.message.slice(0, 50)}...&quot;
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Design options */}
            <div className="grid grid-cols-5 gap-3">
              {designs.map(design => (
                <button
                  key={design.id}
                  onClick={() => updateForm('design', design.id)}
                  className={`aspect-square rounded-xl bg-gradient-to-br ${design.gradient} p-0.5 ${
                    formData.design === design.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]' : ''
                  }`}
                >
                  <div className="w-full h-full bg-black/20 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{design.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Summary / Success */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {giftCardCode ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-400" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Sikeres vásárlás!</h2>
                  <p className="text-gray-400 mt-2">
                    Az ajándékkártya elküldve {formData.recipientEmail} címre
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Ajándékkártya kód</p>
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-2xl font-mono font-bold text-white tracking-wider">
                      {giftCardCode}
                    </p>
                    <button
                      onClick={copyCode}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Copy size={18} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep(1)
                      setGiftCardCode(null)
                      setFormData({
                        amount: 25000,
                        recipientName: '',
                        recipientEmail: '',
                        senderName: '',
                        message: '',
                        deliveryDate: new Date().toISOString().split('T')[0],
                        design: 'classic'
                      })
                    }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                  >
                    Új ajándékkártya
                  </button>
                  <button
                    onClick={() => window.location.href = '/shop'}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
                  >
                    Vissza a boltba
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Összegzés</h2>
                  <p className="text-gray-400 mt-2">Ellenőrizd a rendelés adatait</p>
                </div>

                {/* Preview card */}
                <div className={`bg-gradient-to-br ${selectedDesign.gradient} rounded-2xl p-6 aspect-[1.6/1] relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white/80 text-sm">NEXU Ajándékkártya</p>
                        <p className="text-white text-3xl font-bold mt-1">
                          {formatCurrency(formData.amount)}
                        </p>
                      </div>
                      <Gift className="text-white/50" size={32} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">
                        Címzett: {formData.recipientName}
                      </p>
                      {formData.message && (
                        <p className="text-white/60 text-xs mt-1 italic">
                          &quot;{formData.message}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Összeg</span>
                    <span className="text-white font-medium">{formatCurrency(formData.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Címzett</span>
                    <span className="text-white">{formData.recipientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white">{formData.recipientEmail}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Küldés dátuma</span>
                    <span className="text-white">
                      {new Date(formData.deliveryDate).toLocaleDateString('hu-HU')}
                    </span>
                  </div>
                  {formData.senderName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Küldő</span>
                      <span className="text-white">{formData.senderName}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Fizetendő</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(formData.amount)}</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      {!giftCardCode && (
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Vissza
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Tovább <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <CreditCard size={18} />
                  </motion.div>
                  Feldolgozás...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Megvásárolom
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
