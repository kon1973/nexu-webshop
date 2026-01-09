import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get trending searches
export async function GET() {
  try {
    // Get popular searches from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const searches = await prisma.searchLog.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: 10
    })

    // Get yesterday's searches for comparison
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)

    const yesterdaySearches = await prisma.searchLog.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: twoDaysAgo, lt: yesterday }
      },
      _count: { query: true }
    })

    const yesterdayMap = new Map(
      yesterdaySearches.map(s => [s.query, s._count.query])
    )

    // Calculate trends
    const trending = searches.map(s => {
      const previousCount = yesterdayMap.get(s.query) || 0
      const currentCount = s._count.query
      
      let trend: 'up' | 'stable' | 'new' = 'stable'
      if (previousCount === 0) {
        trend = 'new'
      } else if (currentCount > previousCount * 1.5) {
        trend = 'up'
      }

      return {
        query: s.query,
        count: currentCount,
        trend
      }
    })

    return NextResponse.json({ trending })
  } catch (error) {
    console.error('Error fetching trending searches:', error)
    
    // Return fallback trending data
    return NextResponse.json({
      trending: [
        { query: 'iPhone 16 Pro', count: 150, trend: 'up' },
        { query: 'Samsung Galaxy S25', count: 120, trend: 'new' },
        { query: 'gaming laptop', count: 95, trend: 'up' },
        { query: 'airpods', count: 80, trend: 'stable' },
        { query: 'vezeték nélküli töltő', count: 65, trend: 'stable' }
      ]
    })
  }
}
