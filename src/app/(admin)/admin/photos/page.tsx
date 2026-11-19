'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, ImagePlus, Star, Trash2, UploadCloud, X } from 'lucide-react'
import { adminCall } from '@/lib/admin-fetch'
import { PHOTO_CATEGORIES, type Photo, type PhotoCategory } from '@/lib/photos'
import { cn } from '@/lib/utils'

const inputCls = 'w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-gray-200 focus:border-admin-accent focus:outline-none'
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500'
const catLabel = (k: string) => PHOTO_CATEGORIES.find((c) => c.key === k)?.labelMn ?? k
const PAGE = 80

export default function PhotosPage() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadCategory, setUploadCategory] = useState<PhotoCategory>('other')
  const [progress, setProgress] = useState<{ done: number; total: number; failed: string[] } | null>(null)
  const [filter, setFilter] = useState<'all' | PhotoCategory>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<Photo | null>(null)
  const [limit, setLimit] = useState(PAGE)
  const [busy, setBusy] = useState(false)

  const { data: photos = [], isLoading, error, refetch } = useQuery({ queryKey: ['photos'], queryFn: () => adminCall<Photo[]>('/api/photos') })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['photos'] })

  const visible = filter === 'all' ? photos : photos.filter((p) => p.category === filter)
  const counts = (k: string) => photos.filter((p) => p.category === k).length

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return
    const list = Array.from(files)
    setProgress({ done: 0, total: list.length, failed: [] })
    const failed: string[] = []
    for (let i = 0; i < list.length; i++) {
      const fd = new FormData()
      fd.append('file', list[i])
      fd.append('category', uploadCategory)
      try {
        const res = await fetch('/api/photos', { method: 'POST', body: fd })
        if (res.status === 401) {
          window.location.href = '/admin/login'
          return
        }
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? String(res.status))
      } catch (e) {
        failed.push(`${list[i].name}: ${e instanceof Error ? e.message : 'алдаа'}`)
      }
      setProgress({ done: i + 1, total: list.length, failed: [...failed] })
    }
    await refresh()
    if (fileRef.current) fileRef.current.value = ''
    if (failed.length === 0) toast.success(`${list.length} зураг орууллаа`)
    else toast.error(`${failed.length} зураг оруулж чадсангүй`)
  }

  const toggle = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  async function bulk(action: 'delete' | 'show' | 'hide' | { category: PhotoCategory }) {
    const ids = [...selected]
    if (ids.length === 0) return
    if (action === 'delete' && !window.confirm(`${ids.length} зургийг бүр мөсөн устгах уу? Үүнийг буцаах боломжгүй.`)) return
    setBusy(true)
    let failed = 0
    for (const id of ids) {
      try {
        if (action === 'delete') await adminCall(`/api/photos/${id}`, 'DELETE')
        else if (action === 'show') await adminCall(`/api/photos/${id}`, 'PUT', { inGallery: true })
        else if (action === 'hide') await adminCall(`/api/photos/${id}`, 'PUT', { inGallery: false })
        else await adminCall(`/api/photos/${id}`, 'PUT', { category: action.category })
      } catch {
        failed++
      }
    }
    setSelected(new Set())
    await refresh()
    setBusy(false)
    if (failed) toast.error(`${failed} зураг дээр алдаа гарлаа`)
    else toast.success('Хийгдлээ')
  }

  async function saveEdit() {
    if (!editing) return
    try {
      await adminCall(`/api/photos/${editing.id}`, 'PUT', {
        altText: editing.altText,
        caption: editing.caption,
        category: editing.category,
        inGallery: editing.inGallery,
        featured: editing.featured,
      })
      setEditing(null)
      await refresh()
      toast.success('Хадгалагдлаа')
    } catch (e) {
      toast.error(`Хадгалж чадсангүй${e instanceof Error ? ` (${e.message})` : ''}`)
    }
  }

  async function removeOne(p: Photo) {
    if (!window.confirm('Энэ зургийг бүр мөсөн устгах уу?')) return
    try {
      await adminCall(`/api/photos/${p.id}`, 'DELETE')
      setEditing(null)
      await refresh()
      toast.success('Устгагдлаа')
    } catch {
      toast.error('Устгахад алдаа гарлаа')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Зургийн сан</h1>
        <p className="mt-0.5 max-w-2xl text-xs text-gray-500">Энд оруулсан зургууд нүүр хуудасны галерей болон «Фото» хуудсанд гарна. Том зургийг автоматаар вэбэд тохирох хэмжээнд хүртэл багасгана.</p>
      </div>

      <section className="rounded-xl border border-admin-border bg-admin-card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-56">
            <label className={labelCls}>Ангилал</label>
            <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value as PhotoCategory)} className={inputCls}>
              {PHOTO_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.labelMn}
                </option>
              ))}
            </select>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={progress !== null && progress.done < progress.total} className="inline-flex items-center gap-2 rounded-xl bg-admin-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
            <UploadCloud className="h-4 w-4" /> Зураг оруулах (олныг сонгож болно)
          </button>
          {progress && (
            <p className="text-xs text-gray-400">
              {progress.done}/{progress.total} орууллаа{progress.failed.length > 0 && ` · ${progress.failed.length} алдаатай`}
            </p>
          )}
        </div>
        {progress && progress.failed.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-red-300">
            {progress.failed.slice(0, 5).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setFilter('all'); setLimit(PAGE) }} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold', filter === 'all' ? 'border-admin-accent bg-admin-accent text-white' : 'border-admin-border text-gray-400 hover:text-white')}>
          Бүгд ({photos.length})
        </button>
        {PHOTO_CATEGORIES.filter((c) => counts(c.key) > 0).map((c) => (
          <button key={c.key} onClick={() => { setFilter(c.key); setLimit(PAGE) }} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold', filter === c.key ? 'border-admin-accent bg-admin-accent text-white' : 'border-admin-border text-gray-400 hover:text-white')}>
            {c.labelMn} ({counts(c.key)})
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-admin-accent/40 bg-admin-card p-3 text-xs">
          <span className="font-semibold text-white">{selected.size} сонгосон</span>
          <select defaultValue="" onChange={(e) => { if (e.target.value) bulk({ category: e.target.value as PhotoCategory }); e.target.value = '' }} className="rounded-lg border border-admin-border bg-admin-bg px-2 py-1.5 text-gray-200">
            <option value="">Ангилал солих...</option>
            {PHOTO_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.labelMn}
              </option>
            ))}
          </select>
          <button disabled={busy} onClick={() => bulk('show')} className="rounded-lg border border-admin-border px-3 py-1.5 text-gray-300 hover:text-white">Галерейд харуулах</button>
          <button disabled={busy} onClick={() => bulk('hide')} className="rounded-lg border border-admin-border px-3 py-1.5 text-gray-300 hover:text-white">Галерейгаас нуух</button>
          <button disabled={busy} onClick={() => bulk('delete')} className="rounded-lg border border-red-500/40 px-3 py-1.5 text-red-300 hover:bg-red-500/10">Устгах</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-gray-400 hover:text-white">Болих</button>
        </div>
      )}

      {isLoading && <div className="h-48 animate-pulse rounded-xl border border-admin-border bg-admin-card" />}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
          Зургуудыг ачаалж чадсангүй.{' '}
          <button onClick={() => refetch()} className="font-semibold underline">Дахин оролдох</button>
        </div>
      )}
      {!isLoading && !error && photos.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-500">
          <ImagePlus className="mx-auto mb-3 h-10 w-10 opacity-30" />
          Одоогоор зураг алга. Дээрх товчоор зураг оруулна уу.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {visible.slice(0, limit).map((p) => (
          <div key={p.id} className={cn('group relative aspect-square overflow-hidden rounded-xl border bg-admin-card', selected.has(p.id) ? 'border-admin-accent' : 'border-admin-border')}>
            <button type="button" onClick={() => setEditing(p)} className="absolute inset-0" aria-label="Засах">
              <Image src={p.url} alt={p.altText} fill sizes="200px" className="object-cover" />
            </button>
            <button type="button" onClick={() => toggle(p.id)} aria-label="Сонгох" className={cn('absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border', selected.has(p.id) ? 'border-admin-accent bg-admin-accent text-white' : 'border-white/40 bg-black/40 text-transparent group-hover:text-white/60')}>
              <Check className="h-4 w-4" />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] font-semibold text-white">
              {p.featured && <Star className="h-3 w-3 fill-amber-300 text-amber-300" />}
              <span className="truncate">{catLabel(p.category)}</span>
              {!p.inGallery && <span className="ml-auto rounded bg-black/60 px-1">нуугдсан</span>}
            </div>
          </div>
        ))}
      </div>
      {visible.length > limit && (
        <div className="text-center">
          <button onClick={() => setLimit((n) => n + PAGE)} className="rounded-xl border border-admin-border px-5 py-2 text-sm font-semibold text-gray-300 hover:text-white">
            Нэмж харуулах ({visible.length - limit})
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="grid max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-admin-border bg-admin-card md:grid-cols-2">
            <div className="relative min-h-64 bg-admin-bg">
              <Image src={editing.url} alt={editing.altText} fill sizes="400px" className="object-contain" />
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white">Зураг засах</h2>
                <button onClick={() => setEditing(null)} aria-label="Хаах" className="text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div>
                <label className={labelCls}>Тайлбар (зураг дээр харагдана)</label>
                <input value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Зургийн тодорхойлолт (хайлт, уншигчид)</label>
                <input value={editing.altText} onChange={(e) => setEditing({ ...editing, altText: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ангилал</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as PhotoCategory })} className={inputCls}>
                  {PHOTO_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.labelMn}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input type="checkbox" checked={editing.inGallery} onChange={(e) => setEditing({ ...editing, inGallery: e.target.checked })} className="h-4 w-4" />
                «Фото» хуудсанд харуулах
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="h-4 w-4" />
                Нүүр хуудсанд онцлох
              </label>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => removeOne(editing)} className="inline-flex items-center gap-1.5 text-sm text-red-300 hover:text-red-200">
                  <Trash2 className="h-4 w-4" /> Устгах
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className="rounded-xl border border-admin-border px-4 py-2 text-sm text-gray-300 hover:text-white">Цуцлах</button>
                  <button onClick={saveEdit} className="rounded-xl bg-admin-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Хадгалах</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
