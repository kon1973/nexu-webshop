import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/site'
import { NextResponse } from 'next/server'

// Image sitemap for better Google Images indexing
export async function GET() {
  const siteUrl = getSiteUrl()
  
  // Check if we should serve sitemap
  const isProduction = process.env.VERCEL_ENV === 'production' || 
    (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL)
  
  if (!isProduction) {
    return new NextResponse('Image sitemap not available in development', { status: 404 })
  }

  // Fetch products with images
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      category: true,
      updatedAt: true,
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          images: true,
          attributes: true
        }
      }
    }
  })

  // Fetch blog posts with images
  const blogPosts = await prisma.blogPost.findMany({
    where: { published: true },
    select: {
      slug: true,
      title: true,
      image: true,
      updatedAt: true
    }
  })

  // Fetch categories with descriptions (might have images)
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      name: true,
      ogImage: true,
      updatedAt: true
    }
  })

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'

  // Product images
  for (const product of products) {
    const productUrl = product.slug 
      ? `${siteUrl}/shop/${product.slug}`
      : `${siteUrl}/shop/${product.id}`
    
    const allImages: { url: string; title: string; caption?: string }[] = []
    
    // Main product images
    for (const img of product.images || []) {
      const imageUrl = img.startsWith('http') ? img : `${siteUrl}${img}`
      allImages.push({
        url: imageUrl,
        title: product.name,
        caption: `${product.name} - ${product.category}`
      })
    }
    
    // Variant images
    for (const variant of product.variants || []) {
      const variantImages = variant.images as string[] || []
      const attributes = variant.attributes as Record<string, string> || {}
      const variantName = Object.values(attributes).join(' ')
      
      for (const img of variantImages) {
        const imageUrl = img.startsWith('http') ? img : `${siteUrl}${img}`
        // Avoid duplicates
        if (!allImages.some(i => i.url === imageUrl)) {
          allImages.push({
            url: imageUrl,
            title: `${product.name} - ${variantName}`,
            caption: `${product.name} ${variantName} variáns`
          })
        }
      }
    }
    
    if (allImages.length > 0) {
      xml += '  <url>\n'
      xml += `    <loc>${escapeXml(productUrl)}</loc>\n`
      xml += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`
      
      for (const img of allImages.slice(0, 10)) { // Max 10 images per URL
        xml += '    <image:image>\n'
        xml += `      <image:loc>${escapeXml(img.url)}</image:loc>\n`
        xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`
        if (img.caption) {
          xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`
        }
        xml += '    </image:image>\n'
      }
      
      xml += '  </url>\n'
    }
  }

  // Blog post images
  for (const post of blogPosts) {
    if (post.image) {
      const imageUrl = post.image.startsWith('http') ? post.image : `${siteUrl}${post.image}`
      
      xml += '  <url>\n'
      xml += `    <loc>${escapeXml(`${siteUrl}/blog/${post.slug}`)}</loc>\n`
      xml += `    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n`
      xml += '    <image:image>\n'
      xml += `      <image:loc>${escapeXml(imageUrl)}</image:loc>\n`
      xml += `      <image:title>${escapeXml(post.title)}</image:title>\n`
      xml += '    </image:image>\n'
      xml += '  </url>\n'
    }
  }

  // Category images
  for (const category of categories) {
    if (category.ogImage) {
      const imageUrl = category.ogImage.startsWith('http') ? category.ogImage : `${siteUrl}${category.ogImage}`
      
      xml += '  <url>\n'
      xml += `    <loc>${escapeXml(`${siteUrl}/shop?category=${category.slug}`)}</loc>\n`
      xml += `    <lastmod>${category.updatedAt.toISOString()}</lastmod>\n`
      xml += '    <image:image>\n'
      xml += `      <image:loc>${escapeXml(imageUrl)}</image:loc>\n`
      xml += `      <image:title>${escapeXml(category.name)}</image:title>\n`
      xml += '    </image:image>\n'
      xml += '  </url>\n'
    }
  }

  xml += '</urlset>'

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
