import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { mergeSettings, parseSettingsInput } from '@/lib/site-settings'
import { revalidateSite } from '@/lib/revalidate'

/** GET /api/site-settings (admin): the current contact and company details. */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { data, error } = await getSupabaseAdmin().from('site_settings').select('value').eq('key', 'site').maybeSingle()
    if (error) return apiError(error.message, 500)
    return apiSuccess(mergeSettings(data?.value))
  } catch {
    return apiError('Server error', 500)
  }
}

/** PUT /api/site-settings (admin): save the details (only the fields sent are changed). */
export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const parsed = parseSettingsInput(await request.json())
    if (!parsed.ok) return apiError(`Invalid ${parsed.error}`, 400)

    const db = getSupabaseAdmin()
    const { data: existing, error: readError } = await db.from('site_settings').select('value').eq('key', 'site').maybeSingle()
    if (readError) return apiError(readError.message, 500)
    const value = { ...(existing?.value ?? {}), ...parsed.value }

    const { error } = await db.from('site_settings').upsert({ key: 'site', value, updated_at: new Date().toISOString() })
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess(mergeSettings(value))
  } catch {
    return apiError('Server error', 500)
  }
}
