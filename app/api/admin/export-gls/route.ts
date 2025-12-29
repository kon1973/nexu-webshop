import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { exportGLSService } from '@/lib/services/exportService'

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const csvContent = await exportGLSService()

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="gls-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
