import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'

/** GET /api/admin/notifications - how many inquiries nobody has opened yet. */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)

    const { count, error } = await getSupabaseAdmin().from('inquiries').select('*', { count: 'exact', head: true }).eq('is_read', false)
    if (error) return apiError(error.message, 500)

    return apiSuccess({ unreadInquiries: count ?? 0 })
  } catch {
    return apiError('Server error', 500)
  }
}
