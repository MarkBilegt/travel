/**
 * Turns the crawled pages of the old WordPress site (data/site.json) into what
 * the new site stores: articles, gallery photos and two tours. Pure functions
 * only (no network, no database) so they are unit-tested in tests/old-site.test.mts.
 */
import { plainText, slugify } from '../../src/lib/articles.ts'

export interface Crawled {
  url: string
  path: string
  kind: 'page' | 'post'
  title: string
  date: string | null
  categories: string[]
  md: string
  images: string[]
}

export type ArticleCategory = 'news' | 'trips' | 'culture' | 'info'

export type Plan =
  | { type: 'article'; category: ArticleCategory; slug: string; sort: number }
  | { type: 'gallery'; category: string }
  | { type: 'tour'; slug: string }
  | { type: 'skip'; reason: string }

/** Pages that become articles, in the order they should appear. */
const PAGE_ARTICLES: Record<string, { category: ArticleCategory; slug?: string; sort: number }> = {
  'la-storia/prima-dellimpero-mongolo': { category: 'culture', slug: 'prima-dellimpero-mongolo', sort: 10 },
  'la-storia/ascesa-e-declino-dellimpero-mongolo': { category: 'culture', slug: 'ascesa-e-declino-dellimpero-mongolo', sort: 11 },
  'la-storia/la-mongolia-moderna': { category: 'culture', slug: 'la-mongolia-moderna', sort: 12 },
  'tradizioni-e-religione/la-gher': { category: 'culture', slug: 'ger', sort: 20 },
  'tradizioni-e-religione/la-cucina-mongola': { category: 'culture', slug: 'food', sort: 21 },
  'tradizioni-e-religione/il-buddismo-in': { category: 'culture', slug: 'religion', sort: 22 },
  'tradizioni-e-religione/il-simbolo-del-soyombo': { category: 'culture', slug: 'il-simbolo-del-soyombo', sort: 23 },
  'tradizioni-e-religione/il-calendaro-mongolo': { category: 'culture', slug: 'il-calendario-mongolo', sort: 24 },
  'tradizioni-e-religione/361-2': { category: 'culture', slug: 'il-naadam', sort: 25 },
  'la-macchia-mongolica': { category: 'culture', slug: 'la-macchia-mongolica', sort: 30 },
  'letture-consigliate': { category: 'culture', slug: 'letture-consigliate', sort: 31 },
  'musica-e-video': { category: 'culture', slug: 'musica-e-video', sort: 32 },
  'il-visto': { category: 'info', slug: 'il-visto', sort: 10 },
  'cerco-compagni-di-viaggio-in-mongolia': { category: 'info', slug: 'cerco-compagni-di-viaggio', sort: 20 },
  'services-2': { category: 'info', slug: 'treni-e-voli', sort: 30 },
  'services-2/international-flight-schedule-2014': { category: 'info', slug: 'orari-voli-internazionali', sort: 31 },
  'services-2/iorario-dei-treni-internazionali-e-nazionali-mongolia-2015': { category: 'info', slug: 'orari-treni-internazionali-e-nazionali', sort: 32 },
  'services-2/voli-interni-2017': { category: 'info', slug: 'voli-interni', sort: 33 },
  'orario-treni-nazionali-2016': { category: 'info', slug: 'orario-treni-nazionali', sort: 34 },
}

