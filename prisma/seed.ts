import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

const categories = [
  { name: 'Okostelefonok', slug: 'okostelefonok', icon: 'smartphone' },
  { name: 'Laptopok', slug: 'laptopok', icon: 'laptop' },
  { name: 'Tabletek', slug: 'tabletek', icon: 'tablet' },
  { name: 'Okosórák', slug: 'okosorak', icon: 'watch' },
  { name: 'Fülhallgatók', slug: 'fulhallgatok', icon: 'headphones' },
  { name: 'Konzolok', slug: 'konzolok', icon: 'gamepad' },
  { name: 'Kamerák', slug: 'kamerak', icon: 'camera' },
  { name: 'TV & Audio', slug: 'tv-audio', icon: 'tv' },
  { name: 'Okosotthon', slug: 'okosotthon', icon: 'home' },
  { name: 'Kiegészítők', slug: 'kiegeszitok', icon: 'cable' },
]

const products = [
  // Okostelefonok
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: 599990,
    stock: 15,
    description: 'A legokosabb AI telefon titán kerettel, S Pen támogatással és lenyűgöző kamerarendszerrel.',
    category: 'Okostelefonok',
    image: 'https://placehold.co/600x400/png?text=Samsung+S24+Ultra',
    rating: 4.9,
    specifications: {
      'Kijelző': '6.8" Dynamic AMOLED 2X',
      'Processzor': 'Snapdragon 8 Gen 3',
      'Memória': '12GB RAM',
      'Tárhely': '512GB',
      'Akkumulátor': '5000 mAh'
    }
  },
  {
    name: 'iPhone 15 Pro Max',
    price: 649990,
    stock: 20,
    description: 'Titán dizájn, A17 Pro chip, és a valaha volt legjobb iPhone kamerarendszer.',
    category: 'Okostelefonok',
    image: 'https://placehold.co/600x400/png?text=iPhone+15+Pro+Max',
    rating: 4.8,
    specifications: {
      'Kijelző': '6.7" Super Retina XDR',
      'Processzor': 'A17 Pro',
      'Memória': '8GB RAM',
      'Tárhely': '256GB',
      'Anyag': 'Titán'
    }
  },
  {
    name: 'Google Pixel 8 Pro',
    price: 419990,
    stock: 8,
    description: 'A Google mesterséges intelligenciájával felturbózott Android élmény.',
    category: 'Okostelefonok',
    image: 'https://placehold.co/600x400/png?text=Pixel+8+Pro',
    rating: 4.7,
  },
  {
    name: 'Xiaomi 14 Ultra',
    price: 549990,
    stock: 5,
    description: 'Leica optika és professzionális fotós képességek egy okostelefonban.',
    category: 'Okostelefonok',
    image: 'https://placehold.co/600x400/png?text=Xiaomi+14+Ultra',
    rating: 4.6,
  },

  // Laptopok
  {
    name: 'MacBook Pro 14 M3',
    price: 899990,
    stock: 10,
    description: 'Szédületes teljesítmény az M3 Pro chippel, Liquid Retina XDR kijelzővel.',
    category: 'Laptopok',
    image: 'https://placehold.co/600x400/png?text=MacBook+Pro+14',
    rating: 4.9,
    specifications: {
      'Processzor': 'Apple M3 Pro',
      'Memória': '18GB',
      'Tárhely': '512GB SSD',
      'Kijelző': '14.2" Liquid Retina XDR'
    }
  },
  {
    name: 'Dell XPS 15',
    price: 789990,
    stock: 7,
    description: 'Prémium Windows laptop OLED kijelzővel és erős hardverrel kreatív munkához.',
    category: 'Laptopok',
    image: 'https://placehold.co/600x400/png?text=Dell+XPS+15',
    rating: 4.5,
  },
  {
    name: 'ASUS ROG Zephyrus G14',
    price: 659990,
    stock: 12,
    description: 'Kompakt gamer erőmű AniMe Matrix kijelzővel a fedlapon.',
    category: 'Laptopok',
    image: 'https://placehold.co/600x400/png?text=ROG+Zephyrus',
    rating: 4.8,
  },

  // Tabletek
  {
    name: 'iPad Pro 12.9 M2',
    price: 549990,
    stock: 15,
    description: 'A legfejlettebb iPad mini-LED kijelzővel és asztali szintű teljesítménnyel.',
    category: 'Tabletek',
    image: 'https://placehold.co/600x400/png?text=iPad+Pro',
    rating: 4.9,
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra',
    price: 499990,
    stock: 8,
    description: 'Hatalmas 14.6 colos AMOLED kijelző, vízálló kivitel és S Pen a dobozban.',
    category: 'Tabletek',
    image: 'https://placehold.co/600x400/png?text=Tab+S9+Ultra',
    rating: 4.7,
  },

  // Okosórák
  {
    name: 'Apple Watch Ultra 2',
    price: 379990,
    stock: 18,
    description: 'A legkeményebb és legsokoldalúbb Apple Watch, sportolóknak és kalandoroknak.',
    category: 'Okosórák',
    image: 'https://placehold.co/600x400/png?text=Watch+Ultra+2',
    rating: 4.9,
  },
  {
    name: 'Samsung Galaxy Watch 6 Classic',
    price: 149990,
    stock: 25,
    description: 'Visszatért a forgatható lünetta, prémium dizájn és fejlett egészségkövetés.',
    category: 'Okosórák',
    image: 'https://placehold.co/600x400/png?text=Watch+6+Classic',
    rating: 4.6,
  },

  // Fülhallgatók
  {
    name: 'Sony WH-1000XM5',
    price: 129990,
    stock: 30,
    description: 'Piacvezető zajszűrés és kivételes hangminőség kényelmes kivitelben.',
    category: 'Fülhallgatók',
    image: 'https://placehold.co/600x400/png?text=Sony+XM5',
    rating: 4.8,
  },
  {
    name: 'AirPods Pro 2',
    price: 109990,
    stock: 40,
    description: 'Akár kétszer erősebb aktív zajszűrés, adaptív hang és személyre szabott térbeli hangzás.',
    category: 'Fülhallgatók',
    image: 'https://placehold.co/600x400/png?text=AirPods+Pro+2',
    rating: 4.9,
  },
  {
    name: 'Sennheiser Momentum 4',
    price: 119990,
    stock: 10,
    description: 'Audiofil hangzás és 60 órás akkumulátor üzemidő.',
    category: 'Fülhallgatók',
    image: 'https://placehold.co/600x400/png?text=Momentum+4',
    rating: 4.7,
  },

  // Konzolok
  {
    name: 'PlayStation 5 Slim',
    price: 199990,
    stock: 50,
    description: 'Ugyanaz a lenyűgöző erő, karcsúbb kivitelben. Játssz úgy, mint még soha.',
    category: 'Konzolok',
    image: 'https://placehold.co/600x400/png?text=PS5+Slim',
    rating: 4.9,
  },
  {
    name: 'Xbox Series X',
    price: 189990,
    stock: 35,
    description: 'A legerősebb Xbox valaha. 4K gaming 120 FPS-sel.',
    category: 'Konzolok',
    image: 'https://placehold.co/600x400/png?text=Xbox+Series+X',
    rating: 4.8,
  },
  {
    name: 'Nintendo Switch OLED',
    price: 139990,
    stock: 20,
    description: 'Élénk 7 hüvelykes OLED kijelzővel a még jobb hordozható játékélményért.',
    category: 'Konzolok',
    image: 'https://placehold.co/600x400/png?text=Switch+OLED',
    rating: 4.7,
  },

  // Kamerák
  {
    name: 'Sony Alpha 7 IV',
    price: 999990,
    stock: 5,
    description: 'Hibrid full-frame kamera, amely új mércét állít fel a fotózásban és videózásban.',
    category: 'Kamerák',
    image: 'https://placehold.co/600x400/png?text=Sony+A7+IV',
    rating: 4.9,
  },
  {
    name: 'DJI Osmo Pocket 3',
    price: 249990,
    stock: 15,
    description: 'Kompakt 4K kamera 1 colos szenzorral és mechanikus stabilizátorral.',
    category: 'Kamerák',
    image: 'https://placehold.co/600x400/png?text=Osmo+Pocket+3',
    rating: 4.8,
  },
  {
    name: 'GoPro Hero 12 Black',
    price: 169990,
    stock: 20,
    description: 'Hihetetlen képminőség, még jobb HyperSmooth stabilizálás és hosszabb üzemidő.',
    category: 'Kamerák',
    image: 'https://placehold.co/600x400/png?text=GoPro+Hero+12',
    rating: 4.7,
  },

  // TV & Audio
  {
    name: 'LG C3 OLED TV 55"',
    price: 449990,
    stock: 8,
    description: 'Tökéletes fekete, végtelen kontraszt és 120Hz-es frissítés játékhoz.',
    category: 'TV & Audio',
    image: 'https://placehold.co/600x400/png?text=LG+C3+OLED',
    rating: 4.9,
  },
  {
    name: 'Sonos Arc Soundbar',
    price: 379990,
    stock: 10,
    description: 'Prémium okos hangprojektor Dolby Atmos támogatással a moziélményért.',
    category: 'TV & Audio',
    image: 'https://placehold.co/600x400/png?text=Sonos+Arc',
    rating: 4.8,
  },

  // Okosotthon
  {
    name: 'Philips Hue Starter Kit',
    price: 59990,
    stock: 25,
    description: 'Kezdd el okosítani otthonod a színes LED izzókkal és a Bridge központtal.',
    category: 'Okosotthon',
    image: 'https://placehold.co/600x400/png?text=Philips+Hue',
    rating: 4.7,
  },
  {
    name: 'Roborock S8 Pro Ultra',
    price: 549990,
    stock: 4,
    description: 'A robotporszívózás csúcsa: automatikus ürítés, felmosás és tisztítás.',
    category: 'Okosotthon',
    image: 'https://placehold.co/600x400/png?text=Roborock+S8',
    rating: 4.9,
  },

  // Kiegészítők
  {
    name: 'Logitech MX Master 3S',
    price: 44990,
    stock: 40,
    description: 'Ikonikus egér, most még csendesebb kattintással és 8000 DPI érzékelővel.',
    category: 'Kiegészítők',
    image: 'https://placehold.co/600x400/png?text=MX+Master+3S',
    rating: 4.9,
  },
  {
    name: 'Samsung T7 Shield 2TB',
    price: 69990,
    stock: 30,
    description: 'Strapabíró külső SSD villámgyors adatátvitellel.',
    category: 'Kiegészítők',
    image: 'https://placehold.co/600x400/png?text=T7+Shield',
    rating: 4.8,
  }
]

