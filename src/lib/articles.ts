/**
 * Articles (blog, culture, travel info, past trips): categories, input
 * validation, localisation and the small text format used for the body.
 * Pure module: no framework imports, shared by the API, pages and tests.
 */
import { DEFAULT_LOCALE, LOCALES } from '../i18n/locales.ts'

export const ARTICLE_CATEGORIES = [
  { key: 'news', route: '/blog', labelMn: 'Мэдээ, блог', it: 'Notizie dal blog', en: 'Blog news' },
  { key: 'trips', route: '/blog', labelMn: 'Өмнөх аяллын хөтөлбөр', it: 'Archivio viaggi', en: 'Trip archive' },
  { key: 'culture', route: '/culture', labelMn: 'Соёл, түүх', it: 'Cultura e storia', en: 'Culture and history' },
  { key: 'info', route: '/info', labelMn: 'Аяллын мэдээлэл', it: 'Info utili', en: 'Travel info' },
] as const
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]['key']

export const categoryRoute = (c: ArticleCategory) => ARTICLE_CATEGORIES.find((x) => x.key === c)!.route
export const isCategory = (v: unknown): v is ArticleCategory => ARTICLE_CATEGORIES.some((c) => c.key === v)

export interface ArticleTexts {
  title?: string
  summary?: string
  body?: string
}

export interface Article {
  id: string
  slug: string
  category: ArticleCategory
  title: string
  summary: string
  body: string
  translations: Record<string, ArticleTexts>
  coverImage: string | null
  published: boolean
  publishedAt: string
  sortOrder: number
  sourceUrl: string | null
}

// ─── Text in the visitor's language, falling back to the default language ───

export type TextField = 'title' | 'summary' | 'body'

export function getArticleField(a: Pick<Article, 'title' | 'summary' | 'body' | 'translations'>, field: TextField, locale: string): string {
  if (locale !== DEFAULT_LOCALE) {
    const v = a.translations?.[locale]?.[field]
    if (typeof v === 'string' && v.trim() !== '') return v
  }
  return a[field] ?? ''
}

/** Is this article fully available in the language (title and body translated)? */
export function isArticleTranslated(a: Pick<Article, 'translations'>, locale: string): boolean {
  if (locale === DEFAULT_LOCALE) return true
  const t = a.translations?.[locale]
  return Boolean(t?.title?.trim() && t?.body?.trim())
}

// ─── Validation of the admin form ────────────────────────────────────────────

const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** "Gerelee and his wife!" -> "gerelee-and-his-wife" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

const text = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim().slice(0, max) : '')

export type ArticleInputResult = { ok: true; row: Record<string, unknown> } | { ok: false; error: string }

/** Admin form -> database columns. With `partial` only the keys present are returned. */
export function parseArticleInput(body: unknown, partial = false): ArticleInputResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' }
  const b = body as Record<string, unknown>
  const row: Record<string, unknown> = {}

  if (!partial || 'title' in b) {
    const title = text(b.title, 300)
    if (!title) return { ok: false, error: 'Title is required' }
    row.title = title
  }
  if (!partial || 'slug' in b || 'title' in b) {
    const slug = slugify(text(b.slug, 120) || text(b.title, 300))
    if (!slug || !SLUG_OK.test(slug)) return { ok: false, error: 'Slug is required' }
    row.slug = slug
  }
  if (!partial || 'category' in b) {
    if (!isCategory(b.category)) return { ok: false, error: 'Category is required' }
    row.category = b.category
  }
  if ('summary' in b || !partial) row.summary = text(b.summary, 600) || null
  if ('body' in b || !partial) row.body = text(b.body, 200000)
  if ('coverImage' in b || !partial) row.cover_image = text(b.coverImage, 600) || null
  if ('published' in b || !partial) row.published = b.published !== false
  if ('sortOrder' in b) {
    const n = Number(b.sortOrder)
    row.sort_order = Number.isInteger(n) ? n : 0
  }
  if ('publishedAt' in b) {
    const d = typeof b.publishedAt === 'string' ? new Date(b.publishedAt) : null
    if (!d || Number.isNaN(d.getTime())) return { ok: false, error: 'Date is invalid' }
    row.published_at = d.toISOString()
  }
  if ('translations' in b) {
    const t: Record<string, ArticleTexts> = {}
    const src = b.translations && typeof b.translations === 'object' ? (b.translations as Record<string, Record<string, unknown>>) : {}
    for (const l of LOCALES) {
      if (l === DEFAULT_LOCALE) continue
      const x = src[l]
      if (!x) continue
      const entry: ArticleTexts = {}
      if (text(x.title, 300)) entry.title = text(x.title, 300)
      if (text(x.summary, 600)) entry.summary = text(x.summary, 600)
      if (text(x.body, 200000)) entry.body = text(x.body, 200000)
      if (Object.keys(entry).length) t[l] = entry
    }
    row.translations = t
  }
  return { ok: true, row }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapArticle(r: Record<string, any>): Article {
  return {
    id: r.id,
    slug: r.slug,
    category: isCategory(r.category) ? r.category : 'news',
    title: r.title ?? '',
    summary: r.summary ?? '',
    body: r.body ?? '',
    translations: r.translations && typeof r.translations === 'object' ? r.translations : {},
    coverImage: r.cover_image ?? null,
    published: r.published !== false,
    publishedAt: r.published_at ?? new Date(0).toISOString(),
    sortOrder: Number(r.sort_order ?? 0),
    sourceUrl: r.source_url ?? null,
  }
}

