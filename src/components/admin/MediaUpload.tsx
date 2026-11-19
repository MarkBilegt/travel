'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

interface UploadedFile {
  id: string
  name: string
  preview: string
  url?: string
  status: 'uploading' | 'done' | 'error'
}

interface MediaUploadProps {
  maxFiles?: number
  accept?: string
  label?: string
  folder?: string
  onUpload?: (urls: string[]) => void
  initialUrls?: string[]
}

export function MediaUpload({
  maxFiles = 10,
  accept = 'image/*',
  label = 'Зураг оруулах',
  folder = 'tours',
  onUpload,
  initialUrls = [],
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(() =>
    initialUrls.map((url, i) => ({
      id: `init-${i}`,
      name: url.split('/').pop() ?? 'image',
      preview: url,
      url,
      status: 'done' as const,
    }))
  )
  const [dragging, setDragging] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File): Promise<string | null> {
    if (!ALLOWED_MIME_TYPES.has(file.type)) return null
    if (file.size > MAX_UPLOAD_BYTES) return null

    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const json = await res.json()
    return json.data?.url ?? null
  }

  function processFiles(raw: FileList | null) {
    if (!raw) return
    const selected = Array.from(raw)
    const invalidCount = selected.filter((file) => !ALLOWED_MIME_TYPES.has(file.type) || file.size > MAX_UPLOAD_BYTES).length
    setUploadError(invalidCount > 0 ? 'PNG, JPG, WebP, AVIF төрлийн 10MB-аас бага файл сонгоно уу.' : '')

    const toAdd = selected
      .filter((file) => ALLOWED_MIME_TYPES.has(file.type) && file.size <= MAX_UPLOAD_BYTES)
      .slice(0, maxFiles - files.length)
    toAdd.forEach((file) => {
      const id = `${Date.now()}-${file.name}`
      const reader = new FileReader()
      reader.onload = async (e) => {
        const preview = e.target?.result as string
        setFiles((prev) => [...prev, { id, name: file.name, preview, status: 'uploading' }])
        const url = await uploadFile(file)
        setFiles((prev) => {
          const next = prev.map((f) =>
            f.id === id ? { ...f, url: url ?? undefined, status: url ? 'done' : 'error' } as UploadedFile : f
          )
          const urls = next.filter((f) => f.status === 'done' && f.url).map((f) => f.url!)
          onUpload?.(urls)
          return next
        })
      }
      reader.readAsDataURL(file)
    })
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id)
      const urls = next.filter((f) => f.status === 'done' && f.url).map((f) => f.url!)
      onUpload?.(urls)
      return next
    })
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          dragging ? 'border-admin-accent bg-admin-accent/5' : 'border-admin-border hover:border-gray-500',
          files.length >= maxFiles && 'opacity-50 pointer-events-none',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-300 text-sm font-semibold">{label}</p>
        <p className="text-gray-500 text-xs mt-1">Чирч оруулах эсвэл дарж сонгох</p>
        <p className="text-gray-600 text-xs mt-1">PNG, JPG, WebP, AVIF · max 10MB · {files.length}/{maxFiles}</p>
      </div>

      {uploadError && (
        <p className="text-red-400 text-xs mt-2">{uploadError}</p>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-4">
          {files.map((file) => (
            <div key={file.id} className="relative group aspect-square rounded-xl overflow-hidden bg-admin-bg border border-admin-border">
              {file.preview.startsWith('data:image') || file.preview.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}

              {/* Status overlay */}
              {file.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              {file.status === 'error' && (
                <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              )}
              {file.status === 'done' && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400 drop-shadow" />
                </div>
              )}

              {/* Remove button on hover */}
              {file.status !== 'uploading' && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id) }}
                    className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
