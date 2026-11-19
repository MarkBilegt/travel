'use client'

import { LOCALES, DEFAULT_LOCALE, LOCALE_NAMES, type Locale } from '@/i18n/locales'
import { MONGOLIA_REGIONS, SITE_CONFIG } from '@/lib/constants'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Minus, Save, Eye, Loader2, ImageIcon, X } from 'lucide-react'
import { cn, formatPrice, CURRENCIES } from '@/lib/utils'
import { ACTIVITIES, ACCOMMODATIONS, VEHICLES, TOUR_TYPES, PRICE_MODES, MONTHS, type AccommodationKey } from '@/lib/tour-options'
import type { PriceTier } from '@/lib/tour-pricing'
import { MediaUpload } from './MediaUpload'
import type { Tour } from '@/types'
import { messageMn } from '@/lib/admin-fetch'

const schema = z.object({
  category: z.enum(['adventure', 'cultural', 'nature', 'luxury', 'family']),
  difficulty: z.enum(['easy', 'moderate', 'challenging']),
  duration: z.coerce.number().min(1),
  groupMin: z.coerce.number().min(1),
  groupMax: z.coerce.number().min(1),
  price: z.coerce.number().min(0).catch(0),
  currency: z.enum(['EUR', 'USD']),
  tourType: z.enum(['private', 'group', 'both']),
  vehicle: z.string().optional(),
  priceMode: z.enum(['fixed', 'from_per_day', 'on_request']),
  singleSupplement: z.string().optional(),
  slug: z.string().min(3),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'inactive', 'active']),
})

type FormData = z.infer<typeof schema>

const TABS = ['Үндсэн', 'Зураг, медиа', 'Хөтөлбөр', 'Үнэ, нөхцөл', 'SEO']

const inputCls = 'w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-admin-accent transition-colors placeholder:text-gray-600'
const labelCls = 'text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1.5'

/** One day of the programme as edited in the form. */
interface DayState {
  title: string
  description: string
  image?: string
  overnight?: AccommodationKey
  region?: string
}

/** Toggle buttons for picking several values from a fixed list. */
function ChipGroup({
  options, value, onChange,
}: { options: readonly { key: string; label: string }[]; value: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.key)
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.key) : [...value, o.key])}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              on ? 'bg-admin-accent/20 border-admin-accent text-white' : 'border-admin-border text-gray-500 hover:text-gray-300',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

const REGION_OPTIONS = MONGOLIA_REGIONS.map((r) => ({ key: r.key as string, label: r.label }))
const ACTIVITY_OPTIONS = ACTIVITIES.map((a) => ({ key: a.key as string, label: a.label }))
const ACCOMMODATION_OPTIONS = ACCOMMODATIONS.map((a) => ({ key: a.key as string, label: a.label }))
const MONTH_OPTIONS = MONTHS.map((m) => ({ key: String(m), label: String(m) }))

/** Everything translatable about a tour, for ONE language. */
interface LangState {
  title: string
  shortDescription: string
  description: string
  includes: string[]
  excludes: string[]
  itinerary: DayState[]
}

const emptyDay = (): DayState => ({ title: '', description: '', image: undefined })

function initialLang(tour: Tour | undefined, locale: Locale): LangState {
  const src = locale === DEFAULT_LOCALE ? tour : tour?.translations?.[locale]
  return {
    title: src?.title ?? '',
    shortDescription: src?.shortDescription ?? '',
    description: src?.description ?? '',
    includes: src?.includes?.length ? [...src.includes] : [''],
    excludes: src?.excludes?.length ? [...src.excludes] : [''],
    itinerary: src?.itinerary?.length
      ? src.itinerary.map((d) => ({ title: d.title, description: d.description, image: d.image, overnight: d.overnight, region: d.region }))
      : [emptyDay()],
  }
}

/** Editable list of short strings (included / not included). */
function StringList({
  items, onChange, placeholder, addLabel,
}: { items: string[]; onChange: (next: string[]) => void; placeholder: string; addLabel: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={placeholder}
            className={cn(inputCls, 'flex-1')}
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400 px-2" aria-label="Хасах">
            <Minus className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="text-admin-accent text-xs flex items-center gap-1 hover:opacity-70">
        <Plus className="w-3.5 h-3.5" />{addLabel}
      </button>
    </div>
  )
}

interface TourFormProps {
  tour?: Tour
  onCancel: () => void
  onSuccess?: () => void
}

