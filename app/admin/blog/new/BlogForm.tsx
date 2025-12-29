'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

export default function BlogForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    author: 'Admin',
    published: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate slug from title
    if (name === 'title') {
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
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Bejegyzés létrehozva!')
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cím</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kivonat (Excerpt)</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tartalom (HTML)</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none font-mono text-sm"
            placeholder="<p>Ide írd a tartalmat...</p>"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Borítókép URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full bg-[#121212] border border-white/10 rounded-lg p-3 focus:border-purple-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="published" className="text-sm font-medium">Publikálva</label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        Mentés
      </button>
    </form>
  )
}
