import { DEFAULT_LOCALE, isLocale } from '../i18n/locales.ts'
import type { Tour, TourText, ItineraryDay } from '@/types'

/** Anything carrying tour text: a full Tour or a partial row (footer links, metadata). */
export type TourTextSource = Partial<TourText> & { translations?: Tour['translations'] }

type TextField = 'title' | 'shortDescription' | 'description'
type ListField = 'includes' | 'excludes'

function localized(tour: TourTextSource, locale: string): Partial<TourText> | undefined {
  return isLocale(locale) && locale !== DEFAULT_LOCALE ? tour.translations?.[locale] : undefined
}

/** Text in the visitor's language, falling back to the default language. */
export function getTourField(tour: TourTextSource, field: TextField, locale: string): string {
  const v = localized(tour, locale)?.[field]
  if (typeof v === 'string' && v.trim() !== '') return v
  return tour[field] ?? ''
}

export function getTourArray(tour: TourTextSource, field: ListField, locale: string): string[] {
  const v = localized(tour, locale)?.[field]
  if (Array.isArray(v) && v.length > 0) return v
  return tour[field] ?? []
}

export function getTourItinerary(tour: TourTextSource, locale: string): ItineraryDay[] {
  const v = localized(tour, locale)?.itinerary
  if (Array.isArray(v) && v.length > 0) return v
  return tour.itinerary ?? []
}

/** True when the tour has a real title in this language (the default language always does). */
export function isTourTranslated(tour: Tour, locale: string): boolean {
  if (!isLocale(locale) || locale === DEFAULT_LOCALE) return true
  return !!tour.translations?.[locale]?.title?.trim()
}
