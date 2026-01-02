'use client'

import { FileText, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { exportCatalogAction } from './actions'

export default function ExportCatalogButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [options, setOptions] = useState({
    includeOutOfStock: false,
    includeArchived: false,
    sortBy: 'category' as 'category' | 'name' | 'price',
  })

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const result = await exportCatalogAction({
        includeOutOfStock: options.includeOutOfStock,
        includeArchived: options.includeArchived,
        sortBy: options.sortBy,
      })

      if (!result.success) {
        throw new Error(result.error || 'Export failed')
      }

      // Convert base64 to blob and download
      if (result.pdfBase64 && result.fileName) {
        const binaryString = atob(result.pdfBase64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
      
      toast.success('PDF katalógus exportálva!')
      setShowOptions(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Hiba az exportálás során')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full font-bold transition-all border border-purple-400/20 hover:scale-105 active:scale-95 inline-flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText size={16} /> 
          {isLoading ? 'Generálás...' : 'PDF Katalógus'}
        </button>
        
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full font-bold transition-all border border-purple-400/20 hover:scale-105 active:scale-95"
          title="Beállítások"
        >
          <ChevronDown size={16} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl p-4 z-50">
          <h3 className="text-sm font-bold mb-3 text-white">Export Beállítások</h3>
          
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeOutOfStock}
              onChange={(e) => setOptions(prev => ({ ...prev, includeOutOfStock: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 bg-black/50 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Elfogyott termékek is</span>
          </label>

          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeArchived}
              onChange={(e) => setOptions(prev => ({ ...prev, includeArchived: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 bg-black/50 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Archivált termékek is</span>
          </label>

          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-2">Rendezés:</label>
            <select
              value={options.sortBy}
              onChange={(e) => setOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="category">Kategória szerint</option>
              <option value="name">Név szerint</option>
              <option value="price">Ár szerint</option>
            </select>
          </div>

          <button
            onClick={() => setShowOptions(false)}
            className="w-full bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-sm transition-all"
          >
            Bezárás
          </button>
        </div>
      )}
    </div>
  )
}
