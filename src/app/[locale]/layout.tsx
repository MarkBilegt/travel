import { OG_LOCALE, isLocale, toLocale, localeAlternates } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { Inter, Oswald, Cormorant_Garamond } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from 'sonner'
import { routing } from '@/i18n/routing'
import { validateEnv } from '@/lib/env'
import { SettingsProvider } from '@/components/providers/SettingsProvider'
import { getSiteSettings } from '@/lib/cms-data'
import { LanguagePicker } from '@/components/layout/LanguagePicker'
import { cn } from '@/lib/utils'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Display face: condensed so long Mongolian words fit headlines on phones.
const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

// Editorial accent (italic words inside headings).
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const siteName = SITE_CONFIG.name
  return {
    title: {
      default: t('home.title'),
      template: `%s | ${siteName}`,
    },
    description: t('home.description'),
    keywords: locale === 'en'
      ? ['Mongolia tours', 'Gobi Desert tour', 'nomad stay Mongolia', 'Mongolia travel cooperative', 'trips to Mongolia']
      : ['viaggi in Mongolia', 'tour Mongolia', 'deserto del Gobi', 'cooperativa di viaggi', 'viaggio tra i nomadi'],
    authors: [{ name: SITE_CONFIG.legalName }],
    creator: SITE_CONFIG.legalName,
    publisher: SITE_CONFIG.legalName,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[toLocale(locale)],
      url: `${SITE_URL}/${locale}`,
      siteName,
      title: t('home.title'),
      description: t('home.description'),
      images: [
        {
          // Served by src/app/opengraph-image.tsx (no .png extension in the route)
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home.title'),
      description: t('home.description'),
    },
    alternates: localeAlternates(SITE_URL, locale, ''),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  validateEnv()

  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const settings = await getSiteSettings()

  let messages: Awaited<ReturnType<typeof getMessages>>
  try {
    messages = await getMessages({ locale })
  } catch (err) {
    console.error('Failed to load messages:', err)
    messages = {}
  }

  return (
    <html lang={locale} className={cn(inter.variable, oswald.variable, cormorant.variable)}>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <SettingsProvider value={settings}>
              <LanguagePicker locale={locale} />
              {children}
              <Toaster richColors position="top-right" />
            </SettingsProvider>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
