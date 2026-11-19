/**
 * Fixed option lists for the inbound tour model. Keys are stable ASCII ids
 * stored in the database; public labels live in messages/*.json (tours.*),
 * the Mongolian-only admin uses label.
 * Pure module (no imports) so tests, server and client code can all use it.
 */

export const TOUR_TYPES = [
  { key: 'private', label: 'Хувийн' },
  { key: 'group', label: 'Бүлгийн' },
  { key: 'both', label: 'Хоёулаа' },
] as const
export type TourType = (typeof TOUR_TYPES)[number]['key']

export const PRICE_MODES = [
  { key: 'fixed', label: 'Тогтмол үнэ (нэг хүнд)' },
  { key: 'from_per_day', label: 'Хоногийн үнэ (нэг хүнд)' },
  { key: 'on_request', label: 'Хүсэлтээр' },
] as const
export type PriceMode = (typeof PRICE_MODES)[number]['key']

export const ACTIVITIES = [
  { key: 'horse_riding', label: 'Морин аялал' },
  { key: 'hiking', label: 'Явган аялал' },
  { key: 'camel_trek', label: 'Тэмээн аялал' },
  { key: 'eagle_hunters', label: 'Бүркэдчин' },
  { key: 'nomad_life', label: 'Нүүдэлчин айл' },
  { key: 'monasteries', label: 'Хийд сүм' },
  { key: 'stargazing', label: 'Оддын ажиглалт' },
  { key: 'photography', label: 'Гэрэл зураг' },
  { key: 'festivals', label: 'Наадам, баяр' },
  { key: 'wildlife', label: 'Ан амьтан' },
] as const
export type ActivityKey = (typeof ACTIVITIES)[number]['key']

export const ACCOMMODATIONS = [
  { key: 'hotel', label: 'Зочид буудал' },
  { key: 'guesthouse', label: 'Зочны байр' },
  { key: 'ger_camp', label: 'Гэр кемп' },
  { key: 'tent', label: 'Майхан' },
  { key: 'nomad_family', label: 'Нүүдэлчин айл' },
  { key: 'monastery', label: 'Хийд' },
] as const
export type AccommodationKey = (typeof ACCOMMODATIONS)[number]['key']

export const VEHICLES = [
  { key: 'jeep_4x4', label: '4x4 жийп' },
  { key: 'minivan', label: 'Минивэн' },
  { key: 'mixed', label: 'Холимог' },
] as const
export type VehicleKey = (typeof VEHICLES)[number]['key']

export const DEPARTURE_STATUSES = [
  { key: 'open', label: 'Нээлттэй' },
  { key: 'confirmed', label: 'Баталгаажсан' },
  { key: 'full', label: 'Дүүрсэн' },
  { key: 'cancelled', label: 'Цуцлагдсан' },
] as const
export type DepartureStatus = (typeof DEPARTURE_STATUSES)[number]['key']

export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

export const keysOf = (list: readonly { key: string }[]) => list.map((x) => x.key)
export const isOneOf = <T extends string>(list: readonly { key: T }[], v: unknown): v is T =>
  typeof v === 'string' && list.some((x) => x.key === v)
