/** Photo library: categories, row mapping and admin input validation. Pure module. */

export const PHOTO_CATEGORIES = [
  { key: 'central', labelMn: 'Төв Монгол' },
  { key: 'west', labelMn: 'Баруун Монгол' },
  { key: 'ulaanbaatar', labelMn: 'Улаанбаатар' },
  { key: 'gobi', labelMn: 'Говь' },
  { key: 'khangai', labelMn: 'Хангай, Орхон' },
  { key: 'khuvsgul', labelMn: 'Хөвсгөл' },
  { key: 'altai', labelMn: 'Алтай' },
  { key: 'people', labelMn: 'Хүмүүс, нүүдэлчид' },
  { key: 'festivals', labelMn: 'Баяр наадам' },
  { key: 'other', labelMn: 'Бусад' },
] as const
export type PhotoCategory = (typeof PHOTO_CATEGORIES)[number]['key']
export const isPhotoCategory = (v: unknown): v is PhotoCategory => PHOTO_CATEGORIES.some((c) => c.key === v)

export interface Photo {
  id: string
  url: string
  altText: string
  caption: string
  category: PhotoCategory
  inGallery: boolean
  featured: boolean
  sortOrder: number
  width: number | null
  height: number | null
  uploadedAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPhoto(r: Record<string, any>): Photo {
  return {
    id: r.id,
    url: r.url,
    altText: r.alt_text ?? '',
    caption: r.caption ?? '',
    category: isPhotoCategory(r.category) ? r.category : 'other',
    inGallery: r.in_gallery !== false,
    featured: Boolean(r.featured),
    sortOrder: Number(r.sort_order ?? 0),
    width: typeof r.width === 'number' ? r.width : null,
    height: typeof r.height === 'number' ? r.height : null,
    uploadedAt: r.uploaded_at ?? new Date(0).toISOString(),
  }
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export type PhotoUpdateResult = { ok: true; row: Record<string, unknown> } | { ok: false; error: string }

/** Admin edit form -> columns (only the keys sent). */
export function parsePhotoUpdate(body: unknown): PhotoUpdateResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' }
  const b = body as Record<string, unknown>
  const row: Record<string, unknown> = {}
  if ('altText' in b) row.alt_text = text(b.altText, 300) || null
  if ('caption' in b) row.caption = text(b.caption, 500) || null
  if ('category' in b) {
    if (!isPhotoCategory(b.category)) return { ok: false, error: 'category' }
    row.category = b.category
  }
  if ('inGallery' in b) row.in_gallery = b.inGallery === true
  if ('featured' in b) row.featured = b.featured === true
  if ('sortOrder' in b) {
    const n = Number(b.sortOrder)
    if (!Number.isInteger(n)) return { ok: false, error: 'sortOrder' }
    row.sort_order = n
  }
  return { ok: true, row }
}

/** Storage path of an uploaded file inside the "media" bucket: gallery/2026/11/<random>.jpg */
export function galleryPath(now = new Date(), random = Math.random().toString(36).slice(2, 10), ext = 'jpg'): string {
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `gallery/${now.getFullYear()}/${mm}/${now.getTime()}-${random}.${ext}`
}
