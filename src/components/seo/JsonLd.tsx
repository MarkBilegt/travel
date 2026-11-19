import { SETTINGS_DEFAULTS, socialLinks, type SiteSettings } from '@/lib/site-settings'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // Escape "<" so admin-entered text can never close the script tag early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

export function organizationSchema(settings: SiteSettings = SETTINGS_DEFAULTS) {
  return {
    '@context': 'https://schema.org',
    '@type': ['TravelAgency', 'Organization'],
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.svg`,
    foundingDate: String(settings.foundedYear),
    description:
      'Cooperativa di viaggi in Mongolia: viaggi su misura, tour di gruppo e soggiorni con famiglie nomadi. A Mongolian travel cooperative: tailor-made trips, group tours and stays with nomad families.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MN',
      addressLocality: 'Ulaanbaatar',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: settings.email,
      telephone: settings.phone,
      availableLanguage: ['Italian', 'English'],
    },
    sameAs: socialLinks(settings).map((x) => x.url),
  }
}

export function tourProductSchema({
  title,
  description,
  price,
  image,
  slug,
  duration,
  currency,
  locale,
}: {
  title: string
  description: string
  /** null = price on request (no offer is published) */
  price: number | null
  image: string
  slug: string
  duration: number
  currency: string
  locale: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image,
    url: `${SITE_URL}/${locale}/tours/${slug}`,
    ...(price !== null && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'TravelAgency',
          name: SITE_CONFIG.name,
        },
      },
    }),
    additionalProperty: {
      '@type': 'PropertyValue',
      name: 'duration',
      value: `${duration} days`,
    },
  }
}

export function localBusinessSchema(settings: SiteSettings = SETTINGS_DEFAULTS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: SITE_CONFIG.name,
    image: `${SITE_URL}/brand/logo.svg`,
    url: SITE_URL,
    email: settings.email,
    telephone: settings.phone,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MN',
      addressLocality: 'Ulaanbaatar',
    },
    priceRange: '€€',
  }
}
