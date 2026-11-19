import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArticleCard } from '@/components/content/ArticleCard'
import type { Article } from '@/lib/articles'

/** The newest blog posts on the home page. Renders nothing when there are none. */
export async function LatestPosts({ posts, locale }: { posts: Article[]; locale: string }) {
  if (posts.length === 0) return null
  const t = await getTranslations({ locale, namespace: 'blog' })
  return (
    <section className="bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t('heroLabel')}
          title={t('latestTitle')}
          action={
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-brand-navy/15 px-5 py-3 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-navy hover:bg-brand-navy hover:text-white">
              {t('viewAll')}
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((a) => (
            <ArticleCard key={a.id} article={a} locale={locale} readLabel={t('read')} showDate />
          ))}
        </div>
      </div>
    </section>
  )
}
