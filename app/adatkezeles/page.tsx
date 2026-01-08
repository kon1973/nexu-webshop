import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Adatkezelési Tájékoztató',
  description: 'A NEXU Webshop adatkezelési szabályzata a GDPR előírásai szerint.',
}

export default function AdatkezelesPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-12 text-white">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Adatkezelési Tájékoztató
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
            (GDPR - 2016/679) és a magyar adatvédelmi jogszabályok (különösen az információs
            önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény) szerint.
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
              <li><strong className="text-white">Cégjegyzékszám:</strong> 01-09-123456</li>
              <li><strong className="text-white">E-mail:</strong> info@nexu.hu</li>
              <li><strong className="text-white">Telefon:</strong> +36 1 234 5678</li>
            </ul>
          </div>
        </section>

        {/* 3. Gyűjtött adatok */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Milyen adatokat gyűjtünk?</h2>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1. Regisztráció és fiók kezelés</h3>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <ul className="list-disc ml-6 space-y-2">
              <li>Név</li>
              <li>E-mail cím</li>
              <li>Jelszó (titkosított formában)</li>
              <li>Telefonszám (opcionális)</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2. Megrendelések</h3>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <ul className="list-disc ml-6 space-y-2">
              <li>Szállítási cím (név, irányítószám, város, utca, házszám)</li>
              <li>Számlázási cím</li>
              <li>Telefonszám</li>
              <li>E-mail cím</li>
              <li>Adószám (számlázáshoz, ha megadja)</li>
              <li>Rendelési előzmények</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3. Technikai adatok</h3>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <ul className="list-disc ml-6 space-y-2">
              <li>IP-cím</li>
              <li>Böngésző típusa és verziója</li>
              <li>Operációs rendszer</li>
              <li>Látogatási időpontok</li>
              <li>Megtekintett oldalak</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.4. Fizetési adatok</h3>
          <p className="mt-2">
            A bankkártyás fizetési adatokat közvetlenül a Stripe fizetési szolgáltató kezeli,
            az Adatkezelő ezeket az adatokat nem tárolja. Az utánvétes rendeléseknél csak a
            megrendelési adatokat kezeljük.
          </p>
        </section>

        {/* 4. Adatkezelés célja és jogalapja */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Az adatkezelés célja és jogalapja</h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">4.1. Szerződés teljesítése</h3>
              <p><strong className="text-white">Jogalap:</strong> GDPR 6. cikk (1) bekezdés b) pont</p>
              <p className="mt-2"><strong className="text-white">Cél:</strong> Megrendelések feldolgozása, termékek kiszállítása, számla kiállítása.</p>
              <p className="mt-2"><strong className="text-white">Időtartam:</strong> A szerződéses kapcsolat fennállása alatt, illetve az ezzel kapcsolatos jogi kötelezettségek teljesítéséhez szükséges ideig (számviteli bizonylatok esetén 8 év).</p>
            </div>

            <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">4.2. Hozzájárulás</h3>
              <p><strong className="text-white">Jogalap:</strong> GDPR 6. cikk (1) bekezdés a) pont</p>
              <p className="mt-2"><strong className="text-white">Cél:</strong> Hírlevél küldése, marketing kommunikáció, termékajánlatok.</p>
              <p className="mt-2"><strong className="text-white">Időtartam:</strong> A hozzájárulás visszavonásáig.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">4.3. Jogos érdek</h3>
              <p><strong className="text-white">Jogalap:</strong> GDPR 6. cikk (1) bekezdés f) pont</p>
              <p className="mt-2"><strong className="text-white">Cél:</strong> Visszaélések megelőzése, biztonsági incidensek kivizsgálása, rendszernaplók vezetése.</p>
              <p className="mt-2"><strong className="text-white">Időtartam:</strong> A cél eléréséhez szükséges ideig, maximum 1 év.</p>
            </div>

            <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">4.4. Jogi kötelezettség</h3>
              <p><strong className="text-white">Jogalap:</strong> GDPR 6. cikk (1) bekezdés c) pont</p>
              <p className="mt-2"><strong className="text-white">Cél:</strong> Számviteli kötelezettségek teljesítése, hatósági megkeresés teljesítése.</p>
              <p className="mt-2"><strong className="text-white">Időtartam:</strong> A vonatkozó jogszabályok szerinti időtartam (pl. számla esetén 8 év).</p>
            </div>
          </div>
        </section>

        {/* 5. Adattovábbítás */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Adattovábbítás, adatfeldolgozók</h2>
          <p>
            Az Adatkezelő az alábbi adatfeldolgozókat veszi igénybe:
          </p>
          <div className="mt-6 space-y-4">
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Tárhelyszolgáltató</h4>
              <p><strong className="text-white">Név:</strong> Vercel Inc.</p>
              <p><strong className="text-white">Cél:</strong> A weboldal üzemeltetése.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Fizetési szolgáltató</h4>
              <p><strong className="text-white">Név:</strong> Stripe Inc.</p>
              <p><strong className="text-white">Cél:</strong> Online bankkártyás fizetések lebonyolítása.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Számlázó rendszer</h4>
              <p><strong className="text-white">Név:</strong> Szamlazz.hu</p>
              <p><strong className="text-white">Cél:</strong> Számlák kiállítása és tárolása.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">E-mail szolgáltató</h4>
              <p><strong className="text-white">Név:</strong> Resend</p>
              <p><strong className="text-white">Cél:</strong> Tranzakciós e-mailek (megrendelés visszaigazolás, stb.) küldése.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Futárszolgálat</h4>
              <p><strong className="text-white">Név:</strong> GLS General Logistics Systems Hungary Kft.</p>
              <p><strong className="text-white">Cél:</strong> Csomagok kézbesítése.</p>
            </div>
          </div>
          <p className="mt-6 text-amber-400">
            <strong>Fontos:</strong> Az Adatkezelő nem adja tovább az adatokat harmadik félnek marketing
            célokra, kivéve, ha ehhez kifejezett hozzájárulást adott.
          </p>
        </section>

        {/* 6. Az érintettek jogai */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Az érintettek jogai (GDPR)</h2>
          <p className="mb-6">
            A GDPR értelmében Ön az alábbi jogokkal rendelkezik:
          </p>
          
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">6.1. Hozzáférési jog (GDPR 15. cikk)</h4>
              <p>Jogosult tájékoztatást kérni arról, hogy az Adatkezelő kezeli-e az Ön személyes adatait, és ha igen, milyen adatokat, milyen célból és mennyi ideig.</p>
            </div>

            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">6.2. Helyesbítéshez való jog (GDPR 16. cikk)</h4>
              <p>Kérheti pontatlan vagy hiányos adatainak helyesbítését.</p>
            </div>

            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">6.3. Törléshez való jog / "Elfelejtetéshez való jog" (GDPR 17. cikk)</h4>
              <p>Bizonyos feltételek mellett kérheti adatai törlését (pl. ha visszavonja hozzájárulását és nincs más jogalap az adatkezelésre).</p>
            </div>

            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">6.4. Korlátozáshoz való jog (GDPR 18. cikk)</h4>
              <p>Kérheti adatai kezelésének korlátozását, ha vitatja azok pontosságát vagy jogszerűségét.</p>
            </div>

            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">6.5. Adathordozhatósághoz való jog (GDPR 20. cikk)</h4>
              <p>Jogosult arra, hogy az Ön által rendelkezésre bocsátott adatokat tagolt, széles körben használt, géppel olvasható formátumban megkapja, és ezeket másik adatkezelőnek továbbítsa.</p>
            </div>

            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">6.6. Tiltakozáshoz való jog (GDPR 21. cikk)</h4>
              <p>Jogosult bármikor tiltakozni a személyes adatainak jogos érdeken vagy közvetlen üzletszerzésen alapuló kezelése ellen.</p>
            </div>

            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">6.7. Hozzájárulás visszavonása</h4>
              <p>Ha az adatkezelés hozzájáruláson alapul, bármikor visszavonhatja azt. A visszavonás nem érinti a hozzájárulás alapján a visszavonás előtt végzett adatkezelés jogszerűségét.</p>
            </div>

            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">6.8. Panasztételhez való jog (GDPR 77. cikk)</h4>
              <p>Jogosult panaszt benyújtani a felügyeleti hatóságnál (Nemzeti Adatvédelmi és Információszabadság Hatóság - NAIH).</p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-white/10">
            <h4 className="text-white font-semibold mb-3">Hogyan gyakorolhatja jogait?</h4>
            <p className="mb-3">Jogai gyakorlása érdekében forduljon hozzánk az alábbi elérhetőségeken:</p>
            <ul className="space-y-1">
              <li><strong className="text-white">E-mail:</strong> info@nexu.hu</li>
              <li><strong className="text-white">Postai cím:</strong> NEXU Kft., 1234 Budapest, Példa utca 1.</li>
            </ul>
            <p className="mt-4 text-sm">Az Adatkezelő a kérelem beérkezésétől számított 1 hónapon belül válaszol.</p>
          </div>
        </section>

        {/* 7. Adatbiztonság */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Adatbiztonság</h2>
          <p>
            Az Adatkezelő megfelelő technikai és szervezési intézkedéseket alkalmaz az adatok védelme érdekében:
          </p>
          <ul className="list-disc ml-6 space-y-2 mt-4">
            <li>HTTPS titkosítás a weboldalon.</li>
            <li>Jelszavak titkosított (hash-elt) tárolása.</li>
            <li>Rendszeres biztonsági mentések készítése.</li>
            <li>Hozzáférés-ellenőrzés és jogosultság-kezelés.</li>
            <li>Biztonságos adatbázis-szerver használata.</li>
            <li>Folyamatos biztonsági frissítések telepítése.</li>
          </ul>
        </section>

        {/* 8. Sütik (Cookies) */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Sütik használata</h2>
          <p>
            A weboldal sütiket (cookie) használ a felhasználói élmény javítása, a bejelentkezés
            kezelése és a kosár funkció biztosítása érdekében. A sütikről részletes információt
            a Cookie Szabályzatban talál.
          </p>
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.1. Feltétlenül szükséges sütik</h3>
          <p>
            Ezek a sütik elengedhetetlenek a weboldal működéséhez (pl. bejelentkezés, kosár).
            Ezek használata nem igényel hozzájárulást.
          </p>
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">8.2. Analitikai sütik</h3>
          <p>
            Ezek a sütik segítenek megérteni, hogyan használják a látogatók a weboldalt
            (pl. mely oldalakat látogatják leggyakrabban). Használatukhoz hozzájárulás szükséges.
          </p>
        </section>

        {/* 9. Felügyeleti hatóság */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">9. Felügyeleti hatóság</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="mb-4">
              Ha úgy érzi, hogy az Adatkezelő megsértette az adatvédelmi jogszabályokat,
              panasszal fordulhat az alábbi hatósághoz:
            </p>
            <ul className="space-y-2">
              <li><strong className="text-white">Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)</strong></li>
              <li><strong className="text-white">Székhely:</strong> 1055 Budapest, Falk Miksa utca 9-11.</li>
              <li><strong className="text-white">Levelezési cím:</strong> 1363 Budapest, Pf. 9.</li>
              <li><strong className="text-white">Telefon:</strong> +36 1 391 1400</li>
              <li><strong className="text-white">E-mail:</strong> ugyfelszolgalat@naih.hu</li>
              <li><strong className="text-white">Honlap:</strong> <a href="https://naih.hu" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">naih.hu</a></li>
            </ul>
          </div>
        </section>

        {/* 10. Egyéb */}
        <section>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">10. Záró rendelkezések</h2>
          <p>
            Az Adatkezelő fenntartja a jogot jelen tájékoztató módosítására. A módosításokról
            a felhasználókat e-mailben és a weboldalon értesíti. A módosítások a közzétételt
            követő 8 napon belül lépnek hatályba.
          </p>
          <p className="mt-4">
            Jelen tájékoztató hatálybalépése: <strong className="text-white">2025. január 1.</strong>
          </p>
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
