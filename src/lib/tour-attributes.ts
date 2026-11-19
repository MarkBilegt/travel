import { MONGOLIA_REGIONS } from './constants.ts'
import { ACTIVITIES, ACCOMMODATIONS, VEHICLES, TOUR_TYPES, PRICE_MODES, isOneOf } from './tour-options.ts'
import { cleanTiers } from './tour-pricing.ts'

const REGION_KEYS = MONGOLIA_REGIONS.map((r) => r.key as string)

const pickKeys = (v: unknown, allowed: readonly string[]) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && allowed.includes(x)))] : undefined

const money = (v: unknown): number | null => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * Turns the inbound-tour fields of an admin request body into database
 * columns. Only keys present in the body are returned (so PUT can be partial);
 * unknown values are dropped or replaced by safe defaults.
 */
export function parseTourAttributes(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  if (body.tourType !== undefined) out.tour_type = isOneOf(TOUR_TYPES, body.tourType) ? body.tourType : 'both'
  if (body.priceMode !== undefined) out.price_mode = isOneOf(PRICE_MODES, body.priceMode) ? body.priceMode : 'fixed'

  if (body.regions !== undefined) out.regions = pickKeys(body.regions, REGION_KEYS) ?? []
  else if (body.region !== undefined) out.regions = typeof body.region === 'string' && REGION_KEYS.includes(body.region) ? [body.region] : []

  if (body.activities !== undefined) out.activities = pickKeys(body.activities, ACTIVITIES.map((a) => a.key)) ?? []
  if (body.accommodation !== undefined) out.accommodation = pickKeys(body.accommodation, ACCOMMODATIONS.map((a) => a.key)) ?? []

  if (body.seasonMonths !== undefined) {
    const months = Array.isArray(body.seasonMonths) ? body.seasonMonths.map(Number).filter((m) => Number.isInteger(m) && m >= 1 && m <= 12) : []
    out.season_months = [...new Set(months)].sort((a, b) => a - b)
  }

  if (body.vehicle !== undefined) out.vehicle = isOneOf(VEHICLES, body.vehicle) ? body.vehicle : null
  if (body.priceTiers !== undefined) out.price_tiers = cleanTiers(body.priceTiers)
  if (body.singleSupplement !== undefined) out.single_supplement = money(body.singleSupplement)

  return out
}
