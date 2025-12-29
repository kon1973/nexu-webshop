'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Save, X, Loader2, Type, CheckSquare, Heading } from 'lucide-react'
import { toast } from 'sonner'

type TemplateField = {
  name: string
  type: 'text' | 'boolean' | 'header'
}

type Template = {
  id: string
  name: string
  fields: TemplateField[]
}

export default function SpecificationsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<Partial<Template>>({ name: '', fields: [] })
  const [fieldInput, setFieldInput] = useState('')
  const [fieldType, setFieldType] = useState<'text' | 'boolean' | 'header'>('text')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/specification-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (error) {
      toast.error('Hiba a sablonok betöltésekor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentTemplate.name || !currentTemplate.fields?.length) {
      toast.error('Kérlek töltsd ki a nevet és adj hozzá legalább egy mezőt')
      return
    }

    try {
      const url = currentTemplate.id 
        ? `/api/admin/specification-templates/${currentTemplate.id}`
        : '/api/admin/specification-templates'
      
      const method = currentTemplate.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTemplate),
      })

      if (res.ok) {
        toast.success('Sablon mentve')
        setIsEditing(false)
        setCurrentTemplate({ name: '', fields: [] })
        fetchTemplates()
      } else {
        toast.error('Hiba a mentés során')
      }
    } catch (error) {
      toast.error('Hiba a mentés során')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a sablont?')) return

    try {
      const res = await fetch(`/api/admin/specification-templates/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Sablon törölve')
        fetchTemplates()
      } else {
        toast.error('Hiba a törlés során')
      }
    } catch (error) {
      toast.error('Hiba a törlés során')
    }
  }

  const addField = () => {
    if (!fieldInput.trim()) return
    setCurrentTemplate(prev => ({
      ...prev,
      fields: [...(prev.fields || []), { name: fieldInput.trim(), type: fieldType }]
    }))
    setFieldInput('')
    setFieldType('text')
  }

  const removeField = (index: number) => {
    setCurrentTemplate(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index)
    }))
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'header': return <Heading size={14} />
      case 'boolean': return <CheckSquare size={14} />
      default: return <Type size={14} />
    }
  }

  return (
    <div className="p-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Specifikáció Sablonok</h1>
        <button
          onClick={() => {
            setCurrentTemplate({ name: '', fields: [] })
            setIsEditing(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Új sablon
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {currentTemplate.id ? 'Sablon szerkesztése' : 'Új sablon'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sablon neve</label>
                <input
                  type="text"
                  value={currentTemplate.name}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                  className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                  placeholder="pl. Laptop, Okostelefon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Mezők</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as any)}
                    className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
                  >
                    <option value="text">Szöveg</option>
                    <option value="boolean">Igen/Nem</option>
                    <option value="header">Fejléc (Szekció)</option>
                  </select>
                  <input
                    type="text"
                    value={fieldInput}
                    onChange={(e) => setFieldInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addField()}
                    className="flex-1 bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                    placeholder="Új mező hozzáadása (pl. Processzor)"
                  />
                  <button
                    onClick={addField}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {currentTemplate.fields?.map((field, index) => (
                    <div key={index} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                      field.type === 'header' 
                        ? 'bg-purple-500/20 border-purple-500/30' 
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400" title={field.type}>
                          {getIconForType(field.type)}
                        </span>
                        <span className={`text-sm ${field.type === 'header' ? 'font-bold text-white' : 'text-gray-300'}`}>
                          {field.name}
                        </span>
                      </div>
                      <button onClick={() => removeField(index)} className="text-gray-500 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Mégse
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Save size={18} />
                  Mentés
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{template.name}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setCurrentTemplate(template)
                      setIsEditing(true)
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-blue-400 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {template.fields.slice(0, 5).map((field, i) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    field.type === 'header' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'bg-white/5 text-gray-400'
                  }`}>
                    {getIconForType(field.type)}
                    {field.name}
                  </span>
                ))}
                {template.fields.length > 5 && (
                  <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-500">
                    +{template.fields.length - 5} további
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
