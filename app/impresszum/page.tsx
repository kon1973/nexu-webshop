import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, FileText, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Impresszum',
  description: 'A NEXU Webshop szolgáltatói adatai és elérhetőségei.',
}

export default function ImpreszumPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Impresszum
      </h1>
      
      <div className="prose prose-invert max-w-none text-gray-300 space-y-8">
        <p className="text-sm text-gray-400">
          Hatályos: 2025. január 1-től
        </p>

        {/* Szolgáltató adatai */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-6">Szolgáltató adatai</h2>
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-8 border border-white/10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Cégnév</p>
                    <p className="text-white font-semibold">NEXU Korlátolt Felelősségű Társaság</p>
                    <p className="text-sm text-gray-400">(röviden: NEXU Kft.)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Székhely</p>
                    <p className="text-white font-semibold">1234 Budapest, Példa utca 1.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Cégjegyzékszám</p>
                    <p className="text-white font-semibold">01-09-123456</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Adószám</p>
                    <p className="text-white font-semibold">12345678-2-42</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Nyilvántartó cégbíróság</p>
                    <p className="text-white font-semibold">Fővárosi Törvényszék Cégbírósága</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Alapítás éve</p>
                    <p className="text-white font-semibold">2024</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Statisztikai számjel</p>
                    <p className="text-white font-semibold">12345678-4730-113-01</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="text-blue-400 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Tevékenységi kör</p>
                    <p className="text-white font-semibold">Számítógép, periféria kiskereskedelem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Elérhetőségek */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-10 mb-6">Elérhetőségek</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-colors">
              <Mail className="text-blue-400 mb-4" size={28} />
              <h3 className="text-white font-semibold mb-3">E-mail</h3>
              <a href="mailto:info@nexu.hu" className="text-blue-400 hover:text-blue-300 transition-colors">
                info@nexu.hu
              </a>
              <p className="text-sm text-gray-400 mt-2">Általános megkeresés</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-colors">
              <Phone className="text-purple-400 mb-4" size={28} />
              <h3 className="text-white font-semibold mb-3">Telefon</h3>
              <a href="tel:+3612345678" className="text-purple-400 hover:text-purple-300 transition-colors">
                +36 1 234 5678
              </a>
              <p className="text-sm text-gray-400 mt-2">Hétfő-Péntek: 9-17</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-green-500/30 transition-colors">
              <Mail className="text-green-400 mb-4" size={28} />
              <h3 className="text-white font-semibold mb-3">Ügyfélszolgálat</h3>
              <a href="mailto:support@nexu.hu" className="text-green-400 hover:text-green-300 transition-colors">
                support@nexu.hu
              </a>
              <p className="text-sm text-gray-400 mt-2">Rendelési kérdések</p>
            </div>
          </div>
        </section>

        {/* Vezető tisztségviselő */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-10 mb-6">Vezető tisztségviselő</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold">
                K
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Kovács János</p>
                <p className="text-gray-400">Ügyvezető</p>
              </div>
            </div>
          </div>
        </section>

        {/* Hosting és technikai információk */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-10 mb-6">Tárhelyszolgáltató</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="mb-2"><strong className="text-white">Név:</strong> Vercel Inc.</p>
            <p className="mb-2"><strong className="text-white">Székhely:</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
            <p className="mb-2"><strong className="text-white">Weboldal:</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">vercel.com</a></p>
          </div>
        </section>

        {/* Szellemi tulajdon */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-10 mb-6">Szellemi tulajdon</h2>
          <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 rounded-xl p-6 border border-white/10">
            <div className="flex gap-3">
              <Scale className="text-amber-400 shrink-0 mt-1" size={24} />
              <div>
                <p className="mb-4">
                  A weboldalon megjelenő tartalmak, grafikák, logók, szövegek és más elemek
                  a NEXU Kft. szellemi tulajdonát képezik. Ezek engedély nélküli másolása,
                  terjesztése vagy felhasználása tilos és jogszabályba ütközik.
                </p>
                <p className="text-sm text-gray-400">
                  A weboldalon található termékképek és márkanevek a megfelelő gyártók és
                  tulajdonosaik védjegyei.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Felelősség */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-10 mb-6">Felelősségi nyilatkozat</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="mb-4">
              A weboldalon található információk tájékoztató jellegűek. A NEXU Kft. nem vállal
              felelősséget a weboldalon található esetleges pontatlanságokért vagy hibákért.
            </p>
            <p className="mb-4">
              A weboldal használata során előforduló technikai hibákért, adatvesztésért vagy
              egyéb károkért a Szolgáltató csak a jogszabályokban meghatározott mértékig felel.
            </p>
            <p>
              A weboldalról elérhető külső linkekért (más weboldalak) a NEXU Kft. nem vállal
              felelősséget.
            </p>
          </div>
        </section>

        {/* Kapcsolódó dokumentumok */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-10 mb-6">Kapcsolódó dokumentumok</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/aszf"
              className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all group"
            >
              <FileText className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-white font-semibold mb-2">ÁSZF</h3>
              <p className="text-sm text-gray-400">Általános Szerződési Feltételek</p>
            </Link>

            <Link
              href="/adatkezeles"
              className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <FileText className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-white font-semibold mb-2">Adatkezelési Tájékoztató</h3>
              <p className="text-sm text-gray-400">GDPR megfelelőség</p>
            </Link>

            <Link
              href="/privacy"
              className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 hover:border-green-500/30 transition-all group"
            >
              <FileText className="text-green-400 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-white font-semibold mb-2">Adatvédelem és Sütik</h3>
              <p className="text-sm text-gray-400">Cookie szabályzat</p>
            </Link>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400 mb-6">
            Utolsó frissítés: 2025. január 1.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105"
          >
            Vissza a Webáruházba
          </Link>
        </div>
      </div>
    </div>
  )
}
