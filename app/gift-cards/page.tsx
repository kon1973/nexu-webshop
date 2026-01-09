'use client'

import { motion } from 'framer-motion'
import { Gift, CreditCard, Mail, Clock, Shield, Sparkles } from 'lucide-react'
import GiftCardSystem from '@/app/components/GiftCardSystem'
import Link from 'next/link'

export default function GiftCardsPage() {
  const handlePurchase = (data: any) => {
    console.log('Gift card purchased:', data)
    // Here you would integrate with your payment system
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-6">
            <Sparkles className="text-purple-400" size={16} />
            <span className="text-purple-300 text-sm font-medium">Tökéletes ajándék tech rajongóknak</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              NEXU Ajándékkártyák
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Adj szabadságot az ajándékozásnak! A megajándékozott maga választhatja ki álmai technológiai termékét.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Mail className="text-purple-400 mx-auto mb-2" size={24} />
            <p className="text-white text-sm font-medium">Emailben küldve</p>
            <p className="text-gray-500 text-xs mt-1">Azonnal vagy ütemezve</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Clock className="text-blue-400 mx-auto mb-2" size={24} />
            <p className="text-white text-sm font-medium">1 évig érvényes</p>
            <p className="text-gray-500 text-xs mt-1">Bőven van idő felhasználni</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <CreditCard className="text-green-400 mx-auto mb-2" size={24} />
            <p className="text-white text-sm font-medium">Bármire használható</p>
            <p className="text-gray-500 text-xs mt-1">Teljes választékunkra</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Shield className="text-cyan-400 mx-auto mb-2" size={24} />
            <p className="text-white text-sm font-medium">Biztonságos</p>
            <p className="text-gray-500 text-xs mt-1">Egyedi kód védelem</p>
          </div>
        </motion.div>

        {/* Gift Card System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121212] border border-white/10 rounded-3xl p-8"
        >
          <GiftCardSystem onPurchase={handlePurchase} />
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Gyakori kérdések</h2>
          <div className="space-y-4">
            <div>
              <p className="text-white font-medium text-sm">Hogyan használható fel az ajándékkártya?</p>
              <p className="text-gray-400 text-sm mt-1">
                A vásárlás során a fizetés oldalon add meg az ajándékkártya kódját, és az összeg automatikusan levonódik.
              </p>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Mi történik, ha a rendelés összege nagyobb?</p>
              <p className="text-gray-400 text-sm mt-1">
                A különbözetet a rendes fizetési módokkal (kártyával, utánvéttel) rendezheted.
              </p>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Visszaváltható készpénzre?</p>
              <p className="text-gray-400 text-sm mt-1">
                Nem, az ajándékkártya csak vásárlásra használható fel a NEXU Store-ban.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm mb-4">
            Vállalati ajándékkártyák nagy tételben?{' '}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300">
              Keress minket!
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
