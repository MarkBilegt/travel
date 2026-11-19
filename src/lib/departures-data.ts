import { createSupabasePublic } from '@/lib/supabase/public'
import { mapDeparture } from '@/lib/departures'
import { mapTour, TOUR_CARD_COLUMNS } from '@/lib/tour-mapper'
import { DEMO_DEPARTURES, DEMO_TOURS, isDemoMode } from '@/data/demo-tours'
import type { Departure, Tour } from '@/types'

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Upcoming, non-cancelled departures of active tours (RLS already hides the
 * rest from visitors; the filters keep demo data and the database consistent).
 * Optionally only for one tour. Falls back to demo departures in demo mode.
 */
export async function getUpcomingDepartures(tourId?: string): Promise<Departure[]> {
  let query = createSupabasePublic()
    .from('departures')
    .select('*')
    .neq('status', 'cancelled')
    .gte('start_date', today())
    .order('start_date', { ascending: true })
    .limit(200)
  if (tourId) query = query.eq('tour_id', tourId)
  const { data } = await query
  const rows = (data ?? []).map(mapDeparture)
  if (rows.length === 0 && isDemoMode()) {
    return DEMO_DEPARTURES.filter((d) => (!tourId || d.tourId === tourId) && d.startDate >= today()).sort((a, b) => a.startDate.localeCompare(b.startDate))
  }
  return rows
}

/** The tours the given departures belong to (card columns only). */
export async function getToursForDepartures(departures: Departure[]): Promise<Tour[]> {
  const ids = [...new Set(departures.map((d) => d.tourId))]
  if (ids.length === 0) return []
  const { data } = await createSupabasePublic().from('tours').select(TOUR_CARD_COLUMNS).in('id', ids).eq('status', 'active')
  const tours = (data ?? []).map(mapTour)
  if (tours.length === 0 && isDemoMode()) return DEMO_TOURS.filter((t) => ids.includes(t.id))
  return tours
}
