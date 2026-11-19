import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess, snakeToCamel } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request)

    let query = getSupabaseAdmin().from('content_videos').select('*')
    if (!isAdmin) query = query.eq('status', 'published')

    const { data, error } = await query.order('published_at', { ascending: false })

    if (error) return apiError(error.message, 500)
    return apiSuccess(snakeToCamel(data ?? []))
  } catch {
    return apiError('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) return apiError('Unauthorized', 401)

    const body = await request.json()
    const { data, error } = await getSupabaseAdmin()
      .from('content_videos')
      .insert({
        title: body.title,
        platform: body.platform ?? 'youtube',
        url: body.url,
        thumbnail_url: body.thumbnailUrl,
        description: body.description,
        category: body.category,
        tags: body.tags ?? [],
        views: body.views ?? 0,
        published_at: body.publishedAt ?? null,
        status: body.status ?? 'draft',
      })
      .select()
      .single()

    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess(snakeToCamel(data))
  } catch {
    return apiError('Server error', 500)
  }
}
