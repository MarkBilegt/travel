import { localeAlternates, OG_LOCALE, toLocale } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/navigation'
import { PageHero } from '@/components/ui/PageHero'
import { BookingCTA } from '@/components/home/BookingCTA'
import { ArticleCard } from '@/components/content/ArticleCard'
import { getArticles } from '@/lib/articles-data'
import { cn } from '@/lib/utils'
import type { ArticleCategory } from '@/lib/articles'

const PAGE_SIZE = 12

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ c?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localeAlternates(SITE_URL, locale, '/blog'),
    openGraph: { title: `${t('metaTitle')} | ${SITE_CONFIG.name}`, description: t('metaDescription'), url: `${SITE_URL}/${locale}/blog`, siteName: SITE_CONFIG.name, locale: OG_LOCALE[toLocale(locale)], type: 'website' },
  }
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const { c, page: pageParam } = await searchParams
  const t = await getTranslations({ locale, namespace: 'blog' })
  const filter: 'all' | ArticleCategory = c === 'news' || c === 'trips' ? c : 'all'
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const { items, total } = await getArticles({ categories: filter === 'all' ? ['news', 'trips'] : [filter], limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const href = (nextFilter: string, nextPage = 1) => `/blog?${new URLSearchParams({ ...(nextFilter !== 'all' ? { c: nextFilter } : {}), ...(nextPage > 1 ? { page: String(nextPage) } : {}) }).toString()}`

  return (
    <div className="min-h-screen bg-white">
      <PageHero eyebrow={t('heroLabel')} title={[t('heroTitle1')]} accent={t('heroTitle2')} description={t('description')} image="https://images.unsplash.com/photo-1630326867210-bf4b2cdd2019?w=2000&q=80&auto=format&fit=crop" />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="mb-10 flex flex-wrap gap-2">
          {(['all', 'news', 'trips'] as const).map((key) => (
            <Link key={key} href={href(key)} className={cn('rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors', filter === key ? 'border-brand-navy bg-brand-navy text-white' : 'border-brand-line text-brand-navy hover:border-brand-navy/40')}>
              {t(`filter.${key}`)}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="rounded-3xl border border-brand-line bg-brand-cream p-10 text-center text-brand-navy/70">{t('empty')}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} readLabel={t('read')} showDate />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3 text-sm font-semibold">
            {page > 1 && (
              <Link href={href(filter, page - 1)} className="rounded-full border border-brand-line px-4 py-2 hover:border-brand-navy/40">
                {t('prev')}
              </Link>
            )}
            <span className="text-brand-navy/60">
              {page} / {pages}
            </span>
            {page < pages && (
              <Link href={href(filter, page + 1)} className="rounded-full border border-brand-line px-4 py-2 hover:border-brand-navy/40">
                {t('next')}
              </Link>
            )}
          </nav>
        )}
      </section>
      <BookingCTA />
    </div>
  )
}
