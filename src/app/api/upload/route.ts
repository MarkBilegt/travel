import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import sharp from 'sharp'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_FOLDERS = new Set(['tours', 'tours/covers', 'tours/gallery', 'tours/itinerary', 'articles', 'partners'])
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) return apiError('Unauthorized', 401)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string | null) ?? 'tours'

    if (!file) return apiError('No file provided', 400)
    if (!ALLOWED_FOLDERS.has(folder)) return apiError('Invalid upload folder', 400)
    if (file.size > MAX_UPLOAD_BYTES) return apiError('File is too large. Maximum size is 10MB.', 400)

    const ext = MIME_TO_EXT[file.type]
    if (!ext) return apiError('Unsupported file type. Use JPG, PNG, WebP, or AVIF.', 400)

    const bytes = await file.arrayBuffer()
    let buffer: Buffer = Buffer.from(bytes)
    let contentType = file.type
    let fileExt = ext

    // Article pictures are shrunk to a web size (long edge 1800 px, JPEG) so pages stay fast
    if (folder === 'articles') {
      try {
        buffer = await sharp(buffer).rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
        contentType = 'image/jpeg'
        fileExt = 'jpg'
      } catch {
        return apiError('That file is not a readable picture', 400)
      }
    }

    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.storage
      .from('media')
      .upload(fileName, buffer, {
        contentType,
        upsert: false,
      })

    if (error) return apiError(error.message, 500)

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName)

    return apiSuccess({ url: publicUrl, path: fileName })
  } catch {
    return apiError('Upload failed', 500)
  }
}