/** Long trip programmes: kept as "trip archive" articles with the full original text. */
const TRIP_PAGES = [
  'i-viaggi-di-sain-sanaa-con-amitaba-viaggi',
  'i-viaggi-di-sain-sanaa-con-amitaba-viaggi-piste-sconosciute-dellovest',
  'i-viaggi-di-sain-sanaa-con-amitaba-viaggi-gobi-il-grande-deserto',
  'i-viaggi-di-sain-sanaa-con-amitaba-viaggi-profondo-gobi',
  'i-viaggi-di-sain-sanaa-con-amitaba-viaggi-scoprire-lamongolia',
  'i-viaggi-di-sain-sanaa-con-amitaba-viaggi-conoscere-la-mongolia',
  'i-viaggi-di-sain-sanaa-con-amitaba-viaggu',
  'i-viaggi-di-sain-sana-con-amitaba-viaggio-festival-del-naadam',
  'gli-altai-terra-dei-kazaki-2016',
  'le-terre-del-signore-oceanico-un-itinerario-storico-e-naturalistico-nel-cuore-della-cultura-mongola-2017',
  'mongolia-senza-confini-gobi-altai-e-grandi-laghi-la-vastita-infinita-del-mondo-dei-nomadi-2018',
  'lanello-doro-della-mongolia-dal-4-al-24-agosto-2018',
  'il-grande-anellodall-22-agosto-al-12-settembre-2022',
  'il-gran-tour-della-mongolia',
  'la-cultura-nomade-e-il-festival-del-naadam-2018',
  'steppe-e-deserto-del-gobi-alla-scoperta-del-paese-di-gengis-khaan-dal-2-al-15-giugno-2024',
  'trekking-a-cavallo-dagli-tsaatan',
  'trekking-a-cavallo-dagli-tsaatan-tra-gli-allevatori-di-renne-della-taiga-mongola-dal-26-agosto-al-10-settembre',
  'il-grande-festival-delle-aquile-nel-bayan-olgi-dal-28-settembre-al-9-ottobre',
  'feste-estate-2017',
  'partenze-speciali-estate-2018',
]

/** Pages whose content already lives somewhere else on the new site. */
const SKIPPED: Record<string, string> = {
  'about-us': 'About page',
  contatti: 'Contact page',
  contactus: 'Contact page',
  travels: 'Tours list',
  cultura: 'Index page',
  'tradizioni-e-religione': 'Index page',
  'la-storia': 'Index page',
  'assicurazione-di-viaggio-per-la-mongolia': 'Covered by the Info page',
  'dicono-di-noi': 'Reviews: images only',
  mappa: 'Map images only',
  'tour-di-un-giorno-a-ulaanbaatar': 'Already a tour',
  'tour-di-un-giorno-monastero-di-manzushir-passeggiata-vetta-tsetse-gun': 'Already a tour',
}

const NEW_TOUR_PAGES: Record<string, string> = {
  'il-gran-tour-della-mongolia': 'il-gran-tour-della-mongolia',
  'travels/il-grande-santo': 'il-grande-santo',
}

const GALLERY_PAGES: Record<string, string> = {
  photos: 'other',
  'photos/mongolia-centrale': 'central',
  'photos/mongolia-occidentale': 'west',
}

const cut = (s: string) => slugify(s).slice(0, 90).replace(/-+$/, '')

export function slugForPost(item: Crawled): string {
  const last = item.path.split('/').pop() ?? ''
  const good = last.length >= 5 && /[a-z]/.test(last) && !/^\d+$/.test(last)
  return good ? cut(last) : cut(`${item.title || 'articolo'}-${item.date ?? ''}`) || `articolo-${item.date ?? last}`
}

export function planFor(item: Crawled): Plan {
  const p = item.path
  if (item.kind === 'post') {
    if (item.md.replace(/\s/g, '').length < 15 && item.images.length === 0) return { type: 'skip', reason: 'Empty post' }
    return { type: 'article', category: 'news', slug: slugForPost(item), sort: 0 }
  }
  if (p in GALLERY_PAGES) return { type: 'gallery', category: GALLERY_PAGES[p] }
  if (p in NEW_TOUR_PAGES) return { type: 'tour', slug: NEW_TOUR_PAGES[p] }
  if (p in PAGE_ARTICLES) return { type: 'article', ...PAGE_ARTICLES[p], slug: PAGE_ARTICLES[p].slug ?? slugify(p) }
  if (TRIP_PAGES.includes(p)) return { type: 'article', category: 'trips', slug: cut(p), sort: 0 }
  if (p in SKIPPED) return { type: 'skip', reason: SKIPPED[p] }
  if (p.startsWith('travels/')) return { type: 'skip', reason: 'Already a tour' }
  return { type: 'skip', reason: 'Not mapped' }
}

