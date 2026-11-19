import { localeAlternates, OG_LOCALE, toLocale } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/navigation'
import { PageHero } from '@/components/ui/PageHero'
import { BookingCTA } from '@/components/home/BookingCTA'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { getGalleryCounts, getGalleryPhotos } from '@/lib/photos-data'
import { isPhotoCategory, PHOTO_CATEGORIES } from '@/lib/photos'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 48

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ c?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'gallery' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(SITE_URL, locale, '/gallery'),
    openGraph: { title: `${t('metaTitle')} | ${SITE_CONFIG.name}`, description: t('metaDescription'), url: `${SITE_URL}/${locale}/gallery`, siteName: SITE_CONFIG.name, locale: OG_LOCALE[toLocale(locale)], type: 'website' },
  }
}

export default async function GalleryPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const { c, page: pageParam } = await searchParams
  const t = await getTranslations({ locale, namespace: 'gallery' })
  const category = isPhotoCategory(c) ? c : undefined
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const [{ items, total }, counts] = await Promise.all([getGalleryPhotos({ category, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }), getGalleryCounts()])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const href = (cat?: string, p = 1) => `/gallery?${new URLSearchParams({ ...(cat ? { c: cat } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-white">
      <PageHero eyebrow={t('heroLabel')} title={[t('heroTitle1')]} accent={t('heroTitle2')} description={t('description')} image="https://images.unsplash.com/photo-1773379410075-122d44982a07?w=2000&q=80&auto=format&fit=crop" />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="mb-10 flex flex-wrap gap-2">
          <Link href={href()} className={cn('rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors', !category ? 'border-brand-navy bg-brand-navy text-white' : 'border-brand-line text-brand-navy hover:border-brand-navy/40')}>
            {t('all')} {allCount > 0 && <span className="opacity-60">{allCount}</span>}
          </Link>
          {PHOTO_CATEGORIES.filter((x) => counts[x.key]).map((x) => (
            <Link key={x.key} href={href(x.key)} className={cn('rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors', category === x.key ? 'border-brand-navy bg-brand-navy text-white' : 'border-brand-line text-brand-navy hover:border-brand-navy/40')}>
              {t(`categories.${x.key}`)} <span className="opacity-60">{counts[x.key]}</span>
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="rounded-3xl border border-brand-line bg-brand-cream p-10 text-center text-brand-navy/70">{t('empty')}</p>
        ) : (
          <GalleryGrid photos={items.map((p) => ({ id: p.id, url: p.url, alt: p.altText, caption: p.caption }))} />
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3 text-sm font-semibold">
            {page > 1 && (
              <Link href={href(category, page - 1)} className="rounded-full border border-brand-line px-4 py-2 hover:border-brand-navy/40">
                ←
              </Link>
            )}
            <span className="text-brand-navy/60">
              {page} / {pages}
            </span>
            {page < pages && (
              <Link href={href(category, page + 1)} className="rounded-full border border-brand-line px-4 py-2 hover:border-brand-navy/40">
                →
              </Link>
            )}
          </nav>
        )}
      </section>
      <BookingCTA />
    </div>
  )
}
