import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'
import { PageHero } from '@/components/ui/PageHero'
import { BookingCTA } from '@/components/home/BookingCTA'
import { ArticleBody } from './ArticleBody'
import { getArticleField, isArticleTranslated, type Article } from '@/lib/articles'
import { INTL_LOCALE, toLocale } from '@/i18n/locales'

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1630326867210-bf4b2cdd2019?w=2000&q=80&auto=format&fit=crop'

/** A full article page: hero, text, link back to its list. */
export async function ArticleView({
  article,
  locale,
  eyebrow,
  backHref,
  backLabel,
  showDate = false,
}: {
  article: Article
  locale: string
  eyebrow: string
  backHref: string
  backLabel: string
  showDate?: boolean
}) {
  const t = await getTranslations({ locale, namespace: 'blog' })
  const date = showDate ? new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt)) : undefined
  return (
    <div className="min-h-screen bg-white">
      <PageHero eyebrow={date ? `${eyebrow} · ${date}` : eyebrow} title={[getArticleField(article, 'title', locale)]} description={getArticleField(article, 'summary', locale) || undefined} image={article.coverImage || FALLBACK_HERO} />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 md:py-20">
        {!isArticleTranslated(article, locale) && <p className="mb-8 rounded-2xl border border-brand-line bg-brand-cream p-4 text-sm text-brand-navy/70">{t('onlyItalian')}</p>}
        <ArticleBody body={getArticleField(article, 'body', locale)} />
        <Link href={backHref} className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-gold-deep">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
      </article>
      <BookingCTA />
    </div>
  )
}
