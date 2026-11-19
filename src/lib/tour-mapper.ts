import { cleanTiers } from './tour-pricing.ts'
import type { Tour, TourDifficulty, TourCategory, ItineraryDay, TourDiscount, DepartureSchedule } from '@/types'

/**
 * A row from the "tours" table. Supabase rows are untyped until types are
 * generated ("supabase gen types"), so keep this loose but in ONE place.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TourRow = Record<string, any>

/** Columns a TourCard needs (lists, "similar tours"): everything except long text and itineraries. */
export const TOUR_CARD_COLUMNS = [
  'id', 'slug', 'title', 'translations',
  'short_description',
  'duration', 'group_size_min', 'group_size_max',
  'price', 'currency', 'price_child', 'child_age_min', 'child_age_max',
  'difficulty', 'category',
  'destinations', 'regions', 'tour_type', 'season_months', 'activities',
  'price_mode', 'price_tiers',
  'is_new', 'includes',
  'cover_image', 'featured', 'is_hero',
  'status', 'created_at', 'updated_at',
].join(', ')

/** Single source of truth for DB row -> Tour (used by pages and API routes). */
export function mapTour(row: TourRow): Tour {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? '',
    shortDescription: row.short_description,
    duration: row.duration,
    groupSize: { min: row.group_size_min, max: row.group_size_max },
    price: Number(row.price),
    currency: row.currency === 'USD' ? 'USD' : 'EUR',
    difficulty: row.difficulty as TourDifficulty,
    category: row.category as TourCategory,
    destinations: row.destinations ?? [],
    regions: row.regions ?? [],
    region: row.regions?.[0] ?? undefined,
    tourType: row.tour_type ?? 'both',
    seasonMonths: row.season_months ?? [],
    activities: row.activities ?? [],
    accommodation: row.accommodation ?? [],
    vehicle: row.vehicle ?? undefined,
    priceMode: row.price_mode ?? 'fixed',
    priceTiers: cleanTiers(row.price_tiers),
    singleSupplement: row.single_supplement != null ? Number(row.single_supplement) : undefined,
    isNew: row.is_new ?? false,
    includes: row.includes ?? [],
    excludes: row.excludes ?? [],
    discounts: (row.discounts ?? []) as TourDiscount[],
    departureSchedule: (row.departure_schedule ?? { type: 'general' }) as DepartureSchedule,
    priceChild: row.price_child ? Number(row.price_child) : undefined,
    childAgeMin: row.child_age_min ?? undefined,
    childAgeMax: row.child_age_max ?? undefined,
    itinerary: (row.itinerary ?? []) as ItineraryDay[],
    translations: (row.translations ?? {}) as Tour['translations'],
    images: row.images ?? [],
    coverImage: row.cover_image,
    featured: row.featured ?? false,
    isHero: row.is_hero ?? false,
    active: row.status === 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
