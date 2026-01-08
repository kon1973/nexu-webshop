'use client'

import ProductCard from './ProductCard'
import type { Product } from '@prisma/client'
import { getSiteUrl } from '@/lib/site'

interface RelatedProductsProps {
  products: Product[]
  currentProductId: number
  currentProductName: string
}

export default function RelatedProducts({ products, currentProductId, currentProductName }: RelatedProductsProps) {
  if (products.length === 0) return null

  const siteUrl = getSiteUrl()

  // ItemList schema for related products - helps Google understand product relationships
  const relatedProductsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Kapcsolódó termékek: ${currentProductName}`,
    description: `Termékek amiket mások vásároltak ${currentProductName} mellé`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        url: `${siteUrl}/shop/${(product as any).slug || product.id}`,
        image: product.images?.[0]?.startsWith('http') 
          ? product.images[0] 
          : `${siteUrl}${product.images?.[0] || ''}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'HUF',
          price: product.salePrice || product.price,
          availability: product.stock > 0 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock'
        }
      }
    }))
  }

  return (
    <div className="mt-20 pt-12 border-t border-white/10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedProductsJsonLd) }} />
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Mások ezt is megvették</h2>
        <span className="text-sm text-gray-500">{products.length} termék</span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
