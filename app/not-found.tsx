import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 text-center font-sans selection:bg-purple-500/30">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />
        <h1 className="relative text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10">
          404
        </h1>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-4">Az oldal nem található</h2>
      <p className="text-gray-400 max-w-md mb-8 text-lg">
        Sajnáljuk, de a keresett oldal nem létezik, vagy áthelyezésre került.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
        >
          <Home size={20} /> Vissza a főoldalra
        </Link>
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10"
        >
          <Search size={20} /> Termékek böngészése
        </Link>
      </div>
    </div>
  )
}
