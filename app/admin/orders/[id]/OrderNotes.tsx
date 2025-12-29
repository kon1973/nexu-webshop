'use client'

import { useState } from 'react'
import { MessageSquare, Plus, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface OrderNote {
  id: string
  content: string
  author: string
  createdAt: Date | string
}

export default function OrderNotes({ orderId, notes }: { orderId: string, notes: OrderNote[] }) {
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      })

      if (!res.ok) throw new Error('Failed to add note')

      setNewNote('')
      toast.success('Megjegyzés hozzáadva')
      router.refresh()
    } catch (error) {
      toast.error('Hiba történt a megjegyzés hozzáadásakor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a megjegyzést?')) return

    try {
      const res = await fetch(`/api/admin/orders/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete note')

      toast.success('Megjegyzés törölve')
      router.refresh()
    } catch (error) {
      toast.error('Hiba történt a törléskor')
    }
  }

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 h-full">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
        <MessageSquare size={20} /> Megjegyzések
      </h2>

      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Nincsenek megjegyzések.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white/5 rounded-xl p-3 text-sm group relative">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-purple-300 flex items-center gap-1">
                  <User size={12} /> {note.author}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleString('hu-HU')}
                </span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
              
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-[#121212]/80 rounded"
                title="Törlés"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddNote} className="relative">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Új megjegyzés írása..."
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-purple-500 transition-colors min-h-[80px] resize-none"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newNote.trim()}
          className="absolute bottom-3 right-3 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  )
}
