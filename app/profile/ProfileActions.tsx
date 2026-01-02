'use client'

import { signOut } from "next-auth/react"
import Link from "next/link"
import { LogOut, LayoutDashboard } from "lucide-react"

interface ProfileActionsProps {
  role?: string
}

export default function ProfileActions({ role }: ProfileActionsProps) {
  return (
    <div className="space-y-3 mt-6 pt-6 border-t border-white/10">
      {role === 'admin' && (
        <Link
          href="/admin"
          className="flex items-center gap-3 w-full p-3 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 rounded-xl transition-colors font-medium"
        >
          <LayoutDashboard size={20} />
          Admin vezérlőpult
        </Link>
      )}
      
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-3 w-full p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors font-medium"
      >
        <LogOut size={20} />
        Kijelentkezés
      </button>
    </div>
  )
}
