import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess, snakeToCamel } from '@/lib/api-helpers'

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('content_photos')
      .select('*')
      .order('uploaded_at', { ascending: false })

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
      .from('content_photos')
      .insert({
        url: body.url,
        alt_text: body.altText,
        category: body.category,
        tags: body.tags ?? [],
        size_bytes: body.sizeBytes ?? null,
        width: body.width ?? null,
        height: body.height ?? null,
      })
      .select()
      .single()

    if (error) return apiError(error.message, 500)
    return apiSuccess(snakeToCamel(data))
  } catch {
    return apiError('Server error', 500)
  }
}
