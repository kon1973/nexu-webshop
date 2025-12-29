
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Samsung Galaxy S25 Ultra létrehozása...')

  const product = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S25 Ultra',
      category: 'Okostelefonok',
      price: 599990,
      stock: 50,
      description: 'A Samsung legújabb csúcskészüléke mesterséges intelligencia funkciókkal és titán kerettel.',
      fullDescription: `
        <p>A Samsung Galaxy S25 Ultra új szintre emeli az okostelefonok világát. A titán keret nemcsak elegáns, de rendkívül strapabíró is. A Snapdragon 8 Gen 4 processzor pedig soha nem látott sebességet biztosít.</p>
        <h3>Főbb jellemzők:</h3>
        <ul>
          <li>200 MP-es főkamera</li>
          <li>Beépített S Pen</li>
          <li>Galaxy AI funkciók</li>
          <li>Hosszú üzemidő</li>
        </ul>
      `,
      image: 'https://images.samsung.com/is/image/samsung/p6pim/hu/2401/gallery/hu-galaxy-s24-s928-sm-s928bztqeue-539609204?$650_519_PNG$', // Using S24 Ultra placeholder as S25 is hypothetical/new
      images: [
        'https://images.samsung.com/is/image/samsung/p6pim/hu/2401/gallery/hu-galaxy-s24-s928-sm-s928bztqeue-539609204?$650_519_PNG$',
        'https://images.samsung.com/is/image/samsung/p6pim/hu/2401/gallery/hu-galaxy-s24-s928-sm-s928bztqeue-thumb-539609206?$480_480_PNG$',
        'https://images.samsung.com/is/image/samsung/p6pim/hu/2401/gallery/hu-galaxy-s24-s928-sm-s928bztqeue-thumb-539609208?$480_480_PNG$'
      ],
      rating: 4.9,
      specifications: [
        { key: 'Kijelző', type: 'header', value: '' },
        { key: 'Kijelző méret', type: 'text', value: '6.8 inch' },
        { key: 'Felbontás', type: 'text', value: '3120 x 1440 pixel' },
        { key: 'Képfrissítés', type: 'text', value: '120 Hz' },
        { key: 'Panel típusa', type: 'text', value: 'Dynamic AMOLED 2X' },
        
        { key: 'Teljesítmény', type: 'header', value: '' },
        { key: 'Processzor', type: 'text', value: 'Snapdragon 8 Gen 4' },
        { key: 'RAM', type: 'text', value: '12 GB' },
        { key: 'Tárhely', type: 'text', value: '256 GB / 512 GB / 1 TB' },
        
        { key: 'Kamera', type: 'header', value: '' },
        { key: 'Fő kamera', type: 'text', value: '200 MP' },
        { key: 'Ultraszéles', type: 'text', value: '50 MP' },
        { key: 'Telefotó', type: 'text', value: '50 MP (5x zoom)' },
        { key: 'Optikai képstabilizátor (OIS)', type: 'boolean', value: true },
        { key: '8K videófelvétel', type: 'boolean', value: true },
        
        { key: 'Akkumulátor', type: 'header', value: '' },
        { key: 'Kapacitás', type: 'text', value: '5000 mAh' },
        { key: 'Gyorstöltés', type: 'text', value: '45W' },
        { key: 'Vezeték nélküli töltés', type: 'boolean', value: true },
        { key: 'Fordított töltés', type: 'boolean', value: true },
        
        { key: 'Egyéb', type: 'header', value: '' },
        { key: 'Vízállóság', type: 'text', value: 'IP68' },
        { key: 'S Pen támogatás', type: 'boolean', value: true },
        { key: 'NFC', type: 'boolean', value: true },
        { key: '5G', type: 'boolean', value: true },
        { key: 'Jack csatlakozó', type: 'boolean', value: false }
      ],
      options: {
        create: [
          {
            name: 'Szín',
            values: ['Titán Szürke', 'Titán Fekete']
          },
          {
            name: 'Tárhely',
            values: ['256GB', '512GB']
          }
        ]
      }
    }
  })

  // Create variants
  const colors = ['Titán Szürke', 'Titán Fekete']
  const storages = ['256GB', '512GB']
  
  for (const color of colors) {
    for (const storage of storages) {
      const priceModifier = storage === '512GB' ? 50000 : 0
      
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          price: 599990 + priceModifier,
          stock: 10,
          sku: `S25U-${color.substring(0, 3).toUpperCase()}-${storage}`,
          attributes: {
            'Szín': color,
            'Tárhely': storage
          },
          images: product.images,
          description: `${product.name} - ${color}, ${storage}`
        }
      })
    }
  }

  console.log(`Létrehozva: ${product.name} (ID: ${product.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
