'use client'

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  AlertCircle, 
  DollarSign,
  Users,
  Map,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

type AnalyticsData = {
  activeCartsCount: number
  abandonedCartsCount: number
  potentialRevenue: number
  currentRevenue: number
  revenueGrowth: number
  currentOrders: number
  topProducts: { name: string; quantity: number; revenue: number }[]
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="text-purple-500" />
            Analitika és Statisztikák
          </h1>
          <div className="text-sm text-gray-400">
            Utolsó frissítés: {new Date().toLocaleTimeString('hu-HU')}
          </div>
        </div>

        {/* Google Analytics Banner */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Látogatottság és Útvonalak</h3>
              <p className="text-gray-400 text-sm">
                A részletes felhasználói útvonalak és látogatottsági adatok a Google Analytics felületén érhetők el.
              </p>
            </div>
          </div>
          <Link 
            href="https://analytics.google.com" 
            target="_blank"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
          >
            Megnyitás <ArrowRight size={16} />
          </Link>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-500/10 p-3 rounded-xl">
                <DollarSign className="text-green-500" size={24} />
              </div>
              <span className={`flex items-center gap-1 text-sm font-bold ${data.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.revenueGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(data.revenueGrowth).toFixed(1)}%
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Havi Bevétel</h3>
            <p className="text-2xl font-bold text-white mt-1">
              {data.currentRevenue.toLocaleString('hu-HU')} Ft
            </p>
          </div>

          {/* Active Carts */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-500/10 p-3 rounded-xl">
                <ShoppingCart className="text-purple-500" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Aktív Kosarak (24ó)</h3>
            <p className="text-2xl font-bold text-white mt-1">
              {data.activeCartsCount} db
            </p>
          </div>

          {/* Abandoned Carts */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-red-500/10 p-3 rounded-xl">
                <AlertCircle className="text-red-500" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Elhagyott Kosarak</h3>
            <p className="text-2xl font-bold text-white mt-1">
              {data.abandonedCartsCount} db
            </p>
          </div>

          {/* Potential Revenue */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-yellow-500/10 p-3 rounded-xl">
                <TrendingUp className="text-yellow-500" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Potenciális Bevétel (Kosárban)</h3>
            <p className="text-2xl font-bold text-white mt-1">
              {data.potentialRevenue.toLocaleString('hu-HU')} Ft
            </p>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold">Legnépszerűbb Termékek (Bevétel alapján)</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
              <tr>
                <th className="p-4">Termék Neve</th>
                <th className="p-4 text-right">Eladott Mennyiség</th>
                <th className="p-4 text-right">Összbevétel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{product.name}</td>
                  <td className="p-4 text-right text-gray-400">{product.quantity} db</td>
                  <td className="p-4 text-right font-bold text-green-400">
                    {product.revenue.toLocaleString('hu-HU')} Ft
                  </td>
                </tr>
              ))}
              {data.topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Még nincs elegendő adat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
