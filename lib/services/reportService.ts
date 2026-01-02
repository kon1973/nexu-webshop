import 'server-only'
import { prisma } from '@/lib/prisma'

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface ReportData {
  period: ReportPeriod
  startDate: Date
  endDate: Date
  generatedAt: Date
  
  // Bevételek
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
  
  // Rendelések
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
  
  // Termékek
  products: {
    totalSold: number
    uniqueProductsSold: number
    topSelling: Array<{ 
      id: number
      name: string 
      quantity: number 
      revenue: number 
      category: string
    }>
    worstSelling: Array<{ 
      id: number
      name: string 
      quantity: number 
      revenue: number 
    }>
    byCategory: Array<{ 
      category: string 
      quantity: number 
      revenue: number 
      percentage: number
    }>
    lowStock: Array<{ id: number; name: string; stock: number }>
    outOfStock: number
    averagePrice: number
  }
  
  // Felhasználók
  users: {
    total: number
    new: number
    previousPeriodNew: number
    change: number
    active: number // ordered in period
    returning: number // ordered before and in period
    topSpenders: Array<{
      id: string
      name: string
      email: string
      spent: number
      orders: number
    }>
    byRegistrationSource?: Array<{ source: string; count: number }>
  }
  
  // Kuponok
  coupons: {
    totalUsed: number
    totalDiscount: number
    mostUsed: Array<{
      code: string
      usedCount: number
      totalDiscount: number
    }>
    conversionRate: number
  }
  
  // Vélemények
  reviews: {
    total: number
    approved: number
    pending: number
    rejected: number
    averageRating: number
    ratingDistribution: Array<{ rating: number; count: number }>
  }
  
  // Hírlevél
  newsletter: {
    totalSubscribers: number
    newSubscribers: number
    unsubscribed: number
  }
  
  // Kosár analitika
  cart: {
    abandonedCarts: number
    abandonedValue: number
    averageCartValue: number
    averageItemsPerCart: number
  }
  
  // Készlet
  inventory: {
    totalProducts: number
    totalStock: number
    averageStock: number
    stockValue: number
    lowStockCount: number
    outOfStockCount: number
  }
  
  // Készletváltozások termékenként
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
  
  // Konverziók (ha elérhető)
  conversions?: {
    visitToCart: number
    cartToCheckout: number
    checkoutToOrder: number
    overall: number
  }
}

function getDateRange(period: ReportPeriod, referenceDate?: Date): { start: Date; end: Date } {
  const end = referenceDate ? new Date(referenceDate) : new Date()
  end.setHours(23, 59, 59, 999)
  
  const start = new Date(end)
  
  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0)
      break
    case 'weekly':
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'monthly':
      start.setMonth(start.getMonth() - 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'yearly':
      start.setFullYear(start.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
      break
  }
  
  return { start, end }
}

