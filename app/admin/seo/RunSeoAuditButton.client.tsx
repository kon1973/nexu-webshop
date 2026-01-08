'use client'

import { useState } from 'react'

export default function RunSeoAuditButton() {
  const [status, setStatus] = useState<'idle'|'running'|'success'|'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function run() {
    if (!confirm('Biztosan lefuttatod az SEO auditot most?')) return

    setStatus('running')
    setMessage(null)

    try {
      const res = await fetch('/api/admin/seo/run', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data?.success) {
        setStatus('success')
        setMessage('Audit sikeresen lefutott. Átirányítás a jelentésre...')
        // Redirect to audits list after short delay so admin can view details
        setTimeout(() => {
          window.location.href = '/admin/seo/audits'
        }, 800)
      } else if (res.status === 401) {
        setStatus('error')
        setMessage('Nem vagy bejelentkezve adminként.')
      } else {
        setStatus('error')
        setMessage(data?.error || 'Ismeretlen hiba')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Hálózati hiba')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={status === 'running'}
        className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 py-1 rounded"
      >
        {status === 'running' ? 'Futtatás...' : 'Audit futtatása'}
      </button>
      {message && (
        <div className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message}</div>
      )}
    </div>
  )
}
