import { RefreshCw, Loader2, Upload, X, Trash2 } from 'lucide-react'
import { type ChangeEvent } from 'react'

type Attribute = {
  id: string
  name: string
  values: string[]
}

type Variant = {
  id: string
  attributes: Record<string, string>
  price: number
  salePrice?: number | null
  salePercentage?: number | null
  saleStartDate?: string | null
  saleEndDate?: string | null
  stock: number
  sku?: string
  image?: string
  description?: string
  isActive: boolean
}

type Props = {
  variants: Variant[]
  availableAttributes: Attribute[]
  selectedAttributeIds: string[]
  toggleAttribute: (id: string) => void
  generateVariants: () => void
  updateVariant: (index: number, field: keyof Variant, value: any) => void
  variantUploading: string | null
  handleVariantImageUpload: (index: number, e: ChangeEvent<HTMLInputElement>) => void
  removeVariant: (index: number) => void
}

export function ProductVariants({
  variants,
  availableAttributes,
  selectedAttributeIds,
  toggleAttribute,
  generateVariants,
  updateVariant,
  variantUploading,
  handleVariantImageUpload,
  removeVariant
}: Props) {
  return (
    <div className="border-t border-white/10 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Variációk és Tulajdonságok</h2>
        <button
          type="button"
          onClick={generateVariants}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={16} />
          Variációk generálása
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-3">Elérhető tulajdonságok</label>
          <div className="flex flex-wrap gap-3">
            {availableAttributes.map((attr) => (
              <button
                key={attr.id}
                type="button"
                onClick={() => toggleAttribute(attr.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                  selectedAttributeIds.includes(attr.id)
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-[#0a0a0a] border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                {attr.name}
              </button>
            ))}
          </div>
        </div>

        {variants.length > 0 && (
          <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-white/10">
              {variants.map((variant, idx) => (
                <div key={variant.id} className="p-4 space-y-4">
                  {/* Main Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(variant.attributes).map(([key, val]) => (
                          <span key={key} className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10">
                            <span className="text-gray-500">{key}:</span> {val}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Ár</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Készlet</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">SKU</label>
                      <input
                        type="text"
                        value={variant.sku || ''}
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-xs text-gray-500 block mb-1">Kép</label>
                      <div className="flex items-center gap-2">
                        {variant.image ? (
                            <div className="relative w-8 h-8 rounded overflow-hidden border border-white/10 group/img">
                                <img src={variant.image} alt="Variant" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => updateVariant(idx, 'image', '')}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors">
                                {variantUploading === variant.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Upload size={14} />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleVariantImageUpload(idx, e)}
                                    disabled={!!variantUploading}
                                />
                            </label>
                        )}
                        <input
                            type="text"
                            value={variant.image || ''}
                            onChange={(e) => updateVariant(idx, 'image', e.target.value)}
                            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm min-w-0"
                            placeholder="URL..."
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1 flex items-center justify-end gap-2 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer" title="Aktív">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(e) => updateVariant(idx, 'isActive', e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 bg-black/20 text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-gray-500 hover:text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Sale & Description Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="text-xs font-bold text-purple-400 uppercase mb-2">Akció</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Akciós ár</label>
                                <input
                                    type="number"
                                    value={variant.salePrice || ''}
                                    onChange={(e) => updateVariant(idx, 'salePrice', e.target.value ? Number(e.target.value) : null)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded p-1.5 text-xs"
                                    placeholder="Ft"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Kedvezmény %</label>
                                <input
                                    type="number"
                                    value={variant.salePercentage || ''}
                                    onChange={(e) => updateVariant(idx, 'salePercentage', e.target.value ? Number(e.target.value) : null)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded p-1.5 text-xs"
                                    placeholder="%"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Kezdete</label>
                                <input
                                    type="date"
                                    value={variant.saleStartDate || ''}
                                    onChange={(e) => updateVariant(idx, 'saleStartDate', e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded p-1.5 text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Vége</label>
                                <input
                                    type="date"
                                    value={variant.saleEndDate || ''}
                                    onChange={(e) => updateVariant(idx, 'saleEndDate', e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded p-1.5 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Variáció leírása</label>
                        <textarea
                            value={variant.description || ''}
                            onChange={(e) => updateVariant(idx, 'description', e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-sm h-[108px]"
                            placeholder="Pl. Ez a szín kicsit sötétebb élőben..."
                        />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
