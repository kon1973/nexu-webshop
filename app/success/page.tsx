import Link from 'next/link'
import { Check, Home, ShoppingBag } from 'lucide-react'

type Props = {
  searchParams?: Promise<{ orderId?: string | string[]; email?: string | string[] }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const orderIdRaw = resolvedSearchParams?.orderId
  const orderId = Array.isArray(orderIdRaw) ? orderIdRaw[0] : orderIdRaw
  const orderNumber = orderId ? orderId.slice(-6).toUpperCase() : null
  const emailRaw = resolvedSearchParams?.email
  const emailValue = Array.isArray(emailRaw) ? emailRaw[0] : emailRaw
  const emailSent = emailValue === '1'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 text-center font-sans selection:bg-purple-500/30">
      <div className="max-w-lg w-full bg-[#121212] border border-white/5 p-8 md:p-12 rounded-3xl shadow-2xl animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <Check size={48} className="text-white" strokeWidth={3} />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          {'Sikeres rendel\u00E9s!'}
        </h1>

        <p className="text-gray-400 text-lg leading-relaxed mb-6">
          {
            'K\u00F6sz\u00F6nj\u00FCk, hogy a NEXU Store-t v\u00E1lasztottad! A rendel\u00E9sedet r\u00F6gz\u00EDtett\u00FCk, koll\u00E9g\u00E1ink hamarosan \u00F6sszek\u00E9sz\u00EDtik a csomagodat.'
          }
        </p>

        <p className="text-sm text-gray-500 mb-10">
          {emailSent
            ? 'A visszaigazol\u00E1st emailben is elk\u00FCldt\u00FCk a megadott c\u00EDmre. Ha nem \u00E9rkezik meg, ellen\u0151rizd a spam mapp\u00E1t is.'
            : 'A visszaigazol\u00E1s email k\u00FCld\u00E9se jelenleg nem el\u00E9rhet\u0151. K\u00E9rj\u00FCk \u0151rizd meg a rendel\u00E9s azonos\u00EDt\u00F3j\u00E1t.'}
        </p>

        {orderId && (
          <div className="mb-10 bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-left">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{'Rendel\u00E9ssz\u00E1m'}</p>
            <p className="text-2xl font-extrabold text-white">#{orderNumber}</p>
            <p className="mt-2 text-xs text-gray-500 font-mono break-all">{orderId}</p>

            <Link
              href={`/orders/${orderId}`}
              className="mt-4 inline-flex text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              {'Rendel\u00E9s k\u00F6vet\u00E9se'}
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Link
            href="/shop"
            className="w-full px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-lg hover:scale-[1.02]"
          >
            <ShoppingBag size={20} /> {'V\u00E1s\u00E1rl\u00E1s folytat\u00E1sa'}
          </Link>

          <Link
            href="/"
            className="w-full px-8 py-4 bg-[#1a1a1a] text-white font-bold rounded-xl border border-white/10 hover:bg-[#252525] transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Home size={20} /> {'Vissza a f\u0151oldalra'}
          </Link>
        </div>
      </div>
    </div>
  )
}
