'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, MapPin, Award, Settings, ChevronRight } from 'lucide-react'

const menuItems = [
  { href: '/profile', label: 'Áttekintés', icon: User, exact: true },
  { href: '/profile/orders', label: 'Rendeléseim', icon: Package },
  { href: '/profile/addresses', label: 'Címeim', icon: MapPin },
  { href: '/profile/loyalty', label: 'Hűségprogram', icon: Award },
  { href: '/profile/settings', label: 'Beállítások', icon: Settings },
]

export default function ProfileSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href, item.exact)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
              active
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Icon size={20} className={active ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'} />
            <span className="font-medium flex-1">{item.label}</span>
            <ChevronRight 
              size={16} 
              className={`transition-transform ${active ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'} ${active ? 'translate-x-1' : 'group-hover:translate-x-1'}`} 
            />
          </Link>
        )
      })}
    </nav>
  )
}
