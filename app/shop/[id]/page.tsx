import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import Breadcrumbs from '@/app/components/Breadcrumbs'
import ProductCard from '@/app/components/ProductCard'
import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site'
import ProductDetailsClient from './ProductDetailsClient'
import RecentlyViewed from '@/app/components/RecentlyViewed'
import type { Review, Product } from '@prisma/client'
import { getProductByIdService, getProductsService } from '@/lib/services/productService'
import { getRelatedProductsService } from '@/lib/services/recommendationService'

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params
  const id = Number.parseInt(params.id, 10)

  if (Number.isNaN(id)) {
    return { title: 'Termék' }
  }

  const product = await getProductByIdService(id, true)

  if (!product) {
    return { title: 'Termék nem található' }
  }

  const siteUrl = getSiteUrl()
  const url = new URL(`/shop/${id}`, siteUrl).toString()

  const descriptionRaw = product.description?.trim()
  const description =
    descriptionRaw && descriptionRaw.length > 160 ? `${descriptionRaw.slice(0, 157)}...` : descriptionRaw

  return {
    title: product.name,
    description: description || `Nézd meg a(z) ${product.name} terméket a NEXU Store-ban.`,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description: description || `Nézd meg a(z) ${product.name} terméket a NEXU Store-ban.`,
      url,
      siteName: 'NEXU Webshop',
      locale: 'hu_HU',
      type: 'website',
      images: product.images.map((img: string) => ({ url: img })),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: description || `Nézd meg a(z) ${product.name} terméket a NEXU Store-ban.`,
    },
  }
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = Number.parseInt(params.id, 10)

  if (Number.isNaN(id)) return notFound()

  const product = await getProductByIdService(id, true)

  if (!product) return notFound()

  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  if (product.isArchived && !isAdmin) {
    return notFound()
  }

  const relatedProducts = await getRelatedProductsService(product.id)

  const siteUrl = getSiteUrl()
  const productUrl = new URL(`/shop/${product.id}`, siteUrl).toString()

  const isOnSale = product.salePrice && 
    (!product.saleStartDate || new Date(product.saleStartDate) <= new Date()) && 
    (!product.saleEndDate || new Date(product.saleEndDate) >= new Date())

  const currentPrice = isOnSale ? product.salePrice : product.price

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    category: product.category,
    sku: String(product.id),
    brand: { '@type': 'Brand', name: 'NEXU' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'HUF',
      price: currentPrice,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: productUrl,
      ...(isOnSale && {
        priceValidUntil: product.saleEndDate ? new Date(product.saleEndDate).toISOString().split('T')[0] : undefined,
        itemCondition: 'https://schema.org/NewCondition',
      })
    },
    ...(product.reviews.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

        <Breadcrumbs
          items={[
            { label: 'Termékek', href: '/shop' },
            { label: product.category, href: '/shop' },
            { label: product.name, href: `/shop/${product.id}` },
          ]}
        />

        <ProductDetailsClient product={product} url={productUrl} />

        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/10">
            <h2 className="text-2xl font-bold mb-8">Hasonló termékek</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((relatedProduct: Product) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}

        <RecentlyViewed />
      </div>
    </div>
  )
}

