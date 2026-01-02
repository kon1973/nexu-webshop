import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateReport, ReportPeriod } from '@/lib/services/reportService'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = (searchParams.get('period') || 'monthly') as ReportPeriod
    const dateStr = searchParams.get('date')
    
    // Validate period
    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Use: daily, weekly, monthly, yearly' }, 
        { status: 400 }
      )
    }
    
    const referenceDate = dateStr ? new Date(dateStr) : undefined
    
    const report = await generateReport(period, referenceDate)
    
    return NextResponse.json(report)
  } catch (error) {
    console.error('[REPORTS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to generate report' }, 
      { status: 500 }
    )
  }
}
