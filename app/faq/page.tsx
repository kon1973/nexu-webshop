import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gyakori Kérdések - NEXU Webshop',
  description: 'Válaszok a leggyakrabban felmerülő kérdésekre.',
}

export default function FAQPage() {
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
    }
  ]

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
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
