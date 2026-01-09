'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, FileText, Image as ImageIcon, Share2, 
  X, Check, Loader2, Mail, Copy, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'

interface CompareProduct {
  id: number
  name: string
  price: number
  salePrice?: number | null
  image: string
  category: string
  rating: number
  stock: number
  specifications: Array<{ key: string; value: string; type?: string }>
}

interface CompareExportProps {
  products: CompareProduct[]
}

export default function CompareExport({ products }: CompareExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'image' | 'pdf' | 'text' | 'link'>('image')

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  const generateTextContent = () => {
    let text = '═══════════════════════════════════════\n'
    text += '       NEXU Store - Termék összehasonlítás\n'
    text += '═══════════════════════════════════════\n\n'

    products.forEach((product, index) => {
      text += `[${index + 1}] ${product.name}\n`
      text += `    Ár: ${formatPrice(product.salePrice || product.price)}`
      if (product.salePrice) {
        text += ` (eredeti: ${formatPrice(product.price)})`
      }
      text += '\n'
      text += `    Értékelés: ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))} (${product.rating}/5)\n`
      text += `    Készlet: ${product.stock > 0 ? `${product.stock} db` : 'Nincs készleten'}\n`
      text += `    Kategória: ${product.category}\n`
      
      if (product.specifications.length > 0) {
        text += '\n    Specifikációk:\n'
        product.specifications.forEach(spec => {
          if (spec.type !== 'header') {
            const value = spec.type === 'boolean' ? (spec.value === 'true' ? '✓' : '✗') : spec.value
            text += `    • ${spec.key}: ${value}\n`
          }
        })
      }
      text += '\n───────────────────────────────────────\n\n'
    })

    text += `\nGenerálva: ${new Date().toLocaleString('hu-HU')}\n`
    text += 'https://nexu-webshop.vercel.app/compare\n'

    return text
  }

  const handleExport = async () => {
    if (products.length === 0) {
      toast.error('Nincs összehasonlítandó termék!')
      return
    }

    setIsExporting(true)

    try {
      switch (exportType) {
        case 'text': {
          const text = generateTextContent()
          const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `nexu-compare-${Date.now()}.txt`
          a.click()
          URL.revokeObjectURL(url)
          toast.success('Szöveges fájl letöltve!')
          break
        }

        case 'image': {
          const element = document.querySelector('[data-compare-table]') as HTMLElement
          if (element) {
            const canvas = await html2canvas(element, {
              backgroundColor: '#0a0a0a',
              scale: 2
            })
            const url = canvas.toDataURL('image/png')
            const a = document.createElement('a')
            a.href = url
            a.download = `nexu-compare-${Date.now()}.png`
            a.click()
            toast.success('Kép letöltve!')
          } else {
            toast.error('Nem sikerült a képet generálni')
          }
          break
        }

        case 'link': {
          const productIds = products.map(p => p.id).join(',')
          const shareUrl = `${window.location.origin}/compare?products=${productIds}`
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Link másolva a vágólapra!')
          break
        }

        case 'pdf': {
          // For PDF, we'll use the browser's print functionality
          const printWindow = window.open('', '_blank')
          if (printWindow) {
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>NEXU Store - Összehasonlítás</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; background: #fff; color: #000; }
                  h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
                  .products { display: flex; gap: 20px; flex-wrap: wrap; }
                  .product { flex: 1; min-width: 200px; border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
                  .product-name { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
                  .product-price { color: #7c3aed; font-size: 18px; font-weight: bold; }
                  .specs { margin-top: 12px; font-size: 12px; }
                  .spec-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; }
                  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
              </head>
              <body>
                <h1>🛒 NEXU Store - Termék összehasonlítás</h1>
                <div class="products">
                  ${products.map(p => `
                    <div class="product">
                      <div class="product-name">${p.name}</div>
                      <div class="product-price">${formatPrice(p.salePrice || p.price)}</div>
                      <div>⭐ ${p.rating}/5 | 📦 ${p.stock} db</div>
                      <div class="specs">
                        ${p.specifications.filter(s => s.type !== 'header').map(s => `
                          <div class="spec-row">
                            <span>${s.key}</span>
                            <span><strong>${s.type === 'boolean' ? (s.value === 'true' ? '✓' : '✗') : s.value}</strong></span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
                <p style="margin-top: 20px; color: #666; font-size: 12px;">
                  Generálva: ${new Date().toLocaleString('hu-HU')} | nexu-webshop.vercel.app
                </p>
              </body>
              </html>
            `)
            printWindow.document.close()
            printWindow.print()
            toast.success('PDF nyomtatási ablak megnyitva!')
          }
          break
        }
      }
    } catch (error) {
      toast.error('Hiba történt az exportálás során')
      console.error(error)
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }

  const shareViaEmail = () => {
    const productIds = products.map(p => p.id).join(',')
    const shareUrl = `${window.location.origin}/compare?products=${productIds}`
    const subject = 'NEXU Store - Termék összehasonlítás'
    const body = `Nézd meg az összehasonlításomat!\n\n${products.map(p => `• ${p.name} - ${formatPrice(p.salePrice || p.price)}`).join('\n')}\n\nLink: ${shareUrl}`
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (products.length === 0) return null

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 rounded-xl text-white font-medium transition-all shadow-lg shadow-purple-500/25"
      >
        <Download size={18} />
        <span>Exportálás</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                        <Download size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Összehasonlítás exportálása</h3>
                        <p className="text-gray-400 text-sm">{products.length} termék</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Export Options */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'image', icon: ImageIcon, label: 'Kép', desc: 'PNG formátum' },
                      { id: 'pdf', icon: FileText, label: 'PDF', desc: 'Nyomtatásra' },
                      { id: 'text', icon: FileText, label: 'Szöveg', desc: 'TXT fájl' },
                      { id: 'link', icon: Share2, label: 'Link', desc: 'Megosztás' }
                    ].map((option) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setExportType(option.id as any)}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          exportType === option.id
                            ? 'bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <option.icon size={20} className={exportType === option.id ? 'text-purple-400' : 'text-gray-400'} />
                          <div>
                            <p className="text-white font-medium">{option.label}</p>
                            <p className="text-gray-500 text-xs">{option.desc}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Előnézet:</p>
                    <div className="flex flex-wrap gap-2">
                      {products.map((p) => (
                        <span key={p.id} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg">
                          {p.name.substring(0, 20)}...
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Export Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Exportálás...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Exportálás
                      </>
                    )}
                  </motion.button>

                  {/* Email Share */}
                  <button
                    onClick={shareViaEmail}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Mail size={18} />
                    Küldés emailben
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
