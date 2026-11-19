import { localeAlternates, OG_LOCALE, toLocale } from '@/i18n/locales'
import { SITE_CONFIG, SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArticleView } from '@/components/content/ArticleView'
import { getArticle } from '@/lib/articles-data'
import { getArticleField, plainText } from '@/lib/articles'

export const revalidate = 300

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getArticle(slug, ['info'])
  if (!article) return {}
  const title = getArticleField(article, 'title', locale)
  const description = getArticleField(article, 'summary', locale) || plainText(getArticleField(article, 'body', locale), 160)
  return {
    title,
    description,
    alternates: localeAlternates(SITE_URL, locale, `/info/${slug}`),
    openGraph: { title: `${title} | ${SITE_CONFIG.name}`, description, url: `${SITE_URL}/${locale}/info/${slug}`, siteName: SITE_CONFIG.name, locale: OG_LOCALE[toLocale(locale)], type: 'article' },
  }
}

export default async function InfoArticlePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const article = await getArticle(slug, ['info'])
  if (!article) notFound()
  const t = await getTranslations({ locale, namespace: 'info' })
  return <ArticleView article={article} locale={locale} eyebrow={t('heroLabel')} backHref="/info" backLabel={t('back')} />
}
