import { NextResponse } from 'next/server'
import { runSeoAudit } from '@/lib/services/seoService'
import { sendAdminEmail } from '@/lib/email-modern'
import { getSettings } from '@/lib/cache'

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret') || req.headers.get('x-cron-secret')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runSeoAudit()

  // Send brief email to admins
  const settings = await getSettings()
  const adminEmail = process.env.ADMIN_EMAIL || settings.admin_email

  if (adminEmail) {
    try {
      await sendAdminEmail({
        to: adminEmail,
        subject: `SEO Audit: ${result.totalProducts} products — Avg ${result.avgScore}%`,
        html: `<p>SEO audit finished.</p>
               <p>Total products: ${result.totalProducts}</p>
               <p>Average score: ${result.avgScore}%</p>
               <p>Critical products: ${result.criticalCount}</p>
               <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/seo">View full report</a></p>`
      })
    } catch (err) {
      console.error('Email send failed', err)
    }
  }

  return NextResponse.json({ success: true, result })
}