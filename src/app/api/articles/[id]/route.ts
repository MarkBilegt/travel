import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { mapArticle, parseArticleInput } from '@/lib/articles'
import { revalidateSite } from '@/lib/revalidate'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Params {
  params: Promise<{ id: string }>
}

/** GET /api/articles/[id] (admin): one article with its full text, for the edit form. */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)
    const { data, error } = await getSupabaseAdmin().from('articles').select('*').eq('id', id).maybeSingle()
    if (error) return apiError(error.message, 500)
    if (!data) return apiError('Not found', 404)
    return apiSuccess(mapArticle(data))
  } catch {
    return apiError('Server error', 500)
  }
}

/** PUT /api/articles/[id] (admin): save changes (only the fields sent are changed). */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)
    const parsed = parseArticleInput(await request.json(), true)
    if (!parsed.ok) return apiError(parsed.error, 400)
    if (Object.keys(parsed.row).length === 0) return apiError('Nothing to update', 400)

    const { data, error } = await getSupabaseAdmin().from('articles').update(parsed.row).eq('id', id).select().single()
    if (error) return apiError(error.code === '23505' ? 'Another article already uses this address (slug)' : error.message, error.code === '23505' ? 409 : 500)
    revalidateSite()
    return apiSuccess(mapArticle(data))
  } catch {
    return apiError('Server error', 500)
  }
}

/** DELETE /api/articles/[id] (admin). */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { id } = await params
    if (!UUID_RE.test(id)) return apiError('Invalid id', 400)
    const { error } = await getSupabaseAdmin().from('articles').delete().eq('id', id)
    if (error) return apiError(error.message, 500)
    revalidateSite()
    return apiSuccess({ id })
  } catch {
    return apiError('Server error', 500)
  }
}