function getPreviousDateRange(period: ReportPeriod, currentRange: { start: Date; end: Date }): { start: Date; end: Date } {
  const duration = currentRange.end.getTime() - currentRange.start.getTime()
  const end = new Date(currentRange.start.getTime() - 1)
  const start = new Date(end.getTime() - duration)
  return { start, end }
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export async function generateReport(period: ReportPeriod, referenceDate?: Date): Promise<ReportData> {
  const dateRange = getDateRange(period, referenceDate)
  const prevDateRange = getPreviousDateRange(period, dateRange)
  
  // ============= RENDELÉSEK =============
  const [orders, prevOrders, cancelledOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        status: { not: 'cancelled' }
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, category: true } }
          }
        }
      }
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: prevDateRange.start, lte: prevDateRange.end },
        status: { not: 'cancelled' }
      },
      _count: { id: true },
      _sum: { totalPrice: true }
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        status: 'cancelled'
      },
      _count: { id: true },
      _sum: { totalPrice: true }
    })
  ])

  // Revenue calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const totalDiscounts = orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0)
  const totalLoyaltyDiscounts = orders.reduce((sum, o) => sum + (o.loyaltyDiscount || 0), 0)
  
  // Revenue by payment method
  const revenueByPaymentMethod = orders.reduce((acc, o) => {
    const method = o.paymentMethod || 'unknown'
    if (!acc[method]) acc[method] = { amount: 0, count: 0 }
    acc[method].amount += o.totalPrice
    acc[method].count += 1
    return acc
  }, {} as Record<string, { amount: number; count: number }>)
  
  // Revenue by day
  const revenueByDay = orders.reduce((acc, o) => {
    const date = o.createdAt.toISOString().split('T')[0]
    if (!acc[date]) acc[date] = { amount: 0, orders: 0 }
    acc[date].amount += o.totalPrice
    acc[date].orders += 1
    return acc
  }, {} as Record<string, { amount: number; orders: number }>)
  
  // Order values for statistics
  const orderValues = orders.map(o => o.totalPrice).sort((a, b) => a - b)
  const medianValue = orderValues.length > 0 
    ? orderValues[Math.floor(orderValues.length / 2)] 
    : 0
    
  // Orders by status
  const allOrdersWithStatus = await prisma.order.groupBy({
    by: ['status'],
    where: { createdAt: { gte: dateRange.start, lte: dateRange.end } },
    _count: { id: true }
  })
  
  // Orders by hour
  const ordersByHour = orders.reduce((acc, o) => {
    const hour = o.createdAt.getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)
  
  // Orders by day of week
  const dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']
  const ordersByDayOfWeek = orders.reduce((acc, o) => {
    const day = dayNames[o.createdAt.getDay()]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // ============= TERMÉKEK =============
  const productSales = orders.flatMap(o => o.items).reduce((acc, item) => {
    const productId = item.productId || 0
    const productName = item.product?.name || item.name || 'Ismeretlen'
    const category = item.product?.category || 'Egyéb'
    
    if (!acc[productId]) {
      acc[productId] = { 
        id: productId, 
        name: productName, 
        quantity: 0, 
        revenue: 0,
        category 
      }
    }
    acc[productId].quantity += item.quantity
    acc[productId].revenue += item.price * item.quantity
    return acc
  }, {} as Record<number, { id: number; name: string; quantity: number; revenue: number; category: string }>)
  
  const productSalesArray = Object.values(productSales)
  const topSelling = [...productSalesArray]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
  const worstSelling = [...productSalesArray]
    .filter(p => p.quantity > 0)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 10)
    
  // Sales by category
  const salesByCategory = productSalesArray.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = { quantity: 0, revenue: 0 }
    acc[p.category].quantity += p.quantity
    acc[p.category].revenue += p.revenue
    return acc
  }, {} as Record<string, { quantity: number; revenue: number }>)
  
  const totalCategoryRevenue = Object.values(salesByCategory).reduce((sum, c) => sum + c.revenue, 0)
  
  // Low stock products
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 5 }, isArchived: false },
    select: { id: true, name: true, stock: true },
    orderBy: { stock: 'asc' },
    take: 20
  })
  
  const outOfStockCount = await prisma.product.count({
    where: { stock: 0, isArchived: false }
  })
  
  // ============= FELHASZNÁLÓK =============
  const [totalUsers, newUsers, prevNewUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: dateRange.start, lte: dateRange.end } }
    }),
    prisma.user.count({
      where: { createdAt: { gte: prevDateRange.start, lte: prevDateRange.end } }
    })
  ])
  
  // Active users (ordered in this period)
  const activeUserIds = new Set(orders.filter(o => o.userId).map(o => o.userId!))
  
  // Top spenders
  const userSpending = orders.reduce((acc, o) => {
    if (!o.userId) return acc
    if (!acc[o.userId]) acc[o.userId] = { spent: 0, orders: 0 }
    acc[o.userId].spent += o.totalPrice
    acc[o.userId].orders += 1
    return acc
  }, {} as Record<string, { spent: number; orders: number }>)
  
  const topSpenderIds = Object.entries(userSpending)
    .sort((a, b) => b[1].spent - a[1].spent)
    .slice(0, 10)
    .map(([id]) => id)
    
  const topSpenderUsers = await prisma.user.findMany({
    where: { id: { in: topSpenderIds } },
    select: { id: true, name: true, email: true }
  })
  
  // ============= KUPONOK =============
  const ordersWithCoupons = orders.filter(o => o.couponCode)
  const couponUsage = ordersWithCoupons.reduce((acc, o) => {
    const code = o.couponCode!
    if (!acc[code]) acc[code] = { usedCount: 0, totalDiscount: 0 }
    acc[code].usedCount += 1
    acc[code].totalDiscount += o.discountAmount || 0
    return acc
  }, {} as Record<string, { usedCount: number; totalDiscount: number }>)
  
  // ============= VÉLEMÉNYEK =============
  const [reviewStats, ratingDistribution] = await Promise.all([
    prisma.review.groupBy({
      by: ['status'],
      where: { createdAt: { gte: dateRange.start, lte: dateRange.end } },
      _count: { id: true }
    }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { 
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        status: 'approved'
      },
      _count: { id: true }
    })
  ])
  
  const avgRating = await prisma.review.aggregate({
    where: { 
      createdAt: { gte: dateRange.start, lte: dateRange.end },
      status: 'approved'
    },
    _avg: { rating: true }
  })
  
  // ============= HÍRLEVÉL =============
  const [totalSubscribers, newSubscribers] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.newsletterSubscriber.count({
      where: { 
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        isActive: true 
      }
    })
  ])
  
  // ============= KOSÁR ANALITIKA =============
  const abandonedCarts = await prisma.cart.findMany({
    where: {
      updatedAt: { gte: dateRange.start, lte: dateRange.end }
    },
    include: {
      items: {
        include: { product: { select: { price: true, salePrice: true } } }
      }
    }
  })
  
  // Filter carts that have items but no corresponding order
  const cartsWithValue = abandonedCarts.filter(c => c.items.length > 0)
  const abandonedValue = cartsWithValue.reduce((sum, cart) => {
    return sum + cart.items.reduce((itemSum, item) => {
      const price = item.product.salePrice || item.product.price
      return itemSum + (price * item.quantity)
    }, 0)
  }, 0)
  
  // ============= KÉSZLET =============
  const inventoryStats = await prisma.product.aggregate({
    where: { isArchived: false },
    _count: { id: true },
    _sum: { stock: true, price: true },
    _avg: { stock: true }
  })
  
  const stockValue = await prisma.product.findMany({
    where: { isArchived: false },
    select: { stock: true, price: true, salePrice: true }
  })
  
  const totalStockValue = stockValue.reduce((sum, p) => {
    return sum + ((p.salePrice || p.price) * p.stock)
  }, 0)
  
  // ============= KÉSZLETVÁLTOZÁSOK =============
  // Get all inventory logs for the period
  const inventoryLogs = await prisma.inventoryLog.findMany({
    where: {
      createdAt: { gte: dateRange.start, lte: dateRange.end }
    },
    include: {
      product: { select: { id: true, name: true, category: true, stock: true } },
      variant: { select: { id: true, attributes: true, stock: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  // Get all products with variants for complete picture
  const productsWithVariants = await prisma.product.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      name: true,
      category: true,
      stock: true,
      variants: {
        select: {
          id: true,
          attributes: true,
          stock: true
        }
      }
    }
  })
  
  // Aggregate stock changes by product and variant
  const stockChangesByProduct = new Map<number, {
    productId: number
    productName: string
    category: string
    currentStock: number
    totalChange: number
    ordersSold: number
    restocked: number
    manualAdjustments: number
    variants: Map<string, {
      variantId: string
      attributes: Record<string, string>
      currentStock: number
      totalChange: number
      ordersSold: number
      restocked: number
    }>
  }>()
  
  // Initialize with all products
  for (const product of productsWithVariants) {
    const variantsMap = new Map<string, {
      variantId: string
      attributes: Record<string, string>
      currentStock: number
      totalChange: number
      ordersSold: number
      restocked: number
    }>()
    
    for (const variant of product.variants) {
      variantsMap.set(variant.id, {
        variantId: variant.id,
        attributes: variant.attributes as Record<string, string>,
        currentStock: variant.stock,
        totalChange: 0,
        ordersSold: 0,
        restocked: 0
      })
    }
    
    stockChangesByProduct.set(product.id, {
      productId: product.id,
      productName: product.name,
      category: product.category,
      currentStock: product.stock,
      totalChange: 0,
      ordersSold: 0,
      restocked: 0,
      manualAdjustments: 0,
      variants: variantsMap
    })
  }
  
  // Process inventory logs
  for (const log of inventoryLogs) {
    const productData = stockChangesByProduct.get(log.productId)
    if (!productData) continue
    
    productData.totalChange += log.change
    
    if (log.reason === 'ORDER_PLACED' || log.reason === 'SALE') {
      productData.ordersSold += Math.abs(log.change)
    } else if (log.reason === 'RESTOCK') {
      productData.restocked += log.change
    } else if (log.reason === 'MANUAL_ADJUSTMENT') {
      productData.manualAdjustments += log.change
    } else if (log.reason === 'ORDER_CANCELLED') {
      productData.restocked += log.change // Cancelled orders return stock
    }
    
    // Process variant if exists
    if (log.variantId) {
      const variantData = productData.variants.get(log.variantId)
      if (variantData) {
        variantData.totalChange += log.change
        if (log.reason === 'ORDER_PLACED' || log.reason === 'SALE') {
          variantData.ordersSold += Math.abs(log.change)
        } else if (log.reason === 'RESTOCK' || log.reason === 'ORDER_CANCELLED') {
          variantData.restocked += log.change
        }
      }
    }
  }
  
  // Convert to array and calculate start stock
  const stockChangesArray = Array.from(stockChangesByProduct.values())
    .map(p => ({
      productId: p.productId,
      productName: p.productName,
      category: p.category,
      currentStock: p.currentStock,
      startStock: p.currentStock - p.totalChange,
      totalChange: p.totalChange,
      ordersSold: p.ordersSold,
      restocked: p.restocked,
      manualAdjustments: p.manualAdjustments,
      variants: Array.from(p.variants.values()).map(v => ({
        variantId: v.variantId,
        attributes: v.attributes,
        currentStock: v.currentStock,
        totalChange: v.totalChange,
        ordersSold: v.ordersSold,
        restocked: v.restocked
      }))
    }))
    .filter(p => p.totalChange !== 0 || p.variants.some(v => v.totalChange !== 0))
    .sort((a, b) => Math.abs(b.totalChange) - Math.abs(a.totalChange))
  
  // ============= ÖSSZEÁLLÍTÁS =============
  return {
    period,
    startDate: dateRange.start,
    endDate: dateRange.end,
    generatedAt: new Date(),
    
    revenue: {
      total: totalRevenue,
      previousPeriod: prevOrders._sum.totalPrice || 0,
      change: calculateChange(totalRevenue, prevOrders._sum.totalPrice || 0),
      byPaymentMethod: Object.entries(revenueByPaymentMethod).map(([method, data]) => ({
        method,
        amount: data.amount,
        count: data.count
      })),
      byDay: Object.entries(revenueByDay)
        .map(([date, data]) => ({ date, amount: data.amount, orders: data.orders }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      gross: totalRevenue + totalDiscounts + totalLoyaltyDiscounts,
      discounts: totalDiscounts,
      loyaltyDiscounts: totalLoyaltyDiscounts,
      net: totalRevenue
    },
    
    orders: {
      total: orders.length,
      previousPeriod: prevOrders._count.id || 0,
      change: calculateChange(orders.length, prevOrders._count.id || 0),
      byStatus: allOrdersWithStatus.map(s => ({ status: s.status, count: s._count.id })),
      averageValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
      medianValue,
      maxValue: orderValues.length > 0 ? orderValues[orderValues.length - 1] : 0,
      minValue: orderValues.length > 0 ? orderValues[0] : 0,
      cancelled: cancelledOrders._count.id || 0,
      cancelledValue: cancelledOrders._sum.totalPrice || 0,
      completedRate: orders.length > 0 
        ? Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100) 
        : 0,
      byHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: ordersByHour[i] || 0
      })),
      byDayOfWeek: dayNames.map(day => ({
        day,
        count: ordersByDayOfWeek[day] || 0
      }))
    },
    
    products: {
      totalSold: productSalesArray.reduce((sum, p) => sum + p.quantity, 0),
      uniqueProductsSold: productSalesArray.length,
      topSelling,
      worstSelling,
      byCategory: Object.entries(salesByCategory).map(([category, data]) => ({
        category,
        quantity: data.quantity,
        revenue: data.revenue,
        percentage: totalCategoryRevenue > 0 
          ? Math.round((data.revenue / totalCategoryRevenue) * 100) 
          : 0
      })).sort((a, b) => b.revenue - a.revenue),
      lowStock: lowStockProducts,
      outOfStock: outOfStockCount,
      averagePrice: productSalesArray.length > 0
        ? Math.round(productSalesArray.reduce((sum, p) => sum + (p.revenue / p.quantity), 0) / productSalesArray.length)
        : 0
    },
    
    users: {
      total: totalUsers,
      new: newUsers,
      previousPeriodNew: prevNewUsers,
      change: calculateChange(newUsers, prevNewUsers),
      active: activeUserIds.size,
      returning: 0, // Would need more complex query
      topSpenders: topSpenderIds.map(id => {
        const user = topSpenderUsers.find(u => u.id === id)
        const stats = userSpending[id]
        return {
          id,
          name: user?.name || 'N/A',
          email: user?.email || 'N/A',
          spent: stats.spent,
          orders: stats.orders
        }
      })
    },
    
    coupons: {
      totalUsed: ordersWithCoupons.length,
      totalDiscount: totalDiscounts,
      mostUsed: Object.entries(couponUsage)
        .map(([code, data]) => ({ code, ...data }))
        .sort((a, b) => b.usedCount - a.usedCount)
        .slice(0, 10),
      conversionRate: orders.length > 0 
        ? Math.round((ordersWithCoupons.length / orders.length) * 100) 
        : 0
    },
    
    reviews: {
      total: reviewStats.reduce((sum, r) => sum + r._count.id, 0),
      approved: reviewStats.find(r => r.status === 'approved')?._count.id || 0,
      pending: reviewStats.find(r => r.status === 'pending')?._count.id || 0,
      rejected: reviewStats.find(r => r.status === 'rejected')?._count.id || 0,
      averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
      ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: ratingDistribution.find(r => r.rating === rating)?._count.id || 0
      }))
    },
    
    newsletter: {
      totalSubscribers,
      newSubscribers,
      unsubscribed: 0 // Would need to track unsubscribes
    },
    
    cart: {
      abandonedCarts: cartsWithValue.length,
      abandonedValue,
      averageCartValue: cartsWithValue.length > 0 
        ? Math.round(abandonedValue / cartsWithValue.length) 
        : 0,
      averageItemsPerCart: cartsWithValue.length > 0
        ? Math.round(cartsWithValue.reduce((sum, c) => sum + c.items.length, 0) / cartsWithValue.length)
        : 0
    },
    
    inventory: {
      totalProducts: inventoryStats._count.id || 0,
      totalStock: inventoryStats._sum.stock || 0,
      averageStock: Math.round(inventoryStats._avg.stock || 0),
      stockValue: totalStockValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount
    },
    
    stockChanges: stockChangesArray
  }
}

// Export formatted report for display
export function formatCurrency(value: number): string {
  return value.toLocaleString('hu-HU') + ' Ft'
}

export function formatPercent(value: number): string {
  return value + '%'
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getPeriodLabel(period: ReportPeriod): string {
  switch (period) {
    case 'daily': return 'Napi'
    case 'weekly': return 'Heti'
    case 'monthly': return 'Havi'
    case 'yearly': return 'Éves'
  }
}
