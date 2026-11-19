import { createSupabasePublic } from '@/lib/supabase/public'
import { mapPhoto, type Photo, type PhotoCategory } from '@/lib/photos'

/** Photos marked "show in gallery", newest first. Never throws: an unreachable database means an empty list. */
export async function getGalleryPhotos({ category, limit = 48, offset = 0 }: { category?: PhotoCategory; limit?: number; offset?: number } = {}): Promise<{ items: Photo[]; total: number }> {
  try {
    let query = createSupabasePublic().from('content_photos').select('*', { count: 'exact' }).eq('in_gallery', true)
    if (category) query = query.eq('category', category)
    const { data, count, error } = await query.order('sort_order', { ascending: true }).order('uploaded_at', { ascending: false }).range(offset, offset + limit - 1)
    if (error) throw error
    const items = (data ?? []).map(mapPhoto)
    return { items, total: count ?? items.length }
  } catch {
    return { items: [], total: 0 }
  }
}

/** Photos for the home page strip: the featured ones first, then the newest. */
export async function getHomePhotos(n = 7): Promise<Photo[]> {
  try {
    const { data, error } = await createSupabasePublic()
      .from('content_photos')
      .select('*')
      .eq('in_gallery', true)
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('uploaded_at', { ascending: false })
      .limit(n)
    if (error) throw error
    return (data ?? []).map(mapPhoto)
  } catch {
    return []
  }
}

/** How many gallery photos each category has (for the filter chips). */
export async function getGalleryCounts(): Promise<Record<string, number>> {
  try {
    const { data, error } = await createSupabasePublic().from('content_photos').select('category').eq('in_gallery', true).limit(5000)
    if (error) throw error
    const counts: Record<string, number> = {}
    for (const r of data ?? []) counts[r.category ?? 'other'] = (counts[r.category ?? 'other'] ?? 0) + 1
    return counts
  } catch {
    return {}
  }
}
