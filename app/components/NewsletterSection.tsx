'use client'

import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle2, Sparkles, Bell } from 'lucide-react'
import { subscribeToNewsletter } from '@/app/newsletter/actions'
import { toast } from 'sonner'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const result = await subscribeToNewsletter({ email })

      if (result.success) {
        setStatus('success')
        setEmail('')
        toast.success(result.message || 'Sikeres feliratkozás!')
      } else {
        setStatus('error')
        toast.error(result.error || 'Hiba történt a feliratkozás során.')
      }
    } catch (error) {
      setStatus('error')
      toast.error('Hálózati hiba történt.')
      console.error('Newsletter error:', error)
    }
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#111]" />
      
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-float opacity-20">
        <Mail size={40} className="text-blue-500" />
      </div>
      <div className="absolute bottom-20 right-10 animate-float opacity-20" style={{ animationDelay: '1s' }}>
        <Bell size={32} className="text-purple-500" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-[2rem] p-8 md:p-16 text-center relative overflow-hidden group shadow-2xl shadow-black/50">
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-[2rem] p-[1px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-gradient-x" style={{ backgroundSize: '200% 200%' }}>
            <div className="w-full h-full bg-[#1a1a1a] rounded-[2rem]" />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Icon with glow */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Mail size={36} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-subtle">
                <Sparkles size={16} className="text-black" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ne maradj le az{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                újdonságokról!
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Iratkozz fel hírlevelünkre, és elsőként értesülj a legújabb termékekről, 
              exkluzív akciókról és különleges ajánlatokról.
            </p>

            {status === 'success' ? (
              <div className="flex items-center justify-center gap-3 text-green-400 bg-green-500/10 py-5 px-8 rounded-2xl border border-green-500/20 animate-scale-in max-w-md mx-auto">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Sikeres feliratkozás!</p>
                  <p className="text-green-400/70 text-sm">Hamarosan küldjük az első hírlevelünket.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="flex-1 relative group/input">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                  <input
                    type="email"
                    placeholder="Az email címed..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="relative w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-all text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="relative group/btn bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    {status === 'loading' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Küldés...
                      </>
                    ) : (
                      <>
                        Feliratkozás
                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}
            
            {status === 'error' && (
              <p className="mt-4 text-red-400 text-sm animate-fade-in">
                Hiba történt. Kérjük, próbáld újra később.
              </p>
            )}
            
            <p className="mt-8 text-xs text-gray-500 flex items-center justify-center gap-2">
              <span className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              </span>
              Spam-mentes, bármikor leiratkozhatsz. 
              <a href="/terms" className="text-gray-400 hover:text-white underline underline-offset-2">
                Adatkezelési Tájékoztató
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
