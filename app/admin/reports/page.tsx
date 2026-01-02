'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  FileText, 
  Download, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Star,
  Mail,
  Percent,
  BarChart3,
  PieChart,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  CalendarDays,
  ArrowLeftRight,
  Filter,
  Eye,
  FileSpreadsheet,
  Printer
} from 'lucide-react'
import { toast } from 'sonner'

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

interface ReportData {
  period: ReportPeriod
  startDate: string
  endDate: string
  generatedAt: string
  revenue: {
    total: number
    previousPeriod: number
    change: number
    byPaymentMethod: Array<{ method: string; amount: number; count: number }>
    byDay: Array<{ date: string; amount: number; orders: number }>
    gross: number
    discounts: number
    loyaltyDiscounts: number
    net: number
  }
  orders: {
    total: number
    previousPeriod: number
    change: number
    byStatus: Array<{ status: string; count: number }>
    averageValue: number
    medianValue: number
    maxValue: number
    minValue: number
    cancelled: number
    cancelledValue: number
    completedRate: number
    byHour?: Array<{ hour: number; count: number }>
    byDayOfWeek?: Array<{ day: string; count: number }>
  }
  products: {
    totalSold: number
    uniqueProductsSold: number
    topSelling: Array<{ id: number; name: string; quantity: number; revenue: number; category: string }>
    worstSelling: Array<{ id: number; name: string; quantity: number; revenue: number }>
    byCategory: Array<{ category: string; quantity: number; revenue: number; percentage: number }>
    lowStock: Array<{ id: number; name: string; stock: number }>
    outOfStock: number
    averagePrice: number
  }
  users: {
    total: number
    new: number
    previousPeriodNew: number
    change: number
    active: number
    returning: number
    topSpenders: Array<{ id: string; name: string; email: string; spent: number; orders: number }>
  }
  coupons: {
    totalUsed: number
    totalDiscount: number
    mostUsed: Array<{ code: string; usedCount: number; totalDiscount: number }>
    conversionRate: number
  }
  reviews: {
    total: number
    approved: number
    pending: number
    rejected: number
    averageRating: number
    ratingDistribution: Array<{ rating: number; count: number }>
  }
  newsletter: {
    totalSubscribers: number
    newSubscribers: number
    unsubscribed: number
  }
  cart: {
    abandonedCarts: number
    abandonedValue: number
    averageCartValue: number
    averageItemsPerCart: number
  }
  inventory: {
    totalProducts: number
    totalStock: number
    averageStock: number
    stockValue: number
    lowStockCount: number
    outOfStockCount: number
  }
  stockChanges: Array<{
    productId: number
    productName: string
    category: string
    currentStock: number
    startStock: number
    totalChange: number
    ordersSold: number
    restocked: number
    manualAdjustments: number
    variants: Array<{
      variantId: string
      attributes: Record<string, string>
      currentStock: number
      totalChange: number
      ordersSold: number
      restocked: number
    }>
  }>
}

const periodLabels: Record<ReportPeriod, string> = {
  daily: 'Napi',
  weekly: 'Heti',
  monthly: 'Havi',
  yearly: 'Éves',
  custom: 'Egyedi'
}

const statusLabels: Record<string, string> = {
  pending: 'Függőben',
  processing: 'Feldolgozás alatt',
  shipped: 'Kiszállítva',
  completed: 'Teljesítve',
  cancelled: 'Lemondva'
}

const paymentLabels: Record<string, string> = {
  cod: 'Utánvét',
  stripe: 'Bankkártya',
  transfer: 'Átutalás',
  unknown: 'Ismeretlen'
}

