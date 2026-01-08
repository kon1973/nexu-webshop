import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

// ============================================================================
// CATEGORIES
// ============================================================================
const categories = [
  { 
    name: 'Okostelefonok', 
    slug: 'okostelefonok', 
    icon: 'smartphone',
    description: 'A legújabb okostelefonok a vezető gyártóktól. Apple iPhone, Samsung Galaxy, Google Pixel és más prémium készülékek.',
    metaTitle: 'Okostelefonok | NEXU Webshop',
    metaDescription: 'Vásárolj prémium okostelefonokat: iPhone, Samsung Galaxy, Google Pixel. Gyors szállítás, garancia, részletfizetés.',
  },
  { 
    name: 'Laptopok', 
    slug: 'laptopok', 
    icon: 'laptop',
    description: 'Prémium laptopok munkához, játékhoz és kreatív alkotáshoz. MacBook, Dell XPS, ASUS ROG és még sok más.',
    metaTitle: 'Laptopok | NEXU Webshop',
    metaDescription: 'Válassz a legjobb laptopok közül: MacBook Pro, Dell XPS, ASUS ROG gamer laptopok. Ingyenes szállítás 30.000 Ft felett.',
  },
  { 
    name: 'Tabletek', 
    slug: 'tabletek', 
    icon: 'tablet',
    description: 'iPad, Samsung Galaxy Tab és más tabletek. Ideális munkához, tanuláshoz és szórakozáshoz.',
    metaTitle: 'Tabletek | NEXU Webshop',
    metaDescription: 'iPad Pro, Samsung Galaxy Tab és más tabletek széles választéka. Gyors kiszállítás, 14 napos visszaküldés.',
  },
  { 
    name: 'Okosórák', 
    slug: 'okosorak', 
    icon: 'watch',
    description: 'Okosórák és fitnesz karkötők. Apple Watch, Samsung Galaxy Watch, Garmin és más márkák.',
    metaTitle: 'Okosórák | NEXU Webshop',
    metaDescription: 'Prémium okosórák: Apple Watch Ultra, Samsung Galaxy Watch, Garmin. Egészségkövetés, sportfunkciók.',
  },
  { 
    name: 'Fülhallgatók', 
    slug: 'fulhallgatok', 
    icon: 'headphones',
    description: 'Vezetékes és vezeték nélküli fülhallgatók. AirPods, Sony, Bose és más Hi-Fi márkák.',
    metaTitle: 'Fülhallgatók | NEXU Webshop',
    metaDescription: 'Prémium fülhallgatók: AirPods Pro, Sony WH-1000XM5, Bose. Zajszűrés, Hi-Res Audio támogatás.',
  },
  { 
    name: 'Gaming', 
    slug: 'gaming', 
    icon: 'gamepad',
    description: 'Játékkonzolok, kontrollerek és gaming kiegészítők. PlayStation, Xbox, Nintendo.',
    metaTitle: 'Gaming | NEXU Webshop',
    metaDescription: 'PlayStation 5, Xbox Series X, Nintendo Switch és gaming kiegészítők. Legjobb árak, gyors szállítás.',
  },
]

// ============================================================================
// BRANDS
// ============================================================================
const brands = [
  { 
    name: 'Apple', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  },
  { 
    name: 'Samsung', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
  },
  { 
    name: 'Sony', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
  },
  { 
    name: 'Google', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  },
  { 
    name: 'Microsoft', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  },
  { 
    name: 'ASUS', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg',
  },
]

