import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    
    // Calculate date range
    const days = range === '90d' ? 90 : range === '30d' ? 30 : 7
    const startDate = startOfDay(subDays(new Date(), days))

    // Get AI chat logs from database (if we have a model for it)
    // For now, return mock data that simulates real stats
    
    // In a real implementation, you would have an AIChatLog model:
    // const logs = await prisma.aIChatLog.findMany({
    //   where: {
    //     createdAt: { gte: startDate }
    //   }
    // })

    // Generate realistic mock data based on range
    const baseConversations = days === 7 ? 150 : days === 30 ? 600 : 1800
    const variance = Math.random() * 0.2 - 0.1 // ±10%
    
    const stats = {
      totalConversations: Math.round(baseConversations * (1 + variance)),
      totalMessages: Math.round(baseConversations * 7.2 * (1 + variance)),
      avgMessagesPerConversation: 7.2 + Math.random() * 0.5,
      topQueries: [
        { query: 'telefon', count: Math.round(50 + Math.random() * 20) * (days / 7) },
        { query: 'laptop', count: Math.round(35 + Math.random() * 15) * (days / 7) },
        { query: 'szállítás', count: Math.round(25 + Math.random() * 10) * (days / 7) },
        { query: 'rendelés', count: Math.round(20 + Math.random() * 10) * (days / 7) },
        { query: 'gaming', count: Math.round(18 + Math.random() * 8) * (days / 7) }
      ].map(q => ({ ...q, count: Math.round(q.count) })),
      productSearches: Math.round(baseConversations * 1.8 * (1 + variance)),
      orderLookups: Math.round(baseConversations * 0.4 * (1 + variance)),
      cartAdditions: Math.round(baseConversations * 0.3 * (1 + variance)),
      conversionRate: 15 + Math.random() * 5
    }

    // Generate daily stats
    const dailyStats = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayVariance = Math.random() * 0.4 - 0.2
      dailyStats.push({
        date: format(date, 'yyyy-MM-dd'),
        conversations: Math.round((baseConversations / days) * (1 + dayVariance)),
        messages: Math.round((baseConversations * 7.2 / days) * (1 + dayVariance))
      })
    }

    return NextResponse.json({
      success: true,
      stats,
      dailyStats
    })
  } catch (error) {
    console.error('AI stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI stats' },
      { status: 500 }
    )
  }
}
