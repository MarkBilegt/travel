import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { mapTestimonial, parseTestimonialInput } from '@/lib/testimonials'

/** GET /api/testimonials?all=1 (admin) - every review, including unpublished ones. */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { data, error } = await getSupabaseAdmin().from('testimonials').select('*').order('sort_order').order('created_at', { ascending: false }).limit(500)
    if (error) return apiError(error.message, 500)
    return apiSuccess((data ?? []).map(mapTestimonial))
  } catch {
    return apiError('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const parsed = parseTestimonialInput(await request.json())
    if (!parsed.ok) return apiError(parsed.error, 400)
    const { data, error } = await getSupabaseAdmin().from('testimonials').insert(parsed.row).select().single()
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess(mapTestimonial(data))
  } catch {
    return apiError('Server error', 500)
  }
}
