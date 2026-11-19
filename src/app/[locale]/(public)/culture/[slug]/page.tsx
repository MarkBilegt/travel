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
  const article = await getArticle(slug, ['culture'])
  if (!article) return {}
  const title = getArticleField(article, 'title', locale)
  const description = getArticleField(article, 'summary', locale) || plainText(getArticleField(article, 'body', locale), 160)
  return {
    title,
    description,
    alternates: localeAlternates(SITE_URL, locale, `/culture/${slug}`),
    openGraph: { title: `${title} | ${SITE_CONFIG.name}`, description, url: `${SITE_URL}/${locale}/culture/${slug}`, siteName: SITE_CONFIG.name, locale: OG_LOCALE[toLocale(locale)], type: 'article', ...(article.coverImage ? { images: [article.coverImage] } : {}) },
  }
}

export default async function CultureArticlePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const article = await getArticle(slug, ['culture'])
  if (!article) notFound()
  const t = await getTranslations({ locale, namespace: 'culture' })
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: getArticleField(article, 'title', locale),
          description: getArticleField(article, 'summary', locale),
          inLanguage: locale,
          mainEntityOfPage: `${SITE_URL}/${locale}/culture/${slug}`,
          publisher: { '@type': 'Organization', name: SITE_CONFIG.name },
          ...(article.coverImage ? { image: article.coverImage } : {}),
        }}
      />
      <ArticleView article={article} locale={locale} eyebrow={t('heroLabel')} backHref="/culture" backLabel={t('back')} />
    </>
  )
}
