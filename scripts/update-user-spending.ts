import { prisma } from '../lib/prisma'
import { updateUserSpending } from '../lib/loyalty'

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } })
  console.log(`Updating spending for ${users.length} users...`)
  
  for (const user of users) {
    await updateUserSpending(user.id)
    process.stdout.write('.')
  }
  console.log('\nDone!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
