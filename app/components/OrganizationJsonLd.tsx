'use client'

import { getSiteUrl } from '@/lib/site'

interface OrganizationJsonLdProps {
  settings?: {
    site_name?: string
    site_description?: string
    contact_email?: string
    contact_phone?: string
    address_street?: string
    address_city?: string
    address_zip?: string
    facebook_url?: string
    instagram_url?: string
    // LocalBusiness specific
    opening_hours?: string // e.g., "Mo-Fr 09:00-18:00, Sa 10:00-14:00"
    price_range?: string // e.g., "$$" or "10000-500000 Ft"
    tax_id?: string
  }
}

export default function OrganizationJsonLd({ settings }: OrganizationJsonLdProps) {
  const siteUrl = getSiteUrl()
  
  // Parse opening hours for LocalBusiness schema
  const parseOpeningHours = (hoursString?: string) => {
    if (!hoursString) return undefined
    // Format: "Mo-Fr 09:00-18:00, Sa 10:00-14:00"
    return hoursString.split(',').map(spec => spec.trim()).filter(Boolean)
  }

  const hasPhysicalLocation = settings?.address_street && settings?.address_city
  
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': hasPhysicalLocation ? 'Store' : 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: settings?.site_name || 'NEXU Store',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      width: 512,
      height: 512
    },
    image: `${siteUrl}/logo.png`,
    description: settings?.site_description || 'Prémium elektronikai webáruház',
    // Contact information
    ...(settings?.contact_email && {
      email: settings.contact_email
    }),
    ...(settings?.contact_phone && {
      telephone: settings.contact_phone
    }),
    // Address
    ...((settings?.address_street || settings?.address_city) && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings?.address_street,
        addressLocality: settings?.address_city,
        postalCode: settings?.address_zip,
        addressCountry: 'HU'
      }
    }),
    // LocalBusiness specific fields
    ...(hasPhysicalLocation && {
      geo: {
        '@type': 'GeoCoordinates',
        // Default Budapest coordinates - should be updated with real coords
        latitude: '47.497912',
        longitude: '19.040235'
      },
      ...(settings?.opening_hours && {
        openingHours: parseOpeningHours(settings.opening_hours)
      }),
      ...(settings?.price_range && {
        priceRange: settings.price_range
      }),
      currenciesAccepted: 'HUF',
      paymentAccepted: 'Bankkártya, Utánvét, Átutalás'
    }),
    // Tax ID for business
    ...(settings?.tax_id && {
      taxID: settings.tax_id
    }),
    // Social profiles
    sameAs: [
      settings?.facebook_url,
      settings?.instagram_url,
    ].filter(Boolean),
    // Contact point for customer service
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings?.contact_phone || '+36-1-234-5678',
      contactType: 'customer service',
      email: settings?.contact_email || 'info@nexustore.hu',
      availableLanguage: ['Hungarian', 'English'],
      areaServed: 'HU'
    },
    // Additional properties for e-commerce
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: settings?.site_name || 'NEXU Store',
        description: settings?.site_description || 'Prémium elektronikai webáruház',
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/shop?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        },
        inLanguage: 'hu-HU'
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  )
}
