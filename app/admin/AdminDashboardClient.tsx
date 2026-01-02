'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Plus,
  ArrowRight,
  DollarSign,
  Activity,
  Calendar,
  Mail,
  RefreshCw,
  BarChart3,
  Clock,
  Zap,
  PieChart,
  Target,
  Eye,
  ShoppingBag,
  Filter,
  Sun,
  CreditCard,
  Banknote,
  CheckCircle2
} from 'lucide-react'
import { StatCard, QuickActionCard, AlertBanner } from './components/DashboardWidgets'
import { AreaChart, BarChart, DonutChart, ProgressRing, ComparisonChart } from './components/Charts'
import QuickSearch from './components/QuickSearch'
import NotificationCenter from './components/NotificationCenter'
import OrderStatus from './OrderStatus'

type Period = 'week' | 'month' | 'quarter' | 'year'
type ChartType = 'daily' | 'weekly' | 'monthly'

interface DashboardProps {
  stats: {
    totalRevenue: number
    totalOrders: number
    pendingOrders: number
    totalUsers: number
    newUsers: number
    avgOrderValue: number
    revenueChange: number
    ordersChange: number
    usersChange: number
  }
  todaySummary: {
    revenue: number
    orders: number
    users: number
    avgOrderValue: number
    revenueChange: number
    todayOrders: Array<{
      id: string
      customerName: string
      totalPrice: number
      status: string
      paymentMethod: string | null
      createdAt: string
    }>
  }
  kpiGoals: {
    dailyRevenue: number
    dailyOrders: number
    weeklyRevenue: number
    weeklyOrders: number
    monthlyRevenue: number
    monthlyOrders: number
    conversionRate: number
    avgOrderValue: number
  }
  paymentMethods: Array<{
    method: string
    count: number
    revenue: number
  }>
  revenueByPeriod: {
    week: { revenue: number; orders: number; change: number; ordersChange: number }
    month: { revenue: number; orders: number; change: number; ordersChange: number }
    quarter: { revenue: number; orders: number; change: number; ordersChange: number }
    year: { revenue: number; orders: number; change: number; ordersChange: number }
  }
  usersByPeriod: {
    total: number
    week: { count: number; change: number }
    month: { count: number; change: number }
    quarter: { count: number; change: number }
  }
  avgOrderByPeriod: {
    week: number
    month: number
    quarter: number
    year: number
    total: number
  }
  dailyChartData: Array<{ date: string; label: string; revenue: number; orders: number }>
  weeklyChartData: Array<{ week: string; revenue: number; orders: number }>
  monthlyChartData: Array<{ month: string; revenue: number; orders: number }>
  orderStatusData: Array<{ status: string; count: number }>
  topProducts: Array<{ name: string; count: number; revenue: number; category: string }>
  revenueByCategory: Array<{ category: string; revenue: number }>
  hourlyDistribution: Array<{ hour: number; orders: number }>
  dayOfWeekDistribution: Array<{ day: string; orders: number }>
  conversionStats: { visitors: number; cartAbandonment: number; conversionRate: number }
  reviewStats: { avgRating: number; totalReviews: number; byRating: Array<{ rating: number; count: number }> }
  lowStockProducts: Array<{ id: number; name: string; stock: number; image: string | null }>
  recentReviews: Array<{
    id: string
    rating: number
    text: string | null
    userName: string
    productName: string
    createdAt: string
  }>
  recentOrders: Array<{
    id: string
    customerName: string
    customerEmail: string
    customerAddress: string
    totalPrice: number
    status: string
    createdAt: string
    items: Array<{
      id: string
      quantity: number
      price: number
      productName: string
      productImage: string
    }>
  }>
  activities: Array<{
    id: string
    type: 'order' | 'review' | 'stock'
    title: string
    description: string
    timestamp: string
    href: string
  }>
}

const periodLabels: Record<Period, string> = {
  week: '7 nap',
  month: '30 nap',
  quarter: '90 nap',
  year: '1 év'
}

function formatRelativeTime(date: string) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  
  if (diff < 60000) return 'Most'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} perce`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} órája`
  return d.toLocaleDateString('hu-HU')
}

