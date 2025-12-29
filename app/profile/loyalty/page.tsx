import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getLoyaltyTier, getNextLoyaltyTier, LOYALTY_TIERS } from '@/lib/loyalty'

export default async function LoyaltyPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalSpent: true, name: true }
  })

  if (!user) return null

  const currentTier = getLoyaltyTier(user.totalSpent)
  const nextTier = getNextLoyaltyTier(user.totalSpent)
  
  // Calculate progress within the current tier bracket
  // If no next tier, progress is 100%
  // If base tier (0 spent), progress is based on 0 to next tier
  let progress = 0;
  if (!nextTier) {
      progress = 100;
  } else {
      const tierRange = nextTier.minSpent - currentTier.minSpent;
      const spentInTier = user.totalSpent - currentTier.minSpent;
      progress = (spentInTier / tierRange) * 100;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Törzsvásárlói Program</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Jelenlegi szinted</h2>
            <p className={`text-3xl font-bold ${currentTier.color}`}>{currentTier.name}</p>
          </div>
          <div className="md:text-right">
            <p className="text-gray-600">Eddigi vásárlások összege</p>
            <p className="text-2xl font-bold text-gray-900">{user.totalSpent.toLocaleString('hu-HU')} Ft</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>{currentTier.name}</span>
            {nextTier && <span>{nextTier.name} ({nextTier.minSpent.toLocaleString('hu-HU')} Ft)</span>}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
          {nextTier ? (
            <p className="text-sm text-gray-600 mt-2">
              Még <span className="font-bold text-gray-900">{(nextTier.minSpent - user.totalSpent).toLocaleString('hu-HU')} Ft</span> hiányzik a következő szinthez.
            </p>
          ) : (
            <p className="text-sm text-green-600 mt-2 font-medium">
              Gratulálunk! Elérted a legmagasabb szintet.
            </p>
          )}
        </div>

        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-1">Jelenlegi kedvezményed:</h3>
          <p className="text-lg text-blue-800">
            {currentTier.discount > 0 
              ? `${currentTier.discount * 100}% minden vásárlásból` 
              : 'Még nincs állandó kedvezményed. Vásárolj többet a kedvezményekért!'}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Szintek és kedvezmények</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {LOYALTY_TIERS.map((tier) => (
          <div key={tier.name} className={`border rounded-lg p-5 transition-all ${tier.name === currentTier.name ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className={`text-xl font-bold ${tier.color}`}>{tier.name}</h3>
                {tier.name === currentTier.name && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Jelenlegi</span>}
            </div>
            <p className="text-gray-600 mb-3 font-medium">{tier.minSpent.toLocaleString('hu-HU')} Ft-tól</p>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">{tier.discount * 100}%</span>
                <span className="text-gray-600">kedvezmény</span>
            </div>
            <p className="text-sm text-gray-500">{tier.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
