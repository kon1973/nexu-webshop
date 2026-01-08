'use client'

import { useState } from 'react'

type SeoAudit = {
  id: string
  createdAt: Date
  avgScore: number
  totalProducts: number
  criticalCount: number
  payload: any
}

function ScoreBadge({ score }: { score: number }) {
  let color = 'bg-red-600 text-white'
  if (score >= 80) color = 'bg-green-600 text-white'
  else if (score >= 60) color = 'bg-lime-600 text-white'
  else if (score >= 40) color = 'bg-orange-500 text-white'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {score}%
    </span>
  )
}

function ScoreChange({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  if (diff === 0) return <span className="text-gray-400">→ 0</span>
  if (diff > 0) return <span className="text-green-400">↑ +{diff}</span>
  return <span className="text-red-400">↓ {diff}</span>
}

export default function AuditsClient({ audits }: { audits: SeoAudit[] }) {
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [showCompare, setShowCompare] = useState(false)

  function toggleCompare(id: string) {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  function exportCSV() {
    // Get latest audit data
    const latest = audits[0]
    if (!latest?.payload?.products) return

    const products = latest.payload.products as any[]
    const headers = ['Termék', 'Slug', 'Pontszám', 'Meta Title', 'Meta Description', 'Képek száma', 'Problémák']
    const rows = products.map(p => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.slug || '',
      p.score,
      p.metaTitle ? 'Van' : 'Nincs',
      p.metaDescription ? 'Van' : 'Nincs',
      p.images?.length || 0,
      `"${(p.issues || []).join('; ').replace(/"/g, '""')}"`
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seo-audit-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const audit1 = audits.find(a => a.id === compareIds[0])
  const audit2 = audits.find(a => a.id === compareIds[1])

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={exportCSV}
          disabled={!audits.length}
          className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>

        {compareIds.length === 2 && (
          <button
            onClick={() => setShowCompare(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Összehasonlítás ({compareIds.length}/2)
          </button>
        )}

        {compareIds.length > 0 && (
          <button
            onClick={() => setCompareIds([])}
            className="text-gray-400 hover:text-white text-sm"
          >
            Kijelölés törlése
          </button>
        )}
      </div>

      {/* Audit list */}
      <div className="grid gap-4">
        {audits.map((a, index) => (
          <div 
            key={a.id} 
            className={`bg-white/4 border p-4 rounded-xl transition-colors cursor-pointer ${
              compareIds.includes(a.id) 
                ? 'border-purple-500 bg-purple-900/10' 
                : 'border-white/5 hover:bg-white/6'
            }`}
            onClick={() => toggleCompare(a.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="checkbox" 
                    checked={compareIds.includes(a.id)}
                    onChange={() => toggleCompare(a.id)}
                    className="w-4 h-4 accent-purple-600"
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">#{audits.length - index}</span>
                  <span className="font-medium text-gray-100">
                    {new Date(a.createdAt).toLocaleDateString('hu-HU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Átlag pontszám:</span>
                    <ScoreBadge score={a.avgScore} />
                    {index < audits.length - 1 && (
                      <ScoreChange current={a.avgScore} previous={audits[index + 1].avgScore} />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Termékek:</span>
                    <span className="text-gray-200 font-medium">{a.totalProducts}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Kritikus:</span>
                    <span className={`font-medium ${a.criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {a.criticalCount}
                    </span>
                  </div>
                </div>
              </div>
              <details className="text-sm group" onClick={e => e.stopPropagation()}>
                <summary className="cursor-pointer text-purple-400 hover:text-purple-300 flex items-center gap-1 select-none">
                  <span>Részletek</span>
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-3 bg-[#070707] border border-white/5 rounded-lg p-3 max-w-2xl">
                  <pre className="text-xs text-gray-300 max-h-64 overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(a.payload, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>

      {/* Compare modal */}
      {showCompare && audit1 && audit2 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-100">Audit Összehasonlítás</h2>
              <button 
                onClick={() => setShowCompare(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Audit 1 */}
                <div className="bg-white/4 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    {new Date(audit1.createdAt).toLocaleDateString('hu-HU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={audit1.avgScore} />
                    <span className="text-gray-300">{audit1.totalProducts} termék</span>
                    <span className={audit1.criticalCount > 0 ? 'text-red-400' : 'text-green-400'}>
                      {audit1.criticalCount} kritikus
                    </span>
                  </div>
                </div>

                {/* Audit 2 */}
                <div className="bg-white/4 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">
                    {new Date(audit2.createdAt).toLocaleDateString('hu-HU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={audit2.avgScore} />
                    <span className="text-gray-300">{audit2.totalProducts} termék</span>
                    <span className={audit2.criticalCount > 0 ? 'text-red-400' : 'text-green-400'}>
                      {audit2.criticalCount} kritikus
                    </span>
                  </div>
                </div>
              </div>

              {/* Score comparison */}
              <div className="bg-white/4 rounded-lg p-4">
                <h3 className="font-semibold text-gray-100 mb-4">Változások</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Átlag pontszám</div>
                    <div className="text-2xl font-bold">
                      <ScoreChange current={audit2.avgScore} previous={audit1.avgScore} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Termékek száma</div>
                    <div className="text-2xl font-bold text-gray-200">
                      {audit2.totalProducts - audit1.totalProducts >= 0 ? '+' : ''}
                      {audit2.totalProducts - audit1.totalProducts}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Kritikus problémák</div>
                    <div className={`text-2xl font-bold ${
                      audit2.criticalCount < audit1.criticalCount 
                        ? 'text-green-400' 
                        : audit2.criticalCount > audit1.criticalCount 
                          ? 'text-red-400' 
                          : 'text-gray-400'
                    }`}>
                      {audit2.criticalCount - audit1.criticalCount >= 0 ? '+' : ''}
                      {audit2.criticalCount - audit1.criticalCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