// ============================================================================
// PRODUCTS WITH FULL DETAILS
// ============================================================================
const products = [
  // -------------------------------------------------------------------------
  // iPhone 16 Pro Max
  // -------------------------------------------------------------------------
  {
    name: 'iPhone 16 Pro Max',
    slug: 'iphone-16-pro-max',
    description: 'Az iPhone 16 Pro Max az Apple legfejlettebb okostelefonja, amelyet a forradalmian új A18 Pro chip hajt.',
    fullDescription: `
# iPhone 16 Pro Max - Az Apple legújabb zászlóshajója

Az **iPhone 16 Pro Max** az Apple valaha készített legfejlettebb okostelefonja. A titán házban rejlő **A18 Pro chip** példátlan teljesítményt és energiahatékonyságot biztosít.

## 🎬 Profi kamerarendszer

A háromlencsés kamerarendszer teljesen új szintre emeli a mobil fotózást:
- **48MP fő kamera** - Quad-pixel technológiával
- **12MP ultraszéles** - 120°-os látószöggel
- **12MP telefotó** - 5x optikai zoom

### Cinematic Mode 4K-ban
Most már 4K felbontásban is elérhető a népszerű Cinematic Mode, amellyel filmszerű videókat készíthetsz automatikus fókuszváltással.

## ⚡ A18 Pro Chip

Az új A18 Pro chip 40%-kal gyorsabb CPU-val és 50%-kal gyorsabb GPU-val rendelkezik az előző generációhoz képest:
- 6 teljesítmény mag
- 2 hatékonysági mag  
- 6 magos GPU
- 16 magos Neural Engine

## 🔋 Egész napos üzemidő

A nagyobb akkumulátor és a hatékonyabb chip kombinációja **akár 29 óra videólejátszást** tesz lehetővé.

## 📱 ProMotion kijelző

A 6.9 colos Super Retina XDR kijelző 1-120Hz adaptív frissítési rátával rendelkezik:
- 2868 x 1320 pixel felbontás
- HDR támogatás
- Always-On Display
- ProMotion technológia
    `.trim(),
    price: 699990,
    category: 'Okostelefonok',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      'https://images.unsplash.com/photo-1695048132832-b41dbe01e965?w=800',
      'https://images.unsplash.com/photo-1695048064293-5d809b7e8f80?w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    ],
    rating: 4.9,
    stock: 50,
    brandSlug: 'apple',
    metaTitle: 'iPhone 16 Pro Max vásárlás | NEXU',
    metaDescription: 'Vásárold meg az iPhone 16 Pro Max-ot a NEXU webshopban. A18 Pro chip, 48MP kamera, titán keret. Ingyenes szállítás, 2 év garancia.',
    metaKeywords: 'iPhone 16 Pro Max, Apple iPhone, okostelefon, A18 Pro, titán iPhone',
    gtin: '194253416180',
    sku: 'AAPL-IP16PM',
    specifications: [
      { key: 'Kijelző', value: '6.9" Super Retina XDR OLED', type: 'text' },
      { key: 'Felbontás', value: '2868 x 1320 pixel', type: 'text' },
      { key: 'Processzor', value: 'Apple A18 Pro', type: 'text' },
      { key: 'RAM', value: '8 GB', type: 'text' },
      { key: 'Fő kamera', value: '48 MP + 12 MP + 12 MP', type: 'text' },
      { key: 'Előlapi kamera', value: '12 MP TrueDepth', type: 'text' },
      { key: 'Akkumulátor', value: '4685 mAh', type: 'text' },
      { key: 'Töltési sebesség', value: '27W vezetékes, 25W MagSafe', type: 'text' },
      { key: 'Operációs rendszer', value: 'iOS 18', type: 'text' },
      { key: '5G támogatás', value: true, type: 'boolean' },
      { key: 'Vízállóság', value: 'IP68', type: 'text' },
      { key: 'Face ID', value: true, type: 'boolean' },
      { key: 'Vezeték nélküli töltés', value: true, type: 'boolean' },
      { key: 'Súly', value: '227 g', type: 'text' },
      { key: 'Méretek', value: '163 x 77.6 x 8.25 mm', type: 'text' },
    ],
    options: [
      { name: 'Tárhely', values: ['256GB', '512GB', '1TB'] },
      { name: 'Szín', values: ['Fekete Titán', 'Fehér Titán', 'Natúr Titán', 'Sivatagi Titán'] },
    ],
    variants: [
      // 256GB variants
      { attributes: { Tárhely: '256GB', Szín: 'Fekete Titán' }, price: 699990, stock: 15, sku: 'IP16PM-256-BLK', slug: '256gb-fekete-titan' },
      { attributes: { Tárhely: '256GB', Szín: 'Fehér Titán' }, price: 699990, stock: 12, sku: 'IP16PM-256-WHT', slug: '256gb-feher-titan' },
      { attributes: { Tárhely: '256GB', Szín: 'Natúr Titán' }, price: 699990, stock: 10, sku: 'IP16PM-256-NAT', slug: '256gb-natur-titan' },
      { attributes: { Tárhely: '256GB', Szín: 'Sivatagi Titán' }, price: 699990, stock: 8, sku: 'IP16PM-256-DST', slug: '256gb-sivatagi-titan' },
      // 512GB variants
      { attributes: { Tárhely: '512GB', Szín: 'Fekete Titán' }, price: 819990, stock: 10, sku: 'IP16PM-512-BLK', slug: '512gb-fekete-titan' },
      { attributes: { Tárhely: '512GB', Szín: 'Fehér Titán' }, price: 819990, stock: 8, sku: 'IP16PM-512-WHT', slug: '512gb-feher-titan' },
      { attributes: { Tárhely: '512GB', Szín: 'Natúr Titán' }, price: 819990, stock: 7, sku: 'IP16PM-512-NAT', slug: '512gb-natur-titan' },
      { attributes: { Tárhely: '512GB', Szín: 'Sivatagi Titán' }, price: 819990, stock: 5, sku: 'IP16PM-512-DST', slug: '512gb-sivatagi-titan' },
      // 1TB variants
      { attributes: { Tárhely: '1TB', Szín: 'Fekete Titán' }, price: 939990, stock: 5, sku: 'IP16PM-1TB-BLK', slug: '1tb-fekete-titan' },
      { attributes: { Tárhely: '1TB', Szín: 'Fehér Titán' }, price: 939990, stock: 4, sku: 'IP16PM-1TB-WHT', slug: '1tb-feher-titan' },
      { attributes: { Tárhely: '1TB', Szín: 'Natúr Titán' }, price: 939990, stock: 3, sku: 'IP16PM-1TB-NAT', slug: '1tb-natur-titan' },
      { attributes: { Tárhely: '1TB', Szín: 'Sivatagi Titán' }, price: 939990, stock: 2, sku: 'IP16PM-1TB-DST', slug: '1tb-sivatagi-titan' },
    ],
  },

  // -------------------------------------------------------------------------
  // Samsung Galaxy S24 Ultra
  // -------------------------------------------------------------------------
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'A Samsung Galaxy S24 Ultra a világ első valódi AI okostelefonja, titán kerettel és beépített S Pen-nel.',
    fullDescription: `
# Samsung Galaxy S24 Ultra - Galaxy AI az élen

A **Samsung Galaxy S24 Ultra** újradefiniálja az okostelefon kategóriát a mesterséges intelligencia erejével. A **Galaxy AI** funkciók segítségével a mindennapi feladatok könnyebbé válnak.

## 🧠 Galaxy AI

A beépített AI funkciók forradalmasítják a használatot:

### Körberajzolás a kereséshez
Egyszerűen rajzolj körbe bármit a képernyőn, és a Google segítségével azonnal információkat kapsz róla.

### Élő fordítás
Valós idejű fordítás telefonhívások során - 13 nyelven!

### Chat Assist
Az AI segít megfogalmazni üzeneteidet a megfelelő hangnemben.

## 📸 200MP kamerarendszer

A valaha volt legnagyobb felbontású Samsung kamera:
- **200MP fő szenzor** - páratlan részletességgel
- **12MP ultraszéles** - 120°-os látószög
- **50MP periszkóp telefotó** - 5x optikai zoom
- **10MP telefotó** - 3x optikai zoom

### Nightography
A fejlett éjszakai mód lehetővé teszi a részletgazdag fotózást rossz fényviszonyok között is.

## ✏️ S Pen

A beépített S Pen új szintre emeli a produktivitást:
- Kézírás felismerés
- Képernyő kikapcsolásakor jegyzetelés
- Távoli exponálás
- Air Actions gesztusok

## 🔋 5000 mAh akkumulátor

Egész napos üzemidő 45W gyorstöltéssel:
- 0-65% 30 perc alatt
- Vezeték nélküli töltés
- Vezeték nélküli PowerShare
    `.trim(),
    price: 649990,
    category: 'Okostelefonok',
    image: 'https://images.unsplash.com/photo-1707227156456-56be99d15f60?w=800',
    images: [
      'https://images.unsplash.com/photo-1707227156456-56be99d15f60?w=800',
      'https://images.unsplash.com/photo-1707227155943-1eb86a3e0f54?w=800',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
      'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800',
    ],
    rating: 4.8,
    stock: 40,
    brandSlug: 'samsung',
    metaTitle: 'Samsung Galaxy S24 Ultra vásárlás | NEXU',
    metaDescription: 'Samsung Galaxy S24 Ultra: Galaxy AI, 200MP kamera, S Pen, titán keret. Vásárolj most a NEXU webshopban!',
    metaKeywords: 'Samsung Galaxy S24 Ultra, Galaxy AI, S Pen, 200MP kamera, okostelefon',
    gtin: '8806095373423',
    sku: 'SAM-S24U',
    specifications: [
      { key: 'Kijelző', value: '6.8" Dynamic AMOLED 2X', type: 'text' },
      { key: 'Felbontás', value: '3120 x 1440 pixel (QHD+)', type: 'text' },
      { key: 'Frissítési ráta', value: '1-120 Hz adaptív', type: 'text' },
      { key: 'Processzor', value: 'Snapdragon 8 Gen 3 for Galaxy', type: 'text' },
      { key: 'RAM', value: '12 GB', type: 'text' },
      { key: 'Fő kamera', value: '200 MP + 12 MP + 50 MP + 10 MP', type: 'text' },
      { key: 'Előlapi kamera', value: '12 MP', type: 'text' },
      { key: 'Akkumulátor', value: '5000 mAh', type: 'text' },
      { key: 'Töltési sebesség', value: '45W vezetékes, 15W vezeték nélküli', type: 'text' },
      { key: 'Operációs rendszer', value: 'Android 14 + One UI 6.1', type: 'text' },
      { key: '5G támogatás', value: true, type: 'boolean' },
      { key: 'Vízállóság', value: 'IP68', type: 'text' },
      { key: 'S Pen', value: true, type: 'boolean' },
      { key: 'Galaxy AI', value: true, type: 'boolean' },
      { key: 'Súly', value: '232 g', type: 'text' },
    ],
    options: [
      { name: 'Tárhely', values: ['256GB', '512GB', '1TB'] },
      { name: 'Szín', values: ['Titánszürke', 'Titánfekete', 'Titánlila', 'Titánsárga'] },
    ],
    variants: [
      { attributes: { Tárhely: '256GB', Szín: 'Titánszürke' }, price: 649990, stock: 12, sku: 'S24U-256-GRY', slug: '256gb-titanszurke' },
      { attributes: { Tárhely: '256GB', Szín: 'Titánfekete' }, price: 649990, stock: 15, sku: 'S24U-256-BLK', slug: '256gb-titanfekete' },
      { attributes: { Tárhely: '256GB', Szín: 'Titánlila' }, price: 649990, stock: 8, sku: 'S24U-256-VIO', slug: '256gb-titanlila' },
      { attributes: { Tárhely: '256GB', Szín: 'Titánsárga' }, price: 649990, stock: 6, sku: 'S24U-256-YLW', slug: '256gb-titansarga' },
      { attributes: { Tárhely: '512GB', Szín: 'Titánszürke' }, price: 749990, stock: 8, sku: 'S24U-512-GRY', slug: '512gb-titanszurke' },
      { attributes: { Tárhely: '512GB', Szín: 'Titánfekete' }, price: 749990, stock: 10, sku: 'S24U-512-BLK', slug: '512gb-titanfekete' },
      { attributes: { Tárhely: '512GB', Szín: 'Titánlila' }, price: 749990, stock: 5, sku: 'S24U-512-VIO', slug: '512gb-titanlila' },
      { attributes: { Tárhely: '1TB', Szín: 'Titánfekete' }, price: 899990, stock: 4, sku: 'S24U-1TB-BLK', slug: '1tb-titanfekete' },
    ],
  },

  // -------------------------------------------------------------------------
  // MacBook Pro 16" M3 Max
  // -------------------------------------------------------------------------
  {
    name: 'MacBook Pro 16" M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'A MacBook Pro 16" M3 Max chipkkel a világ leggyorsabb professzionális laptopja. Profi teljesítmény, lenyűgöző kijelző.',
    fullDescription: `
# MacBook Pro 16" M3 Max - Korlátlan professzionális teljesítmény

A **MacBook Pro 16"** az M3 Max chippel az Apple valaha készített leggyorsabb laptopja. Tervezők, fejlesztők és tartalomkészítők számára készült.

## 🚀 M3 Max Chip

Az M3 Max chip páratlan teljesítményt biztosít:
- **16 magos CPU** (12 teljesítmény + 4 hatékonyság)
- **40 magos GPU** - konzol szintű grafika
- **128 GB egységes memória** opció
- **Hardveres ray tracing** támogatás

### Benchmark eredmények
- Geekbench Multi-Core: 21,000+
- Cinebench R23: 14,500+
- 8K ProRes exportálás: valós időben

## 🖥️ Liquid Retina XDR kijelző

A 16.2 colos Liquid Retina XDR kijelző lélegzetelállító:
- **3456 x 2234** pixel felbontás
- **1600 nits** csúcsfényerő HDR-ben
- **1,000,000:1** kontrasztarány
- **ProMotion** 120Hz frissítési ráta

### XDR technológia
A mini-LED háttérvilágítás 2500+ dimming zónával biztosítja a tökéletes feketéket és vakító fényességet.

## 🔋 Hihetetlen akkumulátor

Az energiahatékony M3 Max chip lehetővé teszi:
- **22 óra** videólejátszás
- **15 óra** böngészés
- **140W MagSafe** gyorstöltés

## 🔊 Profi hangrendszer

A 6 hangszórós rendszer Spatial Audio támogatással:
- Force-cancelling mélysugárzók
- Dolby Atmos támogatás
- Stúdió minőségű mikrofon array
    `.trim(),
    price: 1599990,
    category: 'Laptopok',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
      'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800',
    ],
    rating: 4.9,
    stock: 20,
    brandSlug: 'apple',
    metaTitle: 'MacBook Pro 16" M3 Max | NEXU',
    metaDescription: 'MacBook Pro 16" M3 Max chippel: 16 magos CPU, 40 magos GPU, akár 128GB RAM. Profi laptop kreatív munkához.',
    metaKeywords: 'MacBook Pro, M3 Max, Apple laptop, profi laptop, Liquid Retina XDR',
    gtin: '194253391715',
    sku: 'AAPL-MBP16-M3MAX',
    specifications: [
      { key: 'Kijelző', value: '16.2" Liquid Retina XDR', type: 'text' },
      { key: 'Felbontás', value: '3456 x 2234 pixel', type: 'text' },
      { key: 'Frissítési ráta', value: '120 Hz ProMotion', type: 'text' },
      { key: 'Processzor', value: 'Apple M3 Max (16 magos CPU)', type: 'text' },
      { key: 'GPU', value: '40 magos Apple GPU', type: 'text' },
      { key: 'Neural Engine', value: '16 magos', type: 'text' },
      { key: 'Csúcsfényerő', value: '1600 nits HDR', type: 'text' },
      { key: 'Akkumulátor üzemidő', value: '22 óra', type: 'text' },
      { key: 'Töltési sebesség', value: '140W MagSafe', type: 'text' },
      { key: 'Portok', value: '3x Thunderbolt 4, HDMI, SD kártya, MagSafe', type: 'text' },
      { key: 'ProMotion kijelző', value: true, type: 'boolean' },
      { key: 'Touch ID', value: true, type: 'boolean' },
      { key: 'Súly', value: '2.14 kg', type: 'text' },
    ],
    options: [
      { name: 'Memória', values: ['36GB', '48GB', '64GB', '128GB'] },
      { name: 'Tárhely', values: ['1TB', '2TB', '4TB', '8TB'] },
      { name: 'Szín', values: ['Asztroszürke', 'Ezüst'] },
    ],
    variants: [
      { attributes: { Memória: '36GB', Tárhely: '1TB', Szín: 'Asztroszürke' }, price: 1599990, stock: 6, sku: 'MBP16-36-1TB-GRY', slug: '36gb-1tb-asztroszurke' },
      { attributes: { Memória: '36GB', Tárhely: '1TB', Szín: 'Ezüst' }, price: 1599990, stock: 5, sku: 'MBP16-36-1TB-SLV', slug: '36gb-1tb-ezust' },
      { attributes: { Memória: '48GB', Tárhely: '1TB', Szín: 'Asztroszürke' }, price: 1799990, stock: 4, sku: 'MBP16-48-1TB-GRY', slug: '48gb-1tb-asztroszurke' },
      { attributes: { Memória: '64GB', Tárhely: '2TB', Szín: 'Asztroszürke' }, price: 2199990, stock: 3, sku: 'MBP16-64-2TB-GRY', slug: '64gb-2tb-asztroszurke' },
      { attributes: { Memória: '128GB', Tárhely: '4TB', Szín: 'Asztroszürke' }, price: 2999990, stock: 2, sku: 'MBP16-128-4TB-GRY', slug: '128gb-4tb-asztroszurke' },
    ],
  },

  // -------------------------------------------------------------------------
  // Sony WH-1000XM5
  // -------------------------------------------------------------------------
  {
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description: 'A Sony WH-1000XM5 az iparág legjobb zajszűrős fejhallgatója, páratlan hangminőséggel és kényelemmel.',
    fullDescription: `
# Sony WH-1000XM5 - A zajszűrés királya

A **Sony WH-1000XM5** az előző generáció minden erényét megőrzi, miközben jelentős fejlődést hoz a zajszűrés, a kényelem és a hangminőség terén.

## 🔇 Vezető zajszűrés

A 8 mikrofon és két processzor kombinációja biztosítja az iparág legjobb aktív zajszűrését:

### Auto NC Optimizer
Automatikusan optimalizálja a zajszűrést:
- Fejformához igazodás
- Viselési körülmények észlelése
- Légnyomás kompenzáció (repülőn)

## 🎵 Prémium hangminőség

30 mm-es speciálisan fejlesztett meghajtók:
- LDAC Hi-Res Audio kodek
- DSEE Extreme AI upscaling
- 360 Reality Audio támogatás

### Hangprofil személyre szabás
A Sony Headphones Connect app segítségével testre szabhatod a hangot:
- Egyéni EQ beállítások
- Hallásteszt alapú optimalizálás
- Térhatású hangzás beállítások

## ☁️ Ultra könnyű kényelem

Mindössze **250 gramm** a fejeden:
- Puha, bőrbarát párna
- Összecsukható kialakítás
- Prémium tokkal

## 🔋 30 óra üzemidő

- Zajszűréssel: 30 óra
- 3 perc töltés = 3 óra használat
- USB-C gyorstöltés
    `.trim(),
    price: 149990,
    category: 'Fülhallgatók',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    ],
    rating: 4.9,
    stock: 35,
    brandSlug: 'sony',
    metaTitle: 'Sony WH-1000XM5 zajszűrős fejhallgató | NEXU',
    metaDescription: 'Sony WH-1000XM5: az iparág legjobb zajszűrése, 30 óra üzemidő, prémium hangminőség. Vásárolj most!',
    metaKeywords: 'Sony WH-1000XM5, zajszűrős fejhallgató, wireless fejhallgató, ANC, bluetooth fejhallgató',
    gtin: '4548736132610',
    sku: 'SONY-WH1000XM5',
    specifications: [
      { key: 'Típus', value: 'Zárt, circumaural fejhallgató', type: 'text' },
      { key: 'Meghajtó', value: '30mm, speciálisan fejlesztett', type: 'text' },
      { key: 'Frekvenciaátvitel', value: '4 Hz - 40 kHz (LDAC)', type: 'text' },
      { key: 'Impedancia', value: '48 ohm', type: 'text' },
      { key: 'Érzékenység', value: '102 dB/mW', type: 'text' },
      { key: 'Bluetooth verzió', value: '5.2', type: 'text' },
      { key: 'Bluetooth kodekek', value: 'SBC, AAC, LDAC, LC3', type: 'text' },
      { key: 'Üzemidő', value: '30 óra (ANC be)', type: 'text' },
      { key: 'Töltési idő', value: '3.5 óra', type: 'text' },
      { key: 'Gyorstöltés', value: '3 perc = 3 óra', type: 'text' },
      { key: 'Multipoint', value: true, type: 'boolean' },
      { key: 'Hi-Res Audio', value: true, type: 'boolean' },
      { key: 'Speak-to-Chat', value: true, type: 'boolean' },
      { key: 'Súly', value: '250 g', type: 'text' },
    ],
    options: [
      { name: 'Szín', values: ['Fekete', 'Ezüst'] },
    ],
    variants: [
      { attributes: { Szín: 'Fekete' }, price: 149990, stock: 20, sku: 'WH1000XM5-BLK', slug: 'fekete' },
      { attributes: { Szín: 'Ezüst' }, price: 149990, stock: 15, sku: 'WH1000XM5-SLV', slug: 'ezust' },
    ],
  },

  // -------------------------------------------------------------------------
  // Apple Watch Ultra 2
  // -------------------------------------------------------------------------
  {
    name: 'Apple Watch Ultra 2',
    slug: 'apple-watch-ultra-2',
    description: 'Az Apple Watch Ultra 2 a legstrapabíróbb és legsokoldalúbb Apple Watch, sportolóknak és kalandoroknak.',
    fullDescription: `
# Apple Watch Ultra 2 - Határtalan lehetőségek

Az **Apple Watch Ultra 2** az Apple valaha készített legstrapabíróbb és legsokoldalúbb okosórája. Kalandorok, sportolók és extrém körülmények közé tervezve.

## 🏔️ Extrém strapabírás

Titánból készült házban:
- **Aerospace-grade titán** keret
- **Zafírkristály** kijelző
- **100 méter** vízállóság
- **MIL-STD 810H** katonai szabvány

### Minden körülményre felkészülve
- Működés -20°C és +55°C között
- 10 ATM nyomásállóság
- Magas tengerszint kompenzáció (akár 9000m)

## 🖥️ Vakítóan fényes kijelző

Az Always-On Retina kijelző **3000 nits** csúcsfényerővel:
- Közvetlen napfényben is olvasható
- Éjszakai mód piros megvilágítással
- Testreszabható számlap komplikációkkal

## 🏃 Sporttevékenységek

Speciális funkciók minden sportághoz:
- **Futás**: Tempó zónák, vertikális oszcilláció
- **Kerékpár**: Teljesítmény zónák, FTP
- **Úszás**: SWOLF pontszám, körlap követés
- **Búvárkodás**: Mélység és vízhőmérséklet mérés (40m-ig)

## 📍 Precíziós navigáció

Kettős frekvenciás GPS:
- L1 + L5 GPS
- Visszaút funkció
- Iránytű waypoint-okkal
- Offline térkép támogatás
    `.trim(),
    price: 399990,
    category: 'Okosórák',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
    images: [
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
      'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800',
    ],
    rating: 4.9,
    stock: 25,
    brandSlug: 'apple',
    metaTitle: 'Apple Watch Ultra 2 | NEXU',
    metaDescription: 'Apple Watch Ultra 2: titán váz, 3000 nits kijelző, 36 óra üzemidő. A legstrapabíróbb Apple Watch.',
    metaKeywords: 'Apple Watch Ultra 2, okosóra, sportóra, titán óra, GPS óra',
    gtin: '194253944515',
    sku: 'AAPL-AWU2',
    specifications: [
      { key: 'Kijelző', value: '49mm Always-On Retina LTPO OLED', type: 'text' },
      { key: 'Felbontás', value: '502 x 410 pixel', type: 'text' },
      { key: 'Fényerő', value: '3000 nits', type: 'text' },
      { key: 'Processzor', value: 'Apple S9 SiP', type: 'text' },
      { key: 'Tárhely', value: '64 GB', type: 'text' },
      { key: 'Anyag', value: 'Aerospace-grade titán', type: 'text' },
      { key: 'Üveg', value: 'Zafírkristály', type: 'text' },
      { key: 'Vízállóság', value: '100 m (WR100), EN13319', type: 'text' },
      { key: 'GPS', value: 'Kettős frekvenciás (L1 + L5)', type: 'text' },
      { key: 'Üzemidő', value: '36 óra (normál), 72 óra (alacsony fogyasztás)', type: 'text' },
      { key: 'Vér oxigén mérés', value: true, type: 'boolean' },
      { key: 'EKG', value: true, type: 'boolean' },
      { key: 'Baleseti észlelés', value: true, type: 'boolean' },
      { key: 'Súly', value: '61.4 g (tok nélkül)', type: 'text' },
    ],
    options: [
      { name: 'Szíj', values: ['Alpine Loop - Kék', 'Alpine Loop - Narancs', 'Ocean Band - Kék', 'Trail Loop - Fekete/Szürke'] },
    ],
    variants: [
      { attributes: { Szíj: 'Alpine Loop - Kék' }, price: 399990, stock: 8, sku: 'AWU2-ALP-BLU', slug: 'alpine-loop-kek' },
      { attributes: { Szíj: 'Alpine Loop - Narancs' }, price: 399990, stock: 6, sku: 'AWU2-ALP-ORG', slug: 'alpine-loop-narancs' },
      { attributes: { Szíj: 'Ocean Band - Kék' }, price: 399990, stock: 7, sku: 'AWU2-OCN-BLU', slug: 'ocean-band-kek' },
      { attributes: { Szíj: 'Trail Loop - Fekete/Szürke' }, price: 399990, stock: 4, sku: 'AWU2-TRL-BLK', slug: 'trail-loop-fekete-szurke' },
    ],
  },

  // -------------------------------------------------------------------------
  // PlayStation 5 Pro
  // -------------------------------------------------------------------------
  {
    name: 'PlayStation 5 Pro',
    slug: 'playstation-5-pro',
    description: 'A PlayStation 5 Pro a Sony valaha volt legerősebb játékkonzolja, 8K támogatással és fejlett ray tracing-gel.',
    fullDescription: `
# PlayStation 5 Pro - A következő generáció következő szintje

A **PlayStation 5 Pro** nem csupán egy frissítés - ez a konzol játék új dimenziója. Lenyűgöző grafika, villámgyors betöltés és határokat feszegető teljesítmény.

## 🎮 Páratlan teljesítmény

Az új GPU 67%-kal gyorsabb az eredeti PS5-nél:
- **16.7 TFLOPS** grafikai teljesítmény
- Fejlett **ray tracing** egységek
- **PlayStation Spectral Super Resolution** AI upscaling

### 8K Gaming
Támogatás 8K felbontáshoz kompatibilis tévéken - a játékok sosem látott részletességgel kelnek életre.

## ⚡ Ultra gyors SSD

A 2TB-os NVMe SSD újragondolja a játékélményt:
- **10.54 GB/s** olvasási sebesség
- Szinte azonnali betöltés
- Intelligens játékadat kezelés

### Rapid Loading
A Ratchet & Clank: Rift Apart típusú játékok dimenzióváltásai valóban azonnaliak.

## 🕹️ DualSense Elite

A DualSense kontroller tovább fejlődött:
- Adaptív ravaszok
- Haptikus visszajelzés
- Beépített mikrofon
- Cserélhető hátlapok és kar-gombok

## 🌐 Online funkciók

- PlayStation Plus kompatibilitás
- 8K streaming támogatás
- Game Boost PS4 játékokhoz
- VRR változó frissítési ráta
    `.trim(),
    price: 329990,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800',
      'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800',
      'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',
    ],
    rating: 4.8,
    stock: 15,
    brandSlug: 'sony',
    metaTitle: 'PlayStation 5 Pro konzol | NEXU',
    metaDescription: 'PlayStation 5 Pro: 8K gaming, 2TB SSD, fejlett ray tracing. A Sony legerősebb konzolja. Rendeld meg most!',
    metaKeywords: 'PlayStation 5 Pro, PS5 Pro, játékkonzol, Sony konzol, 8K gaming',
    gtin: '711719566571',
    sku: 'SONY-PS5PRO',
    specifications: [
      { key: 'CPU', value: 'AMD Ryzen Zen 2, 8 mag, 3.85 GHz', type: 'text' },
      { key: 'GPU', value: 'Custom AMD RDNA 3, 16.7 TFLOPS', type: 'text' },
      { key: 'RAM', value: '16 GB GDDR6', type: 'text' },
      { key: 'Tárhely', value: '2 TB NVMe SSD', type: 'text' },
      { key: 'SSD sebesség', value: '10.54 GB/s', type: 'text' },
      { key: 'Optikai meghajtó', value: '4K Blu-ray (külön vásárolható)', type: 'text' },
      { key: 'Kimeneti felbontás', value: '8K, 4K 120Hz', type: 'text' },
      { key: 'HDR támogatás', value: true, type: 'boolean' },
      { key: 'Ray Tracing', value: true, type: 'boolean' },
      { key: 'VRR', value: true, type: 'boolean' },
      { key: 'Wi-Fi', value: 'Wi-Fi 7', type: 'text' },
      { key: 'Méretek', value: '388 x 89 x 216 mm', type: 'text' },
    ],
    options: [
      { name: 'Változat', values: ['Alap konzol', 'Blu-ray meghajtóval'] },
    ],
    variants: [
      { attributes: { Változat: 'Alap konzol' }, price: 329990, stock: 10, sku: 'PS5PRO-DIG', slug: 'alap-konzol' },
      { attributes: { Változat: 'Blu-ray meghajtóval' }, price: 379990, stock: 5, sku: 'PS5PRO-DISC', slug: 'blu-ray-meghajto' },
    ],
  },

  // -------------------------------------------------------------------------
  // Google Pixel 9 Pro
  // -------------------------------------------------------------------------
  {
    name: 'Google Pixel 9 Pro',
    slug: 'google-pixel-9-pro',
    description: 'A Google Pixel 9 Pro a legokosabb Android telefon, a Google AI erejével és kiváló kamerarendszerrel.',
    fullDescription: `
# Google Pixel 9 Pro - AI az élen

A **Pixel 9 Pro** a Google legfejlettebb okostelefonja, ahol a mesterséges intelligencia a mindennapok részévé válik.

## 🤖 Gemini AI

A beépített Gemini asszisztens páratlan képességekkel rendelkezik:
- Természetes beszélgetések
- Képek elemzése és keresés
- Kontextus-alapú segítségnyújtás
- Valós idejű fordítás

## 📸 Magic Editor

A fejlett képszerkesztő AI-val:
- Objektumok áthelyezése
- Háttér eltávolítása
- Megvilágítás utólagos módosítása
- Best Take funkció

## 🔋 24 órás üzemidő

Tensor G4 chippel és optimalizált szoftverrel egész napos használat.
    `.trim(),
    price: 449990,
    category: 'Okostelefonok',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
    ],
    rating: 4.7,
    stock: 30,
    brandSlug: 'google',
    metaTitle: 'Google Pixel 9 Pro | NEXU',
    metaDescription: 'Google Pixel 9 Pro: Gemini AI, Magic Editor, 50MP kamera. A legokosabb Android telefon.',
    metaKeywords: 'Google Pixel 9 Pro, Pixel telefon, Android, Gemini AI',
    gtin: '840244701550',
    sku: 'GOOG-PX9P',
    specifications: [
      { key: 'Kijelző', value: '6.3" Super Actua LTPO OLED', type: 'text' },
      { key: 'Processzor', value: 'Google Tensor G4', type: 'text' },
      { key: 'RAM', value: '16 GB', type: 'text' },
      { key: 'Fő kamera', value: '50 MP + 48 MP + 48 MP', type: 'text' },
      { key: 'Akkumulátor', value: '4700 mAh', type: 'text' },
      { key: 'Vízállóság', value: 'IP68', type: 'text' },
      { key: 'Gemini AI', value: true, type: 'boolean' },
    ],
    options: [
      { name: 'Tárhely', values: ['128GB', '256GB', '512GB'] },
      { name: 'Szín', values: ['Obszidián', 'Porcelán', 'Rózsaszín'] },
    ],
    variants: [
      { attributes: { Tárhely: '128GB', Szín: 'Obszidián' }, price: 449990, stock: 10, sku: 'PX9P-128-BLK', slug: '128gb-obszidian' },
      { attributes: { Tárhely: '128GB', Szín: 'Porcelán' }, price: 449990, stock: 8, sku: 'PX9P-128-WHT', slug: '128gb-porcelan' },
      { attributes: { Tárhely: '256GB', Szín: 'Obszidián' }, price: 499990, stock: 6, sku: 'PX9P-256-BLK', slug: '256gb-obszidian' },
      { attributes: { Tárhely: '512GB', Szín: 'Obszidián' }, price: 599990, stock: 4, sku: 'PX9P-512-BLK', slug: '512gb-obszidian' },
    ],
  },

  // -------------------------------------------------------------------------
  // AirPods Pro 2
  // -------------------------------------------------------------------------
  {
    name: 'AirPods Pro 2',
    slug: 'airpods-pro-2',
    description: 'Az AirPods Pro 2 az Apple legfejlettebb vezeték nélküli fülhallgatója H2 chippel és adaptív zajszűréssel.',
    fullDescription: `
# AirPods Pro 2 - Hallás, újragondolva

Az **AirPods Pro 2** az Apple legfejlettebb vezeték nélküli fülhallgatója, amely forradalmasítja a hangzásélményt.

## 🔇 Adaptív zajszűrés

Az új H2 chip 2x jobb zajszűrést biztosít:
- Folyamatosan alkalmazkodik a környezethez
- Beszélgetés észlelés
- Személyre szabott Spatial Audio

## 🎵 Lossless Audio

USB-C tokkal és az Apple Music Lossless minőséggel:
- 48kHz 24-bit audio
- Adaptive EQ
- Személyre szabott hangzás

## 🔋 30 óra üzemidő

A tokkal együtt:
- 6 óra egyfolytában (ANC be)
- 30 óra összesen
- 5 perc töltés = 1 óra hallgatás
    `.trim(),
    price: 109990,
    category: 'Fülhallgatók',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800',
    ],
    rating: 4.8,
    stock: 50,
    brandSlug: 'apple',
    metaTitle: 'AirPods Pro 2 | NEXU',
    metaDescription: 'AirPods Pro 2: H2 chip, adaptív zajszűrés, 30 óra üzemidő. Vásárolj most!',
    metaKeywords: 'AirPods Pro 2, Apple fülhallgató, TWS, zajszűrő fülhallgató',
    gtin: '194253939474',
    sku: 'AAPL-APP2',
    specifications: [
      { key: 'Típus', value: 'True Wireless (TWS)', type: 'text' },
      { key: 'Chip', value: 'Apple H2', type: 'text' },
      { key: 'Üzemidő (fülhallgató)', value: '6 óra', type: 'text' },
      { key: 'Üzemidő (tokkal)', value: '30 óra', type: 'text' },
      { key: 'Aktív zajszűrés', value: true, type: 'boolean' },
      { key: 'Spatial Audio', value: true, type: 'boolean' },
      { key: 'Vízállóság', value: 'IPX4', type: 'text' },
    ],
    options: [
      { name: 'Tok típus', values: ['USB-C tok', 'MagSafe tok'] },
    ],
    variants: [
      { attributes: { 'Tok típus': 'USB-C tok' }, price: 109990, stock: 30, sku: 'APP2-USBC', slug: 'usb-c-tok' },
      { attributes: { 'Tok típus': 'MagSafe tok' }, price: 119990, stock: 20, sku: 'APP2-MAG', slug: 'magsafe-tok' },
    ],
  },

  // -------------------------------------------------------------------------
  // iPad Pro 13" M4
  // -------------------------------------------------------------------------
  {
    name: 'iPad Pro 13" M4',
    slug: 'ipad-pro-13-m4',
    description: 'Az iPad Pro 13" M4 chippel a világ legvékonyabb és legerősebb tabletje. OLED kijelző, Face ID.',
    fullDescription: `
# iPad Pro 13" M4 - Ultra vékony, ultra erős

Az **iPad Pro 13" M4** az Apple valaha készített legvékonyabb eszköze, de a teljesítmény nem szenvedett csorbát.

## 📱 Tandem OLED

Az új Ultra Retina XDR kijelző:
- Dual-layer OLED technológia
- 1000 nits SDR, 1600 nits HDR
- ProMotion 120Hz
- Nano-texture opció

## ⚡ M4 Chip

A legújabb Apple szilícium:
- 10 magos CPU
- 10 magos GPU
- Hardware ray tracing
- Mesh shading támogatás

## ✏️ Apple Pencil Pro

Vadonatúj funkciók:
- Squeeze gesztus
- Barrel Roll érzékelés
- Haptic feedback
- Find My támogatás
    `.trim(),
    price: 599990,
    category: 'Tabletek',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800',
    ],
    rating: 4.9,
    stock: 20,
    brandSlug: 'apple',
    metaTitle: 'iPad Pro 13" M4 | NEXU',
    metaDescription: 'iPad Pro 13" M4 chippel: OLED kijelző, ultra vékony design, Apple Pencil Pro támogatás.',
    metaKeywords: 'iPad Pro, M4 chip, tablet, Apple tablet, OLED tablet',
    gtin: '194253427650',
    sku: 'AAPL-IPADPRO13',
    specifications: [
      { key: 'Kijelző', value: '13" Ultra Retina XDR OLED', type: 'text' },
      { key: 'Felbontás', value: '2752 x 2064 pixel', type: 'text' },
      { key: 'Processzor', value: 'Apple M4 (10 magos)', type: 'text' },
      { key: 'GPU', value: '10 magos GPU', type: 'text' },
      { key: 'Face ID', value: true, type: 'boolean' },
      { key: 'Apple Pencil Pro', value: true, type: 'boolean' },
      { key: 'Thunderbolt port', value: true, type: 'boolean' },
      { key: 'Vastagság', value: '5.1 mm', type: 'text' },
    ],
    options: [
      { name: 'Tárhely', values: ['256GB', '512GB', '1TB', '2TB'] },
      { name: 'Kapcsolat', values: ['Wi-Fi', 'Wi-Fi + Cellular'] },
      { name: 'Szín', values: ['Asztroszürke', 'Ezüst'] },
    ],
    variants: [
      { attributes: { Tárhely: '256GB', Kapcsolat: 'Wi-Fi', Szín: 'Asztroszürke' }, price: 599990, stock: 5, sku: 'IPADPRO-256-WIFI-GRY', slug: '256gb-wifi-asztroszurke' },
      { attributes: { Tárhely: '256GB', Kapcsolat: 'Wi-Fi', Szín: 'Ezüst' }, price: 599990, stock: 4, sku: 'IPADPRO-256-WIFI-SLV', slug: '256gb-wifi-ezust' },
      { attributes: { Tárhely: '512GB', Kapcsolat: 'Wi-Fi', Szín: 'Asztroszürke' }, price: 729990, stock: 3, sku: 'IPADPRO-512-WIFI-GRY', slug: '512gb-wifi-asztroszurke' },
      { attributes: { Tárhely: '1TB', Kapcsolat: 'Wi-Fi + Cellular', Szín: 'Asztroszürke' }, price: 999990, stock: 2, sku: 'IPADPRO-1TB-CELL-GRY', slug: '1tb-cellular-asztroszurke' },
    ],
  },

  // -------------------------------------------------------------------------
  // Samsung Galaxy Watch 7 Ultra
  // -------------------------------------------------------------------------
  {
    name: 'Samsung Galaxy Watch Ultra',
    slug: 'samsung-galaxy-watch-ultra',
    description: 'A Samsung Galaxy Watch Ultra a legstrapabíróbb Galaxy Watch titán házzal és 100 órás GPS üzemidővel.',
    fullDescription: `
# Samsung Galaxy Watch Ultra - Határtalan lehetőségek

A **Galaxy Watch Ultra** a Samsung válasza az extrém követelményekre. Titán váz, 100 óra GPS üzemidő és Wear OS 5.

## 🏔️ Grade 4 titán

A legkeményebb Galaxy Watch:
- 10 ATM + IP68 vízállóság
- MIL-STD-810H tanúsítás
- Zafírkristály üveg
- -20°C-tól +55°C-ig

## 🗺️ Kettős GPS

Precíziós navigáció minden terepen:
- GPS + Galileo + BeiDou
- 100 óra útvonal követés
- Offline térkép támogatás
- 3D magassági adatok
    `.trim(),
    price: 279990,
    category: 'Okosórák',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
    ],
    rating: 4.7,
    stock: 15,
    brandSlug: 'samsung',
    metaTitle: 'Samsung Galaxy Watch Ultra | NEXU',
    metaDescription: 'Samsung Galaxy Watch Ultra: titán váz, 100 óra GPS, Wear OS 5. Extrém okosóra.',
    metaKeywords: 'Samsung Galaxy Watch Ultra, okosóra, sportóra, GPS óra, titán',
    gtin: '8806095581163',
    sku: 'SAM-GWULTRA',
    specifications: [
      { key: 'Kijelző', value: '47mm Super AMOLED', type: 'text' },
      { key: 'Anyag', value: 'Grade 4 titán', type: 'text' },
      { key: 'Processzor', value: 'Exynos W1000', type: 'text' },
      { key: 'RAM', value: '2 GB', type: 'text' },
      { key: 'Tárhely', value: '32 GB', type: 'text' },
      { key: 'Akkumulátor', value: '590 mAh', type: 'text' },
      { key: 'GPS üzemidő', value: '100 óra', type: 'text' },
      { key: 'Vízállóság', value: '10 ATM + IP68', type: 'text' },
      { key: 'EKG', value: true, type: 'boolean' },
      { key: 'Vérnyomás mérés', value: true, type: 'boolean' },
    ],
    options: [
      { name: 'Szín', values: ['Titán szürke', 'Titán ezüst', 'Titán fehérarany'] },
    ],
    variants: [
      { attributes: { Szín: 'Titán szürke' }, price: 279990, stock: 6, sku: 'GWULTRA-GRY', slug: 'titan-szurke' },
      { attributes: { Szín: 'Titán ezüst' }, price: 279990, stock: 5, sku: 'GWULTRA-SLV', slug: 'titan-ezust' },
      { attributes: { Szín: 'Titán fehérarany' }, price: 279990, stock: 4, sku: 'GWULTRA-WHT', slug: 'titan-feherarany' },
    ],
  },

  // -------------------------------------------------------------------------
  // ASUS ROG Ally X
  // -------------------------------------------------------------------------
  {
    name: 'ASUS ROG Ally X',
    slug: 'asus-rog-ally-x',
    description: 'Az ASUS ROG Ally X a legfejlettebb hordozható PC gaming konzol AMD Ryzen Z1 Extreme processzorral.',
    fullDescription: `
# ASUS ROG Ally X - PC gaming a zsebedben

Az **ROG Ally X** az ASUS válasza a Steam Deck-re. Valódi Windows 11, AAA játékok, és a ROG gaming örökség.

## 🎮 AMD Z1 Extreme

A leggyorsabb hordozható gaming chip:
- 8 magos Zen 4 CPU
- RDNA 3 GPU (8.6 TFLOPS)
- 24 GB LPDDR5X RAM
- Up to 8.6 TFLOPS

## 🖥️ 120Hz VRR kijelző

7 colos Full HD+ IPS:
- 1920 x 1080 felbontás
- 120Hz frissítési ráta
- AMD FreeSync Premium
- 500 nits fényerő

## 🔋 80Wh akkumulátor

Kitartó játékidő:
- Akár 8 óra könnyű játékokkal
- 100W USB-C töltés
- Cserélhető SSD (M.2 2230)
    `.trim(),
    price: 349990,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800',
    images: [
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800',
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
      'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=800',
    ],
    rating: 4.6,
    stock: 12,
    brandSlug: 'asus',
    metaTitle: 'ASUS ROG Ally X | NEXU',
    metaDescription: 'ASUS ROG Ally X: AMD Z1 Extreme, 24GB RAM, 120Hz kijelző. Hordozható gaming PC.',
    metaKeywords: 'ROG Ally X, ASUS, hordozható konzol, gaming PC, Steam Deck alternatíva',
    gtin: '4711387066751',
    sku: 'ASUS-ROGALLYX',
    specifications: [
      { key: 'Kijelző', value: '7" FHD+ IPS, 120Hz', type: 'text' },
      { key: 'Processzor', value: 'AMD Ryzen Z1 Extreme', type: 'text' },
      { key: 'GPU', value: 'AMD RDNA 3 (8.6 TFLOPS)', type: 'text' },
      { key: 'RAM', value: '24 GB LPDDR5X', type: 'text' },
      { key: 'Operációs rendszer', value: 'Windows 11 Home', type: 'text' },
      { key: 'Akkumulátor', value: '80 Wh', type: 'text' },
      { key: 'Súly', value: '678 g', type: 'text' },
      { key: 'VRR támogatás', value: true, type: 'boolean' },
    ],
    options: [
      { name: 'Tárhely', values: ['1TB'] },
      { name: 'Szín', values: ['Fekete'] },
    ],
    variants: [
      { attributes: { Tárhely: '1TB', Szín: 'Fekete' }, price: 349990, stock: 12, sku: 'ROGALLYX-1TB', slug: '1tb-fekete' },
    ],
  },
]

