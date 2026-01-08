import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteUrl } from '@/lib/site'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Általános Szerződési Feltételek (ÁSZF)',
  description: 'A NEXU Webshop Általános Szerződési Feltételei. Vásárlási feltételek, szállítás, fizetmód, garancia és elállási jog információk.',
  alternates: { canonical: `${siteUrl}/aszf` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ÁSZF | NEXU Webshop',
    description: 'A NEXU Webshop Általános Szerződési Feltételei. Vásárlási feltételek, szállítás és garancia.',
    url: `${siteUrl}/aszf`,
    siteName: 'NEXU Webshop',
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ÁSZF | NEXU Webshop',
    description: 'A NEXU Webshop Általános Szerződési Feltételei.',
  },
}

export default function AszfPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kezdőlap', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'ÁSZF', item: `${siteUrl}/aszf` }
    ]
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Általános Szerződési Feltételek (ÁSZF)
      </h1>
      
      <div className="prose prose-invert max-w-none text-gray-300 space-y-8">
        <p className="text-sm text-gray-400">
          Hatályos: 2025. január 1-től
        </p>

        {/* 1. Általános rendelkezések */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Általános rendelkezések</h2>
          <p>
            Jelen Általános Szerződési Feltételek (továbbiakban: ÁSZF) tartalmazzák a NEXU Webshop
            (továbbiakban: Szolgáltató) által üzemeltetett webáruházban történő vásárlás feltételeit.
            Az ÁSZF a Polgári Törvénykönyvről szóló 2013. évi V. törvény, az elektronikus kereskedelmi
            szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről
            szóló 2001. évi CVIII. törvény, valamint a fogyasztó és a vállalkozás közötti szerződések
            részletes szabályairól szóló 45/2014. (II. 26.) Korm. rendelet alapján készült.
          </p>
        </section>

        {/* 2. Szolgáltató adatai */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. A Szolgáltató adatai</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <ul className="space-y-2">
              <li><strong className="text-white">Cégnév:</strong> NEXU Kft.</li>
              <li><strong className="text-white">Székhely:</strong> 1234 Budapest, Példa utca 1.</li>
              <li><strong className="text-white">Adószám:</strong> 12345678-2-42</li>
              <li><strong className="text-white">Cégjegyzékszám:</strong> 01-09-123456</li>
              <li><strong className="text-white">E-mail:</strong> info@nexu.hu</li>
              <li><strong className="text-white">Telefon:</strong> +36 1 234 5678</li>
              <li><strong className="text-white">Tárhelyszolgáltató:</strong> Vercel Inc.</li>
            </ul>
          </div>
        </section>

        {/* 3. A szerződés tárgya */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. A szerződés tárgya és létrejötte</h2>
          <p>
            A szerződés tárgya a Szolgáltató által a webáruházban kínált termékek értékesítése és
            kiszállítása. A szerződés a Vásárló megrendelésének leadásával, a Szolgáltató által történő
            visszaigazolással jön létre.
          </p>
          <p className="mt-4">
            A megrendelés elküldésével a Vásárló kijelenti, hogy a jelen ÁSZF-ben foglaltakat
            megismerte és elfogadta.
          </p>
        </section>

        {/* 4. Megrendelés folyamata */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. A megrendelés menete</h2>
          <ol className="list-decimal ml-6 space-y-3">
            <li>A Vásárló a termékeket a kosárba helyezi.</li>
            <li>A kosár tartalmának véglegesítése után a Vásárló megadja szállítási és számlázási adatait.</li>
            <li>A Vásárló kiválasztja a fizetési és szállítási módot.</li>
            <li>A Vásárló elfogadja az ÁSZF-et és az Adatkezelési Tájékoztatót.</li>
            <li>A megrendelés véglegesítése után a Szolgáltató visszaigazoló e-mailt küld.</li>
          </ol>
        </section>

        {/* 5. Árak és fizetés */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Árak és fizetési módok</h2>
          <p>
            A webáruházban feltüntetett árak bruttó árak, tartalmazzák az ÁFÁ-t. A szállítási
            költség a megrendelés összegétől függően változhat. Ingyenes szállítás a feltüntetett
            értékhatár feletti rendeléseknél.
          </p>
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1. Fizetési módok</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="text-white">Utánvét:</strong> A vásárló a termék átvételekor fizet a futárnak.</li>
            <li><strong className="text-white">Online bankkártyás fizetés:</strong> Stripe fizetési rendszeren keresztül, biztonságos környezetben.</li>
          </ul>
        </section>

        {/* 6. Szállítás */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Szállítási feltételek</h2>
          <p>
            A szállítás Magyarország területére történik. A szállítási idő a megrendelés visszaigazolásától
            számított 2-5 munkanap. A pontos szállítási időről a Vásárló a megrendelés visszaigazolásában
            kap tájékoztatást.
          </p>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1. Elérhető szállítási módok</h3>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
            <div>
              <p className="font-bold text-white">GLS Futárszolgálat</p>
              <p className="text-sm text-gray-400">Kézbesítés 1-3 munkanapon belül. Szállítási díj: 2 990 Ft (meghatározott összeghatár felett ingyenes).</p>
            </div>
            <div>
              <p className="font-bold text-white">Magyar Posta (MPL)</p>
              <p className="text-sm text-gray-400">Kézbesítés 2-5 munkanapon belül. Szállítási díj: 1 990 Ft (meghatározott összeghatár felett ingyenes).</p>
              <p className="text-xs text-amber-400 mt-1">A Szolgáltató a 335/2012. (XII. 4.) Korm. rendelet értelmében biztosítja a Magyar Posta (MPL) általi kézbesítést is.</p>
            </div>
          </div>
          
          <p className="mt-4">
            A Szolgáltató mindent megtesz azért, hogy a szállítási határidőt betartsa, azonban nem vállal
            felelősséget a futárszolgálat hibájából eredő késésekért.
          </p>
        </section>

        {/* 7. Elállási jog */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Elállási jog (14 napos)</h2>
          <p>
            A fogyasztót a 45/2014. (II. 26.) Korm. rendelet alapján megilleti az indokolás nélküli
            elállás joga. A fogyasztó a termék kézhezvételétől számított 14 napon belül indokolás
            nélkül elállhat a szerződéstől.
          </p>
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1. Az elállás menete</h3>
          <ol className="list-decimal ml-6 space-y-3">
            <li>A Vásárló e-mailben vagy írásban jelzi elállási szándékát az info@nexu.hu címen.</li>
            <li>A terméket eredeti, sértetlen csomagolásban vissza kell küldeni.</li>
            <li>A Szolgáltató a termék visszaérkezését követően 14 napon belül visszatéríti a vételárat.</li>
          </ol>
          <p className="mt-4 text-amber-400">
            <strong>Fontos:</strong> A visszaküldés költsége a Vásárlót terheli. Bontatlan, sértetlen
            állapotú termékek fogadhatók vissza.
          </p>
        </section>

        {/* 8. Jótállás és garancia */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Jótállás és garancia</h2>
          <p>
            A termékekre a jogszabályokban előírt kötelező jótállás vonatkozik. A jótállás ideje
            fogyasztó esetén 1 év, nem fogyasztó esetén 6 hónap. A jótállási jegy a számlával
            együtt kerül átadásra.
          </p>
          <p className="mt-4">
            Egyes termékekre a gyártó által nyújtott garancia is érvényes lehet. A garanciális
            feltételek a termék leírásában találhatók.
          </p>
        </section>

        {/* 9. Szavatosság */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Kellékszavatosság</h2>
          <p>
            A Vásárlót a teljesítéstől számított 2 évig (nem fogyasztó esetén 1 évig) kellékszavatossági
            igény illeti meg hibás teljesítés esetén. A Vásárló választhat, hogy kijavítást, kicserélést,
            árleszállítást vagy elállást kér.
          </p>
        </section>

        {/* 10. Adatvédelem */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Adatvédelem</h2>
          <p>
            A Szolgáltató az adatkezelés során a hatályos adatvédelmi jogszabályokat betartja.
            Az adatkezelésről részletes tájékoztatást az{' '}
            <Link href="/adatkezeles" className="text-blue-400 hover:text-blue-300 underline">
              Adatkezelési Tájékoztatóban
            </Link>{' '}
            talál.
          </p>
        </section>

        {/* 11. Felelősség korlátozása */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">11. Felelősség korlátozása</h2>
          <p>
            A Szolgáltató nem vállal felelősséget:
          </p>
          <ul className="list-disc ml-6 space-y-2 mt-4">
            <li>A Vásárló által megadott téves vagy hiányos adatokból eredő károkért.</li>
            <li>A futárszolgálat hibájából eredő késésekért.</li>
            <li>Vis maior (elháríthatatlan külső ok) következményeiért.</li>
            <li>Az internetszolgáltató hibájából eredő leállásokért.</li>
          </ul>
        </section>

        {/* 12. Panaszkezelés */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">12. Panaszkezelés és vitarendezés</h2>
          <p>
            A Vásárló panaszával elsősorban a Szolgáltatóhoz fordulhat az info@nexu.hu e-mail címen
            vagy a +36 1 234 5678 telefonszámon. A Szolgáltató a panaszt 30 napon belül kivizsgálja
            és írásban válaszol.
          </p>
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.1. Békéltető testület</h3>
          <p>
            Sikertelen panaszügyintézés esetén a fogyasztó békéltető testülethez fordulhat:
          </p>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mt-4">
            <p><strong className="text-white">Budapest Főváros Békéltető Testülete</strong></p>
            <p>1016 Budapest, Krisztina krt. 99.</p>
            <p>Tel.: +36 1 488 2131</p>
            <p>E-mail: bekelteto.testulet@bkik.hu</p>
          </div>
        </section>

        {/* 13. Egyéb rendelkezések */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">13. Egyéb rendelkezések</h2>
          <p>
            A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására. A módosításokról
            a Vásárlókat e-mailben és a honlapon tájékoztatja. A módosítások a közzétételt követő
            8 napon belül lépnek hatályba.
          </p>
          <p className="mt-4">
            A jelen ÁSZF-ben nem szabályozott kérdésekben a magyar jog, különösen a Polgári
            Törvénykönyv rendelkezései az irányadók.
          </p>
        </section>

        {/* 14. Kapcsolat */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">14. Elérhetőségek</h2>
          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-white/10">
            <p className="mb-4">Kérdés esetén forduljon hozzánk bizalommal:</p>
            <ul className="space-y-2">
              <li><strong className="text-white">E-mail:</strong> info@nexu.hu</li>
              <li><strong className="text-white">Telefon:</strong> +36 1 234 5678</li>
              <li><strong className="text-white">Cím:</strong> 1234 Budapest, Példa utca 1.</li>
            </ul>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
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
