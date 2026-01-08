'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

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

export default function SeoAuditClient({ products }: { products: any[] }) {
  const [filter, setFilter] = useState<'all'|'critical'|'improve'|'good'>('all')
  const [query, setQuery] = useState('')
  const [openIds, setOpenIds] = useState<number[]>([])

  const filtered = useMemo(() => {
    let list = products
    if (filter === 'critical') list = products.filter(p => p.score < 40)
    if (filter === 'improve') list = products.filter(p => p.score >= 40 && p.score < 70)
    if (filter === 'good') list = products.filter(p => p.score >= 70)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q))
    }
    return list
  }, [products, filter, query])

  function toggle(id: number) {
    setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="bg-white/3 rounded-lg p-4"> 
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex bg-white/2 rounded-md overflow-hidden">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm ${filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}>Összes</button>
            <button onClick={() => setFilter('critical')} className={`px-3 py-1 text-sm ${filter === 'critical' ? 'bg-red-600 text-white' : 'text-gray-300'}`}>Kritikus</button>
            <button onClick={() => setFilter('improve')} className={`px-3 py-1 text-sm ${filter === 'improve' ? 'bg-yellow-500 text-black' : 'text-gray-300'}`}>Javítandó</button>
            <button onClick={() => setFilter('good')} className={`px-3 py-1 text-sm ${filter === 'good' ? 'bg-green-600 text-white' : 'text-gray-300'}`}>Jó</button>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keresés terméknév / slug"
            className="ml-3 bg-[#0a0a0a] border border-white/5 rounded px-3 py-1 text-sm text-gray-200"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">Megjelenítve: <span className="font-bold text-white">{filtered.length}</span></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-[#070707]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Termék</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pontszám</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Meta</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Képek</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Problémák</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Művelet</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-white/5">
            {filtered.map((product) => (
              <tr key={product.id} className={`align-top ${product.score < 40 ? 'bg-red-900/10' : ''}`}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-100 max-w-xs truncate">{product.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap"><ScoreBadge score={product.score} /></td>
                <td className="px-4 py-3 whitespace-nowrap">{product.slug ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    <span title="Meta Title" className={product.metaTitle ? 'text-green-400' : 'text-gray-500'}>T</span>
                    <span title="Meta Description" className={product.metaDescription ? 'text-green-400' : 'text-gray-500'}>D</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{product.images.length}</td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-300 max-w-xs truncate">
                    {product.issues.slice(0, 2).map((issue: string, i: number) => (
                      <div key={i} className="truncate">{issue}</div>
                    ))}
                    {product.issues.length > 2 && (
                      <div className="text-gray-500">+{product.issues.length - 2} további</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/edit-product/${product.id}`} className="text-purple-400 hover:text-purple-300 text-sm">Szerkesztés</Link>
                    <button className="text-sm text-gray-300" onClick={() => toggle(product.id)}>Részletek</button>
                  </div>
                </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expandable details section */}
      <div className="mt-4 space-y-2">
        {openIds.map((id) => {
          const p = products.find(x => x.id === id)
          if (!p) return null
          return (
            <div key={id} className="bg-[#0b0b0b] border border-white/5 rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-100">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.slug || 'Nincs slug'}</div>
                </div>
                <div className="text-xs text-gray-400">{p.score}%</div>
              </div>

              <pre className="mt-3 text-xs text-gray-200 bg-[#070707] rounded p-2 overflow-auto max-h-60">{JSON.stringify(p, null, 2)}</pre>
            </div>
          )
        })}
      </div>
    </div>
  )
}
