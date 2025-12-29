import { type Dispatch, type SetStateAction } from 'react'

type Props = {
  name: string
  setName: Dispatch<SetStateAction<string>>
  categoryId: string
  setCategoryId: Dispatch<SetStateAction<string>>
  categories: { id: string; name: string }[]
  basePrice: number
  setBasePrice: Dispatch<SetStateAction<number>>
  baseStock: number
  setBaseStock: Dispatch<SetStateAction<number>>
  isArchived: boolean
  setIsArchived: Dispatch<SetStateAction<boolean>>
  variantsCount: number
  variantsStockSum: number
  // Sale props
  saleType: 'FIXED' | 'PERCENTAGE'
  setSaleType: Dispatch<SetStateAction<'FIXED' | 'PERCENTAGE'>>
  salePrice: number | ''
  setSalePrice: Dispatch<SetStateAction<number | ''>>
  salePercentage: number | ''
  setSalePercentage: Dispatch<SetStateAction<number | ''>>
  saleStartDate: string
  setSaleStartDate: Dispatch<SetStateAction<string>>
  saleEndDate: string
  setSaleEndDate: Dispatch<SetStateAction<string>>
}

export function ProductBasicInfo({
  name,
  setName,
  categoryId,
  setCategoryId,
  categories,
  basePrice,
  setBasePrice,
  baseStock,
  setBaseStock,
  isArchived,
  setIsArchived,
  variantsCount,
  variantsStockSum,
  saleType,
  setSaleType,
  salePrice,
  setSalePrice,
  salePercentage,
  setSalePercentage,
  saleStartDate,
  setSaleStartDate,
  saleEndDate,
  setSaleEndDate
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Termék neve</label>
        <input
          required
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pl. Samsung Galaxy S24 Ultra"
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
        />
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1">
            <label className="block text-sm font-bold text-gray-400 mb-2">Kategória</label>
            <select
              name="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none cursor-pointer"
            >
              <option value="">Válassz kategóriát...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-bold text-gray-400 mb-2">Alap Ár (Ft)</label>
            <input
              required
              name="price"
              type="number"
              min={1}
              value={basePrice || ''}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              placeholder="Pl. 150000"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-bold text-gray-400 mb-2">Alap Készlet (db)</label>
            <input
              required
              name="stock"
              type="number"
              min={0}
              value={variantsCount > 0 ? variantsStockSum : baseStock}
              onChange={(e) => setBaseStock(Number(e.target.value))}
              disabled={variantsCount > 0}
              placeholder="Pl. 25"
              className={`w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors ${variantsCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {variantsCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">Variációk összege</p>
            )}
          </div>

          <div className="sm:col-span-1 flex items-center pt-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${isArchived ? 'bg-purple-600 border-purple-600' : 'border-white/20 bg-[#0a0a0a] group-hover:border-purple-500'}`}>
                {isArchived && <div className="w-3 h-3 bg-white rounded-sm" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={isArchived} 
                onChange={(e) => setIsArchived(e.target.checked)} 
              />
              <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                Termék elrejtése (Archiválás)
              </span>
            </label>
          </div>
        </div>

        {/* Sale Fields */}
        <div className="p-4 border border-purple-500/20 rounded-xl bg-purple-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Akció beállítások</h3>
            <div className="flex bg-[#0a0a0a] rounded-lg p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setSaleType('FIXED')
                  setSalePercentage('')
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  saleType === 'FIXED' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Fix ár
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaleType('PERCENTAGE')
                  setSalePrice('')
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  saleType === 'PERCENTAGE' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Százalék
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                {saleType === 'FIXED' ? 'Akciós ár (Ft)' : 'Kedvezmény (%)'}
              </label>
              {saleType === 'FIXED' ? (
                <input
                  name="salePrice"
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Opcionális"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
                />
              ) : (
                <div className="relative">
                  <input
                    name="salePercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={salePercentage}
                    onChange={(e) => setSalePercentage(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Pl. 20"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</div>
                </div>
              )}
              {saleType === 'PERCENTAGE' && typeof salePrice === 'number' && (
                <div className="mt-2 text-xs text-gray-400">
                  Számított ár: <span className="text-white font-bold">{salePrice.toLocaleString('hu-HU')} Ft</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Kezdete</label>
              <input
                name="saleStartDate"
                type="date"
                value={saleStartDate}
                onChange={(e) => setSaleStartDate(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Vége</label>
              <input
                name="saleEndDate"
                type="date"
                value={saleEndDate}
                onChange={(e) => setSaleEndDate(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
  )
}
