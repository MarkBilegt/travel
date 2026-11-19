import { NextRequest } from 'next/server'
import { revalidateSite } from '@/lib/revalidate'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess, snakeToCamel } from '@/lib/api-helpers'

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN

function appendLogoToken(url: string): string {
  if (!url || !LOGO_DEV_TOKEN || !url.includes('img.logo.dev')) return url
  const u = new URL(url)
  if (!u.searchParams.has('token')) u.searchParams.set('token', LOGO_DEV_TOKEN)
  return u.toString()
}

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('partners')
      .select('*')
      .eq('is_visible', true)
      .order('display_order')

    if (error) return apiError(error.message, 500)

    const partners = (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      logoUrl: appendLogoToken(p.logo_url),
      website: p.website ?? undefined,
      description: p.description ?? undefined,
      type: p.type,
      active: p.is_visible,
    }))

    return apiSuccess({ partners })
  } catch {
    return apiError('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) return apiError('Unauthorized', 401)

    const body = await request.json()

    const { data, error } = await getSupabaseAdmin()
      .from('partners')
      .insert({
        name: body.name,
        logo_url: body.logoUrl,
        website: body.website ?? null,
        description: body.description ?? null,
        type: body.type ?? 'other',
        display_order: body.displayOrder ?? 0,
        is_visible: body.isVisible ?? true,
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
