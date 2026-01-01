import 'server-only'
import { getAllRateLimitSettings } from '@/lib/settingsService'
import { auth } from '@/lib/auth'
import RateLimitsEditor from './RateLimitsEditor.client'
import { saveRateLimits } from './actions'

export default async function RateLimitsPage() {
  const session = await auth()
  if (!session?.user || session?.user?.role !== 'admin') {
    return <div>Hozzáférés megtagadva</div>
  }

  const settings = await getAllRateLimitSettings()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rate limit beállítások</h1>
      <RateLimitsEditor initialSettings={settings} saveAction={saveRateLimits} />
    </div>
  )
}
