'use client'

import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Bold, Eye, EyeOff, Heading2, ImagePlus, Italic, Link2, List, Newspaper, Pencil, Plus, Save, Trash2, Video } from 'lucide-react'
import { adminCall, saveFailed } from '@/lib/admin-fetch'
import { ARTICLE_CATEGORIES, categoryRoute, slugify, type Article, type ArticleCategory } from '@/lib/articles'
import { ArticleBody } from '@/components/content/ArticleBody'
import { cn } from '@/lib/utils'

const inputCls = 'w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-gray-200 focus:border-admin-accent focus:outline-none'
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500'
const catLabel = (k: string) => ARTICLE_CATEGORIES.find((c) => c.key === k)?.labelMn ?? k
const day = (iso: string) => new Date(iso).toLocaleDateString('mn-MN')

export default function ArticlesPage() {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState<'all' | ArticleCategory>('all')
  const [q, setQ] = useState('')
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)

  const { data: articles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['articles', category, q],
    queryFn: () => adminCall<Article[]>(`/api/articles?${new URLSearchParams({ ...(category !== 'all' ? { category } : {}), ...(q ? { q } : {}) })}`),
  })

  if (editingId) {
    return (
      <ArticleEditor
        key={editingId}
        id={editingId}
        onClose={() => {
          setEditingId(null)
          queryClient.invalidateQueries({ queryKey: ['articles'] })
        }}
      />
    )
  }

  async function togglePublished(a: Article) {
    try {
      await adminCall(`/api/articles/${a.id}`, 'PUT', { published: !a.published })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    } catch (e) {
      toast.error(saveFailed(e))
    }
  }
  async function remove(a: Article) {
    if (!window.confirm(`«${a.title}» нийтлэлийг устгах уу? Үүнийг буцаах боломжгүй.`)) return
    try {
      await adminCall(`/api/articles/${a.id}`, 'DELETE')
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success('Устгагдлаа')
    } catch {
      toast.error('Устгахад алдаа гарлаа')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Нийтлэл, блог</h1>
          <p className="mt-0.5 max-w-2xl text-xs text-gray-500">Блог, соёл түүхийн нийтлэл, аяллын мэдээлэл, өмнөх аяллын хөтөлбөрүүд. Өөрчлөлт хадгалмагц вэбсайтад шууд харагдана.</p>
        </div>
        <button onClick={() => setEditingId('new')} className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-admin-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          <Plus className="h-4 w-4" /> Шинэ нийтлэл
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([{ key: 'all', labelMn: 'Бүгд' }, ...ARTICLE_CATEGORIES] as { key: string; labelMn: string }[]).map((c) => (
          <button key={c.key} onClick={() => setCategory(c.key as 'all' | ArticleCategory)} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold', category === c.key ? 'border-admin-accent bg-admin-accent text-white' : 'border-admin-border text-gray-400 hover:text-white')}>
            {c.labelMn}
          </button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Гарчигаар хайх..." className={cn(inputCls, 'ml-auto w-56')} />
      </div>

      {isLoading && <div className="h-40 animate-pulse rounded-xl border border-admin-border bg-admin-card" />}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
          Нийтлэлүүдийг ачаалж чадсангүй (migration 020 хийсэн үү?).{' '}
          <button onClick={() => refetch()} className="font-semibold underline">Дахин оролдох</button>
        </div>
      )}
      {!isLoading && !error && articles.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-500">
          <Newspaper className="mx-auto mb-3 h-10 w-10 opacity-30" />
          Нийтлэл олдсонгүй
        </div>
      )}

      <ul className="divide-y divide-admin-border overflow-hidden rounded-xl border border-admin-border bg-admin-card">
        {articles.map((a) => (
          <li key={a.id} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{a.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {catLabel(a.category)} · {day(a.publishedAt)}
                {Object.keys(a.translations).length > 0 && ' · EN'}
              </p>
            </div>
            <button onClick={() => togglePublished(a)} className={cn('flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold', a.published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-500/15 text-gray-400')}>
              {a.published ? 'Нийтлэгдсэн' : 'Ноорог'}
            </button>
            {a.published && (
              <a href={`/it${categoryRoute(a.category)}/${a.slug}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-gray-500 hover:text-white" aria-label="Вэбсайт дээр харах">
                <Eye className="h-4 w-4" />
              </a>
            )}
            <button onClick={() => setEditingId(a.id)} className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white" aria-label="Засах">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => remove(a)} className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-red-400" aria-label="Устгах">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Editor ──────────────────────────────────────────────────────────────────

interface Draft {
  title: string
  slug: string
  category: ArticleCategory
  publishedAt: string
  published: boolean
  summary: string
  body: string
  coverImage: string
  sortOrder: number
  en: { title: string; summary: string; body: string }
}

const EMPTY: Draft = { title: '', slug: '', category: 'news', publishedAt: new Date().toISOString().slice(0, 10), published: true, summary: '', body: '', coverImage: '', sortOrder: 0, en: { title: '', summary: '', body: '' } }

function toDraft(a: Article): Draft {
  return {
    title: a.title,
    slug: a.slug,
    category: a.category,
    publishedAt: a.publishedAt.slice(0, 10),
    published: a.published,
    summary: a.summary,
    body: a.body,
    coverImage: a.coverImage ?? '',
    sortOrder: a.sortOrder,
    en: { title: a.translations.en?.title ?? '', summary: a.translations.en?.summary ?? '', body: a.translations.en?.body ?? '' },
  }
}

async function uploadPicture(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', 'articles')
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? String(res.status))
  return json.data.url as string
}

function ArticleEditor({ id, onClose }: { id: string | 'new'; onClose: () => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => (id === 'new' ? Promise.resolve(null) : adminCall<Article>(`/api/articles/${id}`)),
  })
  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-admin-border bg-admin-card" />
  if (error) return <p className="text-sm text-red-300">Нийтлэлийг ачаалж чадсангүй.</p>
  return <EditorForm id={id} initial={data ? toDraft(data) : EMPTY} onClose={onClose} />
}

function EditorForm({ id, initial, onClose }: { id: string | 'new'; initial: Draft; onClose: () => void }) {
  const [d, setD] = useState<Draft>(initial)
  const [lang, setLang] = useState<'it' | 'en'>('it')
  const [slugTouched, setSlugTouched] = useState(id !== 'new')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const bodyKey = lang === 'it' ? 'body' : 'en'
  const body = lang === 'it' ? d.body : d.en.body
  const setBody = (v: string) => setD((x) => (lang === 'it' ? { ...x, body: v } : { ...x, en: { ...x.en, body: v } }))

  function wrapSelection(before: string, after = before, placeholder = '') {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const selected = body.slice(s, e) || placeholder
    setBody(`${body.slice(0, s)}${before}${selected}${after}${body.slice(e)}`)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + before.length, s + before.length + selected.length)
    })
  }
  function insertBlock(text: string) {
    const el = bodyRef.current
    const pos = el ? el.selectionStart : body.length
    const prefix = pos > 0 && !body.slice(0, pos).endsWith('\n\n') ? (body.slice(0, pos).endsWith('\n') ? '\n' : '\n\n') : ''
    setBody(`${body.slice(0, pos)}${prefix}${text}\n\n${body.slice(pos)}`)
  }

  async function addImage(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const f of Array.from(files)) insertBlock(`![](${await uploadPicture(f)})`)
      toast.success('Зураг орууллаа')
    } catch (e) {
      toast.error(`Зураг оруулж чадсангүй${e instanceof Error ? ` (${e.message})` : ''}`)
    } finally {
      setUploading(false)
      if (imageRef.current) imageRef.current.value = ''
    }
  }
  async function setCover(files: FileList | null) {
    if (!files?.[0]) return
    setUploading(true)
    try {
      setD((x) => ({ ...x, coverImage: '' }))
      const url = await uploadPicture(files[0])
      setD((x) => ({ ...x, coverImage: url }))
    } catch (e) {
      toast.error(`Зураг оруулж чадсангүй${e instanceof Error ? ` (${e.message})` : ''}`)
    } finally {
      setUploading(false)
      if (coverRef.current) coverRef.current.value = ''
    }
  }

  async function save() {
    if (!d.title.trim()) return toast.error('Гарчиг оруулна уу')
    setSaving(true)
    try {
      const payload = {
        title: d.title,
        slug: d.slug || slugify(d.title),
        category: d.category,
        publishedAt: d.publishedAt || undefined,
        published: d.published,
        summary: d.summary,
        body: d.body,
        coverImage: d.coverImage,
        sortOrder: d.sortOrder,
        translations: { en: d.en },
      }
      if (id === 'new') await adminCall('/api/articles', 'POST', payload)
      else await adminCall(`/api/articles/${id}`, 'PUT', payload)
      toast.success('Хадгалагдлаа. Вэбсайтад шууд шинэчлэгдэнэ.')
      onClose()
    } catch (e) {
      toast.error(saveFailed(e))
    } finally {
      setSaving(false)
    }
  }

  const tool = 'inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Жагсаалт руу
        </button>
        <h1 className="flex-1 text-lg font-bold text-white">{id === 'new' ? 'Шинэ нийтлэл' : 'Нийтлэл засах'}</h1>
        <button onClick={save} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-admin-accent px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>

      <div className="grid gap-4 rounded-xl border border-admin-border bg-admin-card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Гарчиг (Итали хэлээр) *</label>
          <input
            value={d.title}
            onChange={(e) => setD((x) => ({ ...x, title: e.target.value, slug: slugTouched ? x.slug : slugify(e.target.value) }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Вэб хаяг (slug)</label>
          <input value={d.slug} onChange={(e) => { setSlugTouched(true); setD((x) => ({ ...x, slug: e.target.value })) }} className={inputCls} />
          <p className="mt-1 text-xs text-gray-600">Зөвхөн латин үсэг, тоо, зураас. Автоматаар бөглөгдөнө.</p>
        </div>
        <div>
          <label className={labelCls}>Ангилал</label>
          <select value={d.category} onChange={(e) => setD((x) => ({ ...x, category: e.target.value as ArticleCategory }))} className={inputCls}>
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.labelMn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Нийтлэх огноо</label>
          <input type="date" value={d.publishedAt} onChange={(e) => setD((x) => ({ ...x, publishedAt: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Дараалал (соёл, мэдээлэл дээр; жижиг нь эхэнд)</label>
          <input type="number" value={d.sortOrder} onChange={(e) => setD((x) => ({ ...x, sortOrder: Number(e.target.value) }))} className={inputCls} />
        </div>
        <label className="flex items-center gap-3 text-sm text-gray-300 sm:col-span-2">
          <input type="checkbox" checked={d.published} onChange={(e) => setD((x) => ({ ...x, published: e.target.checked }))} className="h-4 w-4" />
          Вэбсайтад нийтлэх (сонгоогүй бол ноорог хэвээр үлдэнэ)
        </label>
        <div className="sm:col-span-2">
          <label className={labelCls}>Нүүр зураг</label>
          <div className="flex items-center gap-3">
            {d.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.coverImage} alt="" className="h-16 w-24 rounded-lg object-cover" />
            )}
            <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => setCover(e.target.files)} />
            <button type="button" onClick={() => coverRef.current?.click()} className="rounded-lg border border-admin-border px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white">
              {d.coverImage ? 'Зураг солих' : 'Зураг оруулах'}
            </button>
            {d.coverImage && (
              <button type="button" onClick={() => setD((x) => ({ ...x, coverImage: '' }))} className="text-xs text-gray-500 hover:text-red-300">
                Хасах
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-admin-border bg-admin-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex gap-1 rounded-lg border border-admin-border bg-admin-bg p-1">
            {(['it', 'en'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cn('rounded-md px-3 py-1 text-xs font-semibold', lang === l ? 'bg-admin-accent text-white' : 'text-gray-400 hover:text-white')}>
                {l === 'it' ? 'Итали (үндсэн)' : 'Англи (орчуулга)'}
              </button>
            ))}
          </div>
          {lang === 'en' && <p className="text-xs text-gray-500">Хоосон орхивол Итали хувилбар харагдана.</p>}
        </div>

        {lang === 'en' && (
          <div className="mb-4">
            <label className={labelCls}>Гарчиг (Англи)</label>
            <input value={d.en.title} onChange={(e) => setD((x) => ({ ...x, en: { ...x.en, title: e.target.value } }))} className={inputCls} />
          </div>
        )}
        <div className="mb-4">
          <label className={labelCls}>Товч тайлбар {lang === 'it' ? '(Итали)' : '(Англи)'}</label>
          <textarea
            value={lang === 'it' ? d.summary : d.en.summary}
            onChange={(e) => setD((x) => (lang === 'it' ? { ...x, summary: e.target.value } : { ...x, en: { ...x.en, summary: e.target.value } }))}
            rows={2}
            className={cn(inputCls, 'resize-none')}
          />
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-1">
          <button type="button" className={tool} title="Тод" onClick={() => wrapSelection('**', '**', 'тод бичвэр')}><Bold className="h-4 w-4" /></button>
          <button type="button" className={tool} title="Налуу" onClick={() => wrapSelection('*', '*', 'налуу бичвэр')}><Italic className="h-4 w-4" /></button>
          <button type="button" className={tool} title="Дэд гарчиг" onClick={() => wrapSelection('\n\n## ', '\n\n', 'Дэд гарчиг')}><Heading2 className="h-4 w-4" /></button>
          <button type="button" className={tool} title="Жагсаалт" onClick={() => wrapSelection('\n\n- ', '\n\n', 'жагсаалтын мөр')}><List className="h-4 w-4" /></button>
          <button type="button" className={tool} title="Холбоос" onClick={() => { const url = window.prompt('Холбоосын хаяг (https://...)'); if (url) wrapSelection('[', `](${url})`, 'холбоосын текст') }}><Link2 className="h-4 w-4" /></button>
          <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => addImage(e.target.files)} />
          <button type="button" className={tool} title="Зураг оруулах" onClick={() => imageRef.current?.click()} disabled={uploading}><ImagePlus className="h-4 w-4" /></button>
          <button type="button" className={tool} title="Видео (YouTube, Vimeo)" onClick={() => { const url = window.prompt('YouTube эсвэл Vimeo хаяг'); if (url) insertBlock(`@[video](${url})`) }}><Video className="h-4 w-4" /></button>
          <button type="button" onClick={() => setPreview((p) => !p)} className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white">
            {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {preview ? 'Засах' : 'Урьдчилан харах'}
          </button>
        </div>

        {preview ? (
          <div className="min-h-80 rounded-lg border border-admin-border bg-white p-6">
            <ArticleBody body={body || ' '} />
          </div>
        ) : (
          <textarea ref={bodyRef} key={bodyKey} value={body} onChange={(e) => setBody(e.target.value)} rows={24} className={cn(inputCls, 'resize-y font-mono leading-relaxed')} placeholder="Нийтлэлийн бичвэр. Догол мөр бүрийн хооронд хоосон мөр үлдээнэ." />
        )}
        <p className="mt-2 text-xs text-gray-600">Хоосон мөр = шинэ догол мөр · ## гарчиг · - жагсаалт · **тод** · *налуу* · [текст](хаяг) · ![тайлбар](зураг) · @[video](YouTube хаяг)</p>
        {uploading && <p className="mt-2 text-xs text-gray-400">Зураг оруулж байна...</p>}
      </div>
    </div>
  )
}
