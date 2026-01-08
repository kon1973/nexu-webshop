'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

type Video = {
  url: string
  title?: string
  description?: string
  thumbnail?: string
  uploadDate?: string
}

export default function ProductVideos({ videos, setVideos }: { videos: Video[]; setVideos: (v: Video[]) => void }) {
  const addVideo = () => setVideos([...videos, { url: '', title: '', description: '', thumbnail: '', uploadDate: '' }])
  const removeVideo = (index: number) => setVideos(videos.filter((_, i) => i !== index))
  const updateVideo = (index: number, field: keyof Video, value: any) => {
    const newVideos = [...videos]
    // @ts-ignore
    newVideos[index][field] = value
    setVideos(newVideos)
  }

  const validateAndSave = (index: number) => {
    const v = videos[index]
    if (!v.url) {
      toast.error('Adj meg egy videó URL-t')
      return
    }
    // Basic URL validation
    try {
      new URL(v.url)
    } catch {
      toast.error('Érvényes URL szükséges')
      return
    }

    // Host validation
    try {
      // Import dynamically to avoid SSR issues
      // @ts-ignore
      const { isTrustedVideoHost } = require('@/lib/video-utils')
      // @ts-ignore
      if (!isTrustedVideoHost(v.url)) {
        toast.error('Nem támogatott videó host. Engedélyezett: YouTube, Vimeo, stb.')
        return
      }
    } catch (err) {
      // If helper unavailable for any reason, fall back to accepting the URL
      console.warn('Video host validation failed:', err)
    }

    toast.success('Videó mentve')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Videók</h4>
        <button type="button" onClick={addVideo} className="text-sm inline-flex items-center gap-2 bg-purple-600/10 px-3 py-1 rounded">
          <PlusCircle size={16} /> Videó hozzáadása
        </button>
      </div>

      {videos.length === 0 && (
        <div className="text-sm text-gray-400">Nincsenek videók hozzáadva.</div>
      )}

      <div className="space-y-4">
        {videos.map((v, i) => (
          <div key={i} className="bg-[#0b0b0b] border border-white/5 rounded p-4 space-y-3">
            <div className="flex items-center gap-3">
              <LinkIcon />
              <input
                name={`videos[${i}].url`}
                value={v.url}
                onChange={(e) => updateVideo(i, 'url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 bg-transparent outline-none border border-white/5 rounded px-3 py-2"
              />
              <button type="button" onClick={() => validateAndSave(i)} className="text-sm text-purple-400 px-2 py-1">Mentés</button>
              <button type="button" onClick={() => removeVideo(i)} className="text-red-400 px-2 py-1"><Trash2 /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                name={`videos[${i}].title`}
                value={v.title}
                onChange={(e) => updateVideo(i, 'title', e.target.value)}
                placeholder="Videó címe (opcionális)"
                className="bg-transparent outline-none border border-white/5 rounded px-3 py-2"
              />
              <input
                name={`videos[${i}].thumbnail`}
                value={v.thumbnail}
                onChange={(e) => updateVideo(i, 'thumbnail', e.target.value)}
                placeholder="Thumbnail URL (opcionális)"
                className="bg-transparent outline-none border border-white/5 rounded px-3 py-2"
              />
              <input
                name={`videos[${i}].uploadDate`}
                value={v.uploadDate}
                onChange={(e) => updateVideo(i, 'uploadDate', e.target.value)}
                placeholder="Feltöltés dátuma (YYYY-MM-DD)
                "
                className="bg-transparent outline-none border border-white/5 rounded px-3 py-2"
              />
              <textarea
                name={`videos[${i}].description`}
                value={v.description}
                onChange={(e) => updateVideo(i, 'description', e.target.value)}
                placeholder="Videó leírás (opcionális)"
                className="bg-transparent outline-none border border-white/5 rounded px-3 py-2 col-span-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
