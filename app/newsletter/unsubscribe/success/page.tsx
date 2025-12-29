import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function UnsubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121212] border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
          <CheckCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-4">Sikeres leiratkozás</h1>
        <p className="text-gray-400 mb-8">
          Sajnáljuk, hogy mész! Az email címedet töröltük a hírlevél listánkról.
        </p>
        <Link 
          href="/"
          className="inline-block bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl transition-colors font-medium"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </div>
  )
}
