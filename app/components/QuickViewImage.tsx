'use client'

import React from 'react'
import { Package } from 'lucide-react'

interface QuickViewImageProps {
  src?: string | null
  alt?: string
}

export default function QuickViewImage({ src, alt }: QuickViewImageProps) {
  // Final stable image: fills image box, no debug overlays or ResizeObserver.
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Package size={128} className="text-gray-500 mx-auto" />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover pointer-events-none rounded-md"
        style={{ maxHeight: '70vh', width: '100%', height: '100%' }}
      />
    </div>
  )
}

