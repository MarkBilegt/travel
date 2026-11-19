import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess, paginate } from '@/lib/api-helpers'
import { mapTour } from '@/lib/tour-mapper'
import { sanitizeTranslations, sanitizeItinerary } from '@/lib/tour-translations'
import { parseTourAttributes } from '@/lib/tour-attributes'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? 'active'
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '12', 10)
    const { from, to } = paginate(page, limit)
    const isAdmin = await verifyAdmin(request)

    let query = getSupabaseAdmin().from('tours').select('*', { count: 'exact' })

    if (!isAdmin) {
      query = query.eq('status', 'active')
    } else if (status !== 'all') {
      query = query.eq('status', status)
    }
    if (category) query = query.eq('category', category)
    if (featured === 'true') query = query.eq('featured', true)

    const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false })

    if (error) return apiError(error.message, 500)

    return apiSuccess((data ?? []).map(mapTour), { total: count ?? 0, page, limit })
  } catch {
    return apiError('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) return apiError('Unauthorized', 401)

    const body = await request.json()
    const { data, error } = await getSupabaseAdmin()
      .from('tours')
      .insert({
        slug: body.slug,
        title: body.title,
        translations: sanitizeTranslations(body.translations),
        description: body.description,
        short_description: body.shortDescription,
        duration: body.duration,
        group_size_min: body.groupSize?.min ?? 1,
        group_size_max: body.groupSize?.max ?? 20,
        price: body.price,
        currency: body.currency === 'USD' ? 'USD' : 'EUR',
        difficulty: body.difficulty ?? 'moderate',
        category: body.category,
        destinations: body.destinations ?? [],
        ...parseTourAttributes(body),
        is_new: body.isNew ?? false,
        includes: body.includes ?? [],
        excludes: body.excludes ?? [],
        itinerary: sanitizeItinerary(body.itinerary) ?? [],
        images: body.images ?? [],
        cover_image: body.coverImage,
        featured: body.featured ?? false,
        status: body.active ? 'active' : 'draft',
      })
      .select()
      .single()

    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess(mapTour(data), undefined)
  } catch {
    return apiError('Server error', 500)
  }
}
