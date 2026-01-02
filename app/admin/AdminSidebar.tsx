'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  TicketPercent, 
  MessageSquare, 
  Mail, 
  BarChart3,
  Settings, 
  LogOut,
  Menu,
  X,
  Tag,
  Image as ImageIcon,
  FileText,
  Sliders,
  Star,
  ClipboardList
} from 'lucide-react'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

const menuItems = [
  { name: 'Vezérlőpult', href: '/admin', icon: LayoutDashboard },
  { name: 'Rendelések', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Termékek', href: '/admin/products', icon: Package },
  { name: 'Felhasználók', href: '/admin/users', icon: Users },
  { name: 'Kuponok', href: '/admin/coupons', icon: TicketPercent },
  { name: 'Értékelések', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Hírlevél', href: '/admin/newsletter', icon: Mail },
  { name: 'Kimutatások', href: '/admin/reports', icon: ClipboardList },
  { name: 'Analitika', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Kategóriák', href: '/admin/categories', icon: Tag },
  { name: 'Bannerek', href: '/admin/banners', icon: ImageIcon },
  { name: 'Márkák', href: '/admin/brands', icon: Star },
  { name: 'Specifikációk', href: '/admin/specifications', icon: FileText },
  { name: 'Jellemzők', href: '/admin/attributes', icon: Sliders },
  { name: 'Beállítások', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#1a1a1a] rounded-lg text-white border border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-white/5 z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            NEXU Admin
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/5 bg-[#0a0a0a]">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors"
          >
            <LogOut size={20} />
            Kijelentkezés
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
