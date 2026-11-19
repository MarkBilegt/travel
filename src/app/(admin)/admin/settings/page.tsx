'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { adminCall, saveFailed } from '@/lib/admin-fetch'
import type { SiteSettings } from '@/lib/site-settings'
import { cn } from '@/lib/utils'

const inputCls = 'w-full rounded-xl border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-gray-200 focus:border-admin-accent focus:outline-none'
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500'
const hintCls = 'mt-1 text-xs text-gray-600'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-admin-border bg-admin-card p-6">
      <h2 className="mb-5 text-sm font-bold text-white">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export default function SettingsPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['site-settings'], queryFn: () => adminCall<SiteSettings>('/api/site-settings') })

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl border border-admin-border bg-admin-card" />
  if (error || !data)
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-300">
        Мэдээллийг ачаалж чадсангүй (migration 020 хийсэн үү?).{' '}
        <button onClick={() => refetch()} className="font-semibold underline">
          Дахин оролдох
        </button>
      </div>
    )
  // The form starts from the saved values; it is rebuilt after every save so it always shows what is stored
  return <SettingsForm key={JSON.stringify(data)} initial={data} onSaved={() => refetch()} />
}

function SettingsForm({ initial, onSaved }: { initial: SiteSettings; onSaved: () => void }) {
  const [form, setForm] = useState<SiteSettings>(initial)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setForm((f) => ({ ...f, [k]: v }))

  async function save() {
    setSaving(true)
    try {
      await adminCall('/api/site-settings', 'PUT', form)
      toast.success('Хадгалагдлаа. Вэбсайтад шууд шинэчлэгдэнэ.')
      onSaved()
    } catch (e) {
      toast.error(saveFailed(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Холбоо барих мэдээлэл</h1>
        <p className="mt-0.5 text-xs text-gray-500">Энд өөрчилсөн утас, имэйл, хаяг нь вэбсайтын бүх хуудас, имэйл, footer-т шууд солигдоно.</p>
      </div>

      <Section title="Утас ба мессенжер">
        <Field label="Үндсэн утас" hint="Бүх хуудсанд харагдана. Жишээ: +976 9586 8948">
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Нэмэлт утас (заавал биш)">
          <input value={form.phone2} onChange={(e) => set('phone2', e.target.value)} className={inputCls} />
        </Field>
        <Field label="WhatsApp дугаар" hint="Зөвхөн цифр, улсын кодтой: 97695868948">
          <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} inputMode="numeric" />
        </Field>
        <Field label="Viber дугаар" hint="Ихэвчлэн WhatsApp-тай ижил">
          <input value={form.viber} onChange={(e) => set('viber', e.target.value)} className={inputCls} inputMode="numeric" />
        </Field>
        <Field label="WeChat (заавал биш)">
          <input value={form.wechat} onChange={(e) => set('wechat', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Skype (заавал биш)">
          <input value={form.skype} onChange={(e) => set('skype', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <Section title="Имэйл">
        <Field label="Олон нийтэд харагдах имэйл" hint="Холбоо барих хуудас, footer, имэйлийн доод хэсэгт">
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Хүсэлт хүлээн авах имэйл" hint="Шинэ хүсэлт ирэхэд мэдэгдэл энд очно. Хоосон бол дээрх имэйл.">
          <input type="email" value={form.notifyEmail} onChange={(e) => set('notifyEmail', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <Section title="Хаяг ба хариу өгөх хугацаа">
        <Field label="Хаяг">
          <input value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Хаягийн тайлбар (заавал биш)" hint="Жишээ: Уулзалт урьдчилж товлосноор">
          <input value={form.addressNote} onChange={(e) => set('addressNote', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Хариу өгөх хугацаа (Итали хэлээр)">
          <input value={form.replyTime.it} onChange={(e) => set('replyTime', { ...form.replyTime, it: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Хариу өгөх хугацаа (Англи хэлээр)">
          <input value={form.replyTime.en} onChange={(e) => set('replyTime', { ...form.replyTime, en: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Газрын зургийн хайлт" hint="Холбоо барих хуудасны газрын зурагт харагдах газар">
          <input value={form.mapQuery} onChange={(e) => set('mapQuery', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <Section title="Олон нийтийн сүлжээ (хоосон бол харагдахгүй)">
        <Field label="Facebook">
          <input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} className={inputCls} placeholder="https://facebook.com/..." />
        </Field>
        <Field label="Instagram">
          <input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} className={inputCls} placeholder="https://instagram.com/..." />
        </Field>
        <Field label="YouTube">
          <input value={form.youtube} onChange={(e) => set('youtube', e.target.value)} className={inputCls} placeholder="https://youtube.com/..." />
        </Field>
      </Section>

      <Section title="Байгууллагын мэдээлэл">
        <Field label="Байгуулагдсан он">
          <input type="number" value={form.foundedYear} onChange={(e) => set('foundedYear', Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Хуудасны доод хэсгийн албан ёсны мэдээлэл" hint="Жишээ: Бүртгэлийн дугаар 1234567 · РД 7654321">
          <input value={form.legalLine} onChange={(e) => set('legalLine', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className={cn('inline-flex items-center gap-2 rounded-xl bg-admin-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60')}>
          <Save className="h-4 w-4" />
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>
    </div>
  )
}
