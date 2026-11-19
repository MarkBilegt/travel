import { localeAlternates, OG_LOCALE, toLocale } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArticleView } from '@/components/content/ArticleView'
import { JsonLd } from '@/components/seo/JsonLd'
import { getArticle } from '@/lib/articles-data'
import { getArticleField, plainText } from '@/lib/articles'

export const revalidate = 300

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getArticle(slug, ['news', 'trips'])
  if (!article) return {}
  const title = getArticleField(article, 'title', locale)
  const description = getArticleField(article, 'summary', locale) || plainText(getArticleField(article, 'body', locale), 160)
  return {
    title,
    description,
    alternates: localeAlternates(SITE_URL, locale, `/blog/${slug}`),
    openGraph: { title: `${title} | ${SITE_CONFIG.name}`, description, url: `${SITE_URL}/${locale}/blog/${slug}`, siteName: SITE_CONFIG.name, locale: OG_LOCALE[toLocale(locale)], type: 'article', ...(article.coverImage ? { images: [article.coverImage] } : {}) },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const article = await getArticle(slug, ['news', 'trips'])
  if (!article) notFound()
  const t = await getTranslations({ locale, namespace: 'blog' })
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: getArticleField(article, 'title', locale),
          datePublished: article.publishedAt,
          inLanguage: locale,
          mainEntityOfPage: `${SITE_URL}/${locale}/blog/${slug}`,
          publisher: { '@type': 'Organization', name: SITE_CONFIG.name },
          ...(article.coverImage ? { image: article.coverImage } : {}),
        }}
      />
      <ArticleView article={article} locale={locale} eyebrow={t(`filter.${article.category}`)} backHref="/blog" backLabel={t('back')} showDate />
    </>
  )
}
