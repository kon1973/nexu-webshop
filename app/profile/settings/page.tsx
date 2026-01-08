'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { User, Lock, Save, Loader2, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateProfile, changePassword } from '../actions'
import ProfileSidebar from '../ProfileSidebar'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(session?.user?.name || '')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile({ name })
      await update({ name })
      toast.success('Profil sikeresen frissítve!')
      router.refresh()
    } catch (error) {
      toast.error('Hiba történt a frissítéskor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 md:pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
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
          <div className="flex-1 min-w-0 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link 
                href="/profile" 
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Fiók beállítások</h1>
                <p className="text-gray-400 text-sm">Személyes adatok és biztonság</p>
              </div>
            </div>

        {/* Profile Section */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <User className="text-blue-400" size={20} />
            </div>
            <span>Személyes adatok</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Teljes név</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                placeholder="Teljes név"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Email cím</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">Az email cím nem módosítható.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || name === session?.user?.name}
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Mentés
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="text-purple-400" size={20} />
            </div>
            <span>Jelszó módosítás</span>
          </h2>
          <PasswordChangeForm />
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h3 className="font-bold text-red-400 mb-2">Veszélyzóna</h3>
          <p className="text-sm text-gray-400 mb-4">
            A fiók törlése végleges és nem visszafordítható.
          </p>
          <button 
            disabled
            className="text-sm text-red-400 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Fiók törlése (hamarosan)
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Az új jelszavak nem egyeznek!')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Az új jelszónak legalább 8 karakternek kell lennie!')
      return
    }

    setIsLoading(true)
    try {
      await changePassword({ currentPassword, newPassword })
      toast.success('Jelszó sikeresen módosítva!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Hiba történt a jelszó módosításakor')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, text: '', color: '' }
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) return { level: strength, text: 'Gyenge', color: 'bg-red-500' }
    if (strength <= 3) return { level: strength, text: 'Közepes', color: 'bg-yellow-500' }
    return { level: strength, text: 'Erős', color: 'bg-green-500' }
  }

  const strength = getPasswordStrength(newPassword)

  return (
    <form onSubmit={handleChangePassword} className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Jelenlegi jelszó</label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Új jelszó</label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            placeholder="Legalább 8 karakter"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {newPassword && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level} 
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    level <= strength.level ? strength.color : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${
              strength.level <= 2 ? 'text-red-400' : 
              strength.level <= 3 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              Jelszó erőssége: {strength.text}
            </p>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Új jelszó megerősítése</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full bg-[#0a0a0a] border rounded-xl p-4 pr-12 text-white outline-none transition-all ${
              confirmPassword && confirmPassword !== newPassword 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
            }`}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {confirmPassword && confirmPassword !== newPassword && (
          <p className="text-xs text-red-400 mt-1">A jelszavak nem egyeznek</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}
        className="flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
        Jelszó módosítása
      </button>
    </form>
  )
}
