import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const BlogPostSchema = z.object({
  title: z.string().min(1, "Cím megadása kötelező"),
  slug: z.string().min(1, "Slug megadása kötelező"),
  content: z.string().min(1, "Tartalom megadása kötelező"),
  excerpt: z.string().optional(),
  image: z.string().optional(),
  author: z.string().min(1, "Szerző megadása kötelező"),
  published: z.boolean().default(false),
})

export type BlogPostInput = z.infer<typeof BlogPostSchema>

export async function createBlogPostService(data: BlogPostInput) {
  const validated = BlogPostSchema.parse(data)

  // Check for duplicate slug
  const existing = await prisma.blogPost.findUnique({
    where: { slug: validated.slug },
  })

  if (existing) {
    throw new Error('Már létezik bejegyzés ezzel a slug-gal')
  }

  return await prisma.blogPost.create({
    data: validated,
  })
}

export async function updateBlogPostService(id: string, data: Partial<BlogPostInput>) {
  const validated = BlogPostSchema.partial().parse(data)

  if (validated.slug) {
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug: validated.slug,
        NOT: { id },
      },
    })

    if (existing) {
      throw new Error('Már létezik bejegyzés ezzel a slug-gal')
    }
  }

  return await prisma.blogPost.update({
    where: { id },
    data: validated,
  })
}

export async function deleteBlogPostService(id: string) {
  return await prisma.blogPost.delete({
    where: { id },
  })
}

export async function getBlogPostService(id: string) {
  return await prisma.blogPost.findUnique({
    where: { id },
  })
}

export async function getAllBlogPostsService(publishedOnly = false) {
  return await prisma.blogPost.findMany({
    where: publishedOnly ? { published: true } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}
