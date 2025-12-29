'use client'

import { useEffect } from 'react'

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Valami hiba történt!</h2>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
        >
          Próbáld újra
        </button>
      </div>
    </div>
  )
}
