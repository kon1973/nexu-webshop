import { NextResponse } from 'next/server'
import { cleanupPendingOrdersService } from '@/lib/services/cronService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const result = await cleanupPendingOrdersService()

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Cleanup orders cron error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
