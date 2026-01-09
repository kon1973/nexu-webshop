'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Search, ArrowLeft, Clock, CheckCircle, Truck, MapPin } from 'lucide-react'
import OrderTracker from '@/app/components/OrderTracker'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Rendelés követése</h1>
          <p className="text-gray-400">
            Kövesd nyomon csomagod útját valós időben
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Feldolgozva</p>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500/30 to-purple-500/30 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Truck className="text-purple-400" size={20} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Szállítás</p>
            </div>
            <div className="flex-1 h-0.5 bg-white/10 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <MapPin className="text-gray-500" size={20} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Kézbesítve</p>
            </div>
          </div>
        </motion.div>

        {/* Order Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <OrderTracker orderId={orderIdParam || undefined} />
        </motion.div>

        {/* Help section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm mb-4">
            Kérdésed van a rendeléseddel kapcsolatban?
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/faq"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors text-sm"
            >
              GYIK
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm"
            >
              Kapcsolat
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
