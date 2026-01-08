import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runSeoAudit } from '@/lib/services/seoService'
import { sendAdminEmail } from '@/lib/email-modern'
import { getSettings } from '@/lib/cache'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const result = await runSeoAudit()

    // send brief email to admins if configured
    const settings = await getSettings()
    const adminEmail = process.env.ADMIN_EMAIL || settings.admin_email

    if (adminEmail) {
      try {
        await sendAdminEmail({
          to: adminEmail,
          subject: `SEO Audit: ${result.totalProducts} products — Avg ${result.avgScore}%`,
          html: `<p>Admin-triggered SEO audit finished.</p>
                 <p>Total products: ${result.totalProducts}</p>
                 <p>Average score: ${result.avgScore}%</p>
                 <p>Critical products: ${result.criticalCount}</p>
                 <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/seo">View full report</a></p>`
        })
      } catch (err) {
        console.error('Admin email send failed', err)
      }
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Admin SEO run error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
