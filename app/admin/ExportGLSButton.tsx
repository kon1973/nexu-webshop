'use client'

import { Truck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ExportGLSButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/export-gls')
      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gls-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('GLS CSV exportálva!')
    } catch (error) {
      toast.error('Hiba az exportálás során')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-bold transition-all border border-blue-400/20 hover:scale-105 active:scale-95 inline-flex items-center gap-2 text-sm"
    >
      <Truck size={16} /> {isLoading ? 'Export...' : 'GLS Export'}
    </button>
  )
}
