/**
 * Pure pricing rules for tours. No imports: unit-tested in tests/tour-pricing.test.mts.
 *
 * price_mode
 *   fixed         `price` is the price per person for the whole trip
 *   from_per_day  `price` is per person per day; the trip total is price x duration
 *   on_request    no public price; the traveller asks for a quote
 * price_tiers     optional per-person prices by group size, replacing `price`
 *                 for that group size ({ minPeople, maxPeople?, price })
 */

export type PriceModeKey = 'fixed' | 'from_per_day' | 'on_request'

export interface PriceTier {
  minPeople: number
  /** open-ended when missing */
  maxPeople?: number
  /** per person, in the tour's currency (same unit as the tour's `price`) */
  price: number
}

export interface PricedTour {
  price: number
  priceMode: PriceModeKey
  priceTiers: PriceTier[]
  priceChild?: number
  duration: number
}

/** Tiers sorted by minimum group size, with junk removed. */
export function cleanTiers(input: unknown): PriceTier[] {
  if (!Array.isArray(input)) return []
  const tiers: PriceTier[] = []
  for (const raw of input) {
    const min = Math.floor(Number(raw?.minPeople))
    const price = Number(raw?.price)
    if (!Number.isFinite(min) || min < 1 || !Number.isFinite(price) || price < 0) continue
    const max = raw?.maxPeople == null || raw.maxPeople === '' ? undefined : Math.floor(Number(raw.maxPeople))
    if (max !== undefined && (!Number.isFinite(max) || max < min)) continue
    tiers.push(max === undefined ? { minPeople: min, price } : { minPeople: min, maxPeople: max, price })
  }
  return tiers.sort((a, b) => a.minPeople - b.minPeople)
}

/** The tier that applies to a group of `people`, if any. */
export function tierFor(tiers: PriceTier[], people: number): PriceTier | undefined {
  return tiers.find((t) => people >= t.minPeople && (t.maxPeople === undefined || people <= t.maxPeople))
}

/** Price per person for a group, in the unit of the mode (per trip, or per day). */
export function unitPrice(tour: Pick<PricedTour, 'price' | 'priceTiers'>, people: number): number {
  return tierFor(tour.priceTiers, people)?.price ?? tour.price
}

/** Price per adult for the whole trip, or null when it is only on request. */
export function adultTripPrice(tour: PricedTour, people = 1): number | null {
  if (tour.priceMode === 'on_request') return null
  const unit = unitPrice(tour, Math.max(1, people))
  return tour.priceMode === 'from_per_day' ? unit * tour.duration : unit
}

/** Child price: the tour's own child price, else 70% of the adult price. */
export function childTripPrice(tour: PricedTour, people = 1): number | null {
  const adult = adultTripPrice(tour, people)
  if (adult === null) return null
  return tour.priceChild != null ? tour.priceChild : Math.round(adult * 0.7)
}

/** Total for a booking, or null when the tour is on request. */
export function bookingTotal(tour: PricedTour, adults: number, children: number): number | null {
  const people = adults + children
  const adult = adultTripPrice(tour, people)
  const child = childTripPrice(tour, people)
  if (adult === null || child === null) return null
  return adults * adult + children * child
}

/** Lowest per-person trip price shown as "from ...", or null when on request. */
export function fromPrice(tour: PricedTour): number | null {
  if (tour.priceMode === 'on_request') return null
  const units = [tour.price, ...tour.priceTiers.map((t) => t.price)].filter((n) => n > 0)
  const lowest = units.length ? Math.min(...units) : tour.price
  return tour.priceMode === 'from_per_day' ? lowest * tour.duration : lowest
}
