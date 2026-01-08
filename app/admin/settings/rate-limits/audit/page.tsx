import 'server-only'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AuditPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return <div className="p-6 text-red-400">Hozzáférés megtagadva</div>
  }

  const audits = await (prisma as any).settingAudit.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Rate Limit Audit Napló</h1>
          <p className="text-sm text-gray-400 mt-1">Beállítások módosításainak története</p>
        </div>
        <Link
          href="/admin/settings/rate-limits"
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          ← Vissza a beállításokhoz
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="bg-white/4 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Nincs még audit bejegyzés</h3>
          <p className="text-gray-400 text-sm">A rate limit beállítások módosításai itt jelennek meg.</p>
        </div>
      ) : (
        <div className="bg-white/4 border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-[#070707]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Kulcs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Régi érték</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Új érték</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Módosító</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">IP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Időpont</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {audits.map((a: any) => (
                <tr key={a.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-purple-400 font-mono text-sm">{a.key}</span>
                  </td>
                  <td className="px-4 py-3">
                    <pre className="whitespace-pre-wrap text-xs text-gray-400 bg-red-900/10 p-2 rounded max-w-xs overflow-auto">
                      {a.oldValue || '—'}
                    </pre>
                  </td>
                  <td className="px-4 py-3">
                    <pre className="whitespace-pre-wrap text-xs text-gray-300 bg-green-900/10 p-2 rounded max-w-xs overflow-auto">
                      {a.newValue || '—'}
                    </pre>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{a.author || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{a.ip || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {audits.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Megjelenítve: {audits.length} legutóbbi bejegyzés
        </div>
      )}
    </div>
  )
}
