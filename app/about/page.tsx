import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rólunk - NEXU Webshop',
  description: 'Ismerd meg a NEXU Webshop történetét és küldetését.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Rólunk
      </h1>
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 mb-6">
          A NEXU Webshop egy modern elektronikai áruház, amely a legújabb technológiákat hozza el otthonodba.
          Célunk, hogy vásárlóink számára a legjobb minőségű termékeket kínáljuk versenyképes áron,
          kiemelkedő ügyfélszolgálattal párosítva.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-white">Küldetésünk</h2>
        <p className="text-gray-300 mb-6">
          Hiszünk abban, hogy a technológia mindenkié. Ezért dolgozunk nap mint nap azon, hogy
          kínálatunkban mindenki megtalálja a számára megfelelő eszközt, legyen szó munkáról,
          szórakozásról vagy tanulásról.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-white">Miért válassz minket?</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Széles termékválaszték</li>
          <li>Gyors és megbízható szállítás</li>
          <li>Szakértő ügyfélszolgálat</li>
          <li>Biztonságos fizetési megoldások</li>
        </ul>
      </div>
    </div>
  )
}
