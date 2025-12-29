import { Plus, Trash2 } from 'lucide-react'

type SpecTemplate = {
  id: string
  name: string
  fields: { name: string; type: 'text' | 'boolean' | 'header' }[]
}

type Specification = {
  key: string
  value: string | boolean
  type: 'text' | 'boolean' | 'header'
}

type Props = {
  specifications: Specification[]
  specTemplates: SpecTemplate[]
  applySpecTemplate: (templateId: string) => void
  addSpecRow: () => void
  removeSpecRow: (index: number) => void
  updateSpec: (index: number, field: 'key' | 'value' | 'type', val: any) => void
}

export function ProductSpecifications({
  specifications,
  specTemplates,
  applySpecTemplate,
  addSpecRow,
  removeSpecRow,
  updateSpec
}: Props) {
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Specifikációk</h2>
        <div className="flex gap-3">
          <select
            onChange={(e) => {
              if (e.target.value) {
                applySpecTemplate(e.target.value)
                e.target.value = ''
              }
            }}
            className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
          >
            <option value="">Sablon betöltése...</option>
            {specTemplates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addSpecRow}
            className="bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Új sor
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {specifications.map((spec, idx) => (
          <div key={idx} className="flex gap-4 items-start group">
            <div className="w-1/3">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                placeholder="Tulajdonság neve"
                className={`w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 outline-none ${spec.type === 'header' ? 'font-bold text-purple-400' : ''}`}
              />
            </div>
            <div className="flex-1 flex gap-2">
              {spec.type === 'boolean' ? (
                <div className="flex items-center h-[46px] px-4 bg-[#0a0a0a] border border-white/10 rounded-lg w-full">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={spec.value as boolean}
                      onChange={(e) => updateSpec(idx, 'value', e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400">Igen / Nem</span>
                  </label>
                </div>
              ) : spec.type === 'header' ? (
                <div className="w-full h-[46px] bg-white/5 border border-white/10 rounded-lg flex items-center px-4 text-sm text-gray-500 italic">
                  Fejléc (nem kell érték)
                </div>
              ) : (
                <input
                  type="text"
                  value={spec.value as string}
                  onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                  placeholder="Érték"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 outline-none"
                />
              )}
              
              <select
                value={spec.type}
                onChange={(e) => updateSpec(idx, 'type', e.target.value)}
                className="w-24 bg-[#0a0a0a] border border-white/10 rounded-lg px-2 text-xs focus:border-purple-500 outline-none"
              >
                <option value="text">Szöveg</option>
                <option value="boolean">Logikai</option>
                <option value="header">Fejléc</option>
              </select>

              <button
                type="button"
                onClick={() => removeSpecRow(idx)}
                className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {specifications.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
            Nincsenek specifikációk hozzáadva
          </div>
        )}
      </div>
    </div>
  )
}
