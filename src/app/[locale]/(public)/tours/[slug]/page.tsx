import { OG_LOCALE, toLocale, localeAlternates } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TourGallery } from '@/components/tours/TourGallery'
import { TourInfo } from '@/components/tours/TourInfo'
import { TourTabs } from '@/components/tours/TourTabs'
import { BookingCard } from '@/components/booking/BookingCard'
import { TourCard } from '@/components/tours/TourCard'
import { createSupabasePublic } from '@/lib/supabase/public'
import { DEMO_TOURS, isDemoMode } from '@/data/demo-tours'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd, tourProductSchema } from '@/components/seo/JsonLd'
import { getTourField } from '@/lib/tour-locale'
import type { Tour } from '@/types'
import { mapTour, TOUR_CARD_COLUMNS } from '@/lib/tour-mapper'
import { fromPrice } from '@/lib/tour-pricing'
import { getUpcomingDepartures } from '@/lib/departures-data'
import { DepartureList } from '@/components/tours/DepartureList'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 300
export const dynamic = 'force-static'

/** Cover first, then the tour's own gallery, without duplicates. */
function buildGalleryImages(coverImage: string, images: string[] = []): string[] {
  const key = (u: string) => u.split('?')[0]
  const seen = new Set<string>()
  return [coverImage, ...images].filter((u) => {
    if (!u || seen.has(key(u))) return false
    seen.add(key(u))
    return true
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const supabase = createSupabasePublic()
  const { data } = await supabase
    .from('tours')
    .select('title, translations, short_description, cover_image')
    .eq('slug', slug)
    .single()

  const t = await getTranslations({ locale, namespace: 'tours' })
  const demoTour = !data && isDemoMode() ? DEMO_TOURS.find((d) => d.slug === slug) : undefined
  if (demoTour) return { title: getTourField(demoTour, 'title', locale), robots: { index: false } }
  if (!data) return { title: t('notFound') }

  const partial = mapTour(data)
  const title = getTourField(partial, 'title', locale)
  const description = getTourField(partial, 'shortDescription', locale)
  const siteName = SITE_CONFIG.name
  const ogImage = data.cover_image
    ? [{ url: data.cover_image, width: 1200, height: 630, alt: title }]
    : undefined

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: `${SITE_URL}/${locale}/tours/${slug}`,
      siteName,
      locale: OG_LOCALE[toLocale(locale)],
      type: 'website',
      ...(ogImage && { images: ogImage }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage[0].url] }),
    },
    alternates: localeAlternates(SITE_URL, locale, `/tours/${slug}`),
  }
}

export default async function TourDetailPage({ params }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const supabase = createSupabasePublic()
  const t = await getTranslations({ locale, namespace: 'tours' })

  const [tourRes, similarRes] = await Promise.all([
    supabase.from('tours').select('*').eq('slug', slug).single(),
    // Only card columns, newest first, excluding this tour; same-region /
    // same-category matches are picked below once the tour itself is known.
    supabase
      .from('tours')
      .select(TOUR_CARD_COLUMNS)
      .eq('status', 'active')
      .neq('slug', slug)
      .order('created_at', { ascending: false })
      .limit(40),
  ])

  const demoTour = !tourRes.data && isDemoMode() ? DEMO_TOURS.find((d) => d.slug === slug) : undefined
  if (!tourRes.data && !demoTour) notFound()

  const tour = demoTour ?? mapTour(tourRes.data)
  const localizedTitle = getTourField(tour, 'title', locale)
  const localizedDescription = getTourField(tour, 'shortDescription', locale)
  const departures = tour.tourType === 'private' ? [] : await getUpcomingDepartures(tour.id)
  const allTours: Tour[] = demoTour ? DEMO_TOURS : (similarRes.data ?? []).map(mapTour)
  const galleryImages = buildGalleryImages(tour.coverImage, tour.images)

  const sameRegion = allTours.filter(
    (t) => t.id !== tour.id && t.region === tour.region && t.active
  )
  const sameCategory = allTours.filter(
    (t) =>
      t.id !== tour.id &&
      t.category === tour.category &&
      t.active &&
      !sameRegion.find((s) => s.id === t.id)
  )
  const similarTours = [...sameRegion, ...sameCategory].slice(0, 3)

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={tourProductSchema({
        title: localizedTitle,
        description: localizedDescription,
        price: fromPrice(tour),
        currency: tour.currency,
        locale,
        image: tour.coverImage,
        slug: tour.slug,
        duration: tour.duration,
      })} />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-28 pb-32 lg:pb-16">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="w-full lg:flex-1 min-w-0">
            <TourGallery images={galleryImages} title={localizedTitle} />
            <TourInfo tour={tour} />
            <TourTabs tour={tour} />
            {tour.tourType !== 'private' && (
              <section className="mt-12" aria-labelledby="departures-heading">
                <h2 id="departures-heading" className="mb-5 text-2xl uppercase text-brand-navy">{t('departuresTitle')}</h2>
                {departures.length > 0 ? (
                  <DepartureList departures={departures} tours={[tour]} />
                ) : (
                  <p className="rounded-2xl border border-brand-line bg-brand-cream p-6 text-sm text-brand-navy/70">{t('departuresNone')}</p>
                )}
              </section>
            )}
          </div>
          <div className="w-full flex-shrink-0 lg:sticky lg:top-28 lg:w-[380px]">
            <BookingCard tour={tour} />
          </div>
        </div>

        {similarTours.length > 0 && (
          <section className="mt-24 border-t border-brand-line pt-20">
            <div className="mb-10">
              <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-deep">
                <span aria-hidden className="h-px w-8 bg-brand-gold-deep" />
                {t('similarLabel')}
              </p>
              <h2 className="text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl">{t('similarTitle')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {similarTours.map((t, i) => (
                <TourCard key={t.id} tour={t} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
