'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { User, Lock, Save, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { updateProfile, changePassword } from '../actions'

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
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Fiók beállítások</h1>

        <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="text-blue-400" /> Személyes adatok
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Név</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                placeholder="Teljes név"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Email cím</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full bg-[#0a0a0a]/50 border border-white/5 rounded-xl p-4 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">Az email cím nem módosítható.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || name === session?.user?.name}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Mentés
            </button>
          </form>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Lock className="text-blue-400" /> Jelszó módosítás
          </h2>
          <PasswordChangeForm />
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

  return (
    <form onSubmit={handleChangePassword} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Jelenlegi jelszó</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
          placeholder="••••••••"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Új jelszó</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
          placeholder="Legalább 8 karakter"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-400 mb-2">Új jelszó megerősítése</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        Jelszó mentése
      </button>
    </form>
  )
}