// ─── The body text format ────────────────────────────────────────────────────

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: Inline[] }
  | { t: 'italic'; v: Inline[] }
  | { t: 'link'; href: string; v: Inline[] }

export type Block =
  | { t: 'heading'; level: 2 | 3 | 4; v: Inline[] }
  | { t: 'p'; v: Inline[] }
  | { t: 'list'; ordered: boolean; items: Inline[][] }
  | { t: 'quote'; v: Inline[] }
  | { t: 'image'; src: string; alt: string }
  | { t: 'video'; src: string }

/** Only web, mail and phone links and site-relative paths are allowed. */
export function safeHref(href: string): string | null {
  const h = href.trim()
  if (/^\/(?!\/)/.test(h) || /^#/.test(h)) return h
  if (/^(https?:\/\/|mailto:|tel:)/i.test(h)) return h
  return null
}

export function safeImageSrc(src: string): string | null {
  const s = src.trim()
  if (/^\/(?!\/)/.test(s)) return s
  if (/^https?:\/\//i.test(s)) return s
  return null
}

/** YouTube and Vimeo links become embed URLs; anything else is rejected. */
export function videoEmbedUrl(src: string): string | null {
  const s = src.trim()
  const yt = s.match(/^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/i)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vm = s.match(/^https?:\/\/(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = []
  let i = 0
  let buf = ''
  const flush = () => {
    if (buf) out.push({ t: 'text', v: buf })
    buf = ''
  }
  while (i < src.length) {
    if (src.startsWith('**', i)) {
      const end = src.indexOf('**', i + 2)
      if (end > i + 2) {
        flush()
        out.push({ t: 'bold', v: parseInline(src.slice(i + 2, end)) })
        i = end + 2
        continue
      }
    }
    if (src[i] === '*' && src[i + 1] !== '*' && src[i + 1] !== ' ') {
      const end = src.indexOf('*', i + 1)
      if (end > i + 1 && src[end - 1] !== ' ') {
        flush()
        out.push({ t: 'italic', v: parseInline(src.slice(i + 1, end)) })
        i = end + 1
        continue
      }
    }
    if (src[i] === '[') {
      const m = src.slice(i).match(/^\[([^\]]*)\]\(([^)\s]+)\)/)
      if (m) {
        const href = safeHref(m[2])
        flush()
        if (href) out.push({ t: 'link', href, v: parseInline(m[1] || m[2]) })
        else out.push({ t: 'text', v: m[1] })
        i += m[0].length
        continue
      }
    }
    buf += src[i]
    i++
  }
  flush()
  return out
}

/** Text -> blocks. Never produces HTML: the page renders the blocks as React elements. */
export function parseBody(src: string): Block[] {
  const blocks: Block[] = []
  const paras = src.replace(/\r\n/g, '\n').split(/\n{2,}/)
  for (const raw of paras) {
    const chunk = raw.trim()
    if (!chunk) continue

    const heading = chunk.match(/^(#{1,4})\s+([\s\S]+)$/)
    if (heading) {
      const level = Math.min(4, Math.max(2, heading[1].length + 1)) as 2 | 3 | 4
      blocks.push({ t: 'heading', level, v: parseInline(heading[2].replace(/\s*\n\s*/g, ' ')) })
      continue
    }
    const video = chunk.match(/^@\[video\]\(([^)\s]+)\)$/)
    if (video) {
      const embed = videoEmbedUrl(video[1])
      if (embed) blocks.push({ t: 'video', src: embed })
      continue
    }
    const image = chunk.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
    if (image) {
      const s = safeImageSrc(image[2])
      if (s) blocks.push({ t: 'image', src: s, alt: image[1] })
      continue
    }
    const lines = chunk.split('\n')
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      blocks.push({ t: 'list', ordered: false, items: lines.map((l) => parseInline(l.replace(/^\s*[-*]\s+/, ''))) })
      continue
    }
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      blocks.push({ t: 'list', ordered: true, items: lines.map((l) => parseInline(l.replace(/^\s*\d+[.)]\s+/, ''))) })
      continue
    }
    if (lines.every((l) => l.startsWith('>'))) {
      blocks.push({ t: 'quote', v: parseInline(lines.map((l) => l.replace(/^>\s?/, '')).join(' ')) })
      continue
    }
    // A paragraph: single line breaks inside it become spaces; trailing double-space breaks are kept simple
    blocks.push({ t: 'p', v: parseInline(lines.map((l) => l.trim()).join(' ')) })
  }
  return blocks
}

/** Plain text (no formatting) for search snippets and previews. */
export function plainText(src: string, max = 200): string {
  const t = src
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/@\[video\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}
