import { localeAlternates, OG_LOCALE, toLocale } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/ui/PageHero'
import { BookingCTA } from '@/components/home/BookingCTA'
import { getArticles } from '@/lib/articles-data'
import { ArticleCard } from '@/components/content/ArticleCard'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('info.title')
  return {
    title,
    description: t('info.description'),
    alternates: localeAlternates(SITE_URL, locale, '/info'),
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: t('info.description'),
      url: `${SITE_URL}/${locale}/info`,
      siteName: SITE_CONFIG.name,
      locale: OG_LOCALE[toLocale(locale)],
      type: 'website',
    },
  }
}

export default async function InfoPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'info' })
  const sections = t.raw('sections') as { id: string; title: string; items: string[] }[]
  const [infoArticles, cultureArticles] = await Promise.all([getArticles({ categories: ['info'], limit: 100 }), getArticles({ categories: ['culture'], limit: 6 })])

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
        <p className="mb-10 rounded-2xl border border-brand-line bg-brand-cream p-5 text-sm leading-relaxed text-brand-navy/70">{t('draftNote')}</p>

        <nav aria-label={t('heroLabel')} className="mb-12 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-full border border-brand-line px-4 py-1.5 text-xs font-semibold text-brand-navy transition-colors hover:border-brand-navy/40">
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-brand-line pt-8">
              <h2 className="mb-4 text-3xl uppercase text-brand-navy">{s.title}</h2>
              <div className="space-y-3 text-base leading-relaxed text-brand-navy/75">
                {s.items.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-base font-semibold text-brand-navy">{t('help')}</p>
      </section>

      {infoArticles.items.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-20">
          <h2 className="mb-8 text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl">{t('moreTitle')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {infoArticles.items.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} readLabel={t('readMore')} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-brand-cream px-5 py-16 sm:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-deep">
            <span aria-hidden className="h-px w-8 bg-brand-gold-deep" />
            {t('cultureLabel')}
          </p>
          <h2 className="text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl">{t('cultureTitle')}</h2>
          <p className="mt-4 max-w-xl text-brand-navy/70">{t('cultureDescription')}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cultureArticles.items.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} readLabel={t('readMore')} />
            ))}
          </div>
        </div>
      </section>

      <BookingCTA />
    </div>
  )
}