async function main() {
  console.log('Adatbázis tisztítása...')
  
  try {
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.review.deleteMany()
    await prisma.productVariant.deleteMany()
    await prisma.productOption.deleteMany()
    await prisma.favorite.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
  } catch (error) {
    console.error('Hiba a törlésnél (nem kritikus):', error)
  }

  console.log('Kategóriák feltöltése...')
  for (const category of categories) {
    await prisma.category.create({
      data: category
    })
  }

  console.log('Termékek feltöltése...')
  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        images: [product.image] // Set main image as first in images array too
      }
    })
  }

  console.log('Beállítások feltöltése...')
  await prisma.setting.createMany({
    data: [
      { key: 'site_name', value: 'NEXU Webshop', description: 'Az oldal neve' },
      { key: 'site_description', value: 'A jövő technológiája', description: 'Az oldal leírása (SEO)' },
      { key: 'contact_email', value: 'info@nexu.hu', description: 'Kapcsolattartó email' },
      { key: 'contact_phone', value: '+36 1 234 5678', description: 'Kapcsolattartó telefon' },
      { key: 'contact_address', value: '1234 Budapest, Tech utca 42.', description: 'Cím' },
      { key: 'shipping_fee', value: '2990', description: 'Szállítási költség (Ft)' },
      { key: 'free_shipping_threshold', value: '20000', description: 'Ingyenes szállítási határ (Ft)' },
      { key: 'social_facebook', value: 'https://facebook.com', description: 'Facebook link' },
      { key: 'social_instagram', value: 'https://instagram.com', description: 'Instagram link' },
    ],
    skipDuplicates: true,
  })

  console.log('Kész! Az adatbázis sikeresen feltöltve.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
