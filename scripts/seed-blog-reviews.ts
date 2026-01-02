import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding blog posts and reviews...')

  // Create Blog Posts
  await prisma.blogPost.createMany({
    data: [
      {
        title: 'A jövő laptopjai: Mit várhatunk 2026-ban?',
        slug: 'jovo-laptopjai-2026',
        content: 'A technológia rohamosan fejlődik...',
        excerpt: 'Áttekintjük a legújabb processzorokat, kijelzőtechnológiákat és az AI integrációt a hordozható számítógépekben.',
        author: 'Kovács András',
        published: true,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop',
      },
      {
        title: 'Hogyan válasszunk gamer fejhallgatót?',
        slug: 'hogyan-valasszunk-gamer-fejhallgatot',
        content: 'A jó hangzás fél siker...',
        excerpt: 'Vezetékes vagy vezeték nélküli? Nyitott vagy zárt? Segítünk eligazodni a specifikációk útvesztőjében.',
        author: 'Nagy Eszter',
        published: true,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
      },
      {
        title: 'Okosotthon kezdőknek: Az első lépések',
        slug: 'okosotthon-kezdoknek',
        content: 'Az otthonunk okosítása nem kell, hogy bonyolult legyen...',
        excerpt: 'Milyen eszközökkel érdemes kezdeni? Világítás, fűtés vagy biztonság? Gyakorlati tanácsok az induláshoz.',
        author: 'Szabó Gábor',
        published: true,
        image: 'https://images.unsplash.com/photo-1558002038-1091a166111c?q=80&w=1000&auto=format&fit=crop',
      },
    ],
    skipDuplicates: true,
  })

  // Create Reviews (Need a product ID, let's find one)
  const product = await prisma.product.findFirst()
  
  if (product) {
    await prisma.review.createMany({
      data: [
        {
          productId: product.id,
          userName: 'Varga Tamás',
          rating: 5,
          text: 'Fantasztikus termék, minden várakozásomat felülmúlta. A szállítás is nagyon gyors volt.',
          status: 'approved',
        },
        {
          productId: product.id,
          userName: 'Kiss Júlia',
          rating: 5,
          text: 'Nagyon elégedett vagyok a vásárlással. Az ügyfélszolgálat is segítőkész volt, amikor kérdésem volt.',
          status: 'approved',
        },
        {
          productId: product.id,
          userName: 'Tóth Bence',
          rating: 4,
          text: 'Jó minőségű termék, bár a csomagolás lehetett volna kicsit masszívabb. De a termék sértetlenül érkezett.',
          status: 'approved',
        },
      ],
    })
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
