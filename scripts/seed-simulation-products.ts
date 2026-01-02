
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Szimulációs termékek betöltése...')

  // Create a dummy user for reviews
  const dummyUser = await prisma.user.upsert({
    where: { email: 'reviewer@example.com' },
    update: {},
    create: {
      email: 'reviewer@example.com',
      name: 'Tesztelő Tamás',
      password: 'hashed_password_placeholder', // In a real app, hash this
      role: 'user'
    }
  })
  
  const userId = dummyUser.id

  // 1. Sony WH-1000XM5
  console.log('Creating Sony WH-1000XM5...')
  const sonyHeadphones = await prisma.product.create({
    data: {
      name: 'Sony WH-1000XM5',
      category: 'Fülhallgatók',
      price: 129990,
      stock: 40,
      description: 'Piacvezető zajszűrés, kivételes hangzás és kristálytiszta hívások.',
      fullDescription: `
        <p>A Sony WH-1000XM5 vezeték nélküli zajszűrős fejhallgató új mércét állít fel a zavartalan zenehallgatásban. A két processzor nyolc mikrofont vezérel a példátlan zajszűrés érdekében.</p>
        <h3>Kiemelt tulajdonságok:</h3>
        <ul>
          <li>Iparági vezető zajszűrés</li>
          <li>Akár 30 órás akkumulátor-üzemidő</li>
          <li>Kényelmes, könnyű kialakítás</li>
        </ul>
      `,
      image: 'https://placehold.co/600x600/1a1a1a/ffffff/png?text=Sony+XM5+Black',
      images: [
        'https://placehold.co/600x600/1a1a1a/ffffff/png?text=Sony+XM5+Black',
        'https://placehold.co/600x600/e0e0e0/333333/png?text=Sony+XM5+Silver',
        'https://placehold.co/600x600/333333/ffffff/png?text=Sony+XM5+Case'
      ],
      rating: 4.8,
      specifications: [
        { key: 'Hangzás', type: 'header', value: '' },
        { key: 'Driver méret', type: 'text', value: '30 mm' },
        { key: 'Frekvenciaátvitel', type: 'text', value: '4 Hz - 40 000 Hz' },
        { key: 'Hi-Res Audio', type: 'boolean', value: true },
        
        { key: 'Funkciók', type: 'header', value: '' },
        { key: 'Aktív zajszűrés (ANC)', type: 'boolean', value: true },
        { key: 'Bluetooth verzió', type: 'text', value: '5.2' },
        { key: 'Multipoint csatlakozás', type: 'boolean', value: true },
        
        { key: 'Akkumulátor', type: 'header', value: '' },
        { key: 'Üzemidő (ANC be)', type: 'text', value: '30 óra' },
        { key: 'Töltési idő', type: 'text', value: '3.5 óra' }
      ],
      options: {
        create: [
          { name: 'Szín', values: ['Fekete', 'Ezüst'] }
        ]
      },
      reviews: {
        create: [
          {
            userName: 'Audiofil András',
            rating: 5,
            text: 'Egyszerűen a legjobb zajszűrés, amit valaha hallottam. A repülőn semmit sem hallottam a hajtóműből.',
            userId: userId
          },
          {
            userName: 'Zene Zita',
            rating: 4,
            text: 'Kicsit melegszik a fülem alatt nyáron, de a hangzás kárpótol.',
            userId: userId
          }
        ]
      }
    }
  })

  // Variants for Sony
  await prisma.productVariant.create({
    data: {
      productId: sonyHeadphones.id,
      price: 129990,
      stock: 25,
      sku: 'SONY-XM5-BLK',
      attributes: { 'Szín': 'Fekete' },
      images: ['https://placehold.co/600x600/1a1a1a/ffffff/png?text=Sony+XM5+Black'],
      description: 'Sony WH-1000XM5 Fekete színben'
    }
  })
  await prisma.productVariant.create({
    data: {
      productId: sonyHeadphones.id,
      price: 129990,
      stock: 15,
      sku: 'SONY-XM5-SLV',
      attributes: { 'Szín': 'Ezüst' },
      images: ['https://placehold.co/600x600/e0e0e0/333333/png?text=Sony+XM5+Silver'],
      description: 'Sony WH-1000XM5 Ezüst színben'
    }
  })


  // 2. Apple MacBook Air 15 M3
  console.log('Creating MacBook Air 15 M3...')
  const macbook = await prisma.product.create({
    data: {
      name: 'MacBook Air 15 M3',
      category: 'Laptopok',
      price: 629990,
      stock: 20,
      description: 'Nagyobb kijelző, vékonyabb dizájn, M3 chip erejével.',
      fullDescription: `
        <p>A 15 hüvelykes MacBook Airrel több helyed van arra, amit szeretsz csinálni. A hihetetlenül vékony és könnyű házban az M3 chip dolgozik.</p>
      `,
      image: 'https://placehold.co/800x500/2c3e50/ffffff/png?text=MacBook+Air+15+Midnight',
      images: [
        'https://placehold.co/800x500/2c3e50/ffffff/png?text=MacBook+Air+15+Midnight',
        'https://placehold.co/800x500/f5f5dc/333333/png?text=MacBook+Air+15+Starlight'
      ],
      rating: 4.9,
      specifications: [
        { key: 'Teljesítmény', type: 'header', value: '' },
        { key: 'Chip', type: 'text', value: 'Apple M3' },
        { key: 'CPU magok', type: 'text', value: '8 magos' },
        { key: 'GPU magok', type: 'text', value: '10 magos' },
        
        { key: 'Kijelző', type: 'header', value: '' },
        { key: 'Méret', type: 'text', value: '15.3 inch' },
        { key: 'Típus', type: 'text', value: 'Liquid Retina' },
        { key: 'Fényerő', type: 'text', value: '500 nit' },
        
        { key: 'Egyéb', type: 'header', value: '' },
        { key: 'Súly', type: 'text', value: '1.51 kg' },
        { key: 'Touch ID', type: 'boolean', value: true }
      ],
      options: {
        create: [
          { name: 'Szín', values: ['Éjfekete', 'Csillagfény'] },
          { name: 'Memória', values: ['8GB', '16GB'] },
          { name: 'Tárhely', values: ['256GB', '512GB'] }
        ]
      }
    }
  })

  // Variants for MacBook (Simplified combination)
  const mbColors = [
    { name: 'Éjfekete', hex: '2c3e50', img: 'Midnight' },
    { name: 'Csillagfény', hex: 'f5f5dc', img: 'Starlight' }
  ]
  const mbRams = ['8GB', '16GB']
  const mbStorages = ['256GB', '512GB']

  for (const color of mbColors) {
    for (const ram of mbRams) {
      for (const storage of mbStorages) {
        const priceDiff = (ram === '16GB' ? 80000 : 0) + (storage === '512GB' ? 80000 : 0)
        
        await prisma.productVariant.create({
          data: {
            productId: macbook.id,
            price: 629990 + priceDiff,
            stock: Math.floor(Math.random() * 5) + 1,
            sku: `MBA15-${color.img.substring(0,3).toUpperCase()}-${ram}-${storage}`,
            attributes: {
              'Szín': color.name,
              'Memória': ram,
              'Tárhely': storage
            },
            images: [`https://placehold.co/800x500/${color.hex}/ffffff/png?text=MacBook+Air+15+${color.img}`],
            description: `MacBook Air 15 M3 - ${color.name}, ${ram}, ${storage}`
          }
        })
      }
    }
  }


  // 3. Garmin Fenix 8
  console.log('Creating Garmin Fenix 8...')
  const garmin = await prisma.product.create({
    data: {
      name: 'Garmin Fenix 8',
      category: 'Okosórák',
      price: 449990,
      stock: 10,
      description: 'A végső multisport GPS óra AMOLED kijelzővel és beépített zseblámpával.',
      fullDescription: `
        <p>Hódítsd meg a napot minden órában a fejlett edzésfunkciókkal, 24/7 egészségfigyeléssel és akár 16 napos üzemidővel okosóra módban.</p>
      `,
      image: 'https://placehold.co/500x500/333333/ffffff/png?text=Garmin+Fenix+8+47mm',
      images: [
        'https://placehold.co/500x500/333333/ffffff/png?text=Garmin+Fenix+8+47mm',
        'https://placehold.co/500x500/555555/ffffff/png?text=Garmin+Fenix+8+51mm'
      ],
      rating: 5.0,
      specifications: [
        { key: 'Kijelző', type: 'header', value: '' },
        { key: 'Típus', type: 'text', value: 'AMOLED' },
        { key: 'Érintőképernyő', type: 'boolean', value: true },
        
        { key: 'Szenzorok', type: 'header', value: '' },
        { key: 'GPS', type: 'text', value: 'Multiband GNSS' },
        { key: 'Pulzusmérő', type: 'text', value: 'Elevate Gen 5' },
        { key: 'Véroxigén', type: 'boolean', value: true },
        
        { key: 'Strapabírás', type: 'header', value: '' },
        { key: 'Vízállóság', type: 'text', value: '10 ATM' },
        { key: 'Katonai szabvány', type: 'text', value: 'MIL-STD-810' }
      ],
      options: {
        create: [
          { name: 'Méret', values: ['47mm', '51mm'] },
          { name: 'Szíj', values: ['Szilikon', 'Titán'] }
        ]
      },
      reviews: {
        create: [
          {
            userName: 'Futó Feri',
            rating: 5,
            text: 'A legjobb sportóra, amit valaha használtam. Az AMOLED kijelző gyönyörű.',
            userId: userId
          }
        ]
      }
    }
  })

  // Variants for Garmin
  const sizes = ['47mm', '51mm']
  const straps = ['Szilikon', 'Titán']

  for (const size of sizes) {
    for (const strap of straps) {
      const priceDiff = (size === '51mm' ? 40000 : 0) + (strap === 'Titán' ? 80000 : 0)
      const imgText = `Garmin+Fenix+8+${size}+${strap === 'Titán' ? 'Titanium' : 'Silicone'}`
      
      await prisma.productVariant.create({
        data: {
          productId: garmin.id,
          price: 449990 + priceDiff,
          stock: 5,
          sku: `GF8-${size}-${strap.substring(0,3).toUpperCase()}`,
          attributes: {
            'Méret': size,
            'Szíj': strap
          },
          images: [`https://placehold.co/500x500/333333/ffffff/png?text=${imgText}`],
          description: `Garmin Fenix 8 - ${size}, ${strap} szíj`
        }
      })
    }
  }

  console.log('Szimulációs termékek sikeresen létrehozva!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
