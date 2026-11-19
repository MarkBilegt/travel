'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/lib/testimonials'
import { messageMn } from '@/lib/admin-fetch'

interface Form {
  name: string
  country: string
  trip: string
  quote: string
  language: 'it' | 'en'
  rating: string
  consentGiven: boolean
  active: boolean
}

const EMPTY: Form = { name: '', country: '', trip: '', quote: '', language: 'it', rating: '5', consentGiven: false, active: true }
const inputCls = 'w-full rounded-xl border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-gray-200 focus:border-admin-accent focus:outline-none'
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500'

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const json = await res.json()
  if (!res.ok) throw new Error(messageMn(json.error ?? 'Алдаа гарлаа'))
  return json.data
}

export default function TestimonialsPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: items = [], isLoading, error: loadError, refetch } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: () => call('/api/testimonials', 'GET'),
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['testimonials'] })
  const open = (t?: Testimonial) => {
    setError('')
    setEditing(
      t
        ? { id: t.id, form: { name: t.name, country: t.country ?? '', trip: t.trip ?? '', quote: t.quote, language: t.language, rating: String(t.rating ?? ''), consentGiven: t.consentGiven, active: t.active } }
        : { id: null, form: EMPTY },
    )
  }
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setEditing((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e))

  async function save() {
    if (!editing) return
    setSaving(true)
    setError('')
    try {
      const { form } = editing
      const body = { ...form, rating: form.rating ? Number(form.rating) : null }
      await call(editing.id ? `/api/testimonials/${editing.id}` : '/api/testimonials', editing.id ? 'PUT' : 'POST', body)
      await refresh()
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  async function remove(t: Testimonial) {
    if (!window.confirm(`${t.name}-ийн сэтгэгдлийг устгах уу?`)) return
    try {
      await call(`/api/testimonials/${t.id}`, 'DELETE')
      await refresh()
    } catch {
      window.alert('Устгахад алдаа гарлаа')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Сэтгэгдэл</h1>
          <p className="mt-0.5 max-w-xl text-xs text-gray-500">
            Зөвхөн жинхэнэ сэтгэгдэл оруулна уу. Сэтгэгдэл идэвхтэй бөгөөд аялагч нийтлэх зөвшөөрөл өгсөн тохиолдолд л нүүр хуудсанд харагдана.
          </p>
        </div>
        <button onClick={() => open()} className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-admin-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
          <Plus className="h-4 w-4" /> Сэтгэгдэл нэмэх
        </button>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          Сэтгэгдэл ачаалж чадсангүй (migration 016 хийсэн үү?).{' '}
          <button onClick={() => refetch()} className="font-semibold underline">
            Дахин оролдох
          </button>
        </div>
      )}
      {isLoading && <div className="h-24 animate-pulse rounded-xl border border-admin-border bg-admin-card" />}
      {!isLoading && !loadError && items.length === 0 && <p className="py-16 text-center text-sm text-gray-500">Одоогоор сэтгэгдэл алга</p>}

      <ul className="space-y-3">
        {items.map((t) => (
          <li key={t.id} className="rounded-xl border border-admin-border bg-admin-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">
                  {t.name}
                  {t.country ? <span className="font-normal text-gray-500"> · {t.country}</span> : null}
                </p>
                {t.trip && <p className="text-xs text-gray-500">{t.trip}</p>}
                <p className="mt-2 text-sm leading-relaxed text-gray-300">“{t.quote}”</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 uppercase text-gray-400">{t.language}</span>
                  {t.rating && (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Star className="h-3 w-3 fill-current" /> {t.rating}
                    </span>
                  )}
                  <span className={cn('rounded-full px-2 py-0.5', t.consentGiven ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300')}>
                    {t.consentGiven ? 'Зөвшөөрөлтэй' : 'Зөвшөөрөлгүй'}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5', t.active ? 'bg-admin-accent/15 text-admin-accent' : 'bg-gray-500/15 text-gray-400')}>{t.active ? 'Нийтлэгдсэн' : 'Нуусан'}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <button onClick={() => open(t)} aria-label="Засах" className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(t)} aria-label="Устгах" className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-admin-border bg-admin-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-white">{editing.id ? 'Сэтгэгдэл засах' : 'Сэтгэгдэл нэмэх'}</h2>
              <button onClick={() => setEditing(null)} aria-label="Хаах" className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Нэр</label>
                  <input value={editing.form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Улс</label>
                  <input value={editing.form.country} onChange={(e) => set('country', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Аялал</label>
                <input value={editing.form.trip} onChange={(e) => set('trip', e.target.value)} className={inputCls} placeholder="жишээ нь: Говь, 2024 оны 8-р сар" />
              </div>
              <div>
                <label className={labelCls}>Сэтгэгдэл</label>
                <textarea rows={5} value={editing.form.quote} onChange={(e) => set('quote', e.target.value)} className={cn(inputCls, 'resize-none')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Сэтгэгдлийн хэл</label>
                  <select value={editing.form.language} onChange={(e) => set('language', e.target.value as 'it' | 'en')} className={inputCls}>
                    <option value="it">Итали</option>
                    <option value="en">Англи</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Үнэлгээ (1-5, заавал биш)</label>
                  <input type="number" min={1} max={5} value={editing.form.rating} onChange={(e) => set('rating', e.target.value)} className={inputCls} />
                </div>
              </div>
              <label className="flex items-start gap-3 text-sm text-gray-300">
                <input type="checkbox" checked={editing.form.consentGiven} onChange={(e) => set('consentGiven', e.target.checked)} className="mt-0.5 h-4 w-4" />
                Аялагч энэ сэтгэгдэл болон нэрээ нийтлэхийг зөвшөөрсөн
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input type="checkbox" checked={editing.form.active && editing.form.consentGiven} disabled={!editing.form.consentGiven} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4" />
                Вэбсайтад харуулах
              </label>
              {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="rounded-xl border border-admin-border px-4 py-2 text-sm text-gray-300 hover:text-white">
                  Цуцлах
                </button>
                <button onClick={save} disabled={saving} className="rounded-xl bg-admin-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">
                  {saving ? 'Хадгалж байна' : 'Хадгалах'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
