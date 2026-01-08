import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import Link from 'next/link'
import AuditsClient from './AuditsClient'

export const metadata: Metadata = {
  title: 'SEO Audits - Admin',
  description: 'Korábbi SEO audit jelentések listája',
}

export default async function SeoAuditsPage() {
  const audits = await prisma.seoAudit.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })

  // Serialize dates for client component
  const serializedAudits = audits.map(a => ({
    ...a,
    createdAt: a.createdAt,
    payload: a.payload as any,
  }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">SEO Audit Napló</h1>
          <p className="text-sm text-gray-400 mt-1">Korábbi audit jelentések és pontszámok • Jelölj ki kettőt az összehasonlításhoz</p>
        </div>
        <Link
          href="/admin/seo"
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          ← Vissza az SEO áttekintéshez
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="bg-white/4 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Nincs még audit</h3>
          <p className="text-gray-400 text-sm mb-4">Futtass egy SEO auditot az SEO áttekintés oldalon.</p>
          <Link
            href="/admin/seo"
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Ugrás az SEO oldalra →
          </Link>
        </div>
      ) : (
        <AuditsClient audits={serializedAudits} />
      )}

      {audits.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Megjelenítve: {audits.length} legutóbbi audit
        </div>
      )}
    </div>
  )
}