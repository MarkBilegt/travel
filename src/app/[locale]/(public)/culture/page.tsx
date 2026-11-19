import { localeAlternates, OG_LOCALE, toLocale } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/ui/PageHero'
import { BookingCTA } from '@/components/home/BookingCTA'
import { ArticleCard } from '@/components/content/ArticleCard'
import { getArticles } from '@/lib/articles-data'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('culture.title')
  return {
    title,
    description: t('culture.description'),
    alternates: localeAlternates(SITE_URL, locale, '/culture'),
    openGraph: { title: `${title} | ${SITE_CONFIG.name}`, description: t('culture.description'), url: `${SITE_URL}/${locale}/culture`, siteName: SITE_CONFIG.name, locale: OG_LOCALE[toLocale(locale)], type: 'website' },
  }
}

export default async function CulturePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'culture' })
  const tInfo = await getTranslations({ locale, namespace: 'info' })
  const { items } = await getArticles({ categories: ['culture'], limit: 100 })

  return (
    <div className="min-h-screen bg-white">
      <PageHero eyebrow={t('heroLabel')} title={[t('heroTitle1')]} accent={t('heroTitle2')} description={t('description')} image="https://images.unsplash.com/photo-1630326867210-bf4b2cdd2019?w=2000&q=80&auto=format&fit=crop" />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} locale={locale} readLabel={tInfo('readMore')} />
          ))}
        </div>
      </section>
      <BookingCTA />
    </div>
  )
}
