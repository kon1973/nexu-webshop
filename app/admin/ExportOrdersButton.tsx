'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ExportOrdersButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/orders?export=true')
      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Rendelések exportálva!')
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
      className="bg-[#1a1a1a] hover:bg-[#252525] text-white px-4 py-2 rounded-full font-bold transition-all border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 inline-flex items-center gap-2 text-sm"
    >
      <Download size={16} /> {isLoading ? 'Exportálás...' : 'CSV Export'}
    </button>
  )
}
