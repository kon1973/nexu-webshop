'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { unsubscribeFromNewsletter } from '@/lib/actions/user-actions'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const result = await unsubscribeFromNewsletter(email)
      
      if (result.success) {
        setStatus('success')
      } else {
        throw new Error(result.error || 'Hiba történt')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#121212] border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-4">Sikeres leiratkozás</h1>
          <p className="text-gray-400 mb-8">
            Az email címedet ({email}) töröltük a listánkról.
          </p>
          <Link 
            href="/"
            className="inline-block bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121212] border border-white/10 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-500">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Leiratkozás hírlevélről</h1>
          <p className="text-gray-400 text-sm">
            Add meg az email címedet a leiratkozáshoz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email cím</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="pelda@email.com"
            />
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-sm text-center">
              Nem találtuk ezt az email címet a rendszerben.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Leiratkozás'}
          </button>
        </form>
      </div>
    </div>
  )
}
