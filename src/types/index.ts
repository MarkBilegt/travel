import { type Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/utils'
import type { PriceTier } from '@/lib/tour-pricing'
import type { TourType, PriceMode, ActivityKey, AccommodationKey, VehicleKey, DepartureStatus } from '@/lib/tour-options'

// ─── Enums / Unions ────────────────────────────────────────────────────────

export type TourDifficulty = 'easy' | 'moderate' | 'challenging'
export type TourCategory = 'adventure' | 'cultural' | 'nature' | 'luxury' | 'family'
export type AdminRole = 'super_admin' | 'admin' | 'staff'
export type PartnerType = 'accommodation' | 'transport' | 'activity' | 'other'

// ─── Tour ──────────────────────────────────────────────────────────────────

export interface ItineraryDay {
  day: number
  title: string
  description: string
  accommodation?: string
  /** Where the group sleeps this night */
  overnight?: AccommodationKey
  /** Region key where the day takes place */
  region?: string
  meals?: string[]
  image?: string
}

export interface TourDiscount {
  min_people: number
  percentage: number
}

export type DepartureScheduleType = 'general' | 'fixed' | 'recurring'

export interface DepartureSchedule {
  type: DepartureScheduleType
  dates?: string[]       // for type 'fixed'
  weekday?: string       // for type 'recurring', e.g. 'tuesday'
  months?: number[]      // for type 'recurring', e.g. [3, 4, 5]
  note?: string          // human-readable label shown on UI
}

/** Translatable text of a tour. The default language also lives on the Tour itself. */
export interface TourText {
  title: string
  shortDescription: string
  description: string
  includes: string[]
  excludes: string[]
  itinerary: ItineraryDay[]
}

export interface Tour {
  id: string
  slug: string
  title: string
  /** Text in the default language (Italian); see translations for the rest. */
  description: string
  shortDescription: string
  duration: number // days
  groupSize: { min: number; max: number }
  price: number // adult price in `currency`
  /** Currency this tour is priced in. */
  currency: Currency
  priceChild?: number // child price in `currency`
  childAgeMin?: number
  childAgeMax?: number
  difficulty: TourDifficulty
  category: TourCategory
  destinations: string[]
  /** Region keys (see MONGOLIA_REGIONS) the tour visits, e.g. ['gobi'] */
  regions: string[]
  /** Main region (first of `regions`), for labels and grouping */
  region?: string
  tourType: TourType
  /** Months (1-12) the tour can run; empty = all year */
  seasonMonths: number[]
  activities: ActivityKey[]
  accommodation: AccommodationKey[]
  vehicle?: VehicleKey
  priceMode: PriceMode
  /** Per-person price by group size; replaces `price` for that group size */
  priceTiers: PriceTier[]
  /** Extra for a single room, in `currency` */
  singleSupplement?: number
  isNew?: boolean
  includes: string[]
  excludes: string[]
  discounts: TourDiscount[]
  departureSchedule: DepartureSchedule
  itinerary: ItineraryDay[]
  /** Other languages keyed by locale. Missing fields fall back to the default language above. */
  translations: Partial<Record<Locale, Partial<TourText>>>
  images: string[]
  coverImage: string
  featured: boolean
  isHero?: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface TourPackage {
  id: string
  tourId: string
  name: string
  description: string
  price: number
  includes: string[]
  maxPeople: number
  available: boolean
}

// ─── Customer ──────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality?: string
  passportNumber?: string
  createdAt: string
}

// ─── Partners ──────────────────────────────────────────────────────────────

export interface Partner {
  id: string
  name: string
  logoUrl: string
  website?: string
  description?: string
  type: PartnerType
  active: boolean
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string
  name: string
  role: AdminRole
  active: boolean
  createdAt: string
  lastLoginAt?: string
}

// ─── Content Video ─────────────────────────────────────────────────────────

export interface ContentVideo {
  id: string
  title: string
  platform: 'youtube' | 'direct' | 'edutv' | 'moviebox'
  url: string
  thumbnailUrl?: string
  description?: string
  category?: string
  tags: string[]
  views: number
  publishedAt?: string
  status: 'draft' | 'published'
}

// ─── Admin Stats ───────────────────────────────────────────────────────────

export interface AdminStats {
  activeTours: number
  upcomingDepartures: number
  newInquiries: number
  totalInquiries: number
  inquiriesByMonth: { month: string; inquiries: number }[]
  statusChart: { name: string; value: number; color: string }[]
  topTours: { title: string; inquiries: number; max: number }[]
  recent: { id: string; kind: 'quote' | 'signup'; status: string; name: string; tourTitle: string | null; createdAt: string }[]
}

export interface AdminSeoMetric {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface AdminSeoRow extends AdminSeoMetric {
  key: string
}

export interface AdminSeoData {
  configured: boolean
  siteUrl: string | null
  dateRange: {
    startDate: string
    endDate: string
    previousStartDate: string
    previousEndDate: string
  }
  summary: AdminSeoMetric
  previousSummary: AdminSeoMetric
  changes: AdminSeoMetric
  topQueries: AdminSeoRow[]
  topPages: AdminSeoRow[]
  countries: AdminSeoRow[]
}

// ─── Navigation ────────────────────────────────────────────────────────────

export interface NavLink {
  label: string
  href: string
  children?: NavLink[]
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

// ─── Departures ───────────────────────────────────────────────────────────

/** A dated group trip people can join. */
export interface Departure {
  id: string
  tourId: string
  startDate: string // YYYY-MM-DD
  endDate: string
  /** Overrides the tour price when set */
  price?: number
  minParticipants: number
  maxParticipants: number
  enrolled: number
  status: DepartureStatus
  notes?: string
}