function formatCurrency(value: number): string {
  return value.toLocaleString('hu-HU') + ' Ft'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly')
  const [report, setReport] = useState<ReportData | null>(null)
  const [compareReport, setCompareReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [showCompare, setShowCompare] = useState(false)
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [period])

  // Auto refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchReport, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, period])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      let url = `/api/admin/reports?period=${period}`
      
      if (period === 'custom' && customStartDate && customEndDate) {
        url = `/api/admin/reports?startDate=${customStartDate}&endDate=${customEndDate}`
      }
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
        
        // Fetch previous period for comparison if enabled
        if (showCompare && period !== 'custom') {
          const prevRes = await fetch(`/api/admin/reports?period=${period}&date=${getPreviousDate(period)}`)
          if (prevRes.ok) {
            const prevData = await prevRes.json()
            setCompareReport(prevData)
          }
        }
      } else {
        toast.error('Hiba a kimutatás betöltésekor')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    } finally {
      setIsLoading(false)
    }
  }

  const getPreviousDate = (p: ReportPeriod): string => {
    const date = new Date()
    switch (p) {
      case 'daily': date.setDate(date.getDate() - 1); break
      case 'weekly': date.setDate(date.getDate() - 7); break
      case 'monthly': date.setMonth(date.getMonth() - 1); break
      case 'yearly': date.setFullYear(date.getFullYear() - 1); break
    }
    return date.toISOString().split('T')[0]
  }

  const handleCustomRangeSubmit = () => {
    if (!customStartDate || !customEndDate) {
      toast.error('Válassz kezdő és záró dátumot!')
      return
    }
    if (new Date(customStartDate) > new Date(customEndDate)) {
      toast.error('A kezdő dátum nem lehet későbbi, mint a záró!')
      return
    }
    setPeriod('custom')
    setShowCustomRange(false)
  }

  const exportToCSV = () => {
    if (!report) return
    
    const sections = [
      '=== KIMUTATÁS ===',
      `Időszak: ${periodLabels[report.period]}`,
      `Kezdő dátum: ${formatDate(report.startDate)}`,
      `Záró dátum: ${formatDate(report.endDate)}`,
      `Generálva: ${formatDateTime(report.generatedAt)}`,
      '',
      '=== BEVÉTELEK ===',
      `Összes bevétel: ${formatCurrency(report.revenue.total)}`,
      `Előző időszak: ${formatCurrency(report.revenue.previousPeriod)}`,
      `Változás: ${report.revenue.change}%`,
      `Bruttó bevétel: ${formatCurrency(report.revenue.gross)}`,
      `Kedvezmények: ${formatCurrency(report.revenue.discounts)}`,
      `Hűségkedvezmények: ${formatCurrency(report.revenue.loyaltyDiscounts)}`,
      `Nettó bevétel: ${formatCurrency(report.revenue.net)}`,
      '',
      'Fizetési módok:',
      ...report.revenue.byPaymentMethod.map(p => 
        `  ${paymentLabels[p.method] || p.method}: ${formatCurrency(p.amount)} (${p.count} db)`
      ),
      '',
      '=== RENDELÉSEK ===',
      `Összes rendelés: ${report.orders.total} db`,
      `Előző időszak: ${report.orders.previousPeriod} db`,
      `Változás: ${report.orders.change}%`,
      `Átlagos kosárérték: ${formatCurrency(report.orders.averageValue)}`,
      `Medián kosárérték: ${formatCurrency(report.orders.medianValue)}`,
      `Maximum: ${formatCurrency(report.orders.maxValue)}`,
      `Minimum: ${formatCurrency(report.orders.minValue)}`,
      `Lemondott: ${report.orders.cancelled} db (${formatCurrency(report.orders.cancelledValue)})`,
      `Teljesítési arány: ${report.orders.completedRate}%`,
      '',
      'Státusz szerinti bontás:',
      ...report.orders.byStatus.map(s => 
        `  ${statusLabels[s.status] || s.status}: ${s.count} db`
      ),
      '',
      '=== TERMÉKEK ===',
      `Eladott termékek: ${report.products.totalSold} db`,
      `Egyedi termékek: ${report.products.uniqueProductsSold} db`,
      `Átlagos ár: ${formatCurrency(report.products.averagePrice)}`,
      `Alacsony készlet: ${report.products.lowStock.length} termék`,
      `Kifogyott: ${report.products.outOfStock} termék`,
      '',
      'Top 10 termék:',
      ...report.products.topSelling.map((p, i) => 
        `  ${i + 1}. ${p.name}: ${p.quantity} db - ${formatCurrency(p.revenue)}`
      ),
      '',
      'Kategória szerinti bontás:',
      ...report.products.byCategory.map(c => 
        `  ${c.category}: ${c.quantity} db - ${formatCurrency(c.revenue)} (${c.percentage}%)`
      ),
      '',
      '=== FELHASZNÁLÓK ===',
      `Összes felhasználó: ${report.users.total}`,
      `Új regisztrációk: ${report.users.new}`,
      `Változás: ${report.users.change}%`,
      `Aktív vásárlók: ${report.users.active}`,
      '',
      'Top vásárlók:',
      ...report.users.topSpenders.map((u, i) => 
        `  ${i + 1}. ${u.name || u.email}: ${formatCurrency(u.spent)} (${u.orders} rendelés)`
      ),
      '',
      '=== KUPONOK ===',
      `Felhasznált kuponok: ${report.coupons.totalUsed} db`,
      `Kedvezmény összesen: ${formatCurrency(report.coupons.totalDiscount)}`,
      `Kupon használati arány: ${report.coupons.conversionRate}%`,
      '',
      '=== VÉLEMÉNYEK ===',
      `Összes vélemény: ${report.reviews.total}`,
      `Jóváhagyott: ${report.reviews.approved}`,
      `Függőben: ${report.reviews.pending}`,
      `Elutasított: ${report.reviews.rejected}`,
      `Átlagos értékelés: ${report.reviews.averageRating}/5`,
      '',
      '=== HÍRLEVÉL ===',
      `Összes feliratkozó: ${report.newsletter.totalSubscribers}`,
      `Új feliratkozók: ${report.newsletter.newSubscribers}`,
      '',
      '=== KÉSZLET ===',
      `Összes termék: ${report.inventory.totalProducts}`,
      `Készlet összesen: ${report.inventory.totalStock} db`,
      `Átlagos készlet: ${report.inventory.averageStock} db`,
      `Készletérték: ${formatCurrency(report.inventory.stockValue)}`,
      `Alacsony készlet: ${report.inventory.lowStockCount} termék`,
      `Kifogyott: ${report.inventory.outOfStockCount} termék`,
      '',
      '=== KÉSZLETVÁLTOZÁSOK TERMÉKENKÉNT ===',
      `Érintett termékek: ${report.stockChanges.length}`,
      `Összes eladás: ${report.stockChanges.reduce((sum, p) => sum + p.ordersSold, 0)} db`,
      `Összes feltöltés: ${report.stockChanges.reduce((sum, p) => sum + p.restocked, 0)} db`,
      '',
      ...report.stockChanges.flatMap(product => [
        `--- ${product.productName} (${product.category}) ---`,
        `  Kezdő készlet: ${product.startStock} db`,
        `  Jelenlegi készlet: ${product.currentStock} db`,
        `  Változás: ${product.totalChange > 0 ? '+' : ''}${product.totalChange} db`,
        `  Eladva: ${product.ordersSold} db`,
        `  Feltöltve: ${product.restocked} db`,
        `  Kézi módosítás: ${product.manualAdjustments} db`,
        ...(product.variants.length > 0 ? [
          '  Variációk:',
          ...product.variants.map(v => 
            `    • ${Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(', ')}: ` +
            `${v.currentStock} db (változás: ${v.totalChange > 0 ? '+' : ''}${v.totalChange}, eladva: ${v.ordersSold}, feltöltve: ${v.restocked})`
          )
        ] : []),
        ''
      ])
    ]
    
    const csvContent = sections.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kimutatas-${report.period}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Kimutatás exportálva!')
  }

  const sections = [
    { id: 'overview', label: 'Áttekintés', icon: BarChart3 },
    { id: 'revenue', label: 'Bevételek', icon: DollarSign },
    { id: 'orders', label: 'Rendelések', icon: ShoppingCart },
    { id: 'products', label: 'Termékek', icon: Package },
    { id: 'users', label: 'Felhasználók', icon: Users },
    { id: 'coupons', label: 'Kuponok', icon: Percent },
    { id: 'reviews', label: 'Vélemények', icon: Star },
    { id: 'inventory', label: 'Készlet', icon: AlertTriangle },
    { id: 'stockChanges', label: 'Készletváltozások', icon: TrendingDown }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Kimutatás generálása...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400">Nem sikerült betölteni a kimutatást</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="text-purple-500" />
              Automatikus Kimutatások
            </h1>
            <p className="text-gray-400 mt-2">
              {formatDate(report.startDate)} - {formatDate(report.endDate)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Period selector */}
            <div className="flex bg-[#1a1a1a] rounded-xl p-1">
              {(['daily', 'weekly', 'monthly', 'yearly'] as ReportPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === p 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
            
            <button
              onClick={fetchReport}
              className="bg-[#1a1a1a] hover:bg-[#252525] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
              Frissítés
            </button>

            <button
              onClick={() => setShowCustomRange(!showCustomRange)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                period === 'custom' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
              }`}
            >
              <CalendarDays size={18} />
              Egyedi dátum
            </button>

            <button
              onClick={() => setShowCompare(!showCompare)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                showCompare 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
              }`}
            >
              <ArrowLeftRight size={18} />
              Összehasonlítás
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#1a1a1a] hover:bg-[#252525] text-white'
              }`}
              title="Automatikus frissítés 5 percenként"
            >
              <Eye size={18} />
              {autoRefresh ? 'Élő' : 'Auto'}
            </button>
            
            <button
              onClick={exportToCSV}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              Exportálás
            </button>
          </div>
        </div>

        {/* Custom date range picker */}
        {showCustomRange && (
          <div className="bg-[#121212] border border-purple-500/30 rounded-xl p-5 mb-6 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CalendarDays className="text-purple-400" size={20} />
              Egyedi időszak kiválasztása
            </h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Kezdő dátum</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Záró dátum</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleCustomRangeSubmit}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
              >
                Kimutatás generálása
              </button>
              <button
                onClick={() => {
                  setShowCustomRange(false)
                  setPeriod('monthly')
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-colors"
              >
                Mégse
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Gyors választás:</span>
              {[
                { label: 'Mai nap', days: 0 },
                { label: 'Tegnap', days: 1 },
                { label: 'Utolsó 7 nap', days: 7 },
                { label: 'Utolsó 30 nap', days: 30 },
                { label: 'Utolsó 90 nap', days: 90 },
                { label: 'Ez a év', days: -1 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    if (preset.days === -1) {
                      start.setMonth(0, 1)
                    } else if (preset.days === 0) {
                      // Today - same date
                    } else {
                      start.setDate(start.getDate() - preset.days)
                    }
                    setCustomStartDate(start.toISOString().split('T')[0])
                    setCustomEndDate(end.toISOString().split('T')[0])
                  }}
                  className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generated info */}
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Clock size={18} className="text-gray-500" />
          <span className="text-sm text-gray-400">
            Generálva: {formatDateTime(report.generatedAt)}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-56 flex-shrink-0 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeSection === section.id
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Overview */}
            {activeSection === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Bevétel"
                    value={formatCurrency(report.revenue.total)}
                    change={report.revenue.change}
                    icon={DollarSign}
                    color="emerald"
                  />
                  <StatCard
                    title="Rendelések"
                    value={`${report.orders.total} db`}
                    change={report.orders.change}
                    icon={ShoppingCart}
                    color="blue"
                  />
                  <StatCard
                    title="Új felhasználók"
                    value={`${report.users.new}`}
                    change={report.users.change}
                    icon={Users}
                    color="purple"
                  />
                  <StatCard
                    title="Átlagos kosár"
                    value={formatCurrency(report.orders.averageValue)}
                    icon={Package}
                    color="amber"
                  />
                </div>

                {/* Quick stats */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Rendelés státuszok</h3>
                    <div className="space-y-2">
                      {report.orders.byStatus.map(s => (
                        <div key={s.status} className="flex justify-between">
                          <span className="text-gray-300">{statusLabels[s.status] || s.status}</span>
                          <span className="font-medium">{s.count} db</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Fizetési módok</h3>
                    <div className="space-y-2">
                      {report.revenue.byPaymentMethod.map(p => (
                        <div key={p.method} className="flex justify-between">
                          <span className="text-gray-300">{paymentLabels[p.method] || p.method}</span>
                          <span className="font-medium">{p.count} db</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Készlet állapot</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Összes termék</span>
                        <span className="font-medium">{report.inventory.totalProducts}</span>
                      </div>
                      <div className="flex justify-between text-amber-400">
                        <span>Alacsony készlet</span>
                        <span className="font-medium">{report.inventory.lowStockCount}</span>
                      </div>
                      <div className="flex justify-between text-red-400">
                        <span>Kifogyott</span>
                        <span className="font-medium">{report.inventory.outOfStockCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top products */}
                <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-4">Top 5 termék</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-3 text-sm text-gray-400">#</th>
                          <th className="text-left py-3 text-sm text-gray-400">Termék</th>
                          <th className="text-left py-3 text-sm text-gray-400">Kategória</th>
                          <th className="text-right py-3 text-sm text-gray-400">Eladva</th>
                          <th className="text-right py-3 text-sm text-gray-400">Bevétel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.products.topSelling.slice(0, 5).map((p, i) => (
                          <tr key={p.id} className="border-b border-white/5">
                            <td className="py-3 text-gray-500">{i + 1}</td>
                            <td className="py-3 font-medium">{p.name}</td>
                            <td className="py-3 text-gray-400">{p.category}</td>
                            <td className="py-3 text-right">{p.quantity} db</td>
                            <td className="py-3 text-right text-emerald-400">{formatCurrency(p.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue section */}
            {activeSection === 'revenue' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4">Bevétel összesítő</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-gray-400">Bruttó bevétel</span>
                        <span className="font-bold text-lg">{formatCurrency(report.revenue.gross)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Kedvezmények</span>
                        <span className="text-red-400">-{formatCurrency(report.revenue.discounts)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Hűségkedvezmények</span>
                        <span className="text-red-400">-{formatCurrency(report.revenue.loyaltyDiscounts)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-white/5">
                        <span className="text-gray-400">Nettó bevétel</span>
                        <span className="font-bold text-lg text-emerald-400">{formatCurrency(report.revenue.net)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4">Fizetési módok</h3>
                    <div className="space-y-3">
                      {report.revenue.byPaymentMethod.map(p => (
                        <div key={p.method} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{paymentLabels[p.method] || p.method}</span>
                            <span>{p.count} rendelés</span>
                          </div>
                          <div className="text-xl font-bold text-emerald-400">
                            {formatCurrency(p.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Revenue by day - Chart */}
                <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-4">Napi bevétel grafikon</h3>
                  <RevenueChart data={report.revenue.byDay} />
                </div>

                {/* Revenue by day - Table */}
                <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-4">Napi bontás</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-3 text-sm text-gray-400">Dátum</th>
                          <th className="text-right py-3 text-sm text-gray-400">Rendelések</th>
                          <th className="text-right py-3 text-sm text-gray-400">Bevétel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.revenue.byDay.map(d => (
                          <tr key={d.date} className="border-b border-white/5">
                            <td className="py-3">{d.date}</td>
                            <td className="py-3 text-right">{d.orders} db</td>
                            <td className="py-3 text-right text-emerald-400">{formatCurrency(d.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders section */}
            {activeSection === 'orders' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid lg:grid-cols-3 gap-4">
                  <StatCard 
                    title="Összes rendelés" 
                    value={`${report.orders.total} db`} 
                    change={report.orders.change}
                    icon={ShoppingCart} 
                    color="blue" 
                  />
                  <StatCard 
                    title="Lemondva" 
                    value={`${report.orders.cancelled} db`}
                    subtitle={formatCurrency(report.orders.cancelledValue)}
                    icon={XCircle} 
                    color="red" 
                  />
                  <StatCard 
                    title="Teljesítési arány" 
                    value={`${report.orders.completedRate}%`}
                    icon={CheckCircle} 
                    color="emerald" 
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4">Kosárérték statisztikák</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Átlagos</span>
                        <span className="font-medium">{formatCurrency(report.orders.averageValue)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Medián</span>
                        <span className="font-medium">{formatCurrency(report.orders.medianValue)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Maximum</span>
                        <span className="font-medium text-emerald-400">{formatCurrency(report.orders.maxValue)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Minimum</span>
                        <span className="font-medium">{formatCurrency(report.orders.minValue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4">Státusz szerinti bontás</h3>
                    <div className="space-y-2">
                      {report.orders.byStatus.map(s => (
                        <div key={s.status} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span>{statusLabels[s.status] || s.status}</span>
                          <span className="font-bold">{s.count} db</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Orders by day of week */}
                {report.orders.byDayOfWeek && (
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4">Hét napjai szerinti bontás</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {report.orders.byDayOfWeek.map(d => (
                        <div key={d.day} className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">{d.day}</div>
                          <div className="font-bold text-lg">{d.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders by hour */}
                {report.orders.byHour && report.orders.byHour.length > 0 && (
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4">Rendelések órák szerint</h3>
                    <HourlyChart data={report.orders.byHour} />
                  </div>
                )}
              </div>
            )}

            {/* Products section */}
            {activeSection === 'products' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Eladott termékek" 
                    value={`${report.products.totalSold} db`}
                    icon={Package} 
                    color="blue" 
                  />
                  <StatCard 
                    title="Egyedi termékek" 
                    value={`${report.products.uniqueProductsSold}`}
                    icon={Package} 
                    color="purple" 
                  />
                  <StatCard 
                    title="Átlagos ár" 
                    value={formatCurrency(report.products.averagePrice)}
                    icon={DollarSign} 
                    color="emerald" 
                  />
                  <StatCard 
                    title="Kifogyott" 
                    value={`${report.products.outOfStock}`}
                    icon={AlertTriangle} 
                    color="red" 
                  />
                </div>

                {/* Category breakdown with pie chart */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4">Kategória eloszlás</h3>
                    <CategoryPieChart data={report.products.byCategory} />
                  </div>
                  
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4">Kategória részletek</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {report.products.byCategory.map(c => (
                        <div key={c.category} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{c.category}</span>
                            <span className="text-gray-400">{c.percentage}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{c.quantity} db eladva</span>
                            <span className="text-emerald-400">{formatCurrency(c.revenue)}</span>
                          </div>
                          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${c.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top & Worst selling */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4 text-emerald-400">Top 10 termék</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {report.products.topSelling.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-500 w-6">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{p.name}</div>
                            <div className="text-sm text-gray-400">{p.quantity} db</div>
                          </div>
                          <div className="text-emerald-400 font-medium">
                            {formatCurrency(p.revenue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-4 text-amber-400">Legkevésbé kelendő</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {report.products.worstSelling.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-500 w-6">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{p.name}</div>
                            <div className="text-sm text-gray-400">{p.quantity} db</div>
                          </div>
                          <div className="text-amber-400 font-medium">
                            {formatCurrency(p.revenue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users section */}
            {activeSection === 'users' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Összes felhasználó" 
                    value={`${report.users.total}`}
                    icon={Users} 
                    color="blue" 
                  />
                  <StatCard 
                    title="Új regisztrációk" 
                    value={`${report.users.new}`}
                    change={report.users.change}
                    icon={Users} 
                    color="emerald" 
                  />
                  <StatCard 
                    title="Aktív vásárlók" 
                    value={`${report.users.active}`}
                    icon={Users} 
                    color="purple" 
                  />
                  <StatCard 
                    title="Visszatérő" 
                    value={`${report.users.returning}`}
                    icon={Users} 
                    color="amber" 
                  />
                </div>

                <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-4">Top 10 vásárló</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-3 text-sm text-gray-400">#</th>
                          <th className="text-left py-3 text-sm text-gray-400">Név</th>
                          <th className="text-left py-3 text-sm text-gray-400">Email</th>
                          <th className="text-right py-3 text-sm text-gray-400">Rendelések</th>
                          <th className="text-right py-3 text-sm text-gray-400">Költés</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.users.topSpenders.map((u, i) => (
                          <tr key={u.id} className="border-b border-white/5">
                            <td className="py-3 text-gray-500">{i + 1}</td>
                            <td className="py-3 font-medium">{u.name || 'N/A'}</td>
                            <td className="py-3 text-gray-400">{u.email}</td>
                            <td className="py-3 text-right">{u.orders} db</td>
                            <td className="py-3 text-right text-emerald-400 font-medium">
                              {formatCurrency(u.spent)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Coupons section */}
            {activeSection === 'coupons' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid lg:grid-cols-3 gap-4">
                  <StatCard 
                    title="Felhasznált kuponok" 
                    value={`${report.coupons.totalUsed} db`}
                    icon={Percent} 
                    color="purple" 
                  />
                  <StatCard 
                    title="Összes kedvezmény" 
                    value={formatCurrency(report.coupons.totalDiscount)}
                    icon={DollarSign} 
                    color="emerald" 
                  />
                  <StatCard 
                    title="Kupon használati arány" 
                    value={`${report.coupons.conversionRate}%`}
                    icon={PieChart} 
                    color="blue" 
                  />
                </div>

                <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-4">Leggyakrabban használt kuponok</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-3 text-sm text-gray-400">Kuponkód</th>
                          <th className="text-right py-3 text-sm text-gray-400">Használva</th>
                          <th className="text-right py-3 text-sm text-gray-400">Kedvezmény összesen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.coupons.mostUsed.length > 0 ? (
                          report.coupons.mostUsed.map(c => (
                            <tr key={c.code} className="border-b border-white/5">
                              <td className="py-3 font-mono font-medium">{c.code}</td>
                              <td className="py-3 text-right">{c.usedCount} alkalom</td>
                              <td className="py-3 text-right text-emerald-400">
                                {formatCurrency(c.totalDiscount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-gray-500">
                              Nem használtak kupont ebben az időszakban
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews section */}
            {activeSection === 'reviews' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Összes vélemény" 
                    value={`${report.reviews.total}`}
                    icon={Star} 
                    color="amber" 
                  />
                  <StatCard 
                    title="Jóváhagyott" 
                    value={`${report.reviews.approved}`}
                    icon={CheckCircle} 
                    color="emerald" 
                  />
                  <StatCard 
                    title="Függőben" 
                    value={`${report.reviews.pending}`}
                    icon={Clock} 
                    color="blue" 
                  />
                  <StatCard 
                    title="Átlag értékelés" 
                    value={`${report.reviews.averageRating}/5`}
                    icon={Star} 
                    color="amber" 
                  />
                </div>

                <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-4">Értékelések eloszlása</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const data = report.reviews.ratingDistribution.find(r => r.rating === rating)
                      const count = data?.count || 0
                      const total = report.reviews.total || 1
                      const percentage = Math.round((count / total) * 100)
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            {rating} <Star size={14} className="text-amber-400 fill-amber-400" />
                          </div>
                          <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-20 text-right text-sm">
                            {count} ({percentage}%)
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Inventory section */}
            {activeSection === 'inventory' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Összes termék" 
                    value={`${report.inventory.totalProducts}`}
                    icon={Package} 
                    color="blue" 
                  />
                  <StatCard 
                    title="Készlet összesen" 
                    value={`${report.inventory.totalStock} db`}
                    icon={Package} 
                    color="emerald" 
                  />
                  <StatCard 
                    title="Készletérték" 
                    value={formatCurrency(report.inventory.stockValue)}
                    icon={DollarSign} 
                    color="purple" 
                  />
                  <StatCard 
                    title="Átlagos készlet" 
                    value={`${report.inventory.averageStock} db`}
                    icon={Package} 
                    color="amber" 
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-2 text-amber-400 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Alacsony készlet ({report.inventory.lowStockCount})
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Termékek 5 db vagy kevesebb készlettel</p>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {report.products.lowStock.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                          <span className="truncate flex-1">{p.name}</span>
                          <span className={`font-bold ml-2 ${p.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                            {p.stock} db
                          </span>
                        </div>
                      ))}
                      {report.products.lowStock.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Nincs alacsony készletű termék</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-5">
                    <h3 className="text-lg font-bold mb-2 text-red-400 flex items-center gap-2">
                      <XCircle size={20} />
                      Kifogyott termékek ({report.inventory.outOfStockCount})
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Termékek 0 készlettel</p>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {report.products.lowStock.filter(p => p.stock === 0).map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                          <span className="truncate flex-1">{p.name}</span>
                          <span className="font-bold text-red-400">Kifogyott</span>
                        </div>
                      ))}
                      {report.products.lowStock.filter(p => p.stock === 0).length === 0 && (
                        <p className="text-gray-500 text-center py-4">Nincs kifogyott termék</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Abandoned carts */}
                <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-4">Elhagyott kosarak</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                      <div className="text-2xl font-bold">{report.cart.abandonedCarts}</div>
                      <div className="text-sm text-gray-400">Elhagyott kosár</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                      <div className="text-2xl font-bold text-amber-400">{formatCurrency(report.cart.abandonedValue)}</div>
                      <div className="text-sm text-gray-400">Elveszett érték</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                      <div className="text-2xl font-bold">{formatCurrency(report.cart.averageCartValue)}</div>
                      <div className="text-sm text-gray-400">Átlagos kosárérték</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                      <div className="text-2xl font-bold">{report.cart.averageItemsPerCart}</div>
                      <div className="text-sm text-gray-400">Átl. termék/kosár</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Changes section */}
            {activeSection === 'stockChanges' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-2">Készletváltozások termékenként</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Részletes kimutatás a készletváltozásokról az időszakban, variánsonként elkülönítve
                  </p>

                  {report.stockChanges.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Nem történt készletváltozás ebben az időszakban</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {report.stockChanges.map((product) => (
                        <div 
                          key={product.productId} 
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          {/* Product header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                            <div>
                              <h4 className="font-bold text-lg">{product.productName}</h4>
                              <span className="text-sm text-gray-400">{product.category}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <span className="text-gray-400">Kezdő:</span>{' '}
                                <span className="font-medium text-blue-400">{product.startStock} db</span>
                              </div>
                              <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <span className="text-gray-400">Jelenlegi:</span>{' '}
                                <span className="font-medium text-purple-400">{product.currentStock} db</span>
                              </div>
                              <div className={`px-3 py-1.5 rounded-lg border ${
                                product.totalChange > 0 
                                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                                  : product.totalChange < 0 
                                    ? 'bg-red-500/10 border-red-500/20'
                                    : 'bg-gray-500/10 border-gray-500/20'
                              }`}>
                                <span className="text-gray-400">Változás:</span>{' '}
                                <span className={`font-bold ${
                                  product.totalChange > 0 ? 'text-emerald-400' : product.totalChange < 0 ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                  {product.totalChange > 0 ? '+' : ''}{product.totalChange} db
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Product stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="p-3 bg-black/20 rounded-lg text-center">
                              <div className="text-red-400 font-bold text-xl">{product.ordersSold}</div>
                              <div className="text-xs text-gray-500">Eladva</div>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg text-center">
                              <div className="text-emerald-400 font-bold text-xl">{product.restocked}</div>
                              <div className="text-xs text-gray-500">Feltöltve</div>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg text-center">
                              <div className="text-amber-400 font-bold text-xl">{product.manualAdjustments}</div>
                              <div className="text-xs text-gray-500">Kézi módosítás</div>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg text-center">
                              <div className="text-purple-400 font-bold text-xl">{product.variants.length}</div>
                              <div className="text-xs text-gray-500">Variáció</div>
                            </div>
                          </div>

                          {/* Variants */}
                          {product.variants.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-400 mb-2">Variációk:</h5>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-white/10">
                                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Variáció</th>
                                      <th className="text-right py-2 px-2 text-gray-500 font-medium">Jelenlegi</th>
                                      <th className="text-right py-2 px-2 text-gray-500 font-medium">Változás</th>
                                      <th className="text-right py-2 px-2 text-gray-500 font-medium">Eladva</th>
                                      <th className="text-right py-2 px-2 text-gray-500 font-medium">Feltöltve</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {product.variants.map((variant) => (
                                      <tr key={variant.variantId} className="border-b border-white/5">
                                        <td className="py-2 px-2">
                                          <div className="flex flex-wrap gap-1">
                                            {Object.entries(variant.attributes).map(([key, value]) => (
                                              <span 
                                                key={key} 
                                                className="px-2 py-0.5 bg-white/10 rounded text-xs"
                                              >
                                                {key}: <span className="font-medium">{value}</span>
                                              </span>
                                            ))}
                                          </div>
                                        </td>
                                        <td className="py-2 px-2 text-right font-medium">
                                          {variant.currentStock} db
                                        </td>
                                        <td className={`py-2 px-2 text-right font-bold ${
                                          variant.totalChange > 0 ? 'text-emerald-400' : 
                                          variant.totalChange < 0 ? 'text-red-400' : 'text-gray-400'
                                        }`}>
                                          {variant.totalChange > 0 ? '+' : ''}{variant.totalChange}
                                        </td>
                                        <td className="py-2 px-2 text-right text-red-400">
                                          {variant.ordersSold}
                                        </td>
                                        <td className="py-2 px-2 text-right text-emerald-400">
                                          {variant.restocked}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary stats */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h4 className="font-bold mb-3">Összesített eladások</h4>
                    <div className="text-3xl font-bold text-red-400">
                      {report.stockChanges.reduce((sum, p) => sum + p.ordersSold, 0)} db
                    </div>
                    <p className="text-sm text-gray-400 mt-1">termék fogyott el rendelésekből</p>
                  </div>
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h4 className="font-bold mb-3">Összesített feltöltés</h4>
                    <div className="text-3xl font-bold text-emerald-400">
                      {report.stockChanges.reduce((sum, p) => sum + p.restocked, 0)} db
                    </div>
                    <p className="text-sm text-gray-400 mt-1">termék került készletre</p>
                  </div>
                  <div className="bg-[#121212] border border-white/5 rounded-xl p-5">
                    <h4 className="font-bold mb-3">Érintett termékek</h4>
                    <div className="text-3xl font-bold text-purple-400">
                      {report.stockChanges.length}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">terméknél volt változás</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card component
function StatCard({ 
  title, 
  value, 
  change, 
  subtitle,
  icon: Icon, 
  color 
}: { 
  title: string
  value: string
  change?: number
  subtitle?: string
  icon: any
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'red'
}) {
  const colors = {
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20 text-red-400'
  }
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <Icon size={24} className={colors[color].split(' ').pop()} />
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}

// Revenue Chart component - simple bar chart
function RevenueChart({ data }: { data: Array<{ date: string; amount: number; orders: number }> }) {
  if (!data || data.length === 0) return null
  
  const maxAmount = Math.max(...data.map(d => d.amount), 1)
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date))
  
  return (
    <div className="space-y-4">
      <div className="h-64 flex items-end gap-1 px-2">
        {sortedData.map((item, index) => {
          const height = (item.amount / maxAmount) * 100
          const date = new Date(item.date)
          const dayName = date.toLocaleDateString('hu-HU', { weekday: 'short' })
          
          return (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex justify-center">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs z-10 whitespace-nowrap">
                  <div className="font-medium">{item.date}</div>
                  <div className="text-emerald-400">{formatCurrency(item.amount)}</div>
                  <div className="text-gray-400">{item.orders} rendelés</div>
                </div>
                {/* Bar */}
                <div 
                  className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all hover:from-emerald-500 hover:to-emerald-300 cursor-pointer"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 truncate w-full text-center">
                {data.length <= 7 ? dayName : (index % 2 === 0 ? date.getDate() : '')}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 px-2">
        <span>{sortedData[0]?.date}</span>
        <span>{sortedData[sortedData.length - 1]?.date}</span>
      </div>
    </div>
  )
}

// Category Pie Chart component
function CategoryPieChart({ data }: { data: Array<{ category: string; quantity: number; revenue: number; percentage: number }> }) {
  if (!data || data.length === 0) return null
  
  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 
    'bg-red-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500'
  ]
  
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      {/* Simplified pie visualization */}
      <div className="relative w-48 h-48 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.reduce((acc, item, index) => {
            const startAngle = acc.offset
            const angle = (item.percentage / 100) * 360
            const endAngle = startAngle + angle
            
            const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180)
            const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180)
            const x2 = 50 + 45 * Math.cos((endAngle * Math.PI) / 180)
            const y2 = 50 + 45 * Math.sin((endAngle * Math.PI) / 180)
            const largeArc = angle > 180 ? 1 : 0
            
            acc.elements.push(
              <path
                key={item.category}
                d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                className={colors[index % colors.length].replace('bg-', 'fill-')}
                opacity={0.8}
              />
            )
            acc.offset = endAngle
            return acc
          }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-[#121212] rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{data.length}</div>
              <div className="text-xs text-gray-400">kategória</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex-1 space-y-2 w-full">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.category} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
            <span className="flex-1 text-sm truncate">{item.category}</span>
            <span className="text-sm font-medium">{item.percentage}%</span>
          </div>
        ))}
        {data.length > 6 && (
          <div className="text-xs text-gray-500 pt-2">+{data.length - 6} további kategória</div>
        )}
      </div>
    </div>
  )
}

// Orders by Hour Chart
function HourlyChart({ data }: { data?: Array<{ hour: number; count: number }> }) {
  if (!data || data.length === 0) return null
  
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const found = data.find(d => d.hour === i)
    return { hour: i, count: found?.count || 0 }
  })
  
  return (
    <div className="space-y-2">
      <div className="h-32 flex items-end gap-0.5">
        {hours.map((item) => {
          const height = (item.count / maxCount) * 100
          return (
            <div key={item.hour} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full flex justify-center">
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#1a1a1a] px-2 py-1 rounded text-xs z-10">
                  {item.hour}:00 - {item.count} db
                </div>
                <div 
                  className={`w-full rounded-t-sm transition-all ${
                    item.count > 0 ? 'bg-blue-500 hover:bg-blue-400' : 'bg-white/5'
                  }`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}

// Rating Distribution Chart
function RatingChart({ data }: { data: Array<{ rating: number; count: number }> }) {
  if (!data || data.length === 0) return null
  
  const maxCount = Math.max(...data.map(d => d.count), 1)
  
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(rating => {
        const item = data.find(d => d.rating === rating)
        const count = item?.count || 0
        const width = (count / maxCount) * 100
        
        return (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              {rating} <Star size={14} className="text-yellow-400 fill-yellow-400" />
            </div>
            <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="text-sm w-12 text-right">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
