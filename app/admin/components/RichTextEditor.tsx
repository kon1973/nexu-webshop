'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { 
  Bold, Italic, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, 
  Image as ImageIcon, Link as LinkIcon,
  Heading1, Heading2, Quote, Undo, Redo
} from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'

type Props = {
  content: string
  onChange: (content: string) => void
}

export function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const addImage = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0]
        const fd = new FormData()
        fd.append('file', file)

        const promise = fetch('/api/upload', {
          method: 'POST',
          body: fd,
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json()
            if (data.url) {
              editor?.chain().focus().setImage({ src: data.url }).run()
              return data.url
            }
          }
          throw new Error('Upload failed')
        })

        toast.promise(promise, {
          loading: 'Kép feltöltése...',
          success: 'Kép beillesztve',
          error: 'Hiba a feltöltéskor',
        })
      }
    }
    
    input.click()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
      <div className="bg-[#121212] border-b border-white/10 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Félkövér"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Dőlt"
        >
          <Italic size={18} />
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Címsor 2"
        >
          <Heading1 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Címsor 3"
        >
          <Heading2 size={18} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('bulletList') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Felsorolás"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive('orderedList') ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Számozott lista"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Balra igazítás"
        >
          <AlignLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Középre igazítás"
        >
          <AlignCenter size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400'}`}
          title="Jobbra igazítás"
        >
          <AlignRight size={18} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1 self-center" />

        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-purple-400"
          title="Kép beillesztése"
        >
          <ImageIcon size={18} />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400 disabled:opacity-50"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-white/10 transition-colors text-gray-400 disabled:opacity-50"
        >
          <Redo size={18} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