// ============================================================================
// REVIEWS
// ============================================================================
const sampleReviews = [
  { rating: 5, text: 'Fantasztikus termék! Minden elvárásomnak megfelelt, sőt túl is szárnyalta. A minőség kiváló, a kiszállítás gyors volt. Csak ajánlani tudom mindenkinek!', userName: 'Kovács Péter' },
  { rating: 5, text: 'Régóta kerestem ilyen minőségű terméket. A NEXU-nál végre megtaláltam! A csomagolás prémium, a termék hibátlan állapotban érkezett.', userName: 'Nagy Anna' },
  { rating: 4, text: 'Nagyon elégedett vagyok a vásárlásommal. A termék minősége kiváló, csak az ár lehetne kicsit barátságosabb. De egyébként minden szuper!', userName: 'Tóth Gábor' },
  { rating: 5, text: 'Ez a legjobb vásárlásom idén! A termék pontosan olyan, mint a képeken, a leírás is pontos. Az ügyfélszolgálat is segítőkész volt.', userName: 'Szabó Eszter' },
  { rating: 4, text: 'Jó minőségű termék, megérte az árát. A szállítás gyors volt, 2 nap alatt megérkezett. Legközelebb is itt fogok vásárolni.', userName: 'Kiss László' },
  { rating: 5, text: 'Tökéletes ajándék volt! Aki kapta, nagyon örült neki. A NEXU megbízható webshop, már többször rendeltem tőlük.', userName: 'Horváth Mária' },
  { rating: 3, text: 'A termék jó, de a doboz kicsit sérült volt. A termék maga szerencsére hibátlan. Az ügyfélszolgálat gyorsan reagált a jelzésemre.', userName: 'Varga Balázs' },
  { rating: 5, text: 'Imádom! Már egy hónapja használom és tökéletesen működik. A minőség prémium kategóriás, az ár-érték arány kiváló.', userName: 'Molnár Katalin' },
]

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function main() {
  console.log('🗑️  Adatok törlése...')
  
  // Delete in correct order due to foreign key constraints
  await prisma.orderNote.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.inventoryLog.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productOption.deleteMany()
  await prisma.product.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()
  
  console.log('✅ Adatok törölve!\n')

  // -------------------------------------------------------------------------
  // CREATE CATEGORIES
  // -------------------------------------------------------------------------
  console.log('📁 Kategóriák létrehozása...')
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log(`✅ ${categories.length} kategória létrehozva!\n`)

  // -------------------------------------------------------------------------
  // CREATE BRANDS
  // -------------------------------------------------------------------------
  console.log('🏷️  Brandek létrehozása...')
  const brandMap: Record<string, string> = {}
  for (const brand of brands) {
    // First try to find existing brand by name
    let existing = await prisma.brand.findFirst({ where: { name: brand.name } })
    if (existing) {
      await prisma.brand.update({ where: { id: existing.id }, data: brand })
      brandMap[brand.name.toLowerCase()] = existing.id
    } else {
      const created = await prisma.brand.create({ data: brand })
      brandMap[brand.name.toLowerCase()] = created.id
    }
  }
  console.log(`✅ ${brands.length} brand létrehozva!\n`)

  // -------------------------------------------------------------------------
  // CREATE PRODUCTS WITH VARIANTS
  // -------------------------------------------------------------------------
  console.log('📦 Termékek létrehozása...')
  
  for (const product of products) {
    const { options, variants, brandSlug, ...productData } = product
    
    // Create product
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        brandId: brandSlug ? brandMap[brandSlug] : undefined,
        specifications: productData.specifications as any,
      },
    })

    // Create options
    if (options && options.length > 0) {
      for (const option of options) {
        await prisma.productOption.create({
          data: {
            name: option.name,
            values: option.values,
            productId: createdProduct.id,
          },
        })
      }
    }

    // Create variants
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            attributes: variant.attributes,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku,
            slug: variant.slug,
            isActive: true,
          },
        })
      }
    }

    // Create reviews
    const reviewCount = Math.floor(Math.random() * 5) + 3 // 3-7 reviews
    const shuffledReviews = [...sampleReviews].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < reviewCount; i++) {
      const review = shuffledReviews[i % shuffledReviews.length]
      await prisma.review.create({
        data: {
          productId: createdProduct.id,
          userName: review.userName,
          rating: review.rating,
          text: review.text,
          status: 'approved',
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      })
    }

    // Update product rating
    const reviews = await prisma.review.findMany({
      where: { productId: createdProduct.id, status: 'approved' },
    })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    await prisma.product.update({
      where: { id: createdProduct.id },
      data: { rating: Math.round(avgRating * 10) / 10 },
    })

    console.log(`  ✓ ${product.name} (${variants?.length || 0} variáns, ${reviewCount} értékelés)`)
  }

  console.log(`\n✅ ${products.length} termék létrehozva!\n`)

  // -------------------------------------------------------------------------
  // CREATE SAMPLE BLOG POSTS
  // -------------------------------------------------------------------------
  console.log('📝 Blog bejegyzések létrehozása...')
  
  const blogPosts = [
    {
      title: 'iPhone 16 Pro Max teszt: Megérte a várakozás?',
      slug: 'iphone-16-pro-max-teszt',
      excerpt: 'Kipróbáltuk az Apple legújabb csúcstelefonját. Olvasd el részletes tesztünket!',
      content: `
# iPhone 16 Pro Max teszt

Az Apple idén újabb mérföldkőhöz érkezett az iPhone 16 Pro Max-szal. De vajon megéri-e a prémium árat?

## Design és kialakítás

A titán keret továbbra is gyönyörű és praktikus egyszerre. Az új színek közül a Sivatagi Titán lett a kedvencünk.

## Kamera teszt

A 48MP fő kamera képességei lenyűgözőek. Különösen éjszakai körülmények között mutatta meg az igazi erejét.

## Összegzés

Ha teheted, válaszd az iPhone 16 Pro Max-ot. A befektetés hosszú távon megtérül.
      `.trim(),
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      author: 'NEXU Tech',
      published: true,
    },
    {
      title: 'A legjobb zajszűrős fejhallgatók 2026-ban',
      slug: 'legjobb-zajszuros-fejhallgatok-2026',
      excerpt: 'Összehasonlítottuk a piac legjobb ANC fejhallgatóit. Melyik a legjobb választás számodra?',
      content: `
# Zajszűrős fejhallgató útmutató

Ha csendre vágysz a zajos világban, egy jó ANC fejhallgató elengedhetetlen.

## Top 3 választásunk

1. **Sony WH-1000XM5** - A legjobb zajszűrés
2. **Apple AirPods Max** - Legjobb Apple ökoszisztémához
3. **Bose QuietComfort Ultra** - Legjobb kényelem

## Melyiket válaszd?

A döntés az igényeidtől függ. Ha az Apple világban mozogsz, az AirPods Max tökéletes választás.
      `.trim(),
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
      author: 'NEXU Tech',
      published: true,
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post })
  }
  console.log(`✅ ${blogPosts.length} blog bejegyzés létrehozva!\n`)

  // -------------------------------------------------------------------------
  // DONE
  // -------------------------------------------------------------------------
  console.log('🎉 Seed befejezve!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📁 ${categories.length} kategória`)
  console.log(`🏷️  ${brands.length} brand`)
  console.log(`📦 ${products.length} termék`)
  console.log(`📝 ${blogPosts.length} blog bejegyzés`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Hiba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
