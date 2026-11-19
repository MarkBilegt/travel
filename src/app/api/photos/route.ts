import { NextRequest } from 'next/server'
import sharp from 'sharp'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { galleryPath, isPhotoCategory, mapPhoto } from '@/lib/photos'
import { revalidateSite } from '@/lib/revalidate'

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const BUCKET = 'media'

/** GET /api/photos (admin): the whole photo library, newest first. */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { data, error } = await getSupabaseAdmin().from('content_photos').select('*').order('uploaded_at', { ascending: false }).limit(2000)
    if (error) return apiError(error.message, 500)
    return apiSuccess((data ?? []).map(mapPhoto))
  } catch {
    return apiError('Server error', 500)
  }
}

/**
 * POST /api/photos (admin, multipart form: file, category?): shrinks the photo to a web size
 * (long edge 2200 px, JPEG), stores it and adds it to the library.
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return apiError('No file provided', 400)
    if (file.size > MAX_UPLOAD_BYTES) return apiError('File is too large (max 25MB)', 400)
    if (!ALLOWED.has(file.type)) return apiError('Use a JPG, PNG, WebP or AVIF photo', 400)
    const categoryField = form.get('category')
    const category = isPhotoCategory(categoryField) ? categoryField : 'other'

    let output: Buffer
    let width: number | null = null
    let height: number | null = null
    try {
      const result = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate() // respect the camera's orientation
        .resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer({ resolveWithObject: true })
      output = result.data
      width = result.info.width
      height = result.info.height
    } catch {
      return apiError('That file is not a readable photo', 400)
    }

    const db = getSupabaseAdmin()
    const path = galleryPath()
    const { error: uploadError } = await db.storage.from(BUCKET).upload(path, output, { contentType: 'image/jpeg', upsert: false })
    if (uploadError) return apiError(uploadError.message, 500)
    const {
      data: { publicUrl },
    } = db.storage.from(BUCKET).getPublicUrl(path)

    const { data, error } = await db
      .from('content_photos')
      .insert({ url: publicUrl, storage_path: path, category, width, height, size_bytes: output.length, in_gallery: true })
      .select()
      .single()
    if (error) {
      await db.storage.from(BUCKET).remove([path])
      return apiError(error.message, 500)
    }
    revalidateSite()
    return apiSuccess(mapPhoto(data))
  } catch {
    return apiError('Upload failed', 500)
  }
}
