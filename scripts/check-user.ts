import { prisma } from '../lib/prisma'

async function main() {
  // Update user to admin and verify email
  const user = await prisma.user.update({
    where: { email: 'konczolrobert@gmail.com' },
    data: { 
      role: 'admin',
      emailVerified: new Date()
    },
    select: { 
      id: true, 
      email: true, 
      role: true, 
      emailVerified: true, 
      isBanned: true 
    }
  })
  console.log('Updated user data:')
  console.log(JSON.stringify(user, null, 2))
}

main().finally(() => prisma.$disconnect())
