'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ContactClientProps {
  settings: Record<string, string>
}

export default function ContactClient({ settings }: ContactClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        toast.success(result.message || 'Üzenet elküldve!')
      } else {
        toast.error(result.error || 'Hiba történt')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Kapcsolat
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-lg text-gray-300 mb-8">
            Kérdésed van? Ügyfélszolgálatunk készséggel áll rendelkezésedre.
            Keress minket az alábbi elérhetőségeken, vagy töltsd ki a kapcsolatfelvételi űrlapot.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <MapPin className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Címünk</h3>
                <p className="text-gray-400">{settings.contact_address || '1234 Budapest, Tech utca 42.'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Phone className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Telefon</h3>
                <p className="text-gray-400">{settings.contact_phone || '+36 1 234 5678'}</p>
                <p className="text-sm text-gray-500">Hétfő - Péntek: 09:00 - 17:00</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Mail className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email</h3>
                <p className="text-gray-400">{settings.contact_email || 'info@nexu.hu'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Írj nekünk</h2>
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Köszönjük megkeresésed!</h3>
              <p className="text-gray-400">Hamarosan felvesszük veled a kapcsolatot.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-6 text-blue-400 hover:text-blue-300 font-medium"
              >
                Új üzenet küldése
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Név</label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Az Ön neve"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  required
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="pelda@email.hu"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">Üzenet</label>
                <textarea
                  required
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Miben segíthetünk?"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Üzenet küldése'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
