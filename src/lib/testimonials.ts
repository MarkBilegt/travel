/** Pure rules for traveller reviews (admin input validation and row mapping). */

export interface Testimonial {
  id: string
  name: string
  country: string | null
  quote: string
  language: 'it' | 'en'
  rating: number | null
  trip: string | null
  consentGiven: boolean
  active: boolean
  sortOrder: number
}

const text = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s === '' ? null : s
}

export type TestimonialResult = { ok: true; row: Record<string, unknown> } | { ok: false; error: string }

/**
 * Admin form -> database columns. With `partial` only the keys present are
 * returned. A review can never be active without the traveller's consent.
 */
export function parseTestimonialInput(body: unknown, partial = false): TestimonialResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' }
  const b = body as Record<string, unknown>
  const row: Record<string, unknown> = {}

  if (!partial || 'name' in b) {
    const name = text(b.name, 120)
    if (!name) return { ok: false, error: 'Name is required' }
    row.name = name
  }
  if (!partial || 'quote' in b) {
    const quote = text(b.quote, 2000)
    if (!quote || quote.length < 10) return { ok: false, error: 'The review needs at least 10 characters' }
    row.quote = quote
  }
  if ('country' in b) row.country = text(b.country, 80)
  if ('trip' in b) row.trip = text(b.trip, 160)
  if ('language' in b || !partial) row.language = b.language === 'en' ? 'en' : 'it'
  if ('rating' in b) {
    const n = Number(b.rating)
    row.rating = Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
  }
  if ('sortOrder' in b) {
    const n = Number(b.sortOrder)
    row.sort_order = Number.isInteger(n) ? n : 0
  }
  if ('consentGiven' in b || !partial) row.consent_given = b.consentGiven === true
  if ('active' in b || !partial) row.active = b.active !== false
  // Consent is required to publish: never store active + no consent together.
  if (row.consent_given === false) row.active = false
  return { ok: true, row }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTestimonial(r: Record<string, any>): Testimonial {
  return {
    id: r.id,
    name: r.name,
    country: r.country ?? null,
    quote: r.quote,
    language: r.language === 'en' ? 'en' : 'it',
    rating: typeof r.rating === 'number' ? r.rating : null,
    trip: r.trip ?? null,
    consentGiven: Boolean(r.consent_given),
    active: Boolean(r.active),
    sortOrder: Number(r.sort_order ?? 0),
  }
}
