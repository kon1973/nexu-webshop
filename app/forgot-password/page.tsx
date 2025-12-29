'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setIsSent(true)
        toast.success('Email elküldve!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Hiba történt')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#121212] border border-white/5 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 border border-green-500/20">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Email elküldve!</h1>
          <p className="text-gray-400 mb-8">
            Ha létezik fiók ezzel az email címmel, küldtünk egy linket a jelszó visszaállításához.
          </p>
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Vissza a bejelentkezéshez
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 border border-blue-500/20">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Elfelejtett jelszó</h1>
          <p className="text-gray-400 text-sm">
            Add meg az email címedet, és küldünk egy linket a jelszó visszaállításához.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              required
              type="email"
              placeholder="Email cím"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Küldés <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-gray-500 hover:text-white text-sm transition-colors">
            Vissza a bejelentkezéshez
          </Link>
        </div>
      </div>
    </div>
  )
}
