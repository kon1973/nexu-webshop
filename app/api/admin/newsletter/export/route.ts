import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { exportSubscribersService } from '@/lib/services/newsletterService'

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const csvData = await exportSubscribersService()

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Newsletter export error:', error)
    return NextResponse.json(
      { error: 'Hiba történt az exportálás során' },
      { status: 500 }
    )
  }
}

