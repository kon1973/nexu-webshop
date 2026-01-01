import 'server-only'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AuditPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return <div>Hozzáférés megtagadva</div>
  }

  const audits = await (prisma as any).settingAudit.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rate limit audit</h1>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th>Key</th>
            <th>Old</th>
            <th>New</th>
            <th>Author</th>
            <th>IP</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((a: any) => (
            <tr key={a.id}>
              <td>{a.key}</td>
              <td><pre className="whitespace-pre-wrap">{a.oldValue}</pre></td>
              <td><pre className="whitespace-pre-wrap">{a.newValue}</pre></td>
              <td>{a.author}</td>
              <td>{a.ip}</td>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
