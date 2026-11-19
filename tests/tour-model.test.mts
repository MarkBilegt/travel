import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mapTour } from '../src/lib/tour-mapper.ts'
import { parseTourAttributes } from '../src/lib/tour-attributes.ts'
import { getTourField, getTourArray, getTourItinerary, isTourTranslated } from '../src/lib/tour-locale.ts'
import { sanitizeTranslations, sanitizeItinerary } from '../src/lib/tour-translations.ts'

test('mapTour maps the inbound fields and applies safe defaults', () => {
  const t = mapTour({
    id: 'x', slug: 's', title: 'T', price: '1500', status: 'active', cover_image: 'c.jpg',
    regions: ['gobi', 'khangai'], tour_type: 'group', season_months: [6, 7], activities: ['hiking'],
    accommodation: ['ger_camp'], vehicle: 'jeep_4x4', price_mode: 'from_per_day',
    price_tiers: [{ minPeople: 4, price: 100 }, { minPeople: 2, maxPeople: 3, price: 120 }], single_supplement: '250', currency: 'USD',
  })
  assert.deepEqual(t.regions, ['gobi', 'khangai'])
  assert.equal(t.region, 'gobi')
  assert.equal(t.tourType, 'group')
  assert.deepEqual(t.seasonMonths, [6, 7])
  assert.equal(t.priceMode, 'from_per_day')
  assert.deepEqual(t.priceTiers.map((x) => x.minPeople), [2, 4]) // sorted
  assert.equal(t.singleSupplement, 250)
  assert.equal(t.currency, 'USD')

  const bare = mapTour({ id: 'y', status: 'draft' } as never)
  assert.deepEqual(bare.regions, [])
  assert.equal(bare.region, undefined)
  assert.equal(bare.tourType, 'both')
  assert.equal(bare.priceMode, 'fixed')
  assert.deepEqual(bare.priceTiers, [])
  assert.equal(bare.singleSupplement, undefined)
  assert.equal(bare.currency, 'EUR')
})

test('parseTourAttributes keeps only known values and only the keys present', () => {
  assert.deepEqual(parseTourAttributes({}), {})
  const out = parseTourAttributes({
    tourType: 'nonsense', priceMode: 'on_request', regions: ['gobi', 'mars', 'gobi'], activities: ['hiking', 'bungee'],
    accommodation: ['tent', 7], seasonMonths: [7, '6', 13, 0, 7], vehicle: 'rocket', singleSupplement: '', priceTiers: [{ minPeople: 2, price: 10 }, 'x'],
  })
  assert.deepEqual(out, {
    tour_type: 'both', price_mode: 'on_request', regions: ['gobi'], activities: ['hiking'], accommodation: ['tent'],
    season_months: [6, 7], vehicle: null, price_tiers: [{ minPeople: 2, price: 10 }], single_supplement: null,
  })
  // legacy single region field
  assert.deepEqual(parseTourAttributes({ region: 'altai' }), { regions: ['altai'] })
  assert.deepEqual(parseTourAttributes({ region: 'mars' }), { regions: [] })
})

test('tour text falls back from the visitor language to the default language', () => {
  const tour = {
    title: 'Viaggio', shortDescription: 'Breve', description: 'Lungo', includes: ['Pasti'], excludes: [], itinerary: [{ day: 1, title: 'Giorno', description: 'x' }],
    translations: { en: { title: 'Trip', includes: ['Meals'] } },
  }
  assert.equal(getTourField(tour, 'title', 'en'), 'Trip')
  assert.equal(getTourField(tour, 'shortDescription', 'en'), 'Breve') // not translated -> default
  assert.equal(getTourField(tour, 'title', 'it'), 'Viaggio')
  assert.equal(getTourField(tour, 'title', 'xx'), 'Viaggio')
  assert.deepEqual(getTourArray(tour, 'includes', 'en'), ['Meals'])
  assert.deepEqual(getTourArray(tour, 'excludes', 'en'), [])
  assert.equal(getTourItinerary(tour, 'en')[0].title, 'Giorno')
  assert.equal(isTourTranslated(tour as never, 'en'), true)
  assert.equal(isTourTranslated({ ...tour, translations: {} } as never, 'en'), false)
  assert.equal(isTourTranslated({ ...tour, translations: {} } as never, 'it'), true)
})

test('translations from the admin form are cleaned', () => {
  const t = sanitizeTranslations({ en: { title: '  Trip  ', includes: ['a', '', 5], itinerary: [{ title: '', description: '' }, { title: 'D', description: 'x', overnight: 'tent', region: 'gobi' }] }, it: { title: 'ignored' }, fr: { title: 'unknown' } })
  assert.deepEqual(Object.keys(t), ['en']) // default language and unknown languages are dropped
  assert.equal(t.en?.title, 'Trip')
  assert.deepEqual(t.en?.includes, ['a'])
  assert.equal(t.en?.itinerary?.length, 1)
  assert.equal(t.en?.itinerary?.[0].overnight, 'tent')
  assert.deepEqual(sanitizeTranslations('junk'), {})
})

test('itinerary days keep a valid overnight type and region only', () => {
  const days = sanitizeItinerary([{ title: 'A', description: 'B', overnight: 'spaceship', region: 'gobi' }, { title: 'C', description: 'D', overnight: 'ger_camp' }])
  assert.equal(days?.[0].overnight, undefined)
  assert.equal(days?.[0].region, 'gobi')
  assert.equal(days?.[1].overnight, 'ger_camp')
  assert.equal(sanitizeItinerary('x'), undefined)
})
