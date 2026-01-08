import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Általános Szerződési Feltételek - NEXU Webshop',
  description: 'A NEXU Webshop használatának feltételei.',
  alternates: { canonical: `${siteUrl}/terms` },
  openGraph: {
    title: 'Szerződési Feltételek | NEXU Webshop',
    description: 'A NEXU Webshop használatának feltételei.',
    url: `${siteUrl}/terms`,
    siteName: 'NEXU Webshop',
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Szerződési Feltételek | NEXU Webshop',
    description: 'A NEXU Webshop használatának feltételei.',
  },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Általános Szerződési Feltételek
      </h1>
      
      <div className="prose prose-invert max-w-none text-gray-300">
        <p className="mb-4">
          Hatályos: 2025. január 1-től visszavonásig.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Általános rendelkezések</h2>
        <p>
          Jelen Általános Szerződési Feltételek (továbbiakban: ÁSZF) tartalmazzák a NEXU Webshop
          (továbbiakban: Szolgáltató) által üzemeltetett webáruház használatának feltételeit.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Megrendelés menete</h2>
        <p>
          A vásárló a webáruházban regisztráció nélkül is böngészhet, azonban a vásárlás regisztrációhoz
          vagy vendégként történő adatszolgáltatáshoz kötött. A megrendelés elküldésével a vásárló
          elfogadja jelen ÁSZF-et.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Árak és fizetés</h2>
        <p>
          A webáruházban feltüntetett árak bruttó árak, az ÁFA-t tartalmazzák. A szállítási költség
          külön kerül felszámításra, melyről a vásárló a megrendelés véglegesítése előtt tájékoztatást kap.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Szállítás</h2>
        <p>
          A megrendelt termékeket futárszolgálattal kézbesítjük. A szállítási határidő általában 1-3 munkanap.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Elállási jog</h2>
        <p>
          A fogyasztónak a termék átvételétől számított 14 napon belül joga van indokolás nélkül elállni
          a vásárlástól. Az elállási jog gyakorlásának részletes feltételeit a vonatkozó jogszabályok tartalmazzák.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Adatvédelem</h2>
        <p>
          A Szolgáltató a vásárlók személyes adatait bizalmasan kezeli, és harmadik félnek nem adja ki,
          kivéve a szállítás teljesítéséhez szükséges adatokat a futárszolgálat részére.
        </p>
      </div>
    </div>
  )
}
