import { LOCALES, DEFAULT_LOCALE } from '../i18n/locales.ts'
import { ACCOMMODATIONS, isOneOf } from './tour-options.ts'
import type { Tour, TourText, ItineraryDay } from '@/types'

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined)
const list = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').map((x) => x.trim().slice(0, 300)).filter(Boolean).slice(0, 50) : undefined

export function sanitizeItinerary(v: unknown): ItineraryDay[] | undefined {
  if (!Array.isArray(v)) return undefined
  return v.slice(0, 60).map((d, i) => ({
    day: typeof d?.day === 'number' ? d.day : i + 1,
    title: str(d?.title, 200) ?? '',
    description: str(d?.description, 4000) ?? '',
    ...(typeof d?.image === 'string' && d.image ? { image: d.image } : {}),
    ...(isOneOf(ACCOMMODATIONS, d?.overnight) ? { overnight: d.overnight } : {}),
    ...(typeof d?.region === 'string' && d.region ? { region: d.region.slice(0, 40) } : {}),
    ...(typeof d?.accommodation === 'string' && d.accommodation ? { accommodation: d.accommodation.slice(0, 200) } : {}),
    ...(Array.isArray(d?.meals) ? { meals: list(d.meals) } : {}),
  }))
}

/**
 * Cleans the `translations` object coming from the admin form: only known,
 * non-default languages; only known text fields; trimmed and length-capped;
 * empty values dropped so they fall back to the default language.
 */
export function sanitizeTranslations(input: unknown): Tour['translations'] {
  const out: Tour['translations'] = {}
  if (!input || typeof input !== 'object') return out
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    const raw = (input as Record<string, unknown>)[locale]
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const t: Partial<TourText> = {}
    const title = str(r.title, 200)
    const shortDescription = str(r.shortDescription, 600)
    const description = str(r.description, 20000)
    const includes = list(r.includes)
    const excludes = list(r.excludes)
    const days = sanitizeItinerary(r.itinerary)?.filter((d) => d.title || d.description)
    if (title) t.title = title
    if (shortDescription) t.shortDescription = shortDescription
    if (description) t.description = description
    if (includes?.length) t.includes = includes
    if (excludes?.length) t.excludes = excludes
    if (days?.length) t.itinerary = days
    if (Object.keys(t).length) out[locale] = t
  }
  return out
}
