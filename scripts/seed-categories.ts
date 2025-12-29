
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

const categories = ['Drón', 'VR & AR', 'Audio', 'Mobil', 'Konzol', 'Kamera', 'Egyéb']

async function main() {
  console.log('Seeding categories...')
  
  for (const name of categories) {
    const slug = name.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug
      }
    })
  }
  
  console.log('Categories seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
