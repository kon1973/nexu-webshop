import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getLoyaltyTier, getNextLoyaltyTier, LOYALTY_TIERS } from '@/lib/loyalty'
import Link from 'next/link'
import { ArrowLeft, Crown, Star, Zap, Gift, TrendingUp, CheckCircle } from 'lucide-react'
import ProfileSidebar from '../ProfileSidebar'

const tierIcons: Record<string, typeof Crown> = {
  'Bronze': Star,
  'Silver': Zap,
  'Gold': Crown,
  'Platinum': Gift,
  'Diamond': Crown,
}

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
  
  let progress = 0;
  if (!nextTier) {
      progress = 100;
  } else {
      const tierRange = nextTier.minSpent - currentTier.minSpent;
      const spentInTier = user.totalSpent - currentTier.minSpent;
      progress = (spentInTier / tierRange) * 100;
  }

  const TierIcon = tierIcons[currentTier.name] || Star

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - hidden on mobile */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">
                  Fiókom
                </h2>
                <ProfileSidebar />
              </div>
            </div>
          </aside>
          
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link 
                href="/profile" 
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Hűségprogram</h1>
                <p className="text-gray-400 text-sm">Szerezz extra kedvezményeket minden vásárlással</p>
              </div>
            </div>

        {/* Current Tier Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-[#121212] to-blue-900/40 rounded-3xl p-6 md:p-10 mb-8 border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg
                  ${currentTier.name === 'Bronze' ? 'bg-gradient-to-br from-amber-700 to-amber-900 shadow-amber-500/30' : ''}
                  ${currentTier.name === 'Silver' ? 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-400/30' : ''}
                  ${currentTier.name === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/30' : ''}
                  ${currentTier.name === 'Platinum' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/30' : ''}
                  ${currentTier.name === 'Diamond' ? 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-purple-500/30' : ''}
                `}>
                  <TierIcon size={36} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Jelenlegi szinted</p>
                  <h2 className={`text-3xl md:text-4xl font-bold ${currentTier.color}`}>{currentTier.name}</h2>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-gray-400">Eddigi vásárlások</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{user.totalSpent.toLocaleString('hu-HU')} Ft</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className={currentTier.color}>{currentTier.name}</span>
                {nextTier && (
                  <span className="text-gray-400">
                    <span className={nextTier.color}>{nextTier.name}</span> ({nextTier.minSpent.toLocaleString('hu-HU')} Ft)
                  </span>
                )}
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              {nextTier ? (
                <p className="text-sm text-gray-400 mt-3">
                  Még <span className="font-bold text-white">{(nextTier.minSpent - user.totalSpent).toLocaleString('hu-HU')} Ft</span> a következő szinthez
                </p>
              ) : (
                <p className="text-sm text-green-400 mt-3 flex items-center gap-2">
                  <CheckCircle size={16} /> Gratulálunk! Elérted a legmagasabb szintet.
                </p>
              )}
            </div>

            {/* Current Discount */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="text-purple-400" size={20} />
                <h3 className="font-bold text-white">Jelenlegi kedvezményed</h3>
              </div>
              {currentTier.discount > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-purple-400">{currentTier.discount * 100}%</span>
                  <span className="text-gray-400">minden vásárlásból automatikusan</span>
                </div>
              ) : (
                <p className="text-gray-400">Vásárolj többet a kedvezményekért!</p>
              )}
            </div>
          </div>
        </div>

        {/* Tiers Grid */}
        <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="text-purple-400" /> Szintek és kedvezmények
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOYALTY_TIERS.map((tier, index) => {
            const Icon = tierIcons[tier.name] || Star
            const isCurrentTier = tier.name === currentTier.name
            const isAchieved = user.totalSpent >= tier.minSpent
            
            return (
              <div 
                key={tier.name} 
                className={`relative bg-[#121212] border rounded-2xl p-5 transition-all
                  ${isCurrentTier 
                    ? 'border-purple-500/50 ring-2 ring-purple-500/20' 
                    : isAchieved 
                      ? 'border-green-500/30' 
                      : 'border-white/5 hover:border-white/10'
                  }
                `}
              >
                {isCurrentTier && (
                  <div className="absolute -top-3 left-4 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                    Jelenlegi
                  </div>
                )}
                {isAchieved && !isCurrentTier && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                    ${tier.name === 'Bronze' ? 'bg-amber-500/20 text-amber-400' : ''}
                    ${tier.name === 'Silver' ? 'bg-gray-400/20 text-gray-300' : ''}
                    ${tier.name === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${tier.name === 'Platinum' ? 'bg-cyan-500/20 text-cyan-400' : ''}
                    ${tier.name === 'Diamond' ? 'bg-purple-500/20 text-purple-400' : ''}
                  `}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${tier.color}`}>{tier.name}</h3>
                    <p className="text-xs text-gray-500">{tier.minSpent.toLocaleString('hu-HU')} Ft-tól</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-white">{tier.discount * 100}%</span>
                  <span className="text-sm text-gray-500">kedvezmény</span>
                </div>
                
                <p className="text-sm text-gray-400">{tier.description}</p>
              </div>
            )
          })}
        </div>

        {/* Benefits Info */}
        <div className="mt-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Hogyan működik?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-white">Vásárolj</p>
                <p className="text-sm text-gray-400">Minden vásárlásod beleszámít az összköltésedbe.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-white">Lépj szintet</p>
                <p className="text-sm text-gray-400">Minél többet költesz, annál magasabb szintre jutsz.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-white">Élvezd</p>
                <p className="text-sm text-gray-400">A kedvezmények automatikusan érvényesülnek.</p>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}