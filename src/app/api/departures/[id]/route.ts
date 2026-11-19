import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { mapDeparture, parseDepartureInput } from '@/lib/departures'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)

    const parsed = parseDepartureInput(await request.json(), true)
    if (!parsed.ok) return apiError(parsed.error, 400)
    if (Object.keys(parsed.row).length === 0) return apiError('Nothing to update', 400)

    const { data, error } = await getSupabaseAdmin().from('departures').update(parsed.row).eq('id', id).select().single()
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess(mapDeparture(data))
  } catch {
    return apiError('Server error', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)

    const { error } = await getSupabaseAdmin().from('departures').delete().eq('id', id)
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess({ id })
  } catch {
    return apiError('Server error', 500)
  }
}
