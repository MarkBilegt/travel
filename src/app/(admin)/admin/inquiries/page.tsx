'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, MailOpen, Phone, Users, Users2, CalendarDays, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INQUIRY_STATUSES, type InquiryStatus } from '@/lib/inquiries'
import { ACCOMMODATIONS, ACTIVITIES } from '@/lib/tour-options'
import type { Departure } from '@/types'

interface Inquiry {
  id: string
  kind: 'quote' | 'signup'
  status: InquiryStatus
  name: string
  email: string
  phone: string | null
  country: string | null
  locale: string
  tourId: string | null
  tourTitle: string | null
  departureId: string | null
  departureStart: string | null
  departureEnd: string | null
  travelFrom: string | null
  travelTo: string | null
  flexible: boolean
  adults: number
  children: number
  budgetPerDay: number | null
  interests: string[]
  accommodationStyle: string | null
  message: string | null
  adminNotes: string | null
  isRead: boolean
  createdAt: string
}

type Patch = Partial<{ status: InquiryStatus; isRead: boolean; adminNotes: string; departureId: string | null }>

const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: 'bg-admin-accent/15 text-admin-accent',
  quoted: 'bg-amber-500/15 text-amber-300',
  confirmed: 'bg-emerald-500/15 text-emerald-300',
  lost: 'bg-gray-500/15 text-gray-400',
}
const statusLabel = (s: InquiryStatus) => INQUIRY_STATUSES.find((x) => x.key === s)?.label ?? s
const labelOf = (list: readonly { key: string; label: string }[], key: string) => list.find((x) => x.key === key)?.label ?? key
const day = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('mn-MN')

async function fetchInquiries(): Promise<Inquiry[]> {
  const res = await fetch('/api/inquiries')
  if (!res.ok) throw new Error('Ачаалах боломжгүй')
  return (await res.json()).data ?? []
}

async function fetchDepartures(): Promise<Departure[]> {
  const res = await fetch('/api/departures?all=1')
  if (!res.ok) return []
  return (await res.json()).data ?? []
}

async function deleteInquiry(id: string): Promise<void> {
  const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Устгах боломжгүй')
}

