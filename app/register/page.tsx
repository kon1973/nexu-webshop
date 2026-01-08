'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, ArrowRight, Loader2, Eye, EyeOff, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { registerUser } from './actions'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const router = useRouter()

  // Password strength indicators
  const hasMinLength = password.length >= 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const passwordStrength = [hasMinLength, hasUpperCase, hasNumber].filter(Boolean).length

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasMinLength) {
      toast.error('A jelszó legalább 6 karakter legyen!')
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser({ name, email, password })

      if (result.success) {
        toast.success(result.message || 'Sikeres regisztráció!')
        router.push('/login')
      } else {
        toast.error(result.error || 'Hiba történt a regisztráció során.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Hálózati hiba történt.')
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-400' : 'text-gray-500'}`}>
      {met ? <Check size={12} /> : <X size={12} />}
      {text}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500 border border-purple-500/20">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Regisztráció</h1>
          <p className="text-gray-400 text-sm">Hozz létre egy fiókot a vásárláshoz.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Teljes név</label>
            <input
              id="name"
              required
              type="text"
              placeholder="Teljes név"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email cím</label>
            <input
              id="email"
              required
              type="email"
              placeholder="Email cím"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <div className="relative">
              <label htmlFor="password" className="sr-only">Jelszó</label>
              <input
                id="password"
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Jelszó"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 pr-12 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {password && (
              <div className="space-y-2 pt-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? level === 1 ? 'bg-red-500' : level === 2 ? 'bg-yellow-500' : 'bg-green-500'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-1">
                  <PasswordRequirement met={hasMinLength} text="Legalább 6 karakter" />
                  <PasswordRequirement met={hasUpperCase} text="Nagybetű" />
                  <PasswordRequirement met={hasNumber} text="Szám" />
                </div>
              </div>
            )}
          </div>

          {/* ÁSZF és Adatkezelési checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptTerms"
              required
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#0a0a0a] cursor-pointer accent-purple-600"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-300 cursor-pointer select-none leading-relaxed">
              Elolvastam és elfogadom az{' '}
              <Link 
                href="/aszf" 
                target="_blank" 
                className="text-purple-400 hover:text-purple-300 underline font-semibold"
              >
                ÁSZF-et
              </Link>
              {' '}és az{' '}
              <Link 
                href="/adatkezeles" 
                target="_blank" 
                className="text-purple-400 hover:text-purple-300 underline font-semibold"
              >
                Adatkezelési Tájékoztatót
              </Link>
              . <span className="text-red-400">*</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !acceptedTerms}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Regisztráció <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Már van fiókod?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Jelentkezz be
          </Link>
        </p>
      </div>
    </div>
  )
}
