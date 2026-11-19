'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { DEPARTURE_STATUSES } from '@/lib/tour-options'
import { shownStatus, spotsLeft } from '@/lib/departures'
import type { Departure, Tour } from '@/types'
import { messageMn } from '@/lib/admin-fetch'

const inputCls = 'w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-admin-accent transition-colors placeholder:text-gray-600'
const labelCls = 'text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1.5'

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-blue-500/15 text-blue-300',
  confirmed: 'bg-green-500/15 text-green-400',
  full: 'bg-amber-500/15 text-amber-400',
  cancelled: 'bg-red-500/15 text-red-400',
}
const statusLabel = (k: string) => DEPARTURE_STATUSES.find((s) => s.key === k)?.label ?? k

interface FormState {
  tourId: string
  startDate: string
  endDate: string
  price: string
  minParticipants: string
  maxParticipants: string
  enrolled: string
  status: string
  notes: string
}

const emptyForm = (tourId = ''): FormState => ({
  tourId, startDate: '', endDate: '', price: '', minParticipants: '4', maxParticipants: '12', enrolled: '0', status: 'open', notes: '',
})

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const json = await res.json()
  if (!res.ok) throw new Error(messageMn(json.error ?? 'Алдаа гарлаа'))
  return json
}

export default function DeparturesPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: tours = [] } = useQuery({
    queryKey: ['admin-tours-for-departures'],
    queryFn: async () => (await call('/api/tours?limit=100&status=all', 'GET')).data as Tour[],
  })
  const { data: departures = [], isLoading } = useQuery({
    queryKey: ['admin-departures'],
    queryFn: async () => (await call('/api/departures?all=1', 'GET')).data as Departure[],
  })

  const tourById = new Map(tours.map((t) => [t.id, t]))

  function openAdd() {
    setEditId(null)
    setError(null)
    setForm(emptyForm(tours[0]?.id ?? ''))
  }

  function openEdit(d: Departure) {
    setEditId(d.id)
    setError(null)
    setForm({
      tourId: d.tourId, startDate: d.startDate, endDate: d.endDate, price: d.price != null ? String(d.price) : '',
      minParticipants: String(d.minParticipants), maxParticipants: String(d.maxParticipants), enrolled: String(d.enrolled),
      status: d.status, notes: d.notes ?? '',
    })
  }

  async function save() {
    if (!form) return
    setSaving(true)
    setError(null)
    try {
      const body = {
        tourId: form.tourId,
        startDate: form.startDate,
        endDate: form.endDate,
        price: form.price === '' ? null : Number(form.price),
        minParticipants: Number(form.minParticipants),
        maxParticipants: Number(form.maxParticipants),
        enrolled: Number(form.enrolled),
        status: form.status,
        notes: form.notes,
      }
      await call(editId ? `/api/departures/${editId}` : '/api/departures', editId ? 'PUT' : 'POST', body)
      await queryClient.invalidateQueries({ queryKey: ['admin-departures'] })
      setForm(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  async function remove(d: Departure) {
    if (!window.confirm('Энэ аяллыг устгах уу?')) return
    try {
      await call(`/api/departures/${d.id}`, 'DELETE')
      await queryClient.invalidateQueries({ queryKey: ['admin-departures'] })
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Алдаа гарлаа')
    }
  }

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => (f ? { ...f, [k]: e.target.value } : f))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">Бүлгийн аяллын огноонууд. Бүртгүүлсэн тоо хүрэхэд аялал автоматаар «Баталгаажсан» болно.</p>
        <button onClick={openAdd} disabled={tours.length === 0} className="flex items-center gap-2 bg-admin-accent hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors">
          <Plus className="w-4 h-4" />Гарах нэмэх
        </button>
      </div>

      <div className="bg-admin-card border border-admin-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-admin-border">
              <th className="px-4 py-3">Аялал</th>
              <th className="px-4 py-3">Огноо</th>
              <th className="px-4 py-3">Бүртгэл</th>
              <th className="px-4 py-3">Үнэ</th>
              <th className="px-4 py-3">Төлөв</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">...</td></tr>}
            {!isLoading && departures.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Гарах бүртгэгдээгүй байна</td></tr>}
            {departures.map((d) => {
              const tour = tourById.get(d.tourId)
              const shown = shownStatus(d)
              return (
                <tr key={d.id} className="border-b border-admin-border/60 last:border-0">
                  <td className="px-4 py-3 text-white">{tour?.title ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{d.startDate} → {d.endDate}</td>
                  <td className="px-4 py-3 text-gray-300">{d.enrolled}/{d.maxParticipants} <span className="text-gray-500 text-xs">(min {d.minParticipants}, left {spotsLeft(d)})</span></td>
                  <td className="px-4 py-3 text-gray-300">{formatPrice(d.price ?? tour?.price ?? 0, tour?.currency ?? 'EUR', 'en')}</td>
                  <td className="px-4 py-3"><span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', STATUS_STYLE[shown])}>{statusLabel(shown)}</span></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(d)} className="text-gray-400 hover:text-white p-1.5" aria-label="Засах"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(d)} className="text-gray-400 hover:text-red-400 p-1.5" aria-label="Устгах"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-admin-card border border-admin-border rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">{editId ? 'Гарах засах' : 'Гарах нэмэх'}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-white" aria-label="Хаах"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className={labelCls}>Аялал</label>
              <select value={form.tourId} onChange={set('tourId')} className={cn(inputCls, 'appearance-none')}>
                {tours.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Эхлэх</label><input type="date" value={form.startDate} onChange={set('startDate')} className={inputCls} /></div>
              <div><label className={labelCls}>Дуусах</label><input type="date" value={form.endDate} onChange={set('endDate')} className={inputCls} /></div>
              <div><label className={labelCls}>Мин хүн</label><input type="number" min={1} value={form.minParticipants} onChange={set('minParticipants')} className={inputCls} /></div>
              <div><label className={labelCls}>Макс хүн</label><input type="number" min={1} value={form.maxParticipants} onChange={set('maxParticipants')} className={inputCls} /></div>
              <div><label className={labelCls}>Бүртгүүлсэн</label><input type="number" min={0} value={form.enrolled} onChange={set('enrolled')} className={inputCls} /></div>
              <div><label className={labelCls}>Үнэ (хоосон = аяллын үнэ)</label><input type="number" min={0} value={form.price} onChange={set('price')} className={inputCls} /></div>
            </div>
            <div>
              <label className={labelCls}>Төлөв</label>
              <select value={form.status} onChange={set('status')} className={cn(inputCls, 'appearance-none')}>
                {DEPARTURE_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Тэмдэглэл</label>
              <textarea value={form.notes} onChange={set('notes')} rows={2} className={cn(inputCls, 'resize-none')} />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setForm(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Цуцлах</button>
              <button onClick={save} disabled={saving} className="bg-admin-accent hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl px-5 py-2.5">
                {saving ? '...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
