import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const deletedItems = await prisma.cartItem.deleteMany({})
  const deletedCarts = await prisma.cart.deleteMany({})
  console.log(`Törölve: ${deletedItems.count} tétel, ${deletedCarts.count} kosár`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