// ─── Titles and text ─────────────────────────────────────────────────────────

/** "TREKKING A CAVALLO DAGLI TSAATAN" -> "Trekking a cavallo dagli Tsaatan". Mixed-case titles are left alone. */
export function tidyTitle(title: string): string {
  const t = title.replace(/\s+/g, ' ').replace(/^[\s\-–]+|[\s\-–]+$/g, '').trim()
  const letters = t.replace(/[^A-Za-zÀ-ÿ]/g, '')
  const upper = t.replace(/[^A-ZÀ-Þ]/g, '')
  if (letters.length > 8 && upper.length / letters.length > 0.7) {
    const lower = t.toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }
  return t
}

const ITALIAN_MONTHS: Record<string, number> = { gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6, luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12 }

export interface LinkMaps {
  /** Old image URL -> new URL (or the same URL when images are not moved) */
  image: (url: string) => string
  /** Old page URL -> new site path, or null when the page does not exist any more */
  link: (url: string) => string | null
}

/** Cleans the crawled text and rewrites its image and link addresses. */
export function cleanMarkdown(md: string, maps: LinkMaps): string {
  let s = md.replace(/\r\n/g, '\n').replace(/ /g, ' ')
  // A picture wrapped in a link to its attachment page: keep just the picture
  s = s.replace(/\[\s*(!\[[^\]]*\]\([^)]*\))\s*\]\([^)]*\)/g, '$1')
  // Pictures
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, url: string) => `![${alt.replace(/\.(jpe?g|png|gif|webp)$/i, '').replace(/[-_]+/g, ' ').trim()}](${maps.image(url)})`)
  // Links: pictures were already handled; keep working links and drop dead ones (keeping their text)
  s = s.replace(/(?<!!)\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
    const t = text.replace(/\s+/g, ' ').trim()
    if (/^(mailto:|tel:)/i.test(url)) return `[${t || url}](${url})`
    if (/^https?:\/\/(www\.)?sainsanaa\.net/i.test(url)) {
      const target = maps.link(url)
      return target ? `[${t || target}](${target})` : t
    }
    if (/wp-admin|wp-login/i.test(url)) return t
    return t ? `[${t}](${url})` : ''
  })
  s = s.replace(/\*\*\*([^*\n]+)\*\*\*/g, '**$1**')
  s = s.replace(/^[ \t]+/gm, '').replace(/[ \t]+$/gm, '')
  s = s.replace(/^\s*[\[\]!]+\s*$/gm, '')
  s = s.replace(/^\*\*\s*\*\*$/gm, '')
  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim()
}

export const firstImage = (md: string): string | null => md.match(/!\[[^\]]*\]\(([^)\s]+)\)/)?.[1] ?? null

