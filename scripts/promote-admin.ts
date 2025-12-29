import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Kérlek add meg az email címet paraméterként!')
    console.log('Használat: npx tsx scripts/promote-admin.ts user@example.com')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.error(`Nem található felhasználó ezzel az email címmel: ${email}`)
    process.exit(1)
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  })

  console.log(`Sikeresen adminná tetted a következő felhasználót: ${email}`)
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
