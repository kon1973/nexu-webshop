"use client"

import { useState } from "react"
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react"

export default function ResendVerification({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleResend = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Hiba történt')

      setStatus('success')
      setMessage('Email elküldve!')
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-400 text-xs mt-1">
        <CheckCircle size={14} />
        <span>{message}</span>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleResend}
        disabled={status === 'loading'}
        className="text-xs text-purple-400 hover:text-purple-300 underline flex items-center gap-1"
      >
        {status === 'loading' && <Loader2 size={12} className="animate-spin" />}
        Megerősítő email újraküldése
      </button>
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-400 text-xs mt-1">
          <AlertCircle size={14} />
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
