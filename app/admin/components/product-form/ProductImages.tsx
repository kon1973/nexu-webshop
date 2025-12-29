import { Loader2, Upload, X } from 'lucide-react'
import { type ChangeEvent } from 'react'

type Props = {
  images: string[]
  uploading: boolean
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
}

export function ProductImages({ images, uploading, handleImageUpload, removeImage }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold border-b border-white/10 pb-2">Képek</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10 group">
            <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">Fő kép</span>
            )}
          </div>
        ))}
        <label className="aspect-square bg-[#0a0a0a] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-all group">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          {uploading ? (
            <Loader2 className="animate-spin text-purple-500" />
          ) : (
            <>
              <Upload className="text-gray-400 group-hover:text-purple-500 mb-2" />
              <span className="text-xs text-gray-500 group-hover:text-purple-500">Kép feltöltése</span>
            </>
          )}
        </label>
      </div>
    </div>
  )
}
