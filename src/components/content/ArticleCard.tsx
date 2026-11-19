import { ArrowUpRight, BookOpen } from 'lucide-react'
import { Link } from '@/navigation'
import { SafeImage } from '@/components/ui/SafeImage'
import { categoryRoute, getArticleField, type Article } from '@/lib/articles'
import { INTL_LOCALE, toLocale } from '@/i18n/locales'

/** First picture of an article: its cover, else none (the card shows a quiet placeholder). */
export const articleCover = (a: Pick<Article, 'coverImage'>) => a.coverImage || null

export function ArticleCard({ article, locale, readLabel, showDate = false }: { article: Article; locale: string; readLabel: string; showDate?: boolean }) {
  const cover = articleCover(article)
  const date = showDate ? new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt)) : null
  return (
    <Link
      href={`${categoryRoute(article.category)}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-brand-line bg-white transition-shadow hover:shadow-xl hover:shadow-brand-navy/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-cream">
        {cover ? (
          <SafeImage src={cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-gold-deep/40">
            <BookOpen className="h-10 w-10" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {date && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold-deep">{date}</p>}
        <h3 className="font-display text-xl font-semibold uppercase leading-snug text-brand-navy">{getArticleField(article, 'title', locale)}</h3>
        {getArticleField(article, 'summary', locale) && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-brand-navy/65">{getArticleField(article, 'summary', locale)}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold text-brand-gold-deep">
          {readLabel}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  )
}
