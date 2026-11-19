/**
 * Pure rules for quote requests and group sign-ups (no framework imports, so
 * the API route, the admin page and the tests all share them).
 */
import { ACCOMMODATIONS, ACTIVITIES, isOneOf } from './tour-options.ts'

export const INQUIRY_KINDS = ['quote', 'signup'] as const
export type InquiryKind = (typeof INQUIRY_KINDS)[number]

export const INQUIRY_STATUSES = [
  { key: 'new', label: 'Шинэ' },
  { key: 'quoted', label: 'Үнийн санал илгээсэн' },
  { key: 'confirmed', label: 'Баталгаажсан' },
  { key: 'lost', label: 'Алдсан' },
] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]['key']

export interface InquiryInput {
  kind: InquiryKind
  name: string
  email: string
  phone: string | null
  country: string | null
  locale: 'it' | 'en'
  tourId: string | null
  departureId: string | null
  travelFrom: string | null
  travelTo: string | null
  flexible: boolean
  adults: number
  children: number
  budgetPerDay: number | null
  interests: string[]
  accommodationStyle: string | null
  message: string | null
}

export type ParseResult = { ok: true; value: InquiryInput } | { ok: false; error: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const text = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, max)
  return s === '' ? null : s
}
const validDate = (v: unknown): v is string =>
  typeof v === 'string' && ISO_DATE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))
const count = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback
}

/** Cleans and validates a public form submission. Error texts are for logs / API clients. */
export function parseInquiryInput(body: unknown): ParseResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' }
  const b = body as Record<string, unknown>

  const kind: InquiryKind = b.kind === 'signup' ? 'signup' : 'quote'
  const name = text(b.name, 120)
  if (!name || name.length < 2) return { ok: false, error: 'name' }
  const email = text(b.email, 200)
  if (!email || !EMAIL.test(email)) return { ok: false, error: 'email' }

  const departureId = typeof b.departureId === 'string' && UUID.test(b.departureId) ? b.departureId : null
  if (kind === 'signup' && !departureId) return { ok: false, error: 'departureId' }
  const tourId = typeof b.tourId === 'string' && UUID.test(b.tourId) ? b.tourId : null

  const travelFrom = validDate(b.travelFrom) ? b.travelFrom : null
  const travelTo = validDate(b.travelTo) ? b.travelTo : null
  if (travelFrom && travelTo && travelTo < travelFrom) return { ok: false, error: 'dates' }

  const budget =
    typeof b.budgetPerDay === 'number'
      ? b.budgetPerDay
      : typeof b.budgetPerDay === 'string' && b.budgetPerDay.trim() !== ''
        ? Number(b.budgetPerDay)
        : NaN
  const interests = Array.isArray(b.interests)
    ? ([...new Set(b.interests.filter((x) => isOneOf(ACTIVITIES, x)))] as string[])
    : []

  return {
    ok: true,
    value: {
      kind,
      name,
      email,
      phone: text(b.phone, 40),
      country: text(b.country, 80),
      locale: b.locale === 'en' ? 'en' : 'it',
      tourId,
      departureId,
      travelFrom,
      travelTo,
      flexible: b.flexible === true,
      adults: count(b.adults, 1, 50, 1),
      children: count(b.children, 0, 50, 0),
      budgetPerDay: Number.isFinite(budget) && budget > 0 && budget <= 100000 ? Math.round(budget) : null,
      interests,
      accommodationStyle: isOneOf(ACCOMMODATIONS, b.accommodationStyle) ? b.accommodationStyle : null,
      message: text(b.message, 4000),
    },
  }
}

/** Travellers counted on a departure: the confirmed sign-ups only. */
export function enrolledFromSignups(rows: { status: string; adults: number; children: number }[]): number {
  return rows.filter((r) => r.status === 'confirmed').reduce((sum, r) => sum + r.adults + r.children, 0)
}

/** Admin PATCH body -> columns to update (only known keys, only valid values). */
export function parseInquiryUpdate(body: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (!body || typeof body !== 'object') return out
  const b = body as Record<string, unknown>
  if (typeof b.status === 'string' && INQUIRY_STATUSES.some((s) => s.key === b.status)) out.status = b.status
  if (typeof b.isRead === 'boolean') out.is_read = b.isRead
  if ('adminNotes' in b) out.admin_notes = text(b.adminNotes, 4000)
  if ('departureId' in b) out.departure_id = typeof b.departureId === 'string' && UUID.test(b.departureId) ? b.departureId : null
  return out
}