async function patchInquiry({ id, patch }: { id: string; patch: Patch }): Promise<void> {
  const res = await fetch(`/api/inquiries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Шинэчлэх боломжгүй')
}

/** Internal notes; remounted per inquiry (key) so the draft always starts from the saved text. */
function NotesEditor({ saved, busy, onSave }: { saved: string; busy: boolean; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState(saved)
  return (
    <div>
      <label htmlFor="inq-notes" className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
        Дотоод тэмдэглэл
      </label>
      <textarea
        id="inq-notes"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full resize-none rounded-xl border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-gray-200"
      />
      <button
        disabled={busy || notes === saved}
        onClick={() => onSave(notes)}
        className="mt-2 rounded-xl border border-admin-border px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:text-white disabled:opacity-40"
      >
        Тэмдэглэл хадгалах
      </button>
    </div>
  )
}

export default function InquiriesPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all')

  const { data: inquiries = [], isLoading, error, refetch } = useQuery({ queryKey: ['inquiries'], queryFn: fetchInquiries })
  const { data: departures = [] } = useQuery({ queryKey: ['departures-all'], queryFn: fetchDepartures })

  const { mutate: update, isPending } = useMutation({
    mutationFn: patchInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      queryClient.invalidateQueries({ queryKey: ['inquiries-unread'] })
      // confirming a sign-up changes the departure's enrolled count
      queryClient.invalidateQueries({ queryKey: ['departures-all'] })
    },
  })

  const { mutate: erase } = useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => {
      setSelectedId(null)
      queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      queryClient.invalidateQueries({ queryKey: ['inquiries-unread'] })
      queryClient.invalidateQueries({ queryKey: ['departures-all'] })
    },
  })

  const selected = inquiries.find((i) => i.id === selectedId) ?? null

  const visible = filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter)
  const unreadCount = inquiries.filter((i) => !i.isRead).length
  const counts = (s: InquiryStatus) => inquiries.filter((i) => i.status === s).length
  const open = (item: Inquiry) => {
    setSelectedId(item.id)
    if (!item.isRead) update({ id: item.id, patch: { isRead: true } })
  }

  // Departures of the same tour first, so linking a sign-up is a short list
  const linkable = selected ? departures.filter((d) => !selected.tourId || d.tourId === selected.tourId) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Хүсэлтүүд</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Quote requests and group-departure sign-ups · {unreadCount > 0 ? `${unreadCount} unread` : 'Бүгд уншсан'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', ...INQUIRY_STATUSES.map((s) => s.key)] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === key ? 'border-admin-accent bg-admin-accent text-white' : 'border-admin-border text-gray-400 hover:text-white',
            )}
          >
            {key === 'all' ? `All (${inquiries.length})` : `${statusLabel(key)} (${counts(key)})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-admin-border bg-admin-card" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-sm font-semibold text-red-300">Хүсэлтүүд ачаалахад алдаа гарлаа</p>
          <p className="mt-1 text-xs text-gray-500">inquiries хүснэгт (migration 014) байгаа эсэх болон админаар нэвтэрсэн эсэхээ шалгана уу.</p>
          <button onClick={() => refetch()} className="mt-4 rounded-xl bg-admin-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
            Дахин оролдох
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <Mail className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>Одоогоор хүсэлт ирээгүй байна</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            {visible.map((item) => (
              <div
                key={item.id}
                onClick={() => open(item)}
                className={cn(
                  'cursor-pointer rounded-xl border bg-admin-card p-4 transition-colors',
                  selectedId === item.id ? 'border-admin-accent' : 'border-admin-border hover:border-gray-600',
                  !item.isRead && 'border-l-2 border-l-admin-accent',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {item.isRead ? <MailOpen className="h-4 w-4 flex-shrink-0 text-gray-500" /> : <Mail className="h-4 w-4 flex-shrink-0 text-admin-accent" />}
                    <div>
                      <p className={cn('text-sm font-bold', item.isRead ? 'text-gray-300' : 'text-white')}>{item.name}</p>
                      <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-gray-600">{new Date(item.createdAt).toLocaleDateString('mn-MN')}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', STATUS_STYLE[item.status])}>{statusLabel(item.status)}</span>
                  </div>
                </div>
                <p className="ml-6 mt-2 flex items-center gap-1.5 text-xs text-brand-gold">
                  {item.kind === 'signup' ? <Users2 className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                  {item.kind === 'signup' ? 'Бүлгийн аялал' : 'Үнийн санал хүсэлт'}
                  {item.tourTitle ? ` · ${item.tourTitle}` : ''}
                </p>
                {item.message && <p className="ml-6 mt-1 line-clamp-1 text-xs text-gray-500">{item.message}</p>}
              </div>
            ))}
          </div>

          {selected ? (
            <div className="sticky top-6 h-fit space-y-4 rounded-xl border border-admin-border bg-admin-card p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-white">{selected.name}</h2>
                <span className="text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString('mn-MN')}</span>
              </div>

              <div className="space-y-2 text-sm">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-admin-accent hover:underline">
                  <Mail className="h-3.5 w-3.5" />
                  {selected.email}
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-admin-accent hover:underline">
                    <Phone className="h-3.5 w-3.5" />
                    {selected.phone}
                  </a>
                )}
                <p className="text-xs text-gray-500">
                  {selected.country ? `${selected.country} · ` : ''}Language: {selected.locale.toUpperCase()}
                </p>
              </div>

              <div className="space-y-2 rounded-xl bg-admin-bg p-4 text-sm text-gray-300">
                {selected.tourTitle && <p className="font-semibold text-white">{selected.tourTitle}</p>}
                {selected.departureStart && selected.departureEnd && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                    Group tour: {day(selected.departureStart)} – {day(selected.departureEnd)}
                  </p>
                )}
                {selected.travelFrom && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-500" />
                    Requested dates: {day(selected.travelFrom)}
                    {selected.travelTo ? ` – ${day(selected.travelTo)}` : ''}
                    {selected.flexible ? ' (уян хатан)' : ''}
                  </p>
                )}
                {!selected.travelFrom && selected.flexible && <p>Огноо уян хатан</p>}
                <p className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-gray-500" />
                  {selected.adults} adults{selected.children > 0 ? `, ${selected.children} children` : ''}
                </p>
                {selected.budgetPerDay !== null && (
                  <p className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-gray-500" />
                    Budget per day: {selected.budgetPerDay} €
                  </p>
                )}
                {selected.interests.length > 0 && <p>Interests: {selected.interests.map((k) => labelOf(ACTIVITIES, k)).join(', ')}</p>}
                {selected.accommodationStyle && <p>Accommodation style: {labelOf(ACCOMMODATIONS, selected.accommodationStyle)}</p>}
              </div>

              {selected.message && (
                <div className="rounded-xl bg-admin-bg p-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Мессеж</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{selected.message}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Төлөв</p>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_STATUSES.map((s) => (
                    <button
                      key={s.key}
                      disabled={isPending}
                      onClick={() => update({ id: selected.id, patch: { status: s.key } })}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60',
                        selected.status === s.key ? 'border-admin-accent bg-admin-accent text-white' : 'border-admin-border text-gray-400 hover:text-white',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {selected.kind === 'signup' && (
                  <p className="mt-2 text-xs text-gray-500">Энэ хүсэлтийг «Баталгаажсан» болговол бүлгийн аяллын бүртгэгдсэн хүний тоо автоматаар шинэчлэгдэнэ.</p>
                )}
              </div>

              <div>
                <label htmlFor="inq-dep" className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                  Холбосон бүлгийн аялал
                </label>
                <select
                  id="inq-dep"
                  value={selected.departureId ?? ''}
                  onChange={(e) => update({ id: selected.id, patch: { departureId: e.target.value || null } })}
                  className="w-full rounded-xl border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-gray-200"
                >
                  <option value="">— холбоогүй —</option>
                  {linkable.map((d) => (
                    <option key={d.id} value={d.id}>
                      {day(d.startDate)} – {day(d.endDate)} ({d.enrolled}/{d.maxParticipants})
                    </option>
                  ))}
                </select>
              </div>

              <NotesEditor key={selected.id} saved={selected.adminNotes ?? ''} busy={isPending} onSave={(adminNotes) => update({ id: selected.id, patch: { adminNotes } })} />

              <a
                href={`mailto:${selected.email}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-admin-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                <Mail className="h-4 w-4" />
                Хариу илгээх
              </a>
              <button
                onClick={() => {
                  if (window.confirm(`${selected.name}-ийн хүсэлтийг бүр мөсөн устгах уу? Үүнийг буцаах боломжгүй.`)) erase(selected.id)
                }}
                className="w-full rounded-xl border border-red-500/30 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/10"
              >
                Бүр мөсөн устгах (мэдээлэл устгуулах хүсэлт)
              </button>
            </div>
          ) : (
            <div className="hidden items-center justify-center text-sm text-gray-600 lg:flex">Хүсэлт сонгоно уу</div>
          )}
        </div>
      )}
    </div>
  )
}
