import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { mapPhoto, parsePhotoUpdate } from '@/lib/photos'
import { revalidateSite } from '@/lib/revalidate'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Params {
  params: Promise<{ id: string }>
}

/** PUT /api/photos/[id] (admin): caption, alt text, category, gallery flags, order. */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)
    const parsed = parsePhotoUpdate(await request.json())
    if (!parsed.ok) return apiError(`Invalid ${parsed.error}`, 400)
    if (Object.keys(parsed.row).length === 0) return apiError('Nothing to update', 400)
    const { data, error } = await getSupabaseAdmin().from('content_photos').update(parsed.row).eq('id', id).select().single()
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess(mapPhoto(data))
  } catch {
    return apiError('Server error', 500)
  }
}

/** DELETE /api/photos/[id] (admin): removes the photo and, when we stored it, its file. */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)
    const db = getSupabaseAdmin()
    const { data: row } = await db.from('content_photos').select('storage_path').eq('id', id).maybeSingle()
    const { error } = await db.from('content_photos').delete().eq('id', id)
    if (error) return apiError(error.message, 500)
    if (row?.storage_path) await db.storage.from('media').remove([row.storage_path])
    revalidateSite()
    return apiSuccess({ id })
  } catch {
    return apiError('Server error', 500)
  }
}
