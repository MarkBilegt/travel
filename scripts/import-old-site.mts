/**
 * Loads everything from the old WordPress site (sainsanaa.net) into the new
 * site's database: 60+ articles (blog, culture, travel info, past trips), the
 * photo gallery (with the photos shrunk to web size and stored in Supabase
 * Storage) and two more tours.
 *
 *   npm run import:old-site -- --dry-run      show what would happen, change nothing
 *   npm run import:old-site                   import everything
 *   npm run import:old-site -- --skip-images  import the text only (pictures stay on the old site)
 *
 * Safe to run again: existing articles, photos, tours and departures are left
 * untouched, so edits made later in the admin panel are never overwritten.
 * Needs the migrations (001-020) applied and the photos downloaded
 * (python scripts/old-site/download-images.py) into import/old-site/images.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { cleanMarkdown, firstImage, parseDays, parseTripHeader, planFor, publishedAt, summaryOf, tidyTitle, type Crawled } from './old-site/convert.mts'
import { DEMO_TOURS } from '../src/data/demo-tours.ts'
import { LEGACY_REDIRECTS } from '../src/lib/legacy-redirects.ts'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const dryRun = process.argv.includes('--dry-run')
const skipImages = process.argv.includes('--skip-images')

// ── environment ─────────────────────────────────────────────────────────────
function readEnv(): Record<string, string> {
  const env: Record<string, string> = { ...(process.env as Record<string, string>) }
  const file = path.join(ROOT, '.env.local')
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!line || line.startsWith('#') || !line.includes('=')) continue
      const i = line.indexOf('=')
      const k = line.slice(0, i).trim()
      if (!(k in env)) env[k] = line.slice(i + 1).trim()
    }
  }
  return env
}
const env = readEnv()
const db = !dryRun && env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null
if (!dryRun && !db) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local).')
  process.exit(1)
}

// ── data ────────────────────────────────────────────────────────────────────
const site: Crawled[] = JSON.parse(readFileSync(path.join(ROOT, 'scripts/old-site/data/site.json'), 'utf8'))
const imageFiles: Record<string, string> = JSON.parse(readFileSync(path.join(ROOT, 'scripts/old-site/data/images.json'), 'utf8'))
const IMAGE_DIR = path.join(ROOT, 'import/old-site/images')
const plans = site.map((item) => ({ item, plan: planFor(item) }))

const ROUTE = { news: '/blog', trips: '/blog', culture: '/culture', info: '/info' } as const
const articleRoute = new Map<string, string>()
for (const { item, plan } of plans) if (plan.type === 'article') articleRoute.set(item.path, `${ROUTE[plan.category]}/${plan.slug}`)
const manualLinks = new Map(LEGACY_REDIRECTS.filter((r) => !r.source.includes(':')).map((r) => [r.source.replace(/^\//, ''), r.destination.replace(/^\/it/, '').replace(/#.*$/, '') || '/']))

function linkFor(url: string): string | null {
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '')
  return articleRoute.get(p) ?? manualLinks.get(p) ?? null
}

// ── pictures ────────────────────────────────────────────────────────────────
const uploaded = new Map<string, { url: string; path: string; width: number; height: number; size: number }>()
let uploadedCount = 0
let missingFiles = 0

const safeName = (rel: string) => rel.replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9/_-]+/g, '-').toLowerCase()

async function uploadImage(oldUrl: string) {
  if (uploaded.has(oldUrl)) return uploaded.get(oldUrl)
  const rel = imageFiles[oldUrl]
  const file = rel ? path.join(IMAGE_DIR, rel) : null
  if (!file || !existsSync(file)) {
    missingFiles++
    return undefined
  }
  const storagePath = `old-site/${safeName(rel)}.jpg`
  const { data, info } = await sharp(file).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer({ resolveWithObject: true })
  let publicUrl = `(dry run) ${storagePath}`
  if (db) {
    const { error } = await db.storage.from('media').upload(storagePath, data, { contentType: 'image/jpeg', upsert: true })
    if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`)
    publicUrl = db.storage.from('media').getPublicUrl(storagePath).data.publicUrl
  }
  const result = { url: publicUrl, path: storagePath, width: info.width, height: info.height, size: data.length }
  uploaded.set(oldUrl, result)
  uploadedCount++
  return result
}

async function uploadAll(urls: string[]) {
  const queue = [...new Set(urls)]
  let done = 0
  const worker = async () => {
    for (;;) {
      const u = queue.pop()
      if (!u) return
      await uploadImage(u)
      if (++done % 25 === 0) console.log(`  pictures: ${done}/${done + queue.length}`)
    }
  }
  await Promise.all(Array.from({ length: 5 }, worker))
}

const IMG_URL = /https:\/\/sainsanaa\.net\/wp-content\/uploads\/[^)\s]+/g
const newImageUrl = (u: string) => uploaded.get(u)?.url ?? u

// ── what to import ──────────────────────────────────────────────────────────
const articles = plans.filter((x) => x.plan.type === 'article')
const gallery = plans.filter((x) => x.plan.type === 'gallery')
const tourPages = plans.filter((x) => x.plan.type === 'tour')
const festivalPost = site.find((i) => i.path === '2014/10/08/sain-sanaa-al-festival-delle-aquile-nel-bayan-olgi')

console.log(`${dryRun ? '[dry run] ' : ''}Old site: ${site.length} pages -> ${articles.length} articles, ${gallery.length} gallery pages, ${tourPages.length} tours, ${plans.filter((x) => x.plan.type === 'skip').length} skipped`)

const wantedImages = [
  ...articles.flatMap((x) => x.item.md.match(IMG_URL) ?? []),
  ...gallery.flatMap((x) => x.item.images),
  ...(festivalPost?.images ?? []),
  ...tourPages.flatMap((x) => x.item.images.slice(0, 3)),
]
if (!skipImages) {
  console.log(`Pictures: ${new Set(wantedImages).size} to process`)
  await uploadAll(wantedImages)
  console.log(`Pictures ready: ${uploadedCount} processed, ${missingFiles} not downloaded (they keep their old address)`)
}

// ── articles ────────────────────────────────────────────────────────────────
const articleRows = articles.map(({ item, plan }) => {
  if (plan.type !== 'article') throw new Error('unreachable')
  const body = cleanMarkdown(item.md, { image: newImageUrl, link: linkFor })
  return {
    slug: plan.slug,
    category: plan.category,
    title: tidyTitle(item.title) || plan.slug,
    summary: summaryOf(body) || null,
    body,
    cover_image: firstImage(body),
    published: true,
    published_at: publishedAt(item, plan),
    sort_order: plan.sort,
    source_url: item.url,
  }
})
console.log(`Articles: ${articleRows.length} (${['news', 'trips', 'culture', 'info'].map((c) => `${articleRows.filter((r) => r.category === c).length} ${c}`).join(', ')})`)

if (db) {
  for (let i = 0; i < articleRows.length; i += 15) {
    const { error } = await db.from('articles').upsert(articleRows.slice(i, i + 15), { onConflict: 'slug', ignoreDuplicates: true })
    if (error) {
      console.error('Articles failed:', error.message, '(migration 020 applied?)')
      process.exit(1)
    }
  }
  console.log('Articles saved (existing ones were left as they are).')
}

// ── gallery photos ──────────────────────────────────────────────────────────
const photoSources: { url: string; category: string }[] = [
  ...gallery.flatMap(({ item, plan }) => item.images.map((url) => ({ url, category: plan.type === 'gallery' ? plan.category : 'other' }))),
  ...(festivalPost?.images ?? []).map((url) => ({ url, category: 'festivals' })),
]
const seenPhotos = new Set<string>()
const photoRows = photoSources
  .filter(({ url }) => (seenPhotos.has(url) ? false : (seenPhotos.add(url), true)))
  .flatMap(({ url, category }) => {
    const up = uploaded.get(url)
    return up ? [{ url: up.url, storage_path: up.path, category, width: up.width, height: up.height, size_bytes: up.size, in_gallery: true, sort_order: 0 }] : []
  })
console.log(`Gallery photos: ${photoRows.length}`)
if (db && photoRows.length) {
  const { data: existing } = await db.from('content_photos').select('storage_path').not('storage_path', 'is', null).limit(5000)
  const have = new Set((existing ?? []).map((r) => r.storage_path))
  const fresh = photoRows.filter((r) => !have.has(r.storage_path))
  for (let i = 0; i < fresh.length; i += 50) {
    const { error } = await db.from('content_photos').insert(fresh.slice(i, i + 50))
    if (error) {
      console.error('Photos failed:', error.message)
      process.exit(1)
    }
  }
  console.log(`Photos saved: ${fresh.length} new, ${photoRows.length - fresh.length} already there.`)
}

// ── tours ───────────────────────────────────────────────────────────────────
const base = DEMO_TOURS.find((t) => t.slug === 'dalle-steppe-al-deserto-18-giorni')!
const today = new Date().toISOString().slice(0, 10)

interface TourSpec {
  page: string
  slug: string
  title: string
  en: { title: string; shortDescription: string }
  regions: string[]
  category: 'adventure' | 'cultural' | 'nature'
  activities: string[]
}
const TOURS: TourSpec[] = [
  { page: 'il-gran-tour-della-mongolia', slug: 'il-gran-tour-della-mongolia', title: 'Il gran tour della Mongolia', en: { title: 'The Grand Tour of Mongolia', shortDescription: 'An 18-day loop from Lake Khuvsgul through Kharkhorin and the Gobi back to the capital, with monasteries, hermitages and nomad camps.' }, regions: ['khuvsgul', 'khangai', 'gobi', 'central', 'ulaanbaatar'], category: 'adventure', activities: ['hiking', 'monasteries', 'nomad_life', 'camel_trek', 'photography'] },
  { page: 'travels/il-grande-santo', slug: 'il-grande-santo', title: 'Il Grande Santo: Ikh Bogd e il Gobi', en: { title: 'The Great Saint: Ikh Bogd and the Gobi', shortDescription: 'Across the Gobi to the sacred Ikh Bogd mountain, then volcanic lakes and Hustai’s wild horses.' }, regions: ['gobi', 'khangai', 'central', 'ulaanbaatar'], category: 'adventure', activities: ['hiking', 'wildlife', 'monasteries', 'photography'] },
]

for (const spec of TOURS) {
  const page = site.find((i) => i.path === spec.page)
  if (!page) continue
  const body = cleanMarkdown(page.md, { image: newImageUrl, link: linkFor })
  const header = parseTripHeader(body)
  const days = parseDays(body)
  const intro = body.split('\n\n').filter((b) => !/^(#|!\[|@\[|\*\*|[-–])/.test(b.trim()) && b.length > 120 && !/^(Costo|Da:|Durata)/i.test(b)).slice(0, 2).join('\n\n')
  const upImages = page.images.map((u) => uploaded.get(u)?.url).filter((u): u is string => Boolean(u))
  const images = upImages.length ? upImages : base.images
  const fixed = header.price !== null && spec.slug === 'il-gran-tour-della-mongolia'
  const duration = header.start && header.end ? Math.round((Date.parse(header.end) - Date.parse(header.start)) / 86400000) + 1 : days.length || 14
  const row = {
    slug: spec.slug,
    title: spec.title,
    translations: { en: { title: spec.en.title, shortDescription: spec.en.shortDescription, includes: base.translations?.en?.includes, excludes: base.translations?.en?.excludes } },
    description: intro || summaryOf(body),
    short_description: summaryOf(intro || body).slice(0, 220),
    duration,
    group_size_min: header.minPeople ?? 2,
    group_size_max: header.maxPeople ?? 12,
    price: fixed ? header.price : 70,
    currency: fixed ? header.currency : 'EUR',
    difficulty: 'moderate',
    category: spec.category,
    destinations: [],
    regions: spec.regions,
    tour_type: 'both',
    season_months: [6, 7, 8, 9],
    activities: spec.activities,
    accommodation: ['hotel', 'ger_camp'],
    vehicle: 'jeep_4x4',
    price_mode: fixed ? 'fixed' : 'from_per_day',
    price_tiers: [],
    single_supplement: header.singleSupplement,
    is_new: false,
    includes: base.includes,
    excludes: base.excludes,
    itinerary: days.map((d) => ({ day: d.day, title: d.title, description: d.description })),
    images: images.slice(0, 8),
    cover_image: images[0],
    featured: false,
    is_hero: false,
    status: 'active',
  }
  console.log(`Tour "${spec.title}": ${days.length} days parsed, price ${row.price} ${row.currency} (${row.price_mode}), ${images.length} pictures${header.start ? `, departure ${header.start}..${header.end}` : ''}`)
  if (!db) continue

  const { error } = await db.from('tours').upsert(row, { onConflict: 'slug', ignoreDuplicates: true })
  if (error) {
    console.error('Tour failed:', error.message)
    process.exit(1)
  }
  if (header.start && header.end && header.start >= today) {
    const { data: tour } = await db.from('tours').select('id').eq('slug', spec.slug).single()
    if (tour) {
      const { data: exists } = await db.from('departures').select('id').eq('tour_id', tour.id).eq('start_date', header.start).maybeSingle()
      if (!exists) {
        const { error: depError } = await db.from('departures').insert({
          tour_id: tour.id,
          start_date: header.start,
          end_date: header.end,
          min_participants: header.minPeople ?? 4,
          max_participants: header.maxPeople ?? 14,
          status: 'open',
          notes: 'Date e prezzo come indicati sul sito originale: da confermare.',
        })
        if (depError) console.error('Departure failed:', depError.message)
        else console.log(`  departure added: ${header.start} - ${header.end}`)
      }
    }
  }
}

console.log(dryRun ? '\nDry run finished: nothing was changed.' : '\nDone. Open the website and the admin panel to check the result.')
