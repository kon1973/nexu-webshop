import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Gyakori Kérdések - NEXU Webshop',
  description: 'Válaszok a leggyakrabban felmerülő kérdésekre a rendelésekkel, szállítással és garanciával kapcsolatban.',
  alternates: { canonical: `${siteUrl}/faq` },
  openGraph: {
    title: 'Gyakori Kérdések | NEXU Webshop',
    description: 'Válaszok a leggyakrabban felmerülő kérdésekre a rendelésekkel, szállítással és garanciával kapcsolatban.',
    url: `${siteUrl}/faq`,
    siteName: 'NEXU Webshop',
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Gyakori Kérdések | NEXU Webshop',
    description: 'Válaszok a rendelésekkel, szállítással és garanciával kapcsolatos kérdésekre.',
  },
}

const faqs = [
  {
    question: 'Mennyi idő alatt érkezik meg a rendelésem?',
    answer: 'A raktáron lévő termékeket általában 1-3 munkanapon belül kiszállítjuk. A rendelés feladásáról emailben értesítünk.'
  },
  {
    question: 'Milyen fizetési módok közül választhatok?',
    answer: 'Webshopunkban fizethetsz bankkártyával (Stripe), utánvéttel, vagy előre utalással.'
  },
  {
    question: 'Van lehetőség személyes átvételre?',
    answer: 'Jelenleg csak házhozszállítással vagy csomagpontra történő szállítással tudjuk teljesíteni a rendeléseket.'
  },
  {
    question: 'Mit tegyek, ha sérült terméket kaptam?',
    answer: 'Kérjük, a sérülést azonnal jelezd ügyfélszolgálatunknak az info@nexu.hu email címen, és mellékelj fotókat a sérülésről. A terméket díjmentesen kicseréljük.'
  },
  {
    question: 'Hogyan érvényesíthetem a garanciát?',
    answer: 'A garanciális ügyintézéshez kérjük, őrizd meg a számlát és a garanciajegyet. Hiba esetén vedd fel velünk a kapcsolatot.'
  },
  {
    question: 'Hogyan tudok rendelni?',
    answer: 'Válaszd ki a kívánt termékeket, helyezd őket a kosárba, majd a fizetés oldalon add meg a szállítási adataidat és válassz fizetési módot.'
  },
  {
    question: 'Visszaküldhetem a terméket?',
    answer: 'Igen, a termék átvételétől számított 14 napon belül indoklás nélkül elállhatsz a vásárlástól. A visszaküldés költsége a vásárlót terheli.'
  },
  {
    question: 'Hogyan követhetem nyomon a rendelésemet?',
    answer: 'A rendelés feladása után emailben küldjük a nyomkövetési számot, amivel a futárszolgálat oldalán ellenőrizheted a csomag útját.'
  }
]

export default function FAQPage() {
  const siteUrl = getSiteUrl()

  // FAQ structured data for rich results in search
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  // HowTo schema for ordering process
  const howToOrderJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Hogyan rendelj a NEXU webshopból',
    description: 'Lépésről lépésre útmutató a rendelés leadásához',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'HUF',
      value: '0'
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Böngészd a termékeket',
        text: 'Keresd meg a kívánt termékeket a webshopban, használd a kategóriákat vagy a keresőt.',
        url: `${siteUrl}/shop`
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Tedd a kosárba',
        text: 'Kattints a "Kosárba" gombra a kiválasztott termékeknél. Válaszd ki a méretet vagy színt ha szükséges.',
        url: `${siteUrl}/cart`
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Ellenőrizd a kosarat',
        text: 'Nézd át a kosár tartalmát, módosítsd a mennyiségeket szükség szerint.',
        url: `${siteUrl}/cart`
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Add meg az adataidat',
        text: 'Töltsd ki a szállítási és számlázási adatokat a pénztár oldalon.',
        url: `${siteUrl}/checkout`
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Válassz fizetési módot',
        text: 'Válassz bankkártya, utánvét vagy átutalás közül.',
        url: `${siteUrl}/checkout`
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Véglegesítsd a rendelést',
        text: 'Ellenőrizd az adatokat és kattints a "Rendelés leadása" gombra. Visszaigazoló emailt kapsz.'
      }
    ]
  }

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Kezdőlap',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Gyakori Kérdések',
        item: `${siteUrl}/faq`
      }
    ]
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToOrderJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Gyakori Kérdések
      </h1>
      
      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-white">{faq.question}</h3>
            <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
