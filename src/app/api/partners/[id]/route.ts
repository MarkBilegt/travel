import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    if (!await verifyAdmin(request)) return apiError('Unauthorized', 401)

    const { id } = await params
    const body = await request.json()

    const update: Record<string, unknown> = {}
    if (body.name !== undefined) update.name = body.name
    if (body.logoUrl !== undefined) update.logo_url = body.logoUrl
    if (body.website !== undefined) update.website = body.website ?? null
    if (body.description !== undefined) update.description = body.description ?? null
    if (body.type !== undefined) update.type = body.type
    if (body.isVisible !== undefined) update.is_visible = body.isVisible

    const { error } = await getSupabaseAdmin().from('partners').update(update).eq('id', id)

    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess({ id })
  } catch {
    return apiError('Server error', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    if (!await verifyAdmin(request)) return apiError('Unauthorized', 401)

    const { id } = await params
    const { error } = await getSupabaseAdmin().from('partners').delete().eq('id', id)

    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess({ id })
  } catch {
    return apiError('Server error', 500)
  }
}
