import { localeAlternates, OG_LOCALE, toLocale, INTL_LOCALE } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/ui/PageHero'
import { BookingCTA } from '@/components/home/BookingCTA'
import { DepartureList } from '@/components/tours/DepartureList'
import { getToursForDepartures, getUpcomingDepartures } from '@/lib/departures-data'
import type { Departure } from '@/types'

export const revalidate = 300

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('departures.title')
  return {
    title,
    description: t('departures.description'),
    alternates: localeAlternates(SITE_URL, locale, '/departures'),
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: t('departures.description'),
      url: `${SITE_URL}/${locale}/departures`,
      siteName: SITE_CONFIG.name,
      locale: OG_LOCALE[toLocale(locale)],
      type: 'website',
    },
  }
}

export default async function DeparturesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'departures' })

  const departures = await getUpcomingDepartures()
  const tours = await getToursForDepartures(departures)
  // Only departures whose tour is public
  const visible = departures.filter((d) => tours.some((x) => x.id === d.tourId))

  const monthFmt = new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { month: 'long', year: 'numeric' })
  const byMonth = new Map<string, Departure[]>()
  for (const d of visible) {
    const key = d.startDate.slice(0, 7)
    byMonth.set(key, [...(byMonth.get(key) ?? []), d])
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow={t('heroLabel')}
        title={[t('heroTitle1')]}
        accent={t('heroTitle2')}
        description={t('description')}
        image="https://images.unsplash.com/photo-1630326867210-bf4b2cdd2019?w=2000&q=80&auto=format&fit=crop"
      />

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 md:py-20">
        {byMonth.size === 0 ? (
          <p className="rounded-3xl border border-brand-line bg-brand-cream p-10 text-center text-brand-navy/70">{t('empty')}</p>
        ) : (
          <div className="space-y-12">
            {[...byMonth.entries()].map(([key, list]) => (
              <div key={key}>
                <h2 className="mb-5 text-3xl uppercase text-brand-navy">{monthFmt.format(new Date(`${key}-01T00:00:00`))}</h2>
                <DepartureList departures={list} tours={tours} showTour />
              </div>
            ))}
          </div>
        )}
      </section>

      <BookingCTA />
    </div>
  )
}
