import { type Dispatch, type SetStateAction } from 'react'
import { RichTextEditor } from '../RichTextEditor'

type Props = {
  description: string
  setDescription: Dispatch<SetStateAction<string>>
  fullDescription: string
  setFullDescription: Dispatch<SetStateAction<string>>
}

export function ProductDescriptions({
  description,
  setDescription,
  fullDescription,
  setFullDescription
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Rövid leírás</label>
        <textarea
          required
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
          placeholder="Rövid összefoglaló a termékről..."
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Részletes leírás</label>
        <RichTextEditor 
          content={fullDescription} 
          onChange={setFullDescription} 
        />
      </div>
    </div>
  )
}
