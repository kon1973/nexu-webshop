'use client'

import React, { useState, useEffect } from 'react'

export default function RateLimitsEditor({ initialSettings = {}, saveAction }: { initialSettings?: Record<string, any>, saveAction?: any }) {
  const [settings, setSettings] = useState<Record<string, any>>(initialSettings || {})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    setSettings(initialSettings || {})
  }, [initialSettings])

  function addRow() {
    setSettings((s) => ({ ...s, ['new:' + Date.now()]: { limit: 10, windowSeconds: 60, identifier: 'ip' } }))
  }

  async function save() {
    setLoading(true)
    setMessage(null)
    try {
      const payload = Object.entries(settings).map(([k, v]) => ({ key: k, cfg: v }))
      if (saveAction) {
        await saveAction(JSON.stringify(payload))
        setMessage({ type: 'success', text: 'Beállítások sikeresen mentve!' })
      } else {
        const res = await fetch('/api/admin/settings/rate-limits', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await res.json()
        if (!res.ok) {
          setMessage({ type: 'error', text: 'Hiba: ' + (json?.error || 'Ismeretlen hiba') })
        } else {
          setMessage({ type: 'success', text: 'Beállítások sikeresen mentve!' })
        }
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Hiba: ' + String(e) })
    } finally {
      setLoading(false)
    }
  }

  function updateKey(oldKey: string, newKey: string) {
    const obj = { ...settings }
    obj[newKey] = obj[oldKey]
    delete obj[oldKey]
    setSettings(obj)
  }

  function updateCfg(key: string, field: string, val: any) {
    setSettings((s) => ({ ...s, [key]: { ...(s[key] || {}), [field]: val } }))
  }

  function deleteRow(key: string) {
    const copy = { ...settings }
    delete copy[key]
    setSettings(copy)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/4 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-[#070707]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Endpoint</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Limit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Window (s)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Identifier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Object.entries(settings).map(([k, v]) => (
              <tr key={k} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <input 
                    value={k} 
                    onChange={(e) => updateKey(k, e.target.value)} 
                    className="bg-[#0a0a0a] border border-white/10 rounded px-3 py-1.5 text-sm text-gray-200 w-full focus:border-purple-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <input 
                    type="number" 
                    value={v.limit} 
                    onChange={(e) => updateCfg(k, 'limit', Number(e.target.value))} 
                    className="bg-[#0a0a0a] border border-white/10 rounded px-3 py-1.5 text-sm text-gray-200 w-20 focus:border-purple-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <input 
                    type="number" 
                    value={v.windowSeconds} 
                    onChange={(e) => updateCfg(k, 'windowSeconds', Number(e.target.value))} 
                    className="bg-[#0a0a0a] border border-white/10 rounded px-3 py-1.5 text-sm text-gray-200 w-20 focus:border-purple-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <select 
                    value={v.identifier} 
                    onChange={(e) => updateCfg(k, 'identifier', e.target.value)}
                    className="bg-[#0a0a0a] border border-white/10 rounded px-3 py-1.5 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ip">IP cím</option>
                    <option value="user">Felhasználó</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => deleteRow(k)}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    Törlés
                  </button>
                </td>
              </tr>
            ))}
            {Object.keys(settings).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Nincs még beállítás. Adj hozzá egy új sort!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={addRow} 
          className="bg-white/5 hover:bg-white/10 text-gray-300 text-sm px-4 py-2 rounded-lg border border-white/10 transition-colors"
        >
          + Sor hozzáadása
        </button>
        <button 
          onClick={save} 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Mentés...' : 'Mentés'}
        </button>
        {message && (
          <span className={`text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {message.text}
          </span>
        )}
      </div>

      <div className="bg-[#071028] rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-gray-100 mb-2">💡 Rate Limit Tippek</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• <strong>Limit:</strong> Maximális kérések száma az időablakban</li>
          <li>• <strong>Window:</strong> Időablak másodpercben (pl. 60 = 1 perc)</li>
          <li>• <strong>IP:</strong> IP cím alapján korlátoz (anonim felhasználóknak)</li>
          <li>• <strong>User:</strong> Bejelentkezett felhasználó alapján korlátoz</li>
        </ul>
      </div>
    </div>
  )
}
