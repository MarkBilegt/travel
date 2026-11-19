import { OG_LOCALE, toLocale, localeAlternates } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ServicesSection } from '@/components/services/ServicesSection'
import { ImpactSection } from '@/components/about/ImpactSection'
import { BookingCTA } from '@/components/home/BookingCTA'
import { ServicesPhotoStrip } from '@/components/services/ServicesPhotoStrip'
import { PageHero } from '@/components/ui/PageHero'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('services.title')
  return {
    title,
    description: t('services.description'),
    alternates: localeAlternates(SITE_URL, locale, '/services'),
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: t('services.description'),
      url: `${SITE_URL}/${locale}/services`,
      siteName: SITE_CONFIG.name,
      locale: OG_LOCALE[toLocale(locale)],
      type: 'website',
    },
  }
}

export default async function ServicesPage() {
  const t = await getTranslations('services')

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow={t('heroLabel')}
        title={[t('heroTitle1')]}
        accent={t('heroTitle2')}
        description={t('heroDescription')}
        // TODO(client): replace with the client's own photo.
        image="https://images.unsplash.com/photo-1773379418260-c34d07daf797?w=2000&q=80&auto=format&fit=crop"
      />
      <ServicesSection />
      <ServicesPhotoStrip />
      <ImpactSection />
      <BookingCTA />
    </div>
  )
}
