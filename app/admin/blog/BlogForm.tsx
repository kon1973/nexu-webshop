'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save, Bold, Italic, Heading1, Heading2, List, Quote, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { RichTextEditor } from '../components/RichTextEditor'

interface BlogFormProps {
  initialData?: {
    id?: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    image: string | null
    author: string
    published: boolean
  }
}

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    image: initialData?.image || '',
    author: initialData?.author || 'Admin',
    published: initialData?.published || false
  })

  const isEditing = !!initialData?.id

  const insertTag = (start: string, end: string) => {
    setFormData(prev => ({ ...prev, content: prev.content + start + end }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate slug from title only if creating new
    if (name === 'title' && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      setFormData(prev => ({ ...prev, slug }))
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = isEditing ? `/api/admin/blog/${initialData.id}` : '/api/admin/blog'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(isEditing ? 'Bejegyzés frissítve!' : 'Bejegyzés létrehozva!')
        router.push('/admin/blog')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Hiba történt.')
      }
    } catch (error) {
      toast.error('Hálózati hiba.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Cím</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Szerző</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Borítókép URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none text-white"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Kivonat (Excerpt)</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={4}
              className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-8">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#121212]"
            />
            <label htmlFor="published" className="text-sm font-medium text-white cursor-pointer">
              Publikálva (megjelenik az oldalon)
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1 text-gray-400">Tartalom</label>
        
        {/* Simple Toolbar */}
        <div className="flex flex-wrap gap-2 bg-[#1a1a1a] p-2 rounded-t-lg border border-white/10 border-b-0">
          <button type="button" onClick={() => insertTag('<b>', '</b>')} className="p-2 hover:bg-white/10 rounded text-gray-300" title="Félkövér"><Bold size={18} /></button>
          <button type="button" onClick={() => insertTag('<i>', '</i>')} className="p-2 hover:bg-white/10 rounded text-gray-300" title="Dőlt"><Italic size={18} /></button>
          <button type="button" onClick={() => insertTag('<h2>', '</h2>')} className="p-2 hover:bg-white/10 rounded text-gray-300" title="Címsor 2"><Heading1 size={18} /></button>
          <button type="button" onClick={() => insertTag('<h3>', '</h3>')} className="p-2 hover:bg-white/10 rounded text-gray-300" title="Címsor 3"><Heading2 size={18} /></button>
          <button type="button" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} className="p-2 hover:bg-white/10 rounded text-gray-300" title="Lista"><List size={18} /></button>
          <button type="button" onClick={() => insertTag('<blockquote>', '</blockquote>')} className="p-2 hover:bg-white/10 rounded text-gray-300" title="Idézet"><Quote size={18} /></button>
          <button type="button" onClick={() => insertTag('<a href="URL">', '</a>')} className="p-2 hover:bg-white/10 rounded text-gray-300" title="Link"><LinkIcon size={18} /></button>
          <button type="button" onClick={() => insertTag('<img src="URL" alt="leírás" />', '')} className="p-2 hover:bg-white/10 rounded text-gray-300" title="Kép"><ImageIcon size={18} /></button>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-lg overflow-hidden">
          <RichTextEditor 
            content={formData.content} 
            onChange={(content) => setFormData(prev => ({ ...prev, content }))} 
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isEditing ? 'Mentés' : 'Létrehozás'}
        </button>
      </div>
    </form>
  )
}
