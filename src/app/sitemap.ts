import { LOCALES, localeAlternates } from '@/i18n/locales'
import { SITE_URL } from '@/lib/constants'
import { MetadataRoute } from 'next'
import { getArticleSlugs } from '@/lib/articles-data'
import { categoryRoute } from '@/lib/articles'
import { createSupabaseServer } from '@/lib/supabase/server'

const BASE_URL = SITE_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServer()

  const { data: tours } = await supabase
    .from('tours')
    .select('slug, updated_at')
    .eq('status', 'active')

  const now = new Date()
  const pages: Array<{ path: string; freq: 'daily' | 'weekly' | 'monthly'; priority: number }> = [
    { path: '', freq: 'daily', priority: 1.0 },
    { path: '/tours', freq: 'daily', priority: 0.9 },
    { path: '/departures', freq: 'daily', priority: 0.8 },
    { path: '/about', freq: 'monthly', priority: 0.6 },
    { path: '/contact', freq: 'monthly', priority: 0.6 },
    { path: '/services', freq: 'monthly', priority: 0.5 },
    { path: '/info', freq: 'monthly', priority: 0.7 },
    { path: '/culture', freq: 'monthly', priority: 0.6 },
    { path: '/blog', freq: 'weekly', priority: 0.6 },
    { path: '/gallery', freq: 'weekly', priority: 0.5 },
  ]

  // One entry per language, each listing its alternates so search engines pair them (hreflang).
  const entry = (path: string, lastModified: Date, changeFrequency: 'daily' | 'weekly' | 'monthly', priority: number): MetadataRoute.Sitemap =>
    LOCALES.map((l) => ({
      url: `${BASE_URL}/${l}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: localeAlternates(BASE_URL, l, path).languages },
    }))

  const staticPages = pages.flatMap((p) => entry(p.path, now, p.freq, p.priority))
  const tourPages = (tours ?? []).flatMap((tour) => entry(`/tours/${tour.slug}`, new Date(tour.updated_at), 'weekly', 0.8))

  const articles = await getArticleSlugs()
  const articlePages = articles.flatMap((a) => entry(`${categoryRoute(a.category)}/${a.slug}`, new Date(a.publishedAt), 'monthly', 0.5))

  return [...staticPages, ...tourPages, ...articlePages]
}
