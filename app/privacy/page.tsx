import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteUrl } from '@/lib/site'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Adatvédelmi Tájékoztató (GDPR)',
  description: 'A NEXU Webshop adatvédelmi és cookie szabályzata. GDPR megfelelőség, adatkezelési eljárások és felhasználói jogok.',
  alternates: { canonical: `${siteUrl}/privacy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Adatvédelmi Tájékoztató | NEXU Webshop',
    description: 'A NEXU Webshop adatvédelmi és cookie szabályzata. GDPR megfelelőség és felhasználói jogok.',
    url: `${siteUrl}/privacy`,
    siteName: 'NEXU Webshop',
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Adatvédelmi Tájékoztató | NEXU Webshop',
    description: 'A NEXU Webshop adatvédelmi és cookie szabályzata.',
  },
}

export default function PrivacyPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kezdőlap', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Adatvédelmi Tájékoztató', item: `${siteUrl}/privacy` }
    ]
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Adatvédelmi Tájékoztató
      </h1>
      
      <div className="prose prose-invert max-w-none text-gray-300 space-y-8">
        <p className="text-sm text-gray-400">
          Hatályos: 2025. január 1-től
        </p>

        {/* 1. Bevezetés */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Bevezetés</h2>
          <p>
            A NEXU Webshop (továbbiakban: Adatkezelő) elkötelezett a felhasználók személyes adatainak
            védelme iránt. Jelen tájékoztató célja, hogy a felhasználók megismerjék, hogyan gyűjtjük,
            használjuk és védjük személyes adataikat az Európai Unió Általános Adatvédelmi Rendelete
            (GDPR - 2016/679) és a magyar adatvédelmi jogszabályok szerint.
          </p>
        </section>

        {/* 2. Adatkezelő */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Az Adatkezelő adatai</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <ul className="space-y-2">
              <li><strong className="text-white">Cégnév:</strong> NEXU Kft.</li>
              <li><strong className="text-white">Székhely:</strong> 1234 Budapest, Példa utca 1.</li>
              <li><strong className="text-white">Adószám:</strong> 12345678-2-42</li>
              <li><strong className="text-white">E-mail:</strong> info@nexu.hu</li>
              <li><strong className="text-white">Telefon:</strong> +36 1 234 5678</li>
            </ul>
          </div>
        </section>

        {/* 3. Gyűjtött adatok */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Milyen adatokat gyűjtünk?</h2>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1. Regisztráció és fiók kezelés</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Teljes név</li>
            <li>E-mail cím</li>
            <li>Jelszó (titkosított formában)</li>
            <li>Telefonszám (opcionális)</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2. Vásárlás és szállítás</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Szállítási cím (irányítószám, város, utca, házszám)</li>
            <li>Számlázási cím</li>
            <li>Telefonszám (szállításhoz)</li>
            <li>Adószám (céges vásárlás esetén)</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3. Automatikusan gyűjtött adatok</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>IP-cím</li>
            <li>Böngésző típusa és verziója</li>
            <li>Meglátogatott oldalak és időpontok</li>
            <li>Hivatkozó oldal (referrer)</li>
          </ul>
        </section>

        {/* 4. Adatkezelés célja */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Adatkezelés célja és jogalapja</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-white">Cél</th>
                  <th className="py-3 px-4 text-white">Jogalap</th>
                  <th className="py-3 px-4 text-white">Megőrzési idő</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4">Felhasználói fiók kezelése</td>
                  <td className="py-3 px-4">Szerződés teljesítése</td>
                  <td className="py-3 px-4">Fiók törléséig</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4">Rendelés feldolgozása</td>
                  <td className="py-3 px-4">Szerződés teljesítése</td>
                  <td className="py-3 px-4">8 év (számviteli tv.)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4">Számlázás</td>
                  <td className="py-3 px-4">Jogi kötelezettség</td>
                  <td className="py-3 px-4">8 év</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4">Hírlevél küldése</td>
                  <td className="py-3 px-4">Hozzájárulás</td>
                  <td className="py-3 px-4">Leiratkozásig</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4">Weboldal működtetése</td>
                  <td className="py-3 px-4">Jogos érdek</td>
                  <td className="py-3 px-4">Session lejártáig</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Cookie-k */}
        <section id="cookies">
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Cookie (süti) szabályzat</h2>
          
          <p className="mb-4">
            A weboldal sütiket (cookie-kat) használ a felhasználói élmény javítása és a szolgáltatások
            megfelelő működése érdekében.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1. Feltétlenül szükséges sütik</h3>
          <p className="mb-2">
            Ezek a sütik elengedhetetlenek a weboldal működéséhez. Ide tartozik:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><code className="bg-white/10 px-2 py-0.5 rounded">session</code> - Munkamenet azonosító</li>
            <li><code className="bg-white/10 px-2 py-0.5 rounded">nexu-cart</code> - Kosár tartalma</li>
            <li><code className="bg-white/10 px-2 py-0.5 rounded">cookie-consent</code> - Cookie beállítások</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2. Funkcionális sütik</h3>
          <p className="mb-2">
            A felhasználói élmény javítását szolgálják:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li><code className="bg-white/10 px-2 py-0.5 rounded">nexu-favorites</code> - Kedvencek listája</li>
            <li><code className="bg-white/10 px-2 py-0.5 rounded">nexu-recently-viewed</code> - Megtekintett termékek</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3. Analitikai sütik</h3>
          <p>
            Ezeket a sütiket csak a felhasználó kifejezett hozzájárulásával használjuk weboldal-statisztikák
            készítésére.
          </p>
        </section>

        {/* 6. Adattovábbítás */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Adattovábbítás harmadik félnek</h2>
          <p className="mb-4">
            Személyes adatait az alábbi esetekben továbbíthatjuk harmadik félnek:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-white">Futárszolgálat:</strong> Szállítási cím és telefonszám a kézbesítéshez</li>
            <li><strong className="text-white">Fizetési szolgáltató (Stripe):</strong> Bankkártya tranzakciók feldolgozása</li>
            <li><strong className="text-white">Számlázási szolgáltatás:</strong> Számla kiállítása</li>
            <li><strong className="text-white">E-mail szolgáltató (Resend):</strong> Értesítések küldése</li>
          </ul>
        </section>

        {/* 7. Jogok */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Az Ön jogai</h2>
          <p className="mb-4">
            A GDPR alapján Önt az alábbi jogok illetik meg:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-bold text-white mb-2">📋 Hozzáférési jog</h4>
              <p className="text-sm">Tájékoztatást kérhet arról, milyen adatait kezeljük.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-bold text-white mb-2">✏️ Helyesbítési jog</h4>
              <p className="text-sm">Kérheti pontatlan adatai javítását.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-bold text-white mb-2">🗑️ Törlési jog</h4>
              <p className="text-sm">Kérheti adatai törlését ("elfeledtetéshez való jog").</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-bold text-white mb-2">⏸️ Korlátozási jog</h4>
              <p className="text-sm">Kérheti az adatkezelés korlátozását.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-bold text-white mb-2">📤 Adathordozhatóság</h4>
              <p className="text-sm">Kérheti adatai géppel olvasható formátumban történő kiadását.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="font-bold text-white mb-2">🚫 Tiltakozási jog</h4>
              <p className="text-sm">Tiltakozhat adatai kezelése ellen.</p>
            </div>
          </div>
        </section>

        {/* 8. Biztonság */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Adatbiztonság</h2>
          <p>
            Az Adatkezelő megfelelő technikai és szervezési intézkedéseket alkalmaz a személyes adatok
            védelme érdekében, beleértve:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-4">
            <li>SSL/TLS titkosított kapcsolat (HTTPS)</li>
            <li>Jelszavak hash-elt tárolása</li>
            <li>Rendszeres biztonsági mentések</li>
            <li>Hozzáférés-korlátozás (role-based access control)</li>
          </ul>
        </section>

        {/* 9. Kapcsolat */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Kapcsolatfelvétel és panasz</h2>
          <p className="mb-4">
            Adatvédelmi kérdéseivel, kéréseivel forduljon hozzánk:
          </p>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-4">
            <p><strong className="text-white">E-mail:</strong> privacy@nexu.hu</p>
            <p><strong className="text-white">Postacím:</strong> 1234 Budapest, Példa utca 1.</p>
          </div>
          <p className="mb-4">
            Amennyiben úgy érzi, hogy adatkezelésünk sérti jogait, panaszt tehet a Nemzeti
            Adatvédelmi és Információszabadság Hatóságnál (NAIH):
          </p>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p><strong className="text-white">NAIH</strong></p>
            <p>1055 Budapest, Falk Miksa utca 9-11.</p>
            <p>E-mail: ugyfelszolgalat@naih.hu</p>
            <p>Weboldal: <a href="https://naih.hu" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">https://naih.hu</a></p>
          </div>
        </section>

        {/* 10. Módosítások */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Tájékoztató módosítása</h2>
          <p>
            Az Adatkezelő fenntartja a jogot, hogy jelen tájékoztatót egyoldalúan módosítsa.
            A módosításokról a weboldalon keresztül értesítjük felhasználóinkat.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Utolsó módosítás: 2025. január 1.
          </p>
          <Link href="/terms" className="text-purple-400 hover:underline text-sm">
            → Általános Szerződési Feltételek megtekintése
          </Link>
        </div>
      </div>
    </div>
  )
}
