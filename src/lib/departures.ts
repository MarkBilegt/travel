/**
 * Pure rules and validation for group departures. Unit-tested in
 * tests/departures.test.mts; no framework imports.
 */
import type { Departure } from '../types/index.ts'
import { DEPARTURE_STATUSES, isOneOf } from './tour-options.ts'

export type ShownStatus = 'open' | 'confirmed' | 'full' | 'cancelled'

export function spotsLeft(d: Pick<Departure, 'maxParticipants' | 'enrolled'>): number {
  return Math.max(0, d.maxParticipants - d.enrolled)
}

/** How many more sign-ups are needed for the departure to be guaranteed. */
export function signupsNeeded(d: Pick<Departure, 'minParticipants' | 'enrolled'>): number {
  return Math.max(0, d.minParticipants - d.enrolled)
}

/**
 * The status shown to visitors: cancelled and full win, then confirmed (set by
 * the team, or reached automatically at the minimum number of sign-ups).
 */
export function shownStatus(d: Pick<Departure, 'status' | 'minParticipants' | 'maxParticipants' | 'enrolled'>): ShownStatus {
  if (d.status === 'cancelled') return 'cancelled'
  if (d.status === 'full' || d.enrolled >= d.maxParticipants) return 'full'
  if (d.status === 'confirmed' || d.enrolled >= d.minParticipants) return 'confirmed'
  return 'open'
}

/** Can someone still sign up? */
export function isJoinable(d: Pick<Departure, 'status' | 'minParticipants' | 'maxParticipants' | 'enrolled'>): boolean {
  const s = shownStatus(d)
  return s === 'open' || s === 'confirmed'
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validDate(v: unknown): v is string {
  if (typeof v !== 'string' || !ISO_DATE.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

const int = (v: unknown, fallback: number) => {
  const n = Number(v)
  return Number.isInteger(n) ? n : fallback
}

export type DepartureInput =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; error: string }

/**
 * Validates a departure from the admin form into database columns.
 * For updates pass `partial: true` (only the fields present are checked).
 */
export function parseDepartureInput(body: Record<string, unknown>, partial = false): DepartureInput {
  const row: Record<string, unknown> = {}

  if (!partial || body.tourId !== undefined) {
    if (typeof body.tourId !== 'string' || !UUID.test(body.tourId)) return { ok: false, error: 'Tour is required' }
    row.tour_id = body.tourId
  }
  if (!partial || body.startDate !== undefined) {
    if (!validDate(body.startDate)) return { ok: false, error: 'Start date is invalid' }
    row.start_date = body.startDate
  }
  if (!partial || body.endDate !== undefined) {
    if (!validDate(body.endDate)) return { ok: false, error: 'End date is invalid' }
    row.end_date = body.endDate
  }
  if (typeof row.start_date === 'string' && typeof row.end_date === 'string' && row.end_date < row.start_date) {
    return { ok: false, error: 'End date must not be before the start date' }
  }

  if (!partial || body.minParticipants !== undefined) {
    const n = int(body.minParticipants, 2)
    if (n < 1) return { ok: false, error: 'Minimum participants must be at least 1' }
    row.min_participants = n
  }
  if (!partial || body.maxParticipants !== undefined) {
    const n = int(body.maxParticipants, 12)
    if (n < 1) return { ok: false, error: 'Maximum participants must be at least 1' }
    row.max_participants = n
  }
  if (typeof row.min_participants === 'number' && typeof row.max_participants === 'number' && row.max_participants < row.min_participants) {
    return { ok: false, error: 'Maximum must not be below the minimum' }
  }
  if (body.enrolled !== undefined) {
    const n = int(body.enrolled, 0)
    if (n < 0) return { ok: false, error: 'Enrolled cannot be negative' }
    row.enrolled = n
  }
  if (body.price !== undefined) {
    if (body.price === null || body.price === '') row.price = null
    else {
      const n = Number(body.price)
      if (!Number.isFinite(n) || n < 0) return { ok: false, error: 'Price is invalid' }
      row.price = n
    }
  }
  if (body.status !== undefined) {
    if (!isOneOf(DEPARTURE_STATUSES, body.status)) return { ok: false, error: 'Status is invalid' }
    row.status = body.status
  }
  if (body.notes !== undefined) row.notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim().slice(0, 1000) : null

  return { ok: true, row }
}

/** A `departures` database row as a Departure. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDeparture(row: Record<string, any>): Departure {
  return {
    id: row.id,
    tourId: row.tour_id,
    startDate: row.start_date,
    endDate: row.end_date,
    price: row.price != null ? Number(row.price) : undefined,
    minParticipants: row.min_participants,
    maxParticipants: row.max_participants,
    enrolled: row.enrolled ?? 0,
    status: row.status,
    notes: row.notes ?? undefined,
  }
}
