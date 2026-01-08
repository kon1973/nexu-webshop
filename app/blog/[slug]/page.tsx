import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getImageUrl } from '@/lib/image'
import { getSiteUrl } from '@/lib/site'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const siteUrl = getSiteUrl()
  // @ts-ignore
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, image: true }
  })

  if (!post) return { title: 'Bejegyzés nem található' }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${siteUrl}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      url: `${siteUrl}/blog/${slug}`,
      siteName: 'NEXU Webshop',
      locale: 'hu_HU',
      type: 'article',
      ...(post.image && { images: [{ url: getImageUrl(post.image) || '' }] }),
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const siteUrl = getSiteUrl()
  // @ts-ignore
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post || !post.published) return notFound()

  // Article structured data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author
    },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'NEXU Store',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${slug}`
    },
    ...(post.image && { image: getImageUrl(post.image) })
  }

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Kezdőlap',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${slug}`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="container mx-auto px-4 max-w-3xl">
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Vissza a bloghoz
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-400 mb-8 border-b border-white/10 pb-8">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                {new Date(post.createdAt).toLocaleDateString('hu-HU', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2">
                <User size={18} />
                {post.author}
              </div>
            </div>

            {getImageUrl(post.image) && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10">
                <Image
                  src={getImageUrl(post.image)!}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  )
}
