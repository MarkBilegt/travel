import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cleanTiers, tierFor, adultTripPrice, childTripPrice, bookingTotal, fromPrice, type PricedTour } from '../src/lib/tour-pricing.ts'

const base: PricedTour = { price: 2000, priceMode: 'fixed', priceTiers: [], duration: 10 }

test('cleanTiers drops junk and sorts by group size', () => {
  const t = cleanTiers([
    { minPeople: 4, price: 1500 },
    { minPeople: 2, maxPeople: 3, price: 1800 },
    { minPeople: 0, price: 1 },
    { minPeople: 5, maxPeople: 2, price: 1 },
    { minPeople: 2, price: -5 },
    'nope',
  ])
  assert.deepEqual(t, [{ minPeople: 2, maxPeople: 3, price: 1800 }, { minPeople: 4, price: 1500 }])
  assert.deepEqual(cleanTiers(null), [])
})

test('tierFor picks the tier for the group size', () => {
  const tiers = cleanTiers([{ minPeople: 2, maxPeople: 3, price: 1800 }, { minPeople: 4, price: 1500 }])
  assert.equal(tierFor(tiers, 1), undefined)
  assert.equal(tierFor(tiers, 3)?.price, 1800)
  assert.equal(tierFor(tiers, 4)?.price, 1500)
  assert.equal(tierFor(tiers, 40)?.price, 1500)
})

test('fixed price: per person for the whole trip, tiers override it', () => {
  assert.equal(adultTripPrice(base, 2), 2000)
  const tiered = { ...base, priceTiers: cleanTiers([{ minPeople: 4, price: 1500 }]) }
  assert.equal(adultTripPrice(tiered, 2), 2000)
  assert.equal(adultTripPrice(tiered, 4), 1500)
})

test('per-day price is multiplied by the number of days', () => {
  const t: PricedTour = { ...base, price: 150, priceMode: 'from_per_day', duration: 8 }
  assert.equal(adultTripPrice(t), 1200)
  assert.equal(fromPrice(t), 1200)
})

test('on request has no price and cannot be booked online', () => {
  const t: PricedTour = { ...base, priceMode: 'on_request' }
  assert.equal(adultTripPrice(t), null)
  assert.equal(childTripPrice(t), null)
  assert.equal(bookingTotal(t, 2, 0), null)
  assert.equal(fromPrice(t), null)
})

test('child price: own price, else 70% of adult', () => {
  assert.equal(childTripPrice(base), 1400)
  assert.equal(childTripPrice({ ...base, priceChild: 1000 }), 1000)
})

test('booking total uses the tier of the whole group (adults + children)', () => {
  const t: PricedTour = { ...base, priceTiers: cleanTiers([{ minPeople: 4, price: 1500 }]) }
  assert.equal(bookingTotal(t, 2, 0), 4000)
  assert.equal(bookingTotal(t, 3, 1), 3 * 1500 + 1 * Math.round(1500 * 0.7))
})

test('fromPrice shows the cheapest tier', () => {
  const t: PricedTour = { ...base, priceTiers: cleanTiers([{ minPeople: 4, price: 1500 }]) }
  assert.equal(fromPrice(t), 1500)
  assert.equal(fromPrice(base), 2000)
})
