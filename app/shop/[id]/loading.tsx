import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/shop" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft size={20} /> Vissza a boltba
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-12 flex items-center justify-center relative">
            <div className="w-40 h-40 bg-white/5 rounded-3xl animate-pulse" />
          </div>

          <div>
            <div className="h-6 w-32 bg-white/10 rounded-full animate-pulse mb-4" />
            <div className="h-10 w-3/4 bg-white/10 rounded-xl animate-pulse mb-6" />
            <div className="space-y-3 mb-8">
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
            </div>

            <div className="flex items-center justify-between mb-8 p-6 bg-[#121212] rounded-2xl border border-white/5">
              <div>
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse mb-2" />
                <div className="h-8 w-40 bg-white/10 rounded-xl animate-pulse" />
              </div>
              <div className="h-8 w-32 bg-white/10 rounded-full animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-14 w-full bg-white/5 rounded-xl animate-pulse" />
              <div className="h-14 w-full bg-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-white/10">
          <div className="lg:order-1 space-y-4">
            <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-56 bg-white/5 rounded animate-pulse" />
            <div className="h-40 w-full bg-white/5 rounded-2xl animate-pulse" />
          </div>

          <div className="lg:col-span-2 lg:order-2 space-y-4">
            <div className="h-6 w-56 bg-white/10 rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse mb-3" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

