import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { mapTour } from '@/lib/tour-mapper'
import { sanitizeTranslations, sanitizeItinerary } from '@/lib/tour-translations'
import { parseTourAttributes } from '@/lib/tour-attributes'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const isUUID = UUID_RE.test(id)
    const isAdmin = await verifyAdmin(request)

    let query = getSupabaseAdmin().from('tours').select('*')
    if (!isAdmin) query = query.eq('status', 'active')
    const { data, error } = await (isUUID ? query.eq('id', id) : query.eq('slug', id)).single()

    if (error || !data) return apiError('No tours found', 404)
    return apiSuccess(mapTour(data))
  } catch {
    return apiError('Server error', 500)
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    if (!await verifyAdmin(request)) return apiError('Unauthorized', 401)

    const { id } = await params
    const body = await request.json()

    const updates: Record<string, unknown> = {}
    if (body.title !== undefined) updates.title = body.title
    if (body.translations !== undefined) updates.translations = sanitizeTranslations(body.translations)
    if (body.description !== undefined) updates.description = body.description
    if (body.shortDescription !== undefined) updates.short_description = body.shortDescription
    if (body.duration !== undefined) updates.duration = body.duration
    if (body.groupSize?.min !== undefined) updates.group_size_min = body.groupSize.min
    if (body.groupSize?.max !== undefined) updates.group_size_max = body.groupSize.max
    if (body.price !== undefined) updates.price = body.price
    if (body.currency !== undefined) updates.currency = body.currency === 'USD' ? 'USD' : 'EUR'
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty
    if (body.category !== undefined) updates.category = body.category
    if (body.destinations !== undefined) updates.destinations = body.destinations
    Object.assign(updates, parseTourAttributes(body))
    if (body.isNew !== undefined) updates.is_new = body.isNew
    if (body.includes !== undefined) updates.includes = body.includes
    if (body.excludes !== undefined) updates.excludes = body.excludes
    if (body.itinerary !== undefined) updates.itinerary = sanitizeItinerary(body.itinerary) ?? []
    if (body.images !== undefined) updates.images = body.images
    if (body.coverImage !== undefined) updates.cover_image = body.coverImage
    if (body.featured !== undefined) updates.featured = body.featured
    if (body.is_hero !== undefined) updates.is_hero = body.is_hero
    if (body.active !== undefined) updates.status = body.active ? 'active' : 'inactive'
    if (body.status !== undefined) {
      if (!['active', 'inactive', 'draft'].includes(body.status)) return apiError('Invalid tour status', 400)
      updates.status = body.status
    }

    const { data, error } = await getSupabaseAdmin()
      .from('tours')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess(mapTour(data))
  } catch {
    return apiError('Server error', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    if (!await verifyAdmin(request)) return apiError('Unauthorized', 401)

    const { id } = await params
    const { error } = await getSupabaseAdmin()
      .from('tours')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess({ id })
  } catch {
    return apiError('Server error', 500)
  }
}
