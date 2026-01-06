import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SEO Audits - Admin',
  description: 'Korábbi SEO audit jelentések listája',
}

export default async function SeoAuditsPage() {
  const audits = await prisma.seoAudit.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SEO Audits</h1>
        <a
          href="/api/cron/seo-audit?secret="
          className="text-sm text-purple-400 hover:text-purple-300"
        >Run now</a>
      </div>

      <div className="grid gap-4">
        {audits.map(a => (
          <div key={a.id} className="bg-white/3 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{new Date(a.createdAt).toLocaleString()}</div>
                <div className="text-sm text-gray-400">Avg score: {a.avgScore} — Critical: {a.criticalCount}</div>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer text-purple-300">Report</summary>
                <pre className="mt-2 text-xs text-gray-200 max-h-48 overflow-auto">{JSON.stringify(a.payload, null, 2)}</pre>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}