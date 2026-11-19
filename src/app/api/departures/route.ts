import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { mapDeparture, parseDepartureInput } from '@/lib/departures'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/departures?tourId=...&all=1
 * Visitors get upcoming, non-cancelled departures of active tours.
 * Admins with `all=1` also get past and cancelled ones.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const tourId = searchParams.get('tourId')
    if (tourId && !UUID_RE.test(tourId)) return apiError('Invalid tour', 400)

    const wantsAll = searchParams.get('all') === '1' && (await verifyAdmin(request))
    let query = getSupabaseAdmin().from('departures').select('*, tours!inner(status)').order('start_date', { ascending: true }).limit(500)
    if (tourId) query = query.eq('tour_id', tourId)
    if (!wantsAll) {
      query = query.neq('status', 'cancelled').eq('tours.status', 'active').gte('start_date', new Date().toISOString().slice(0, 10))
    }

    const { data, error } = await query
    if (error) return apiError(error.message, 500)
    return apiSuccess((data ?? []).map(mapDeparture))
  } catch {
    return apiError('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const parsed = parseDepartureInput(await request.json())
    if (!parsed.ok) return apiError(parsed.error, 400)

    const { data, error } = await getSupabaseAdmin().from('departures').insert(parsed.row).select().single()
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess(mapDeparture(data))
  } catch {
    return apiError('Server error', 500)
  }
}
