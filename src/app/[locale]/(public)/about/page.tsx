import { localeAlternates } from '@/i18n/locales'
import { SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AboutHero } from '@/components/about/AboutHero'
import { CompanyStory } from '@/components/about/CompanyStory'
import { ValuesSection } from '@/components/about/ValuesSection'
import { ImpactSection } from '@/components/about/ImpactSection'
import { BookingCTA } from '@/components/home/BookingCTA'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('about.title'),
    description: t('about.description'),
    alternates: localeAlternates(SITE_URL, locale, '/about'),
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <CompanyStory />
      <ValuesSection />
      <ImpactSection />
      { /* <TeamSection /> */}
      <BookingCTA />
    </div>
  )
}
