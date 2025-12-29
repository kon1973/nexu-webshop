'use client'

import { Download } from 'lucide-react'

export default function ExportSubscribersButton() {
  const handleExport = () => {
    window.location.href = '/api/admin/newsletter/export'
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm"
    >
      <Download size={16} />
      CSV Exportálás
    </button>
  )
}