export default function AdminDashboardClient({
  stats,
  todaySummary,
  kpiGoals,
  paymentMethods,
  revenueByPeriod,
  usersByPeriod,
  avgOrderByPeriod,
  dailyChartData,
  weeklyChartData,
  monthlyChartData,
  orderStatusData,
  topProducts,
  revenueByCategory,
  hourlyDistribution,
  dayOfWeekDistribution,
  conversionStats,
  reviewStats,
  lowStockProducts,
  recentReviews,
  recentOrders,
  activities
}: DashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month')
  const [chartType, setChartType] = useState<ChartType>('daily')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    window.location.reload()
  }

  // Get data based on selected period
  const currentPeriodData = revenueByPeriod[selectedPeriod]
  const currentUserData = selectedPeriod === 'year' 
    ? { count: usersByPeriod.total, change: 0 }
    : usersByPeriod[selectedPeriod as 'week' | 'month' | 'quarter']

  // Prepare chart data based on selected type
  const getChartData = () => {
    switch (chartType) {
      case 'daily':
        return dailyChartData.slice(-7).map(d => ({
          date: d.date,
          value: d.revenue,
          label: d.label
        }))
      case 'weekly':
        return weeklyChartData.map(d => ({
          date: d.week,
          value: d.revenue,
          label: d.week
        }))
      case 'monthly':
        return monthlyChartData.map(d => ({
          date: d.month,
          value: d.revenue,
          label: d.month
        }))
    }
  }

  // Status colors and labels
  const statusColors: Record<string, string> = {
    pending: '#eab308',
    paid: '#3b82f6',
    shipped: '#8b5cf6',
    completed: '#22c55e',
    cancelled: '#ef4444'
  }

  const statusLabels: Record<string, string> = {
    pending: 'Függőben',
    paid: 'Kifizetve',
    shipped: 'Szállítás alatt',
    completed: 'Teljesítve',
    cancelled: 'Törölve'
  }

  const donutData = orderStatusData.map(d => ({
    label: statusLabels[d.status] || d.status,
    value: d.count,
    color: statusColors[d.status]
  }))

  // Category chart data
  const categoryChartData = revenueByCategory.slice(0, 6).map(c => ({
    label: c.category,
    value: c.revenue
  }))

  // Notifications
  const notifications = lowStockProducts.map(p => ({
    id: `stock-${p.id}`,
    type: 'stock' as const,
    title: 'Alacsony készlet',
    message: `${p.name} - már csak ${p.stock} db`,
    timestamp: new Date(),
    read: false,
    href: `/admin/edit-product/${p.id}`,
    priority: p.stock <= 2 ? 'high' as const : 'medium' as const
  }))

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans pt-20 md:pt-24 selection:bg-purple-500/30">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Vezérlőpult
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Calendar size={14} />
              {new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <QuickSearch />
            <NotificationCenter notifications={notifications} />
            
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              title="Frissítés"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <Link
              href="/admin/add-product"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 text-sm"
            >
              <Plus size={16} /> Új termék
            </Link>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={16} className="text-gray-500 flex-shrink-0" />
          {(['week', 'month', 'quarter', 'year'] as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                selectedPeriod === period
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>

        {/* Today's Summary - NEW SECTION */}
        <div className="mb-8 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <Sun className="text-yellow-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Mai nap összefoglaló</h2>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString('hu-HU', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            {todaySummary.revenueChange !== 0 && (
              <div className={`ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                todaySummary.revenueChange > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {todaySummary.revenueChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {todaySummary.revenueChange > 0 ? '+' : ''}{todaySummary.revenueChange}% vs tegnap
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-400" />
                <span className="text-xs text-gray-400">Mai bevétel</span>
              </div>
              <p className="text-2xl font-bold text-white">{todaySummary.revenue.toLocaleString('hu-HU')} Ft</p>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min((todaySummary.revenue / kpiGoals.dailyRevenue) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Cél: {kpiGoals.dailyRevenue.toLocaleString('hu-HU')} Ft ({Math.round((todaySummary.revenue / kpiGoals.dailyRevenue) * 100)}%)
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart size={16} className="text-blue-400" />
                <span className="text-xs text-gray-400">Mai rendelések</span>
              </div>
              <p className="text-2xl font-bold text-white">{todaySummary.orders} db</p>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                  style={{ width: `${Math.min((todaySummary.orders / kpiGoals.dailyOrders) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Cél: {kpiGoals.dailyOrders} db ({Math.round((todaySummary.orders / kpiGoals.dailyOrders) * 100)}%)
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={16} className="text-purple-400" />
                <span className="text-xs text-gray-400">Átl. kosárérték</span>
              </div>
              <p className="text-2xl font-bold text-white">{todaySummary.avgOrderValue.toLocaleString('hu-HU')} Ft</p>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all"
                  style={{ width: `${Math.min((todaySummary.avgOrderValue / kpiGoals.avgOrderValue) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Cél: {kpiGoals.avgOrderValue.toLocaleString('hu-HU')} Ft
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-yellow-400" />
                <span className="text-xs text-gray-400">Mai regisztrációk</span>
              </div>
              <p className="text-2xl font-bold text-white">{todaySummary.users}</p>
              <p className="text-xs text-gray-500 mt-2">
                {todaySummary.users > 0 ? '🎉 Új felhasználók!' : 'Még nem regisztrált senki'}
              </p>
            </div>
          </div>

          {/* Today's Orders List */}
          {todaySummary.todayOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-300 mb-3">Mai rendelések ({todaySummary.todayOrders.length})</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {todaySummary.todayOrders.slice(0, 6).map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex-shrink-0 bg-black/40 hover:bg-black/60 rounded-xl p-3 min-w-[180px] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-gray-500">#{order.id.slice(-6).toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{order.customerName}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-purple-400 font-bold">{order.totalPrice.toLocaleString('hu-HU')} Ft</span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        {order.paymentMethod === 'stripe' ? <CreditCard size={10} /> : <Banknote size={10} />}
                        {order.paymentMethod === 'stripe' ? 'Kártya' : 'Utánvét'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KPI Goals Progress - NEW SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#121212] p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Target size={16} className="text-green-400" />
                Heti cél
              </h3>
              {revenueByPeriod.week.revenue >= kpiGoals.weeklyRevenue && (
                <CheckCircle2 size={18} className="text-green-400" />
              )}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-bold text-white">
                {revenueByPeriod.week.revenue.toLocaleString('hu-HU')} Ft
              </span>
              <span className="text-xs text-gray-500 mb-1">/ {kpiGoals.weeklyRevenue.toLocaleString('hu-HU')} Ft</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  revenueByPeriod.week.revenue >= kpiGoals.weeklyRevenue 
                    ? 'bg-green-500' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${Math.min((revenueByPeriod.week.revenue / kpiGoals.weeklyRevenue) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((revenueByPeriod.week.revenue / kpiGoals.weeklyRevenue) * 100)}% teljesítve
            </p>
          </div>

          <div className="bg-[#121212] p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Target size={16} className="text-purple-400" />
                Havi cél
              </h3>
              {revenueByPeriod.month.revenue >= kpiGoals.monthlyRevenue && (
                <CheckCircle2 size={18} className="text-green-400" />
              )}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-bold text-white">
                {revenueByPeriod.month.revenue.toLocaleString('hu-HU')} Ft
              </span>
              <span className="text-xs text-gray-500 mb-1">/ {kpiGoals.monthlyRevenue.toLocaleString('hu-HU')} Ft</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  revenueByPeriod.month.revenue >= kpiGoals.monthlyRevenue 
                    ? 'bg-green-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${Math.min((revenueByPeriod.month.revenue / kpiGoals.monthlyRevenue) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((revenueByPeriod.month.revenue / kpiGoals.monthlyRevenue) * 100)}% teljesítve
            </p>
          </div>

          <div className="bg-[#121212] p-5 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-blue-400" />
              Fizetési módok (30 nap)
            </h3>
            <div className="space-y-2">
              {paymentMethods.map((pm) => {
                const totalPayments = paymentMethods.reduce((sum, p) => sum + p.count, 0)
                const percentage = totalPayments > 0 ? Math.round((pm.count / totalPayments) * 100) : 0
                return (
                  <div key={pm.method} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5">
                      {pm.method === 'stripe' ? <CreditCard size={12} className="text-blue-400" /> : <Banknote size={12} className="text-green-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">{pm.method === 'stripe' ? 'Bankkártya' : 'Utánvét'}</span>
                        <span className="text-white font-bold">{percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${pm.method === 'stripe' ? 'bg-blue-500' : 'bg-green-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{pm.count} db</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Alert banner */}
        {lowStockProducts.length > 0 && (
          <AlertBanner
            variant="warning"
            title={`${lowStockProducts.length} termék alacsony készlettel`}
            message="Ellenőrizd a készletet és rendelj új árut!"
            action={{ label: 'Megtekintés', href: '/admin/products?filter=low-stock' }}
            dismissible
            className="mb-6"
          />
        )}

        {/* Main Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            title={`Bevétel (${periodLabels[selectedPeriod]})`}
            value={`${currentPeriodData.revenue.toLocaleString('hu-HU')} Ft`}
            icon={DollarSign}
            change={currentPeriodData.change}
            color="green"
          />
          <StatCard
            title={`Rendelések (${periodLabels[selectedPeriod]})`}
            value={`${currentPeriodData.orders} db`}
            icon={ShoppingCart}
            change={currentPeriodData.ordersChange}
            color="blue"
          />
          <StatCard
            title="Átlagos kosárérték"
            value={`${avgOrderByPeriod[selectedPeriod].toLocaleString('hu-HU')} Ft`}
            icon={ShoppingBag}
            color="purple"
          />
          <StatCard
            title={`Új felhasználók`}
            value={currentUserData.count.toString()}
            icon={Users}
            change={currentUserData.change}
            color="yellow"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-blue-400" />
              <span className="text-xs text-gray-500">Látogatók (becsült)</span>
            </div>
            <p className="text-xl font-bold text-white">{conversionStats.visitors.toLocaleString('hu-HU')}</p>
          </div>
          <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-green-400" />
              <span className="text-xs text-gray-500">Konverziós ráta</span>
            </div>
            <p className="text-xl font-bold text-white">{conversionStats.conversionRate}%</p>
          </div>
          <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-yellow-400" />
              <span className="text-xs text-gray-500">Átlagos értékelés</span>
            </div>
            <p className="text-xl font-bold text-white">{reviewStats.avgRating.toFixed(1)}★</p>
          </div>
          <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-purple-400" />
              <span className="text-xs text-gray-500">Aktív rendelések</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.pendingOrders}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <QuickActionCard title="Új termék" icon={Plus} href="/admin/add-product" color="purple" />
          <QuickActionCard title="Rendelések" icon={ShoppingCart} href="/admin/orders" color="blue" badge={stats.pendingOrders > 0 ? stats.pendingOrders : undefined} />
          <QuickActionCard title="Analitika" icon={BarChart3} href="/admin/analytics" color="green" />
          <QuickActionCard title="Beállítások" icon={Zap} href="/admin/settings" color="orange" />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="xl:col-span-2 bg-[#121212] p-6 rounded-2xl border border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">Bevétel alakulása</h2>
              <div className="flex items-center gap-2">
                {(['daily', 'weekly', 'monthly'] as ChartType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      chartType === type
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {type === 'daily' ? 'Napi' : type === 'weekly' ? 'Heti' : 'Havi'}
                  </button>
                ))}
              </div>
            </div>
            <AreaChart 
              data={getChartData()} 
              height={280}
              color="#a855f7"
              gradientOpacity={0.4}
            />
          </div>

          {/* Order Status Donut */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6">Rendelések státusza</h2>
            <DonutChart 
              data={donutData}
              size={180}
              thickness={28}
              totalLabel="Összes"
            />
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Category Revenue */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Bevétel kategóriánként</h2>
            <BarChart 
              data={categoryChartData}
              height={180}
              horizontal
            />
          </div>

          {/* Hourly Distribution */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Rendelések napszak szerint</h2>
            <div className="flex items-end gap-0.5 h-[180px]">
              {hourlyDistribution.map((h, i) => {
                const maxOrders = Math.max(...hourlyDistribution.map(x => x.orders)) || 1
                const height = (h.orders / maxOrders) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 bg-purple-500/30 hover:bg-purple-500 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${h.hour}:00 - ${h.orders} rendelés`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-2">
              <span>0:00</span>
              <span>6:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </div>

          {/* Day of Week Distribution */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Rendelések napok szerint</h2>
            <div className="space-y-2">
              {dayOfWeekDistribution.map((d, i) => {
                const maxOrders = Math.max(...dayOfWeekDistribution.map(x => x.orders)) || 1
                const width = (d.orders / maxOrders) * 100
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10">{d.day}</span>
                    <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${Math.max(width, 5)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{d.orders}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Review Distribution */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Értékelések eloszlása</h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const ratingData = reviewStats.byRating.find(r => r.rating === rating)
                const count = ratingData?.count || 0
                const maxCount = Math.max(...reviewStats.byRating.map(r => r.count)) || 1
                const width = (count / maxCount) * 100
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs text-yellow-400 w-8 flex items-center gap-0.5">
                      {rating}<Star size={10} fill="currentColor" />
                    </span>
                    <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${Math.max(width, count > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <p className="text-2xl font-bold text-yellow-400">{reviewStats.avgRating.toFixed(1)}★</p>
              <p className="text-xs text-gray-500">{reviewStats.totalReviews} értékelés</p>
            </div>
          </div>
        </div>

        {/* Period Comparison */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Period Comparison */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6">Időszak összehasonlítás</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['week', 'month', 'quarter', 'year'] as Period[]).map((period) => {
                const data = revenueByPeriod[period]
                const isSelected = selectedPeriod === period
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      isSelected 
                        ? 'bg-purple-500/10 border-purple-500' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">{periodLabels[period]}</p>
                    <p className="text-lg font-bold text-white">
                      {data.revenue.toLocaleString('hu-HU')} Ft
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{data.orders} rendelés</span>
                      {data.change !== 0 && (
                        <span className={`text-xs flex items-center gap-0.5 ${
                          data.change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {data.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {data.change > 0 ? '+' : ''}{data.change}%
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Top 10 termék</h2>
              <Link href="/admin/products" className="text-xs text-purple-400 hover:text-purple-300">
                Mind →
              </Link>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {topProducts.map((product, i) => {
                const maxCount = topProducts[0]?.count || 1
                const width = (product.count / maxCount) * 100
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white truncate">{product.name}</span>
                        <span className="text-xs text-purple-400 ml-2">{product.count} db</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row - Activity, Orders, Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Feed */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-purple-400" />
              Aktivitás
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {activities.slice(0, 10).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    href={activity.href}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      activity.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
                      activity.type === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {activity.type === 'order' ? <ShoppingCart size={14} /> :
                       activity.type === 'review' ? <Star size={14} /> :
                       <AlertTriangle size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <span className="text-[10px] text-gray-600 flex-shrink-0">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-[#121212] p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Legutóbbi rendelések</h2>
              <Link href="/admin/orders" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                Mind <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {recentOrders.slice(0, 6).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className="font-medium text-white">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {order.customerEmail}
                        </span>
                        <span>{formatRelativeTime(order.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-white">
                        {order.totalPrice.toLocaleString('hu-HU')} Ft
                      </span>
                      <OrderStatus orderId={order.id} initialStatus={order.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.items.slice(0, 3).map((item) => (
                      <span 
                        key={item.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400"
                      >
                        {item.productImage && item.productImage.startsWith('/') || item.productImage?.startsWith('http') ? (
                          <img 
                            src={item.productImage} 
                            alt="" 
                            className="w-4 h-4 rounded object-cover"
                          />
                        ) : (
                          <Package size={12} className="text-gray-500" />
                        )}
                        <span className="truncate max-w-[80px]">{item.productName}</span>
                        <span className="text-gray-600">×{item.quantity}</span>
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-500">+{order.items.length - 3}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock & Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Low Stock */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle size={20} />
                Alacsony készlet
              </h2>
              <Link href="/admin/products?filter=low-stock" className="text-xs text-purple-400">Mind →</Link>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {lowStockProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/admin/edit-product/${product.id}`}
                  className="flex items-center justify-between p-3 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-red-300 truncate max-w-[180px]">
                        {product.name}
                      </p>
                      <p className="text-xs text-red-400 font-bold">Csak {product.stock} db!</p>
                    </div>
                  </div>
                  <ProgressRing 
                    value={product.stock} 
                    max={10} 
                    size={40} 
                    thickness={4}
                    color="#ef4444"
                    showValue={false}
                  />
                </Link>
              ))}
              {lowStockProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto mb-3 text-green-400" size={32} />
                  <p className="text-gray-400 text-sm">Minden rendben a készlettel!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Legutóbbi értékelések</h2>
              <Link href="/admin/reviews" className="text-xs text-purple-400">Mind →</Link>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">{formatRelativeTime(review.createdAt)}</span>
                  </div>
                  {review.text && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{review.text}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 truncate">{review.productName}</span>
                    <span className="text-purple-400">{review.userName}</span>
                  </div>
                </div>
              ))}
              {recentReviews.length === 0 && (
                <div className="text-center py-8">
                  <Star className="mx-auto mb-3 text-gray-600" size={32} />
                  <p className="text-gray-400 text-sm">Még nincsenek értékelések</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalRevenue.toLocaleString('hu-HU')} Ft</p>
            <p className="text-xs text-gray-400 mt-1">Összes bevétel</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalOrders}</p>
            <p className="text-xs text-gray-400 mt-1">Összes rendelés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-white">{avgOrderByPeriod.total.toLocaleString('hu-HU')} Ft</p>
            <p className="text-xs text-gray-400 mt-1">Átlagos kosárérték</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-white">{usersByPeriod.total}</p>
            <p className="text-xs text-gray-400 mt-1">Regisztrált felhasználó</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-white">{reviewStats.avgRating.toFixed(1)}★</p>
            <p className="text-xs text-gray-400 mt-1">Átlagos értékelés</p>
          </div>
        </div>
      </div>
    </div>
  )
}
