export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pt-16 pb-24">
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-transparent pb-8">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="h-10 w-56 bg-white/10 rounded-xl mx-auto animate-pulse" />
          <div className="h-4 w-72 bg-white/5 rounded-lg mx-auto mt-3 animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-60 flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 space-y-6 shadow-xl">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-9 w-full bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden flex flex-col"
                >
                  <div className="h-44 bg-white/5 animate-pulse" />
                  <div className="p-4 space-y-3 flex-grow">
                    <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="p-4 border-t border-white/5 space-y-2">
                    <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
                    <div className="h-9 w-full bg-white/5 rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

