'use client'

import React, { useState, useEffect } from 'react'

export default function RateLimitsEditor({ initialSettings = {}, saveAction }: { initialSettings?: Record<string, any>, saveAction?: any }) {
  const [settings, setSettings] = useState<Record<string, any>>(initialSettings || {})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // hydrate from server-provided prop (when rendered by server component)
    setSettings(initialSettings || {})
  }, [initialSettings])

  function addRow() {
    setSettings((s) => ({ ...s, ['new:' + Date.now()]: { limit: 10, windowSeconds: 60, identifier: 'ip' } }))
  }

  async function save() {
    setLoading(true)
    try {
      const payload = Object.entries(settings).map(([k, v]) => ({ key: k, cfg: v }))
      if (saveAction) {
        // Use server action if provided
        // @ts-ignore
        await saveAction(JSON.stringify(payload))
        alert('Mentve')
      } else {
        const res = await fetch('/api/admin/settings/rate-limits', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await res.json()
        if (!res.ok) alert('Hiba: ' + (json?.error || ''))
        else alert('Mentve')
      }
    } catch (e) {
      alert('Hiba: ' + String(e))
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

  return (
    <div>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Limit</th>
            <th>Window (s)</th>
            <th>Identifier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(settings).map(([k, v]) => (
            <tr key={k}>
              <td><input value={k} onChange={(e) => updateKey(k, e.target.value)} /></td>
              <td><input type="number" value={v.limit} onChange={(e) => updateCfg(k, 'limit', Number(e.target.value))} /></td>
              <td><input type="number" value={v.windowSeconds} onChange={(e) => updateCfg(k, 'windowSeconds', Number(e.target.value))} /></td>
              <td>
                <select value={v.identifier} onChange={(e) => updateCfg(k, 'identifier', e.target.value)}>
                  <option value="ip">ip</option>
                  <option value="user">user</option>
                </select>
              </td>
              <td><button onClick={() => { const copy = {...settings}; delete copy[k]; setSettings(copy) }}>Törlés</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <button onClick={addRow} className="mr-2">Sor hozzáadása</button>
        {/* If server action passed, embed it into a hidden form to call it */}
        {saveAction ? (
          <form
            action={async (formData: FormData) => {
              // call server action via hidden input
              const payload = JSON.stringify(Object.entries(settings).map(([k, v]) => ({ key: k, cfg: v })))
              const fd = new FormData()
              fd.set('payload', payload)
              // @ts-ignore
              await saveAction(fd)
              alert('Mentve')
            }}
          >
            <button type="submit" disabled={loading}>{loading ? 'Mentés...' : 'Mentés'}</button>
          </form>
        ) : (
          <button onClick={save} disabled={loading}>{loading ? 'Mentés...' : 'Mentés'}</button>
        )}
      </div>
    </div>
  )
}
