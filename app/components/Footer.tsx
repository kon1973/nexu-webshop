'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { subscribeToNewsletter } from '@/lib/actions/user-actions'

type FooterProps = {
  settings?: Record<string, string>
}

export default function Footer({ settings }: FooterProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  const [email, setEmail] = useState('')
  const [honey, setHoney] = useState('') // Honeypot
  const [isLoading, setIsLoading] = useState(false)

  const contactAddress = settings?.contact_address || '1234 Budapest, Tech utca 42.'
  const contactPhone = settings?.contact_phone || '+36 1 234 5678'
  const contactEmail = settings?.contact_email || 'info@nexu.hu'
  const facebookUrl = settings?.social_facebook || '#'
  const instagramUrl = settings?.social_instagram || '#'
  const twitterUrl = settings?.social_twitter || '#'

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    // Honeypot check
    if (honey) return
    
    setIsLoading(true)
    try {
      const result = await subscribeToNewsletter(email)

      if (result.success) {
        toast.success(result.message || 'Sikeres feliratkozás a hírlevélre!')
        setEmail('')
      } else {
        toast.error(result.error || 'Hiba történt')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className={`bg-[#050505] border-t border-white/10 pt-16 pb-8 mt-20 ${isAdmin ? 'lg:ml-64' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand & About */}
          <div>
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4 inline-block">
              NEXU
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              A jövő technológiája, ma. Prémium elektronikai eszközök és kiegészítők széles választéka, szakértőktől.
            </p>
            <div className="flex gap-4">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Gyorslinkek</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/shop" className="hover:text-blue-400 transition-colors">Termékek</Link></li>
              <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">Rólunk</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Kapcsolat</Link></li>
              <li><Link href="/faq" className="hover:text-blue-400 transition-colors">GYIK</Link></li>
              <li><Link href="/gift-cards" className="hover:text-pink-400 transition-colors">🎁 Ajándékkártyák</Link></li>
              <li><Link href="/track-order" className="hover:text-blue-400 transition-colors">📦 Rendelés követése</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Jogi információk</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/aszf" className="hover:text-blue-400 transition-colors">ÁSZF</Link></li>
              <li><Link href="/adatkezeles" className="hover:text-blue-400 transition-colors">Adatkezelés</Link></li>
              <li><Link href="/impresszum" className="hover:text-blue-400 transition-colors">Impresszum</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Adatvédelem</Link></li>
              <li>
                <a 
                  href="https://ec.europa.eu/consumers/odr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-400 transition-colors"
                >
                  Online Vitarendezési Platform
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6">Elérhetőség</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{contactAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-400 shrink-0" />
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">{contactPhone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-400 shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6">Hírlevél</h3>
            <p className="text-gray-400 text-sm mb-4">
              Iratkozz fel, hogy elsőként értesülj akcióinkról és újdonságainkról!
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              {/* Honeypot field - hidden from users */}
              <input
                type="text"
                name="website"
                value={honey}
                onChange={(e) => setHoney(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />
              <input
                type="email"
                placeholder="Email címed"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Feliratkozás...' : 'Feliratkozás'}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} NEXU Webshop. Minden jog fenntartva.</p>
          <div className="flex gap-6">
            <Link href="/aszf" className="hover:text-gray-300">ÁSZF</Link>
            <Link href="/adatkezeles" className="hover:text-gray-300">Adatkezelés</Link>
            <Link href="/impresszum" className="hover:text-gray-300">Impresszum</Link>
            <Link href="/privacy" className="hover:text-gray-300">Sütik</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
