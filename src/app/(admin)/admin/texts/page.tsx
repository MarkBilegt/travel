'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExternalLink, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { adminCall, saveFailed } from '@/lib/admin-fetch'
import { TEXT_GROUPS, type Json } from '@/lib/site-texts'
import { cn } from '@/lib/utils'

const GROUP_PAGE: Record<string, string> = {
  hero: '', stats: '', featuredTours: '', recentlyAddedTours: '', destinations: '', impact: '', whyUs: '', gallery: '/gallery', bookingCTA: '',
  about: '/about', services: '/services', info: '/info', culture: '/culture', blog: '/blog', contact: '/contact', departures: '/departures', testimonials: '', footer: '', nav: '',
}

const inputCls = 'w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-gray-200 focus:border-admin-accent focus:outline-none'

type TextData = { builtIn: Json; saved: Json | null; current: Json }

const isObj = (v: Json): v is { [k: string]: Json } => typeof v === 'object' && v !== null && !Array.isArray(v)

/** An empty copy of a value with the same shape (used for "add item"). */
function blank(v: Json | undefined): Json {
  if (typeof v === 'string' || v === undefined) return ''
  if (Array.isArray(v)) return []
  if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]))
  return v
}

function Node({ value, onChange, label }: { value: Json; onChange: (v: Json) => void; label?: string }) {
  if (typeof value === 'string') {
    const long = value.length > 70 || value.includes('\n')
    return (
      <div>
        {label && <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>}
        {long ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(14, Math.max(3, Math.ceil(value.length / 90) + 1))} className={cn(inputCls, 'resize-y leading-relaxed')} />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        )}
      </div>
    )
  }
  if (Array.isArray(value)) {
    const template = value[0]
    const plain = value.every((x) => typeof x === 'string')
    return (
      <div>
        {label && <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>}
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className={cn('flex gap-2', !plain && 'rounded-xl border border-admin-border bg-admin-bg/60 p-3')}>
              <div className="min-w-0 flex-1">
                <Node value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} label={plain ? undefined : `№ ${i + 1}`} />
              </div>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Устгах" className="h-9 flex-shrink-0 rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {template !== undefined && (
          <button type="button" onClick={() => onChange([...value, blank(template)])} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-admin-border px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white">
            <Plus className="h-3.5 w-3.5" /> Нэмэх
          </button>
        )}
      </div>
    )
  }
  if (isObj(value)) {
    return (
      <div className="space-y-3">
        {Object.entries(value).map(([k, v]) => (
          <Node key={k} value={v} label={k} onChange={(nv) => onChange({ ...value, [k]: nv })} />
        ))}
      </div>
    )
  }
  return null
}

function TextEditor({ group, locale, data, onChanged }: { group: string; locale: string; data: TextData; onChanged: () => void }) {
  const [draft, setDraft] = useState<Json>(data.current)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.current)

  async function save() {
    setSaving(true)
    try {
      await adminCall(`/api/site-texts?locale=${locale}&namespace=${group}`, 'PUT', { data: draft })
      toast.success('Хадгалагдлаа. Вэбсайтад шууд шинэчлэгдэнэ.')
      onChanged()
    } catch (e) {
      toast.error(saveFailed(e))
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!window.confirm('Энэ хэсгийн засварыг цуцалж, анхны текст рүү буцаах уу?')) return
    try {
      await adminCall(`/api/site-texts?locale=${locale}&namespace=${group}`, 'DELETE')
      toast.success('Анхны текст сэргээгдлээ')
      onChanged()
    } catch (e) {
      toast.error(saveFailed(e))
    }
  }

  const page = GROUP_PAGE[group]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {data.saved !== null && <span className="rounded-full bg-admin-accent/15 px-2.5 py-1 text-[11px] font-bold text-admin-accent">Засварласан</span>}
        {page && (
          <a href={`/${locale}${page}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
            <ExternalLink className="h-3.5 w-3.5" /> Вэбсайт дээр харах
          </a>
        )}
        <div className="flex-1" />
        {data.saved !== null && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-admin-border px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white">
            <RotateCcw className="h-3.5 w-3.5" /> Анхны текст рүү буцаах
          </button>
        )}
        <button type="button" onClick={save} disabled={saving || !dirty} className="inline-flex items-center gap-2 rounded-xl bg-admin-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-40">
          <Save className="h-4 w-4" />
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>
      <div className="rounded-xl border border-admin-border bg-admin-card p-5">
        <Node value={draft} onChange={setDraft} />
      </div>
    </div>
  )
}

export default function TextsPage() {
  const queryClient = useQueryClient()
  const [group, setGroup] = useState<string>(TEXT_GROUPS[9].key) // "about" first: the page people ask about most
  const [locale, setLocale] = useState<'it' | 'en'>('it')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['site-texts', locale, group],
    queryFn: () => adminCall<TextData>(`/api/site-texts?locale=${locale}&namespace=${group}`),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Вэбсайтын текст</h1>
        <p className="mt-0.5 max-w-2xl text-xs text-gray-500">
          Хуудас бүрийн бичвэрийг энд засна. Итали болон Англи хувилбарыг тусад нь засдаг. Өөрчлөлт хадгалмагц вэбсайтад шууд харагдана. Хэсгийн мөр, жагсаалтыг нэмж, хасаж болно.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-64 flex-1 sm:max-w-md">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Хуудас, хэсэг</label>
          <select value={group} onChange={(e) => setGroup(e.target.value)} className={inputCls}>
            {TEXT_GROUPS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.labelMn}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1 rounded-xl border border-admin-border bg-admin-card p-1">
          {(['it', 'en'] as const).map((l) => (
            <button key={l} onClick={() => setLocale(l)} className={cn('rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors', locale === l ? 'bg-admin-accent text-white' : 'text-gray-400 hover:text-white')}>
              {l === 'it' ? 'Итали хэл' : 'Англи хэл'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="h-48 animate-pulse rounded-xl border border-admin-border bg-admin-card" />}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
          Текстийг ачаалж чадсангүй (migration 020 хийсэн үү?).{' '}
          <button onClick={() => refetch()} className="font-semibold underline">
            Дахин оролдох
          </button>
        </div>
      )}
      {data && (
        <TextEditor
          key={`${group}-${locale}-${JSON.stringify(data.saved)}`}
          group={group}
          locale={locale}
          data={data}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ['site-texts', locale, group] })}
        />
      )}
    </div>
  )
}
