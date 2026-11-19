import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { conformToDefault, TEXT_GROUP_KEYS, type Json } from '@/lib/site-texts'
import { LOCALES, isLocale } from '@/i18n/locales'
import { revalidateSite } from '@/lib/revalidate'
import it from '../../../../messages/it.json'
import en from '../../../../messages/en.json'

const BUILT_IN: Record<string, Record<string, Json>> = { it: it as never, en: en as never }

function target(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const locale = searchParams.get('locale')
  const namespace = searchParams.get('namespace')
  if (!isLocale(locale) || !namespace || !TEXT_GROUP_KEYS.includes(namespace)) return null
  return { locale, namespace }
}

/** GET /api/site-texts?locale=it&namespace=about (admin): built-in text, saved edit and what the site shows now. */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const t = target(request)
    if (!t) return apiError(`Unknown text group or language (languages: ${LOCALES.join(', ')})`, 400)

    const { data, error } = await getSupabaseAdmin().from('site_texts').select('data').eq('locale', t.locale).eq('namespace', t.namespace).maybeSingle()
    if (error) return apiError(error.message, 500)
    const builtIn = BUILT_IN[t.locale][t.namespace]
    return apiSuccess({ builtIn, saved: data?.data ?? null, current: data?.data ?? builtIn })
  } catch {
    return apiError('Server error', 500)
  }
}

/** PUT /api/site-texts?locale=&namespace= with { data } (admin): save an edited text group. */
export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const t = target(request)
    if (!t) return apiError('Unknown text group or language', 400)

    const body = await request.json()
    const fitted = conformToDefault(body?.data, BUILT_IN[t.locale][t.namespace])
    if (fitted === null) return apiError('The text does not match the structure of this page', 400)

    const { error } = await getSupabaseAdmin().from('site_texts').upsert({ locale: t.locale, namespace: t.namespace, data: fitted, updated_at: new Date().toISOString() })
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess({ saved: true })
  } catch {
    return apiError('Server error', 500)
  }
}

/** DELETE /api/site-texts?locale=&namespace= (admin): go back to the built-in text. */
export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const t = target(request)
    if (!t) return apiError('Unknown text group or language', 400)
    const { error } = await getSupabaseAdmin().from('site_texts').delete().eq('locale', t.locale).eq('namespace', t.namespace)
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess({ reset: true })
  } catch {
    return apiError('Server error', 500)
  }
}
