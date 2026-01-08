import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import RelatedProducts from '@/app/components/RelatedProducts'
import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site'
import ProductDetailsClient from './ProductDetailsClient'
import RecentlyViewed from '@/app/components/RecentlyViewed'
import type { Review, Product } from '@prisma/client'
import { getProductBySlugOrIdService, getProductsService } from '@/lib/services/productService'
import { getRelatedProductsService } from '@/lib/services/recommendationService'
import { generateProductMetaDescription, generateProductMetaTitle, normalizeCanonicalUrl, getVariantUrl } from '@/lib/seo-utils'

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params
  const slugOrId = params.id

  const product = await getProductBySlugOrIdService(slugOrId, true) as any

  if (!product) {
    return { title: 'Termék nem található' }
  }

  const siteUrl = getSiteUrl()
  
  // Always use slug in canonical URL if available
  const productPath = product.slug ? `/shop/${product.slug}` : `/shop/${product.id}`
  const url = new URL(productPath, siteUrl).toString()
  const canonicalUrl = normalizeCanonicalUrl(product.canonicalUrl || url, [])

  // Use SEO fields if available, fallback to auto-generated
  const title = product.metaTitle || generateProductMetaTitle({
    name: product.name,
    category: product.category,
    brand: product.brand
  })
  
  // Auto-generate description if not manually set
  const description = product.metaDescription || generateProductMetaDescription({
    name: product.name,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    category: product.category,
    brand: product.brand,
    stock: product.stock,
    specifications: product.specifications as Array<{ key: string; value: string | boolean }> | null
  })

  // Build keywords array
  const keywords = product.metaKeywords 
    ? product.metaKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [product.name, product.category, 'NEXU', 'webshop']

  return {
    title: title,
    description: description,
    keywords: keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      siteName: 'NEXU Webshop',
      locale: 'hu_HU',
      type: 'website',
      images: product.ogImage 
        ? [{ url: product.ogImage }]
        : product.images.map((img: string) => ({ url: img.startsWith('http') ? img : `${siteUrl}${img}` })),
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description || `Nézd meg a(z) ${product.name} terméket a NEXU Store-ban.`,
    },
    other: {
      // Product-specific meta tags for better SEO
      ...(product.gtin && { 'product:gtin': product.gtin }),
      ...(product.mpn && { 'product:mpn': product.mpn }),
      ...(product.sku && { 'product:sku': product.sku }),
      'product:price:amount': String(product.salePrice || product.price),
      'product:price:currency': 'HUF',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      ...(product.brand && { 'product:brand': product.brand.name }),
    }
  }
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const slugOrId = params.id

  const product = await getProductBySlugOrIdService(slugOrId, true)

  if (!product) return notFound()

  // If accessed by ID but product has a slug, redirect to SEO-friendly URL
  const isAccessedById = /^\d+$/.test(slugOrId)
  if (isAccessedById && product.slug) {
    redirect(`/shop/${product.slug}`)
  }

  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  if (product.isArchived && !isAdmin) {
    return notFound()
  }

  const relatedProducts = await getRelatedProductsService(product.id)

  const siteUrl = getSiteUrl()
  const productUrl = new URL(product.slug ? `/shop/${product.slug}` : `/shop/${product.id}`, siteUrl).toString()

  const isOnSale = product.salePrice && 
    (!product.saleStartDate || new Date(product.saleStartDate) <= new Date()) && 
    (!product.saleEndDate || new Date(product.saleEndDate) >= new Date())

  const currentPrice = isOnSale ? product.salePrice : product.price

  // Helper to get availability URL based on stock
  const getAvailabilityUrl = (stock: number, preorder?: boolean) => {
    if (preorder) return 'https://schema.org/PreOrder'
    if (stock > 10) return 'https://schema.org/InStock'
    if (stock > 0) return 'https://schema.org/LimitedAvailability'
    return 'https://schema.org/OutOfStock'
  }

  // Generate offers for variants if they exist (include all active variants)
  const variantOffers = product.variants && product.variants.length > 0 
    ? product.variants.filter((v: any) => v.isActive).map((variant: any) => {
        const variantIsOnSale = variant.salePrice && 
          (!variant.saleStartDate || new Date(variant.saleStartDate) <= new Date()) && 
          (!variant.saleEndDate || new Date(variant.saleEndDate) >= new Date())
        const variantPrice = variantIsOnSale ? variant.salePrice : variant.price
        const attributes = variant.attributes as Record<string, string>
        
        return {
          '@type': 'Offer',
          priceCurrency: 'HUF',
          price: variantPrice,
          availability: getAvailabilityUrl(variant.stock),
          url: getVariantUrl(productUrl, variant),
          sku: variant.sku || `${product.id}-${variant.id}`,
          itemCondition: 'https://schema.org/NewCondition',
          ...(variantIsOnSale && variant.saleEndDate && {
            priceValidUntil: new Date(variant.saleEndDate).toISOString().split('T')[0],
          }),
          // Inventory level for merchant listings
          ...(variant.stock > 0 && variant.stock <= 10 && {
            inventoryLevel: {
              '@type': 'QuantitativeValue',
              value: variant.stock
            }
          }),
          // Add variant attributes
          ...(attributes.Szín || attributes.Color || attributes.szín ? {
            itemOffered: {
              '@type': 'Product',
              color: attributes.Szín || attributes.Color || attributes.szín
            }
          } : {})
        }
      })
    : null

  // Get brand info
  const brandName = product.brand?.name || 'NEXU'

  // Build individual review schema items
  const reviewSchemas = product.reviews && product.reviews.length > 0
    ? product.reviews.slice(0, 10).map((review: any) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1
        },
        author: {
          '@type': 'Person',
          name: review.user?.name || 'Vásárló'
        },
        datePublished: new Date(review.createdAt).toISOString().split('T')[0],
        reviewBody: review.content || undefined
      }))
    : []

  // Shipping and return policy details for offers
  const shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: (currentPrice || 0) >= 30000 ? 0 : 1490,
      currency: 'HUF'
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'HU'
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        maxValue: 1,
        unitCode: 'DAY'
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 3,
        unitCode: 'DAY'
      }
    }
  }

  const returnPolicy = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'HU',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility'
  }

  // Build offer with shipping and return details
  const buildOffer = (price: number, stock: number, url: string, priceValidUntil?: string, preorder?: boolean) => ({
    '@type': 'Offer',
    priceCurrency: 'HUF',
    price: price,
    availability: getAvailabilityUrl(stock, preorder),
    url: url,
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@type': 'Organization',
      name: 'NEXU Store'
    },
    shippingDetails,
    hasMerchantReturnPolicy: returnPolicy,
    ...(priceValidUntil && { priceValidUntil }),
    // Show inventory level for limited stock items
    ...(stock > 0 && stock <= 10 && {
      inventoryLevel: {
        '@type': 'QuantitativeValue',
        value: stock
      }
    })
  })

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img: string) => img.startsWith('http') ? img : `${siteUrl}${img}`),
    description: product.metaDescription || product.description,
    category: product.category,
    sku: product.sku || String(product.id),
    mpn: product.mpn || String(product.id),
    ...(product.gtin && { gtin: product.gtin }),
    brand: { '@type': 'Brand', name: brandName },
    // Use AggregateOffer if there are variants, otherwise single Offer
    offers: variantOffers && variantOffers.length > 0 
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'HUF',
          lowPrice: Math.min(...variantOffers.map((o: any) => o.price)),
          highPrice: Math.max(...variantOffers.map((o: any) => o.price)),
          offerCount: variantOffers.length,
          offers: variantOffers.map((o: any) => ({
            ...o,
            shippingDetails,
            hasMerchantReturnPolicy: returnPolicy,
            seller: { '@type': 'Organization', name: 'NEXU Store' }
          }))
        }
      : buildOffer(
          currentPrice || product.price,
          product.stock,
          productUrl,
          isOnSale && product.saleEndDate ? new Date(product.saleEndDate).toISOString().split('T')[0] : undefined
        ),
    // Aggregate rating
    ...(product.reviews && product.reviews.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews.length,
            bestRating: 5,
            worstRating: 1
          },
        }
      : {}),
    // VideoObject support (optional)
    ...((product as any).videos && Array.isArray((product as any).videos) && (product as any).videos.length > 0
      ? {
          video: (product as any).videos.map((v: any) => ({
            '@type': 'VideoObject',
            name: v.title || product.name,
            description: v.description || product.metaDescription || product.description || undefined,
            thumbnailUrl: v.thumbnail || product.images?.[0],
            contentUrl: v.url,
            ...(v.uploadDate && { uploadDate: new Date(v.uploadDate).toISOString() })
          }))
        }
      : {}),
    // Individual reviews (max 10 for performance)
    ...(reviewSchemas.length > 0 ? { review: reviewSchemas } : {}),
    // Product specifications as additionalProperty for rich results
    ...(product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0
      ? {
          additionalProperty: (product.specifications as Array<{ key: string; value: string | boolean; type?: string }>)
            .filter(spec => spec.key && spec.value !== undefined && spec.value !== null)
            .map(spec => ({
              '@type': 'PropertyValue',
              name: spec.key,
              value: typeof spec.value === 'boolean' 
                ? (spec.value ? 'Igen' : 'Nem')
                : String(spec.value)
            }))
        }
      : {}),
  }

  // ProductGroup schema for products with variants (helps Google understand product variations)
  const productGroupJsonLd = product.variants && product.variants.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    name: product.name,
    description: product.description,
    url: productUrl,
    brand: { '@type': 'Brand', name: brandName },
    productGroupID: product.sku || String(product.id),
    // Define what varies between products
    variesBy: [
      ...(product.variants.some((v: any) => v.attributes?.Szín || v.attributes?.Color) ? ['https://schema.org/color'] : []),
      ...(product.variants.some((v: any) => v.attributes?.Méret || v.attributes?.Size) ? ['https://schema.org/size'] : []),
    ],
    // List individual product variants
    hasVariant: product.variants.filter((v: any) => v.isActive).map((variant: any) => {
      const attrs = variant.attributes as Record<string, string> || {}
      const variantPrice = variant.salePrice || variant.price
      return {
        '@type': 'Product',
        name: `${product.name} - ${Object.values(attrs).join(' ')}`,
        sku: variant.sku || `${product.id}-${variant.id}`,
        ...(attrs.Szín || attrs.Color ? { color: attrs.Szín || attrs.Color } : {}),
        ...(attrs.Méret || attrs.Size ? { size: attrs.Méret || attrs.Size } : {}),
        image: variant.images?.[0] || product.images[0],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'HUF',
          price: variantPrice,
          availability: getAvailabilityUrl(variant.stock),
          url: getVariantUrl(productUrl, variant)
        }
      }
    })
  } : null

  // Breadcrumb structured data for better navigation display in search results
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
        name: 'Termékek',
        item: `${siteUrl}/shop`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `${siteUrl}/shop?category=${encodeURIComponent(product.category)}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: productUrl
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        {productGroupJsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productGroupJsonLd) }} />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <Breadcrumbs
          items={[
            { label: 'Termékek', href: '/shop' },
            { label: product.category, href: '/shop' },
            { label: product.name, href: `/shop/${product.id}` },
          ]}
        />

        <ProductDetailsClient product={product} url={productUrl} />

        <RelatedProducts 
          products={relatedProducts} 
          currentProductId={product.id}
          currentProductName={product.name}
        />

        <RecentlyViewed />
      </div>
    </div>
  )
}

