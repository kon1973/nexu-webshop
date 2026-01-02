import { NextResponse } from 'next/server'
import { checkPriceDrops } from '@/lib/services/alertService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const result = await checkPriceDrops()

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Price drop cron error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
