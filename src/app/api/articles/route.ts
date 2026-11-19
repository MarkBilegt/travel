import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { isCategory, mapArticle, parseArticleInput } from '@/lib/articles'
import { revalidateSite } from '@/lib/revalidate'

/** GET /api/articles?category=&q= (admin): every article, newest first, without the long text. */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const q = (searchParams.get('q') ?? '').trim().slice(0, 100)

    let query = getSupabaseAdmin()
      .from('articles')
      .select('id, slug, category, title, summary, translations, cover_image, published, published_at, sort_order, source_url')
      .order('published_at', { ascending: false })
      .limit(1000)
    if (isCategory(category)) query = query.eq('category', category)
    // Search in the title only; the characters PostgREST treats as syntax are removed
    if (q) query = query.ilike('title', `%${q.replace(/[%_,()*\\]/g, ' ')}%`)

    const { data, error } = await query
    if (error) return apiError(error.message, 500)
    return apiSuccess((data ?? []).map((r) => mapArticle({ ...r, body: '' })))
  } catch {
    return apiError('Server error', 500)
  }
}

/** POST /api/articles (admin): create an article. */
export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const parsed = parseArticleInput(await request.json())
    if (!parsed.ok) return apiError(parsed.error, 400)

    const { data, error } = await getSupabaseAdmin().from('articles').insert(parsed.row).select().single()
    if (error) return apiError(error.code === '23505' ? 'Another article already uses this address (slug)' : error.message, error.code === '23505' ? 409 : 500)
    revalidateSite()
    return apiSuccess(mapArticle(data))
  } catch {
    return apiError('Server error', 500)
  }
}
