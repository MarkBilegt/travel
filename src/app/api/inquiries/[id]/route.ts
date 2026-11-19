import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { apiError, apiSuccess, verifyAdmin } from '@/lib/api-helpers'
import { enrolledFromSignups, parseInquiryUpdate } from '@/lib/inquiries'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Sets departures.enrolled to the travellers of its confirmed sign-ups. */
async function recountDeparture(departureId: string) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('inquiries').select('status, adults, children').eq('departure_id', departureId).eq('kind', 'signup')
  await db.from('departures').update({ enrolled: enrolledFromSignups(data ?? []) }).eq('id', departureId)
}

/** PATCH /api/inquiries/[id]  (admin) - status, notes, read flag, linked departure. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)

    const update = parseInquiryUpdate(await request.json())
    if (Object.keys(update).length === 0) return apiError('Nothing to update', 400)

    const db = getSupabaseAdmin()
    const { data: before } = await db.from('inquiries').select('departure_id').eq('id', id).maybeSingle()
    if (!before) return apiError('Not found', 404)

    const { error } = await db.from('inquiries').update(update).eq('id', id)
    if (error) return apiError(error.message, 500)

    // Confirmed sign-ups fill the departure: recount the old and the new one.
    if ('status' in update || 'departure_id' in update) {
      const ids = new Set<string>()
      if (before.departure_id) ids.add(before.departure_id)
      if (typeof update.departure_id === 'string') ids.add(update.departure_id)
      for (const dep of ids) await recountDeparture(dep)
    }
    revalidateSite()
    return apiSuccess({ success: true })
  } catch {
    return apiError('Server error', 500)
  }
}

/** DELETE /api/inquiries/[id]  (admin) - erase one request (right to erasure) and recount its departure. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)

    const db = getSupabaseAdmin()
    const { data: before } = await db.from('inquiries').select('departure_id').eq('id', id).maybeSingle()
    if (!before) return apiError('Not found', 404)

    const { error } = await db.from('inquiries').delete().eq('id', id)
    if (error) return apiError(error.message, 500)
    if (before.departure_id) await recountDeparture(before.departure_id)
    revalidateSite()
    return apiSuccess({ id })
  } catch {
    return apiError('Server error', 500)
  }
}
