import { OG_LOCALE, toLocale, localeAlternates } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Hero } from '@/components/home/Hero'
import { StatsStrip } from '@/components/home/StatsStrip'
import { FeaturedTours } from '@/components/home/FeaturedTours'
import { RecentlyAddedTours } from '@/components/home/RecentlyAddedTours'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { PhotoGallery } from '@/components/home/PhotoGallery'
import { Partners } from '@/components/home/Partners'
import { LatestPosts } from '@/components/home/LatestPosts'
import { Testimonials } from '@/components/home/Testimonials'
import { ImpactSection } from '@/components/about/ImpactSection'
import { BookingCTA } from '@/components/home/BookingCTA'
import { createSupabasePublic } from '@/lib/supabase/public'
import { getSiteSettings } from '@/lib/cms-data'
import { getHomePhotos } from '@/lib/photos-data'
import { getArticles } from '@/lib/articles-data'
import { JsonLd, organizationSchema } from '@/components/seo/JsonLd'
import type { Tour } from '@/types'
import { withDemoTours, DEMO_TOURS, isDemoMode } from '@/data/demo-tours'
import { mapTour, TOUR_CARD_COLUMNS } from '@/lib/tour-mapper'

export const revalidate = 300
export const dynamic = 'force-static'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('home.title')
  return {
    title: { absolute: `${SITE_CONFIG.name} - ${title}` },
    description: t('home.description'),
    alternates: localeAlternates(SITE_URL, locale, ''),
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: t('home.description'),
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_CONFIG.name,
      locale: OG_LOCALE[toLocale(locale)],
      type: 'website',
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const supabase = createSupabasePublic()

  const [homePhotos, latestNews] = await Promise.all([getHomePhotos(7), getArticles({ categories: ['news'], limit: 3 })])
  const [featuredRes, heroRes, recentRes] = await Promise.all([
    supabase
      .from('tours')
      .select(TOUR_CARD_COLUMNS)
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('tours')
      .select(TOUR_CARD_COLUMNS)
      .eq('status', 'active')
      .eq('is_hero', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('tours')
      .select(TOUR_CARD_COLUMNS)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const demo = isDemoMode() && (recentRes.data ?? []).length === 0
  const featuredTours: Tour[] = demo ? DEMO_TOURS.filter((t) => t.featured) : (featuredRes.data ?? []).map(mapTour)
  const heroMarked: Tour[] = demo ? DEMO_TOURS.filter((t) => t.isHero) : (heroRes.data ?? []).map(mapTour)

  // Fallback: if fewer than 5 hero tours, fill from most recent active (reuse already-fetched data)
  let heroTours: Tour[] = heroMarked
  if (heroMarked.length < 5) {
    const markedIds = new Set(heroMarked.map((t) => t.id))
    const extra = withDemoTours((recentRes.data ?? []).map(mapTour))
      .filter((t) => !markedIds.has(t.id))
      .slice(0, 5 - heroMarked.length)
    heroTours = [...heroMarked, ...extra]
  }

  const recentTours: Tour[] = withDemoTours((recentRes.data ?? []).map(mapTour)).slice(0, 6)

  return (
    <>
      <JsonLd data={organizationSchema(await getSiteSettings())} />
      <Hero tours={heroTours} />
      <StatsStrip />
      <FeaturedTours tours={featuredTours} />
      <ImpactSection />
      <RecentlyAddedTours tours={recentTours} />
      <WhyChooseUs />
      <Testimonials locale={locale} />
      <LatestPosts posts={latestNews.items} locale={locale} />
      <PhotoGallery photos={homePhotos.map((p) => ({ url: p.url, alt: p.altText || p.caption }))} />
      <Partners />
      <BookingCTA />
    </>
  )
}
