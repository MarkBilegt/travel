import { OG_LOCALE, toLocale, localeAlternates } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import { getSiteSettings } from '@/lib/cms-data'
import { telHref } from '@/lib/site-settings'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Mail, Phone } from 'lucide-react'
import { ContactInfo } from '@/components/contact/ContactInfo'
import { ConsentMap } from '@/components/ui/ConsentMap'
import { InquiryForm, type InquiryDeparture } from '@/components/contact/InquiryForm'
import { createSupabasePublic } from '@/lib/supabase/public'
import { DEMO_DEPARTURES, withDemoTours } from '@/data/demo-tours'
import { getTourField } from '@/lib/tour-locale'
import { isJoinable, mapDeparture, spotsLeft } from '@/lib/departures'
import { mapTour, TOUR_CARD_COLUMNS } from '@/lib/tour-mapper'
import { QuickActions } from '@/components/contact/QuickActions'
import { FAQAccordion } from '@/components/contact/FAQAccordion'
import { JsonLd, localBusinessSchema } from '@/components/seo/JsonLd'
import { PageHero } from '@/components/ui/PageHero'

interface Props {
  params: Promise<{ locale: string }>
  /** ?tour=<slug> pre-selects a tour; ?departure=<id> switches to the group sign-up. */
  searchParams: Promise<{ tour?: string; departure?: string }>
}

// TODO(client): replace with a photo of the client's office or team.
const HERO_IMAGE = 'https://images.unsplash.com/photo-1773379410075-122d44982a07?w=2000&q=80&auto=format&fit=crop'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('contact.title')
  return {
    title,
    description: t('contact.description'),
    alternates: localeAlternates(SITE_URL, locale, '/contact'),
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: t('contact.description'),
      url: `${SITE_URL}/${locale}/contact`,
      siteName: SITE_CONFIG.name,
      locale: OG_LOCALE[toLocale(locale)],
      type: 'website',
    },
  }
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { tour: tourSlug, departure: departureId } = await searchParams
  const t = await getTranslations({ locale, namespace: 'contact' })
  const settings = await getSiteSettings()

  const db = createSupabasePublic()
  const { data: tourRows } = await db.from('tours').select(TOUR_CARD_COLUMNS).eq('status', 'active').order('created_at', { ascending: false })
  const tours = withDemoTours((tourRows ?? []).map(mapTour))
  const tourOptions = tours.map((x) => ({ id: x.id, title: getTourField(x, 'title', locale) }))
  const defaultTourId = tours.find((x) => x.slug === tourSlug)?.id

  // Sign-up mode: only for a real departure that can still take people.
  let departure: InquiryDeparture | undefined
  if (departureId) {
    const { data } = await db.from('departures').select('*').eq('id', departureId).maybeSingle()
    const found = data ? mapDeparture(data) : DEMO_DEPARTURES.find((d) => d.id === departureId)
    const tour = found && tours.find((x) => x.id === found.tourId)
    if (found && tour && isJoinable(found)) {
      departure = { id: found.id, tourTitle: getTourField(tour, 'title', locale), startDate: found.startDate, endDate: found.endDate, spotsLeft: spotsLeft(found) }
    }
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={localBusinessSchema(settings)} />
      <PageHero
        eyebrow={t('heroLabel')}
        title={[t('heroTitle1')]}
        accent={t('heroTitle2')}
        description={t('heroSubtitle')}
        image={HERO_IMAGE}
        aside={
          <div className="space-y-3">
            <a
              href={telHref(settings.phone)}
              className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                <Phone className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-semibold tracking-wide">{settings.phone}</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-navy">
                <Mail className="h-5 w-5" />
              </span>
              <span className="break-all text-base font-semibold">{settings.email}</span>
            </a>
          </div>
        }
      />

      <section className="bg-white px-5 py-20 sm:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-14 lg:col-span-5">
            <ContactInfo />
            <QuickActions />
          </div>
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <InquiryForm tours={tourOptions} defaultTourId={defaultTourId} departure={departure} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-20 sm:px-8 md:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-brand-line">
          <ConsentMap
            title={t('mapTitle')}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.mapQuery)}&z=14&output=embed&hl=${toLocale(locale)}`}
            height={440}
            className="block border-0 grayscale-[35%]"
          />
        </div>
      </section>

      <FAQAccordion />
    </div>
  )
}