export function TourForm({ tour, onCancel, onSuccess }: TourFormProps) {
  const isEditing = !!tour
  const [activeTab, setActiveTab] = useState(0)
  const [contentLang, setContentLang] = useState<Locale>(DEFAULT_LOCALE)
  const [texts, setTexts] = useState<Record<Locale, LangState>>(
    () => Object.fromEntries(LOCALES.map((l) => [l, initialLang(tour, l)])) as Record<Locale, LangState>,
  )
  const [defaultErrors, setDefaultErrors] = useState({ title: '', shortDescription: '', description: '' })
  const [regions, setRegions] = useState<string[]>(tour?.regions ?? [])
  const [seasonMonths, setSeasonMonths] = useState<string[]>((tour?.seasonMonths ?? []).map(String))
  const [activities, setActivities] = useState<string[]>(tour?.activities ?? [])
  const [accommodation, setAccommodation] = useState<string[]>(tour?.accommodation ?? [])
  const [tiers, setTiers] = useState<Array<{ minPeople: string; maxPeople: string; price: string }>>(
    (tour?.priceTiers ?? []).map((t: PriceTier) => ({ minPeople: String(t.minPeople), maxPeople: t.maxPeople ? String(t.maxPeople) : '', price: String(t.price) })),
  )
  const [coverImageUrl, setCoverImageUrl] = useState<string>(tour?.coverImage ?? '')
  const [galleryUrls, setGalleryUrls] = useState<string[]>(tour?.images ?? [])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadingDays, setUploadingDays] = useState<Set<number>>(new Set())
  const [dayImageErrors, setDayImageErrors] = useState<Record<number, string>>({})

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: (tour?.category as FormData['category']) ?? 'cultural',
      difficulty: (tour?.difficulty as FormData['difficulty']) ?? 'moderate',
      duration: tour?.duration ?? 7,
      groupMin: tour?.groupSize?.min ?? 2,
      groupMax: tour?.groupSize?.max ?? 12,
      price: tour?.price ?? 0,
      currency: tour?.currency ?? 'EUR',
      tourType: tour?.tourType ?? 'both',
      vehicle: tour?.vehicle ?? '',
      priceMode: tour?.priceMode ?? 'fixed',
      singleSupplement: tour?.singleSupplement != null ? String(tour.singleSupplement) : '',
      slug: tour?.slug ?? '',
      featured: tour?.featured ?? false,
      status: tour ? (tour.active ? 'active' : 'inactive') : 'draft',
    },
  })

  const watchedPrice = watch('price')
  const watchedCurrency = watch('currency')
  const watchedDuration = watch('duration')
  const watchedStatus = watch('status')
  const watchedMode = watch('priceMode')

  const cur = texts[contentLang]
  const isDefault = contentLang === DEFAULT_LOCALE
  const patch = (p: Partial<LangState>) => setTexts((all) => ({ ...all, [contentLang]: { ...all[contentLang], ...p } }))
  const setDay = (i: number, p: Partial<DayState>) => patch({ itinerary: cur.itinerary.map((d, j) => (j === i ? { ...d, ...p } : d)) })

  async function onSubmit(data: FormData) {
    // The default language (Italian) is required; other languages are optional.
    const d = texts[DEFAULT_LOCALE]
    const newErrors = {
      title: d.title.trim().length < 3 ? 'Нэр оруулна уу (3+ тэмдэгт)' : '',
      shortDescription: d.shortDescription.trim().length < 10 ? '10-300 тэмдэгт оруулна уу' : d.shortDescription.trim().length > 300 ? 'Хамгийн ихдээ 300 тэмдэгт' : '',
      description: d.description.trim().length < 20 ? '20+ тэмдэгт оруулна уу' : '',
    }
    if (Object.values(newErrors).some(Boolean)) {
      setDefaultErrors(newErrors)
      setActiveTab(0)
      setContentLang(DEFAULT_LOCALE)
      return
    }
    setDefaultErrors({ title: '', shortDescription: '', description: '' })

    setSaving(true)
    setSaveError(null)
    try {
      const days = (l: LangState) => l.itinerary.filter((x) => x.title || x.description)
      // Day photos are shared by all languages: copy them over by position.
      const baseImages = d.itinerary.map((x) => x.image)
      const translations: Record<string, unknown> = {}
      for (const l of LOCALES) {
        if (l === DEFAULT_LOCALE) continue
        const t = texts[l]
        translations[l] = {
          title: t.title,
          shortDescription: t.shortDescription,
          description: t.description,
          includes: t.includes.filter(Boolean),
          excludes: t.excludes.filter(Boolean),
          itinerary: days(t).map((x, i) => ({ day: i + 1, title: x.title, description: x.description, image: baseImages[i], overnight: d.itinerary[i]?.overnight, region: d.itinerary[i]?.region })),
        }
      }
      const payload = {
        title: d.title,
        description: d.description,
        shortDescription: d.shortDescription,
        includes: d.includes.filter(Boolean),
        excludes: d.excludes.filter(Boolean),
        itinerary: days(d).map((x, i) => ({ day: i + 1, title: x.title, description: x.description, image: x.image, overnight: x.overnight, region: x.region })),
        translations,
        category: data.category,
        difficulty: data.difficulty,
        duration: data.duration,
        groupSize: { min: data.groupMin, max: data.groupMax },
        price: data.price,
        currency: data.currency,
        tourType: data.tourType,
        regions,
        seasonMonths: seasonMonths.map(Number),
        activities,
        accommodation,
        vehicle: data.vehicle || null,
        priceMode: data.priceMode,
        priceTiers: tiers.filter((t) => t.minPeople && t.price).map((t) => ({ minPeople: Number(t.minPeople), maxPeople: t.maxPeople ? Number(t.maxPeople) : undefined, price: Number(t.price) })),
        singleSupplement: data.singleSupplement ? Number(data.singleSupplement) : null,
        slug: data.slug,
        featured: data.featured ?? false,
        status: data.status,
        coverImage: coverImageUrl,
        images: galleryUrls,
      }

      const url = isEditing ? `/api/tours/${tour.id}` : '/api/tours'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(messageMn(json.error ?? 'Хадгалахад алдаа гарлаа'))
      }

      onSuccess?.()
      onCancel()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  async function uploadDayImage(file: File, idx: number) {
    if (file.size > 5 * 1024 * 1024) {
      setDayImageErrors((p) => ({ ...p, [idx]: 'Файлын хэмжээ 5MB-аас хэтэрсэн байна' }))
      return
    }
    setDayImageErrors((p) => { const n = { ...p }; delete n[idx]; return n })
    setUploadingDays((p) => new Set(p).add(idx))
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'tours/itinerary')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Зураг хуулахад алдаа гарлаа')
      const json = await res.json()
      const url = json.data?.url as string
      setTexts((all) => ({
        ...all,
        [DEFAULT_LOCALE]: {
          ...all[DEFAULT_LOCALE],
          itinerary: all[DEFAULT_LOCALE].itinerary.map((d, j) => (j === idx ? { ...d, image: url } : d)),
        },
      }))
    } catch {
      setDayImageErrors((p) => ({ ...p, [idx]: 'Зураг хуулахад алдаа гарлаа' }))
    } finally {
      setUploadingDays((p) => { const n = new Set(p); n.delete(idx); return n })
    }
  }

  const hasContent = (l: Locale) => !!texts[l].title.trim()

  /** Language switcher for all the translatable tabs. */
  const langToggle = (
    <div className="flex items-center gap-1 bg-admin-bg border border-admin-border rounded-lg p-0.5 w-fit mb-4">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setContentLang(l)}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
            contentLang === l ? 'bg-admin-card text-white' : 'text-gray-500 hover:text-gray-300')}
        >
          {LOCALE_NAMES[l].label}
          {l === DEFAULT_LOCALE ? <span className="text-amber-400 text-[10px]">*</span> : hasContent(l) && <span className="text-green-400 text-[10px] ml-0.5">✓</span>}
        </button>
      ))}
    </div>
  )

  const ph = isDefault
    ? { title: 'Viaggio nel Gobi', short: 'Breve presentazione del viaggio', long: 'Descrizione completa del viaggio...', inc: 'Trasporto in 4x4, campo di gher...', exc: 'Spese personali...', day: 'Titolo del giorno', dayText: 'Programma del giorno...' }
    : { title: 'Journey through the Gobi (optional)', short: 'Short description (optional)', long: 'Full description (optional)', inc: 'Translation (optional)', exc: 'Translation (optional)', day: 'Day title (optional)', dayText: 'Day description (optional)' }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-6 items-start">
        {/* Left - form tabs (60%) */}
        <div className="flex-[3] min-w-0">
          {/* Tab bar */}
          <div className="flex gap-1 bg-admin-bg border border-admin-border rounded-xl p-1 mb-6">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(i)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-semibold transition-colors',
                  i === activeTab ? 'bg-admin-card text-white shadow-sm' : 'text-gray-500 hover:text-gray-300',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Basic */}
          {activeTab === 0 && (
            <div className="space-y-4">
              {langToggle}
              <p className="text-gray-500 text-xs">
                {isDefault
                  ? 'Үндсэн хэл (Итали) заавал. Бусад хэлээр оруулаагүй бол энэ текст харагдана.'
                  : 'Заавал биш. Хоосон бол Итали текст харагдана.'}
              </p>

              <div>
                <label className={labelCls}>Tour title {isDefault && '*'}</label>
                <input value={cur.title} onChange={(e) => patch({ title: e.target.value })} placeholder={ph.title} className={inputCls} />
                {isDefault && defaultErrors.title && <p className="text-red-400 text-xs mt-1">{defaultErrors.title}</p>}
              </div>
              <div>
                <label className={labelCls}>Short description {isDefault && '*'}</label>
                <textarea value={cur.shortDescription} onChange={(e) => patch({ shortDescription: e.target.value })} rows={2} placeholder={ph.short} className={cn(inputCls, 'resize-none')} />
                {isDefault && defaultErrors.shortDescription && <p className="text-red-400 text-xs mt-1">{defaultErrors.shortDescription}</p>}
              </div>
              <div>
                <label className={labelCls}>Full description {isDefault && '*'}</label>
                <textarea value={cur.description} onChange={(e) => patch({ description: e.target.value })} rows={5} placeholder={ph.long} className={cn(inputCls, 'resize-none')} />
                {isDefault && defaultErrors.description && <p className="text-red-400 text-xs mt-1">{defaultErrors.description}</p>}
              </div>

              <div>
                <label className={labelCls}>Бүс нутаг (хэд ч сонгож болно)</label>
                <ChipGroup options={REGION_OPTIONS} value={regions} onChange={setRegions} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Аялалын төрөл</label>
                  <select {...register('tourType')} className={cn(inputCls, 'appearance-none')}>
                    {TOUR_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Тээвэр</label>
                  <select {...register('vehicle')} className={cn(inputCls, 'appearance-none')}>
                    <option value="">—</option>
                    {VEHICLES.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Улирал (сар) — хоосон бол жилийн турш</label>
                <ChipGroup options={MONTH_OPTIONS} value={seasonMonths} onChange={setSeasonMonths} />
              </div>
              <div>
                <label className={labelCls}>Үйл ажиллагаа</label>
                <ChipGroup options={ACTIVITY_OPTIONS} value={activities} onChange={setActivities} />
              </div>
              <div>
                <label className={labelCls}>Байрлах газар</label>
                <ChipGroup options={ACCOMMODATION_OPTIONS} value={accommodation} onChange={setAccommodation} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Ангилал</label>
                  <select {...register('category')} className={cn(inputCls, 'appearance-none')}>
                    <option value="adventure">Адал явдал</option>
                    <option value="cultural">Соёл</option>
                    <option value="nature">Байгаль</option>
                    <option value="luxury">Тансаг</option>
                    <option value="family">Гэр бүл</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Хүндрэл</label>
                  <select {...register('difficulty')} className={cn(inputCls, 'appearance-none')}>
                    <option value="easy">Хялбар</option>
                    <option value="moderate">Дунд</option>
                    <option value="challenging">Хэцүү</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Хоног *</label>
                  <input {...register('duration')} type="number" min={1} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Бүлгийн хэмжээ (мин)</label>
                  <input {...register('groupMin')} type="number" min={1} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Бүлгийн хэмжээ (макс)</label>
                  <input {...register('groupMax')} type="number" min={1} className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Media */}
          {activeTab === 1 && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Нүүр зураг</label>
                <MediaUpload
                  maxFiles={1}
                  label="Нүүр зураг оруулах"
                  folder="tours/covers"
                  initialUrls={coverImageUrl ? [coverImageUrl] : []}
                  onUpload={(urls) => setCoverImageUrl(urls[0] ?? '')}
                />
                {coverImageUrl && (
                  <p className="text-green-400 text-xs mt-2">✓ Нүүр зураг тохируулагдсан</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Галерей зургууд (дээд тал нь 8)</label>
                <MediaUpload
                  maxFiles={8}
                  label="Зургууд оруулах"
                  folder="tours/gallery"
                  initialUrls={galleryUrls}
                  onUpload={setGalleryUrls}
                />
                {galleryUrls.length > 0 && (
                  <p className="text-green-400 text-xs mt-2">✓ {galleryUrls.length} image set</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Itinerary */}
          {activeTab === 2 && (
            <div className="space-y-4">
              {langToggle}
              <p className="text-gray-400 text-xs">
                {isDefault
                  ? 'Аяллын өдөр бүрийн хөтөлбөрийг нэмнэ үү.'
                  : 'Өдрийн дараалал Итали хөтөлбөртэй таарна. Хоосон бол Итали хөтөлбөр харуулна.'}
              </p>
              {cur.itinerary.map((day, i) => (
                <div key={i} className="bg-admin-bg border border-admin-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-semibold">Day {i + 1}</span>
                    {isDefault && cur.itinerary.length > 1 && (
                      <button type="button" onClick={() => patch({ itinerary: cur.itinerary.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-300" aria-label="Өдрийг хасах">
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input value={day.title} onChange={(e) => setDay(i, { title: e.target.value })} placeholder={ph.day} className={inputCls} />
                  <textarea value={day.description} onChange={(e) => setDay(i, { description: e.target.value })} rows={3} placeholder={ph.dayText} className={cn(inputCls, 'resize-none')} />
                  {isDefault && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Хоноглох газар</label>
                        <select value={day.overnight ?? ''} onChange={(e) => setDay(i, { overnight: (e.target.value || undefined) as AccommodationKey | undefined })} className={cn(inputCls, 'appearance-none')}>
                          <option value="">—</option>
                          {ACCOMMODATIONS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Бүс нутаг</label>
                        <select value={day.region ?? ''} onChange={(e) => setDay(i, { region: e.target.value || undefined })} className={cn(inputCls, 'appearance-none')}>
                          <option value="">—</option>
                          {REGION_OPTIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  {isDefault && (
                    <div>
                      <label className={labelCls}>Өдрийн зураг</label>
                      {uploadingDays.has(i) ? (
                        <div className="flex items-center gap-2 text-gray-400 text-xs py-3">
                          <Loader2 className="w-4 h-4 animate-spin" />Зураг хуулж байна...
                        </div>
                      ) : day.image ? (
                        <div className="relative w-40 h-24 rounded-xl overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={day.image} alt={`Day ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setDay(i, { image: undefined })}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Зургийг хасах"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-1.5 w-full border border-dashed border-admin-border rounded-xl py-4 cursor-pointer hover:border-gray-500 transition-colors text-gray-500 hover:text-gray-300">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-xs">Зураг оруулах</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) uploadDayImage(file, i)
                              e.target.value = ''
                            }}
                          />
                        </label>
                      )}
                      {dayImageErrors[i] && <p className="text-red-400 text-xs mt-1">{dayImageErrors[i]}</p>}
                    </div>
                  )}
                </div>
              ))}
              {isDefault && (
                <button
                  type="button"
                  onClick={() => setTexts((all) => {
                    // keep every language's list the same length so days line up
                    const next = { ...all }
                    for (const l of LOCALES) next[l] = { ...all[l], itinerary: [...all[l].itinerary, emptyDay()] }
                    return next
                  })}
                  className="w-full border border-dashed border-admin-border rounded-xl py-3 text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />Өдөр нэмэх
                </button>
              )}
            </div>
          )}

          {/* Tab 4: Price & Conditions */}
          {activeTab === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Үнийн төрөл</label>
                  <select {...register('priceMode')} className={cn(inputCls, 'appearance-none')}>
                    {PRICE_MODES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Валют</label>
                  <select {...register('currency')} className={cn(inputCls, 'appearance-none')}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{watchedMode === 'from_per_day' ? 'Price per day (per person) *' : 'Price (per adult) *'}</label>
                  <input {...register('price')} type="number" min={0} placeholder="1890" disabled={watchedMode === 'on_request'} className={cn(inputCls, 'disabled:opacity-40')} />
                </div>
                <div>
                  <label className={labelCls}>Ганцаарын нэмэлт төлбөр</label>
                  <input {...register('singleSupplement')} type="number" min={0} placeholder="250" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Бүлгийн хэмжээнээс хамаарсан үнэ (нэг хүнд)</label>
                <div className="space-y-2">
                  {tiers.map((t, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={t.minPeople} onChange={(e) => setTiers((p) => p.map((x, j) => (j === i ? { ...x, minPeople: e.target.value } : x)))} type="number" min={1} placeholder="Мин хүн" className={cn(inputCls, 'flex-1')} />
                      <input value={t.maxPeople} onChange={(e) => setTiers((p) => p.map((x, j) => (j === i ? { ...x, maxPeople: e.target.value } : x)))} type="number" min={1} placeholder="Макс (хоосон = хязгааргүй)" className={cn(inputCls, 'flex-1')} />
                      <input value={t.price} onChange={(e) => setTiers((p) => p.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} type="number" min={0} placeholder="Үнэ" className={cn(inputCls, 'flex-1')} />
                      <button type="button" onClick={() => setTiers((p) => p.filter((_, j) => j !== i))} className="text-red-400 px-2" aria-label="Үнийн шатлалыг хасах">
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setTiers((p) => [...p, { minPeople: '', maxPeople: '', price: '' }])} className="text-admin-accent text-xs flex items-center gap-1 hover:opacity-70">
                    <Plus className="w-3.5 h-3.5" />Нэмэх
                  </button>
                </div>
              </div>

              {langToggle}

              <div>
                <label className={labelCls}>Багтсан зүйлс</label>
                <StringList items={cur.includes} onChange={(includes) => patch({ includes })} placeholder={ph.inc} addLabel="Нэмэх" />
              </div>
              <div>
                <label className={labelCls}>Орхигдсон зүйлс</label>
                <StringList items={cur.excludes} onChange={(excludes) => patch({ excludes })} placeholder={ph.exc} addLabel="Нэмэх" />
              </div>
            </div>
          )}

          {/* Tab 5: SEO */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Вэб хаяг (slug) *</label>
                <input {...register('slug')} placeholder="govi-aylal" className={inputCls} />
                {errors.slug && <p className="text-red-400 text-xs mt-1">Вэб хаяг оруулна уу</p>}
                <p className="text-gray-600 text-xs mt-1">{SITE_CONFIG.domain}/it/tours/gobi-desert-journey</p>
              </div>
              <div className="flex items-center gap-3">
                <input {...register('featured')} type="checkbox" id="featured" className="w-4 h-4 accent-admin-accent" />
                <label htmlFor="featured" className="text-gray-300 text-sm cursor-pointer">Онцлох аяллуудад харуулах</label>
              </div>
            </div>
          )}
        </div>

        {/* Right - live preview (40%) */}
        <div className="flex-[2] sticky top-4">
          <div className="bg-admin-bg border border-admin-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Урьдчилан харах</p>
            </div>
            {/* Preview card */}
            <div className="bg-admin-card rounded-xl overflow-hidden border border-admin-border">
              <div className="h-32 bg-gradient-to-br from-admin-accent/20 to-purple-500/10 flex items-center justify-center overflow-hidden">
                {coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImageUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-gray-500 text-xs">Зураг оруулах</p>
                )}
              </div>
              <div className="p-4">
                <p className="text-white font-bold text-sm mb-1">{texts[DEFAULT_LOCALE].title || 'Tour title...'}</p>
                <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
                  <span>🕐 {watchedDuration || 0} days</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                    watchedStatus === 'active' ? 'bg-green-500/15 text-green-400' :
                    watchedStatus === 'inactive' ? 'bg-gray-500/15 text-gray-400' :
                    'bg-amber-500/15 text-amber-400'
                  )}>
                    {watchedStatus === 'active' ? 'Идэвхтэй' : watchedStatus === 'inactive' ? 'Идэвхгүй' : 'Ноорог'}
                  </span>
                </div>
                <p className="text-gray-400 text-2xl font-bold">
                  {formatPrice(Number(watchedPrice) || 0, watchedCurrency ?? 'EUR', 'en')}
                </p>
              </div>
            </div>

            {/* Status selector */}
            <div className="mt-4">
              <label className={labelCls}>Нийтлэх төлөв</label>
              <select {...register('status')} className={cn(inputCls, 'appearance-none')}>
                <option value="draft">Ноорог</option>
                <option value="inactive">Идэвхгүй</option>
                <option value="active">Идэвхтэй</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {saveError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {saveError}
        </div>
      )}

      {/* Footer buttons */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-admin-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
          Цуцлах
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-admin-accent hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? 'Өөрчлөлт хадгалах' : 'Хадгалах'}
        </button>
      </div>
    </form>
  )
}
