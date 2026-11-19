import { createSupabasePublic } from '@/lib/supabase/public'
import { mapArticle, type Article, type ArticleCategory } from '@/lib/articles'
import { ARTICLES as BUILT_IN_CULTURE } from '@/data/articles'

const COLUMNS = 'id, slug, category, title, summary, body, translations, cover_image, published, published_at, sort_order, source_url'
const LIST_COLUMNS = 'id, slug, category, title, summary, translations, cover_image, published, published_at, sort_order, source_url'

/** Built-in culture articles, shown only until the real ones are loaded into the database. */
function builtInCulture(): Article[] {
  return BUILT_IN_CULTURE.map((a, i) => ({
    id: `built-in-${a.slug}`,
    slug: a.slug,
    category: 'culture' as const,
    title: a.text.it.title,
    summary: a.text.it.summary,
    body: a.text.it.body.join('\n\n'),
    translations: { en: { title: a.text.en.title, summary: a.text.en.summary, body: a.text.en.body.join('\n\n') } },
    coverImage: a.image,
    published: true,
    publishedAt: '2026-01-01T00:00:00.000Z',
    sortOrder: i,
    sourceUrl: null,
  }))
}

export interface ArticleQuery {
  categories: ArticleCategory[]
  limit?: number
  offset?: number
}

/** Published articles (newest first for the blog, by sort order for culture and info). The body is not loaded for lists. */
export async function getArticles({ categories, limit = 12, offset = 0 }: ArticleQuery): Promise<{ items: Article[]; total: number }> {
  try {
    const manual = categories.every((c) => c === 'culture' || c === 'info')
    let query = createSupabasePublic()
      .from('articles')
      .select(LIST_COLUMNS, { count: 'exact' })
      .in('category', categories)
      .eq('published', true)
      .lte('published_at', new Date().toISOString())
    query = manual
      ? query.order('sort_order', { ascending: true }).order('title', { ascending: true })
      : query.order('published_at', { ascending: false })
    const { data, count, error } = await query.range(offset, offset + limit - 1)
    if (error) throw error
    const items = (data ?? []).map((r) => mapArticle({ ...r, body: '' }))
    if (items.length === 0 && offset === 0 && categories.includes('culture') && categories.length === 1) {
      const fallback = builtInCulture()
      return { items: fallback, total: fallback.length }
    }
    return { items, total: count ?? items.length }
  } catch {
    if (categories.length === 1 && categories[0] === 'culture') {
      const fallback = builtInCulture()
      return { items: fallback, total: fallback.length }
    }
    return { items: [], total: 0 }
  }
}

/** One published article with its full text. */
export async function getArticle(slug: string, categories: ArticleCategory[]): Promise<Article | null> {
  try {
    const { data } = await createSupabasePublic()
      .from('articles')
      .select(COLUMNS)
      .eq('slug', slug)
      .in('category', categories)
      .eq('published', true)
      .lte('published_at', new Date().toISOString())
      .maybeSingle()
    if (data) return mapArticle(data)
  } catch {
    // fall through to the built-in articles
  }
  if (categories.includes('culture')) return builtInCulture().find((a) => a.slug === slug) ?? null
  return null
}

/** Slugs and dates of everything published, for the sitemap. */
export async function getArticleSlugs(): Promise<{ slug: string; category: ArticleCategory; publishedAt: string }[]> {
  try {
    const { data } = await createSupabasePublic().from('articles').select('slug, category, published_at').eq('published', true).limit(2000)
    return (data ?? []).map((r) => ({ slug: r.slug, category: r.category, publishedAt: r.published_at }))
  } catch {
    return []
  }
}