export function summaryOf(md: string): string {
  const withoutHeadingsAndImages = md.split('\n\n').filter((b) => !/^(#|!\[|@\[)/.test(b.trim())).join(' ')
  return plainText(withoutHeadingsAndImages, 220)
}

// ─── Trip pages: header facts and day-by-day programme ───────────────────────

export interface TripHeader {
  price: number | null
  currency: 'EUR' | 'USD'
  singleSupplement: number | null
  minPeople: number | null
  maxPeople: number | null
  start: string | null
  end: string | null
}

const num = (s: string) => Number(s.replace(/[.\s]/g, ''))

export function parseTripHeader(md: string): TripHeader {
  const flat = md.replace(/[*#_]/g, ' ').replace(/\s+/g, ' ')
  const eur = flat.match(/(\d[\d.]{2,5})\s*(?:€|euro)/i) ?? flat.match(/(?:€|euro)\s*(\d[\d.]{2,5})/i)
  const usd = flat.match(/(\d[\d.]{2,5})\s*(?:dollari|usd|\$)/i)
  const price = eur ? num(eur[1]) : usd ? num(usd[1]) : null
  const single = flat.match(/supplemento singola[^\d]{0,60}(\d{2,4})/i)
  const min = flat.match(/(?:gruppo\s+)?minimo\s+(?:di\s+)?(\d{1,2})/i)
  const max = flat.match(/(?:massimo|max)\s+(?:di\s+)?(\d{1,2})\s*(?:partecipanti|persone|pax)?/i) ?? flat.match(/partecipanti\s+(\d{1,2})\s*max/i)
  let start: string | null = null
  let end: string | null = null
  const d = flat.match(/Da:?\s+(?:[A-Za-zì]+\s+)?(\d{1,2})\s*([A-Za-z]+)?\s+A:?\s+(?:[A-Za-zì]+\s+)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i)
  if (d) {
    const endMonth = ITALIAN_MONTHS[d[4].toLowerCase()]
    const startMonth = d[2] && ITALIAN_MONTHS[d[2].toLowerCase()] ? ITALIAN_MONTHS[d[2].toLowerCase()] : endMonth
    if (endMonth && startMonth) {
      const pad = (n: number) => String(n).padStart(2, '0')
      start = `${d[5]}-${pad(startMonth)}-${pad(Number(d[1]))}`
      end = `${d[5]}-${pad(endMonth)}-${pad(Number(d[3]))}`
    }
  }
  return {
    price,
    currency: eur || !usd ? 'EUR' : 'USD',
    singleSupplement: single ? Number(single[1]) : null,
    minPeople: min ? Number(min[1]) : null,
    maxPeople: max ? Number(max[1]) : null,
    start,
    end,
  }
}

export interface ParsedDay {
  day: number
  title: string
  description: string
}

const DAY_PATTERNS = [/^\s*(\d{1,2})\s*[°º]\s*g\b\.?\s*(.*)$/gim, /^\s*(\d{1,2})\s*g\.\s*(.*)$/gim]

/** Finds "3°g. ..." or "3 g. ..." day markers and returns the programme (empty when the page has none). */
export function parseDays(md: string): ParsedDay[] {
  const text = md.replace(/[*_]/g, '')
  let best: { index: number; day: number; rest: string }[] = []
  for (const rx of DAY_PATTERNS) {
    const found = [...text.matchAll(rx)].map((m) => ({ index: m.index ?? 0, day: Number(m[1]), rest: (m[2] ?? '').trim() }))
    if (found.length > best.length) best = found
  }
  const days: ParsedDay[] = []
  for (let i = 0; i < best.length; i++) {
    const m = best[i]
    const lineEnd = text.indexOf('\n', m.index)
    const bodyStart = lineEnd === -1 ? text.length : lineEnd
    const bodyEnd = i + 1 < best.length ? best[i + 1].index : text.length
    const rest = [m.rest, text.slice(bodyStart, bodyEnd)].join(' ').replace(/\s+/g, ' ').trim()
    // The title is the first sentence-sized piece of the marker line, the description is everything
    const title = (m.rest.split(/\s{2,}|\.\s/)[0] || rest.slice(0, 80)).slice(0, 90).trim()
    if (!rest) continue
    days.push({ day: m.day, title: title.charAt(0).toUpperCase() + title.slice(1), description: rest.slice(0, 1800) })
  }
  // Keep a sensible run: increasing day numbers from the first marker
  return days.filter((d, i) => i === 0 || d.day >= days[i - 1].day)
}

/** Year in the title or address of a trip page ("... agosto 2018"), for the archive date. */
export function yearOf(item: Crawled): number {
  const m = `${item.title} ${item.path}`.match(/(20[12]\d)/g)
  return m ? Number(m[m.length - 1]) : 2018
}

export function publishedAt(item: Crawled, plan: Plan): string {
  if (item.date) return `${item.date}T09:00:00.000Z`
  if (plan.type === 'article' && plan.category === 'trips') return `${yearOf(item)}-01-01T09:00:00.000Z`
  return '2018-01-01T09:00:00.000Z'
}
