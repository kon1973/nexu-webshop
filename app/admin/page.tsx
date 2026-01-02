import { prisma } from '@/lib/prisma'
import AdminDashboardClient from './AdminDashboardClient'

// Helper function to get date ranges
function getDateRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start, end }
}

// Helper function to get previous period
function getPreviousPeriod(days: number) {
  const end = new Date()
  end.setDate(end.getDate() - days)
  const start = new Date()
  start.setDate(start.getDate() - (days * 2))
  return { start, end }
}

// Helper to get today's date range
function getTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// Helper to get yesterday's date range
function getYesterdayRange() {
  const start = new Date()
  start.setDate(start.getDate() - 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setDate(end.getDate() - 1)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export default async function AdminPage() {
  // Date ranges for different periods
  const periods = {
    week: getDateRange(7),
    month: getDateRange(30),
    quarter: getDateRange(90),
    year: getDateRange(365)
  }

  const prevPeriods = {
    week: getPreviousPeriod(7),
    month: getPreviousPeriod(30),
    quarter: getPreviousPeriod(90),
    year: getPreviousPeriod(365)
  }

  const todayRange = getTodayRange()
  const yesterdayRange = getYesterdayRange()

  // Today's stats
  const [todayRevenue, yesterdayRevenue, todayOrders, todayUsers] = await Promise.all([
    prisma.order.aggregate({
      where: { 
        status: { not: 'cancelled' }, 
        createdAt: { gte: todayRange.start, lte: todayRange.end } 
      },
      _sum: { totalPrice: true },
      _count: { id: true }
    }),
    prisma.order.aggregate({
      where: { 
        status: { not: 'cancelled' }, 
        createdAt: { gte: yesterdayRange.start, lte: yesterdayRange.end } 
      },
      _sum: { totalPrice: true },
      _count: { id: true }
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: todayRange.start, lte: todayRange.end } },
      select: { 
        id: true, 
        customerName: true, 
        totalPrice: true, 
        status: true, 
        createdAt: true,
        paymentMethod: true 
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({
      where: { createdAt: { gte: todayRange.start, lte: todayRange.end } }
    })
  ])

  const todaySummary = {
    revenue: todayRevenue._sum.totalPrice || 0,
    orders: todayRevenue._count.id,
    users: todayUsers,
    avgOrderValue: todayRevenue._count.id > 0 
      ? Math.round((todayRevenue._sum.totalPrice || 0) / todayRevenue._count.id) 
      : 0,
    revenueChange: yesterdayRevenue._sum.totalPrice 
      ? Math.round(((todayRevenue._sum.totalPrice || 0) - (yesterdayRevenue._sum.totalPrice || 0)) / (yesterdayRevenue._sum.totalPrice || 1) * 100)
      : 0,
    todayOrders: todayOrders.map(o => ({
      id: o.id,
      customerName: o.customerName,
      totalPrice: o.totalPrice,
      status: o.status,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt.toISOString()
    }))
  }

  // 1. Total Revenue & Orders (all time)
  const totalRevenueAgg = await prisma.order.aggregate({
    where: { status: { not: 'cancelled' } },
    _sum: { totalPrice: true },
    _count: { id: true },
  })
  const totalRevenue = totalRevenueAgg._sum.totalPrice || 0
  const totalOrders = totalRevenueAgg._count.id

  // 2. Revenue by period
  const [weekRevenue, monthRevenue, quarterRevenue, yearRevenue] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: 'cancelled' }, createdAt: { gte: periods.week.start } },
      _sum: { totalPrice: true },
      _count: { id: true }
    }),
    prisma.order.aggregate({
      where: { status: { not: 'cancelled' }, createdAt: { gte: periods.month.start } },
      _sum: { totalPrice: true },
      _count: { id: true }
    }),
    prisma.order.aggregate({
      where: { status: { not: 'cancelled' }, createdAt: { gte: periods.quarter.start } },
      _sum: { totalPrice: true },
      _count: { id: true }
    }),
    prisma.order.aggregate({
      where: { status: { not: 'cancelled' }, createdAt: { gte: periods.year.start } },
      _sum: { totalPrice: true },
      _count: { id: true }
    })
  ])

  // 3. Previous period revenue for comparison
  const [prevWeekRevenue, prevMonthRevenue, prevQuarterRevenue] = await Promise.all([
    prisma.order.aggregate({
      where: { 
        status: { not: 'cancelled' }, 
        createdAt: { gte: prevPeriods.week.start, lt: prevPeriods.week.end } 
      },
      _sum: { totalPrice: true },
      _count: { id: true }
    }),
    prisma.order.aggregate({
      where: { 
        status: { not: 'cancelled' }, 
        createdAt: { gte: prevPeriods.month.start, lt: prevPeriods.month.end } 
      },
      _sum: { totalPrice: true },
      _count: { id: true }
    }),
    prisma.order.aggregate({
      where: { 
        status: { not: 'cancelled' }, 
        createdAt: { gte: prevPeriods.quarter.start, lt: prevPeriods.quarter.end } 
      },
      _sum: { totalPrice: true },
      _count: { id: true }
    })
  ])

  // Calculate changes
  const calcChange = (current: number, previous: number) => 
    previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0

  const revenueByPeriod = {
    week: {
      revenue: weekRevenue._sum.totalPrice || 0,
      orders: weekRevenue._count.id,
      change: calcChange(weekRevenue._sum.totalPrice || 0, prevWeekRevenue._sum.totalPrice || 0),
      ordersChange: calcChange(weekRevenue._count.id, prevWeekRevenue._count.id)
    },
    month: {
      revenue: monthRevenue._sum.totalPrice || 0,
      orders: monthRevenue._count.id,
      change: calcChange(monthRevenue._sum.totalPrice || 0, prevMonthRevenue._sum.totalPrice || 0),
      ordersChange: calcChange(monthRevenue._count.id, prevMonthRevenue._count.id)
    },
    quarter: {
      revenue: quarterRevenue._sum.totalPrice || 0,
      orders: quarterRevenue._count.id,
      change: calcChange(quarterRevenue._sum.totalPrice || 0, prevQuarterRevenue._sum.totalPrice || 0),
      ordersChange: calcChange(quarterRevenue._count.id, prevQuarterRevenue._count.id)
    },
    year: {
      revenue: yearRevenue._sum.totalPrice || 0,
      orders: yearRevenue._count.id,
      change: 0,
      ordersChange: 0
    }
  }

  // 4. Pending Orders
  const pendingOrders = await prisma.order.count({
    where: { status: { in: ['pending', 'paid'] } },
  })

  // 5. Recent Orders (Limit to 10) - exclude cancelled
  const recentOrders = await prisma.order.findMany({
    take: 10,
    where: { status: { not: 'cancelled' } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  })

  // 6. Low Stock
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lt: 5 } },
    orderBy: { stock: 'asc' },
    take: 8,
  })

  // 7. Recent Reviews
  const recentReviews = await prisma.review.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: true },
  })

  // 8. Daily chart data for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const dailyOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ['pending', 'paid', 'shipped', 'completed'] }
    },
    select: { createdAt: true, totalPrice: true }
  })

  // Generate daily data for 30 days
  const dailySalesMap = new Map<string, { revenue: number; orders: number }>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    dailySalesMap.set(dateStr, { revenue: 0, orders: 0 })
  }

  dailyOrders.forEach((order) => {
    const dateStr = new Date(order.createdAt).toISOString().split('T')[0]
    if (dailySalesMap.has(dateStr)) {
      const current = dailySalesMap.get(dateStr)!
      dailySalesMap.set(dateStr, { 
        revenue: current.revenue + order.totalPrice, 
        orders: current.orders + 1 
      })
    }
  })

  const dailyChartData = Array.from(dailySalesMap.entries()).map(([date, data]) => ({
    date,
    label: new Date(date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
    revenue: data.revenue,
    orders: data.orders
  }))

  // 9. Weekly chart data for last 12 weeks
  const weeklyChartData: Array<{ week: string; revenue: number; orders: number }> = []
  for (let i = 11; i >= 0; i--) {
    const weekEnd = new Date()
    weekEnd.setDate(weekEnd.getDate() - (i * 7))
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 7)
    
    const weekOrders = dailyOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= weekStart && orderDate < weekEnd
    })
    
    weeklyChartData.push({
      week: `${weekStart.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}`,
      revenue: weekOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      orders: weekOrders.length
    })
  }

  // 10. Monthly chart data for last 12 months
  const yearAgo = new Date()
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  const monthlyOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: yearAgo },
      status: { in: ['pending', 'paid', 'shipped', 'completed'] }
    },
    select: { createdAt: true, totalPrice: true }
  })

  const monthlyChartData: Array<{ month: string; revenue: number; orders: number }> = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthStr = d.toLocaleDateString('hu-HU', { year: '2-digit', month: 'short' })
    const monthOrders = monthlyOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear()
    })
    monthlyChartData.push({
      month: monthStr,
      revenue: monthOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      orders: monthOrders.length
    })
  }

  // 11. Top Products
  const topSellingItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { order: { status: { not: 'cancelled' } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  })

  const productIds = topSellingItems
    .map((item) => item.productId)
    .filter((id): id is number => id !== null)

  const productsInfo = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, category: true }
  })

  const topProducts = topSellingItems.map((item) => {
    const product = productsInfo.find((p) => p.id === item.productId)
    return { 
      name: product?.name || 'Ismeretlen', 
      count: item._sum.quantity || 0,
      revenue: (product?.price || 0) * (item._sum.quantity || 0),
      category: product?.category || 'Egyéb'
    }
  })

  // 12. User Stats by period
  const [totalUsers, weekUsers, monthUsers, quarterUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: periods.week.start } } }),
    prisma.user.count({ where: { createdAt: { gte: periods.month.start } } }),
    prisma.user.count({ where: { createdAt: { gte: periods.quarter.start } } })
  ])

  const [prevWeekUsers, prevMonthUsers] = await Promise.all([
    prisma.user.count({ 
      where: { createdAt: { gte: prevPeriods.week.start, lt: prevPeriods.week.end } } 
    }),
    prisma.user.count({ 
      where: { createdAt: { gte: prevPeriods.month.start, lt: prevPeriods.month.end } } 
    })
  ])

  const usersByPeriod = {
    total: totalUsers,
    week: { count: weekUsers, change: calcChange(weekUsers, prevWeekUsers) },
    month: { count: monthUsers, change: calcChange(monthUsers, prevMonthUsers) },
    quarter: { count: quarterUsers, change: 0 }
  }

  // 13. Order Status Distribution - exclude cancelled from chart
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    where: { status: { not: 'cancelled' } },
    _count: { id: true },
  })

  const orderStatusData = ordersByStatus.map((item) => ({
    status: item.status,
    count: item._count.id
  }))

  // 14. Revenue by category
  const orderItemsWithCategory = await prisma.orderItem.findMany({
    where: { order: { status: { not: 'cancelled' } } },
    include: { product: { select: { category: true } } }
  })

  const categoryRevenueMap = new Map<string, number>()
  orderItemsWithCategory.forEach(item => {
    const category = item.product?.category || 'Egyéb'
    const current = categoryRevenueMap.get(category) || 0
    categoryRevenueMap.set(category, current + (item.price * item.quantity))
  })

  const revenueByCategory = Array.from(categoryRevenueMap.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  // 15. Average Order Value by period
  const avgOrderByPeriod = {
    week: revenueByPeriod.week.orders > 0 
      ? Math.round(revenueByPeriod.week.revenue / revenueByPeriod.week.orders) : 0,
    month: revenueByPeriod.month.orders > 0 
      ? Math.round(revenueByPeriod.month.revenue / revenueByPeriod.month.orders) : 0,
    quarter: revenueByPeriod.quarter.orders > 0 
      ? Math.round(revenueByPeriod.quarter.revenue / revenueByPeriod.quarter.orders) : 0,
    year: revenueByPeriod.year.orders > 0 
      ? Math.round(revenueByPeriod.year.revenue / revenueByPeriod.year.orders) : 0,
    total: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  }

  // 16. Hourly distribution (orders by hour of day) - exclude cancelled
  const allOrders = await prisma.order.findMany({
    where: { 
      createdAt: { gte: periods.month.start },
      status: { not: 'cancelled' }
    },
    select: { createdAt: true }
  })

  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    orders: allOrders.filter(o => new Date(o.createdAt).getHours() === hour).length
  }))

  // 17. Day of week distribution
  const dayOfWeekNames = ['Vas', 'Hét', 'Kedd', 'Szer', 'Csüt', 'Pén', 'Szom']
  const dayOfWeekDistribution = dayOfWeekNames.map((name, index) => ({
    day: name,
    orders: allOrders.filter(o => new Date(o.createdAt).getDay() === index).length
  }))

  // 18. Conversion funnel (simplified)
  const totalVisitors = totalUsers * 5 // Approximate visitors based on users
  const cartAbandonment = Math.round(totalOrders * 0.3) // Approximate abandoned carts
  const conversionRate = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(1) : '0'

  // 19. Review stats
  const reviewStats = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { id: true }
  })

  const reviewsByRating = await prisma.review.groupBy({
    by: ['rating'],
    _count: { id: true }
  })

  // 20. Activities for feed - only show non-cancelled orders
  const activities = [
    ...recentOrders.filter(o => o.status !== 'cancelled').slice(0, 5).map(order => ({
      id: `order-${order.id}`,
      type: 'order' as const,
      title: `Új rendelés: ${order.customerName}`,
      description: `${order.totalPrice.toLocaleString('hu-HU')} Ft értékben`,
      timestamp: order.createdAt.toISOString(),
      href: `/admin/orders/${order.id}`
    })),
    ...recentReviews.slice(0, 3).map(review => ({
      id: `review-${review.id}`,
      type: 'review' as const,
      title: `Új értékelés: ${review.userName}`,
      description: `${review.rating}★ - ${review.product.name}`,
      timestamp: review.createdAt.toISOString(),
      href: `/admin/reviews`
    })),
    ...lowStockProducts.slice(0, 3).map(product => ({
      id: `stock-${product.id}`,
      type: 'stock' as const,
      title: `Alacsony készlet: ${product.name}`,
      description: `Már csak ${product.stock} db maradt`,
      timestamp: new Date().toISOString(),
      href: `/admin/edit-product/${product.id}`
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // 21. KPI Goals - read from database settings
  const kpiSettings = await prisma.setting.findMany({
    where: { key: { startsWith: 'kpi_' } }
  })
  const kpiMap = kpiSettings.reduce((acc, s) => {
    acc[s.key] = parseFloat(s.value) || 0
    return acc
  }, {} as Record<string, number>)

  const kpiGoals = {
    dailyRevenue: kpiMap.kpi_daily_revenue || 100000,
    dailyOrders: kpiMap.kpi_daily_orders || 10,
    weeklyRevenue: kpiMap.kpi_weekly_revenue || 500000,
    weeklyOrders: kpiMap.kpi_weekly_orders || 50,
    monthlyRevenue: kpiMap.kpi_monthly_revenue || 2000000,
    monthlyOrders: kpiMap.kpi_monthly_orders || 200,
    conversionRate: kpiMap.kpi_conversion_rate || 3.0,
    avgOrderValue: kpiMap.kpi_avg_order_value || 30000
  }

  // 22. Payment method breakdown
  const paymentMethodBreakdown = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where: { 
      status: { not: 'cancelled' },
      createdAt: { gte: periods.month.start }
    },
    _count: { id: true },
    _sum: { totalPrice: true }
  })

  const paymentMethods = paymentMethodBreakdown.map(pm => ({
    method: pm.paymentMethod || 'unknown',
    count: pm._count.id,
    revenue: pm._sum.totalPrice || 0
  }))

  return (
    <AdminDashboardClient
      stats={{
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalUsers,
        newUsers: weekUsers,
        avgOrderValue: avgOrderByPeriod.total,
        revenueChange: revenueByPeriod.month.change,
        ordersChange: revenueByPeriod.month.ordersChange,
        usersChange: usersByPeriod.week.change
      }}
      todaySummary={todaySummary}
      kpiGoals={kpiGoals}
      paymentMethods={paymentMethods}
      revenueByPeriod={revenueByPeriod}
      usersByPeriod={usersByPeriod}
      avgOrderByPeriod={avgOrderByPeriod}
      dailyChartData={dailyChartData}
      weeklyChartData={weeklyChartData}
      monthlyChartData={monthlyChartData}
      orderStatusData={orderStatusData}
      topProducts={topProducts}
      revenueByCategory={revenueByCategory}
      hourlyDistribution={hourlyDistribution}
      dayOfWeekDistribution={dayOfWeekDistribution}
      conversionStats={{
        visitors: totalVisitors,
        cartAbandonment,
        conversionRate: parseFloat(conversionRate)
      }}
      reviewStats={{
        avgRating: reviewStats._avg.rating || 0,
        totalReviews: reviewStats._count.id,
        byRating: reviewsByRating.map(r => ({ rating: r.rating, count: r._count.id }))
      }}
      lowStockProducts={lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        image: p.image
      }))}
      recentReviews={recentReviews.map(r => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        userName: r.userName,
        productName: r.product.name,
        createdAt: r.createdAt.toISOString()
      }))}
      recentOrders={recentOrders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerAddress: order.customerAddress,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          productName: item.product?.name || 'Ismeretlen',
          productImage: item.product?.image || '📦'
        }))
      }))}
      activities={activities}
    />
  )
}

