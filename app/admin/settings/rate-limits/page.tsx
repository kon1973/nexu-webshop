import 'server-only'
import { getAllRateLimitSettings } from '@/lib/settingsService'
import { auth } from '@/lib/auth'
import RateLimitsEditor from './RateLimitsEditor.client'
import { saveRateLimits } from './actions'
import Link from 'next/link'

export default async function RateLimitsPage() {
  const session = await auth()
  if (!session?.user || session?.user?.role !== 'admin') {
    return <div className="p-6 text-red-400">Hozzáférés megtagadva</div>
  }

  const settings = await getAllRateLimitSettings()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Rate Limit Beállítások</h1>
          <p className="text-sm text-gray-400 mt-1">API végpontok sebességkorlátozásának kezelése</p>
        </div>
        <Link
          href="/admin/settings/rate-limits/audit"
          className="bg-white/5 hover:bg-white/10 text-gray-300 text-sm px-4 py-2 rounded-lg border border-white/10 transition-colors"
        >
          Audit napló →
        </Link>
      </div>
      <RateLimitsEditor initialSettings={settings} saveAction={saveRateLimits} />
    </div>
  )
}
