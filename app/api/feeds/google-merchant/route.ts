import 'server-only'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/site'
import { getImageUrl } from '@/lib/image'
import { getVariantUrl } from '@/lib/seo-utils'

/**
 * Google Merchant Center Product Feed (XML/RSS 2.0 format)
 * 
 * This feed can be submitted to Google Merchant Center at:
 * https://merchants.google.com/
 * 
 * Feed URL: https://yourdomain.com/api/feeds/google-merchant
 * 
 * The feed includes:
 * - All active products with stock > 0
 * - Product variants as separate items with item_group_id
 * - Proper pricing, availability, and product identifiers
 */
export async function GET() {
  try {
    const siteUrl = getSiteUrl()
    
    // Fetch all active products with variants and brand
    const products = await prisma.product.findMany({
      where: {
        stock: { gt: 0 },
        isArchived: false
      },
      include: {
        variants: {
          where: {
            isActive: true,
            stock: { gt: 0 }
          }
        },
        options: true,
        brand: true
      }
    })

    const now = new Date()
    
    // Generate feed items
    const items: string[] = []

    for (const product of products as any[]) {
      const isOnSale = product.salePrice && 
        (!product.saleStartDate || new Date(product.saleStartDate) <= now) && 
        (!product.saleEndDate || new Date(product.saleEndDate) >= now)
      
      const basePrice = isOnSale ? product.salePrice! : product.price
      const imageUrl = getImageUrl(product.images[0])
      const fullImageUrl = imageUrl?.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`
      
      // Use SEO-friendly slug or id for product URL
      const productPath = product.slug ? product.slug : String(product.id)
      const brandName = product.brand?.name || 'NEXU'

      // If product has variants, create separate items for each variant
      if (product.variants.length > 0) {
        for (const variant of product.variants) {
          const variantIsOnSale = variant.salePrice && 
            (!variant.saleStartDate || new Date(variant.saleStartDate) <= now) && 
            (!variant.saleEndDate || new Date(variant.saleEndDate) >= now)
          
          const variantPrice = variantIsOnSale ? variant.salePrice! : variant.price
          const variantImageUrl = variant.images[0] 
            ? (getImageUrl(variant.images[0])?.startsWith('http') ? getImageUrl(variant.images[0]) : `${siteUrl}${getImageUrl(variant.images[0])}`)
            : fullImageUrl

          // Build variant title with attributes
          const attributes = variant.attributes as Record<string, string>
          const variantTitle = Object.entries(attributes)
            .map(([key, value]) => `${value}`)
            .join(' - ')
          
          const fullTitle = product.metaTitle 
            ? `${product.metaTitle} - ${variantTitle}` 
            : `${product.name} - ${variantTitle}`

          const productUrl = `${siteUrl}/shop/${productPath}`
          const variantLink = getVariantUrl(productUrl, variant)

          items.push(`
    <item>
      <g:id>${product.id}-${variant.id}</g:id>
      <g:item_group_id>${product.id}</g:item_group_id>
      <title><![CDATA[${escapeXml(fullTitle)}]]></title>
      <description><![CDATA[${escapeXml(product.metaDescription || variant.description || product.description || '')}]]></description>
      <link>${variantLink}</link>
      <g:image_link>${variantImageUrl}</g:image_link>
      ${product.images.slice(1, 10).map((img: string) => {
        const imgUrl = getImageUrl(img)
        return `<g:additional_image_link>${imgUrl?.startsWith('http') ? imgUrl : `${siteUrl}${imgUrl}`}</g:additional_image_link>`
      }).join('\n      ')}
      <g:availability>${variant.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${variantPrice} HUF</g:price>
      ${variantIsOnSale && variant.salePrice ? `<g:sale_price>${variant.salePrice} HUF</g:sale_price>` : ''}
      ${variant.saleEndDate ? `<g:sale_price_effective_date>${now.toISOString()}/${new Date(variant.saleEndDate).toISOString()}</g:sale_price_effective_date>` : ''}
      <g:brand>${escapeXml(brandName)}</g:brand>
      <g:condition>new</g:condition>
      ${variant.sku ? `<g:mpn>${escapeXml(variant.sku)}</g:mpn>` : product.mpn ? `<g:mpn>${escapeXml(product.mpn)}</g:mpn>` : `<g:mpn>${product.id}-${variant.id}</g:mpn>`}
      ${product.gtin ? `<g:gtin>${escapeXml(product.gtin)}</g:gtin>` : ''}
      <g:product_type><![CDATA[${escapeXml(product.category)}]]></g:product_type>
      ${Object.entries(attributes).map(([key, value]) => {
        // Map common attribute names to Google's taxonomy
        const googleAttr = mapAttributeToGoogle(key)
        if (googleAttr) {
          return `<g:${googleAttr}>${escapeXml(String(value))}</g:${googleAttr}>`
        }
        return ''
      }).filter(Boolean).join('\n      ')}
    </item>`)
        }
      } else {
        // Product without variants
        items.push(`
    <item>
      <g:id>${product.id}</g:id>
      <title><![CDATA[${escapeXml(product.metaTitle || product.name)}]]></title>
      <description><![CDATA[${escapeXml(product.metaDescription || product.description || '')}]]></description>
      <link>${siteUrl}/shop/${productPath}</link>
      <g:image_link>${fullImageUrl}</g:image_link>
      ${product.images.slice(1, 10).map((img: string) => {
        const imgUrl = getImageUrl(img)
        return `<g:additional_image_link>${imgUrl?.startsWith('http') ? imgUrl : `${siteUrl}${imgUrl}`}</g:additional_image_link>`
      }).join('\n      ')}
      <g:availability>${product.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${basePrice} HUF</g:price>
      ${isOnSale && product.salePrice ? `<g:sale_price>${product.salePrice} HUF</g:sale_price>` : ''}
      ${product.saleEndDate ? `<g:sale_price_effective_date>${now.toISOString()}/${new Date(product.saleEndDate).toISOString()}</g:sale_price_effective_date>` : ''}
      <g:brand>${escapeXml(brandName)}</g:brand>
      <g:condition>new</g:condition>
      <g:mpn>${product.mpn ? escapeXml(product.mpn) : product.sku ? escapeXml(product.sku) : product.id}</g:mpn>
      ${product.gtin ? `<g:gtin>${escapeXml(product.gtin)}</g:gtin>` : ''}
      <g:product_type><![CDATA[${escapeXml(product.category)}]]></g:product_type>
    </item>`)
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>NEXU Store - Termékek</title>
    <link>${siteUrl}</link>
    <description>NEXU Store termék feed a Google Merchant Center számára</description>
    ${items.join('\n')}
  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating Google Merchant feed:', error)
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 })
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function mapAttributeToGoogle(attributeName: string): string | null {
  const mapping: Record<string, string> = {
    'Szín': 'color',
    'Color': 'color',
    'szín': 'color',
    'color': 'color',
    'Méret': 'size',
    'Size': 'size',
    'méret': 'size',
    'size': 'size',
    'Anyag': 'material',
    'Material': 'material',
    'anyag': 'material',
    'material': 'material',
    'Minta': 'pattern',
    'Pattern': 'pattern',
    'Nem': 'gender',
    'Gender': 'gender',
    'Tárhely': 'size', // For phones - storage as size
    'Storage': 'size',
    'RAM': 'size',
  }
  return mapping[attributeName] || null
}
