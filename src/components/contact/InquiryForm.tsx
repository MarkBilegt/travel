'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, CheckCircle2, Loader2, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Link } from '@/navigation'
import { ACCOMMODATIONS, ACTIVITIES } from '@/lib/tour-options'
import { INTL_LOCALE, toLocale } from '@/i18n/locales'

export interface InquiryTourOption {
  id: string
  title: string
}

/** The group departure a visitor is signing up for (sign-up mode). */
export interface InquiryDeparture {
  id: string
  tourTitle: string
  startDate: string
  endDate: string
  spotsLeft: number
}

interface InquiryFormProps {
  tours: InquiryTourOption[]
  /** Pre-selected tour (quote mode). */
  defaultTourId?: string
  /** Sign-up mode: reserve a spot on this departure. */
  departure?: InquiryDeparture
}

function makeSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().trim().min(2, t('errors.nameMin')),
    email: z.string().trim().email(t('errors.emailInvalid')),
    phone: z.string().optional(),
    country: z.string().optional(),
    tourId: z.string().optional(),
    travelFrom: z.string().optional(),
    travelTo: z.string().optional(),
    flexible: z.boolean().optional(),
    adults: z.coerce.number().int().min(1).max(50),
    children: z.coerce.number().int().min(0).max(50),
    budgetPerDay: z.string().optional(),
    accommodationStyle: z.string().optional(),
    message: z.string().optional(),
    website: z.string().optional(), // honeypot
  })
}

type FormData = z.infer<ReturnType<typeof makeSchema>>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-navy/60">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="mt-1 text-xs text-red-500">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputCls = (err?: boolean) =>
  cn(
    'w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-brand-navy placeholder:text-brand-navy/35 transition-colors',
    'focus:outline-none focus:ring-4 focus:ring-brand-gold/15',
    err ? 'border-red-400' : 'border-brand-line hover:border-brand-navy/25 focus:border-brand-gold',
  )

/**
 * Quote request, or (with `departure`) a no-payment request for a spot on a
 * group departure. Posts to /api/inquiries; no account needed.
 */
export function InquiryForm({ tours, defaultTourId, departure }: InquiryFormProps) {
  const t = useTranslations('contact.form')
  const tt = useTranslations('tours')
  const locale = useLocale()
  const signup = Boolean(departure)
  const [interests, setInterests] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const schema = makeSchema(t as unknown as (key: string) => string)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { adults: 1, children: 0, tourId: defaultTourId ?? '', flexible: false },
  })

  const fmt = new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { day: 'numeric', month: 'long', year: 'numeric' })
  const today = new Date().toISOString().slice(0, 10)

  const toggleInterest = (key: string) => setInterests((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]))

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          kind: signup ? 'signup' : 'quote',
          locale,
          departureId: departure?.id,
          tourId: signup ? undefined : data.tourId || undefined,
          interests,
        }),
      })
      if (res.status === 409) {
        setSubmitError(t('fullError'))
        return
      }
      if (!res.ok) throw new Error('server error')
      setSubmitted(true)
    } catch {
      setSubmitError(t('submitError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="contact-form" className="scroll-mt-24">
      <div className="rounded-[2rem] border border-brand-line bg-brand-cream p-6 sm:p-10">
        <div className="mb-8">
          <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-deep">
            <span aria-hidden className="h-px w-8 bg-brand-gold-deep" />
            {signup ? t('signupLabel') : t('label')}
          </p>
          <h2 className="text-3xl uppercase leading-none text-brand-navy sm:text-4xl">{signup ? t('signupTitle') : t('title')}</h2>
        </div>

        {departure && (
          <div className="mb-6 rounded-2xl border border-brand-line bg-white p-4 text-sm text-brand-navy">
            <p className="font-display text-lg font-semibold uppercase">{departure.tourTitle}</p>
            <p className="mt-1">
              {fmt.format(new Date(`${departure.startDate}T00:00:00`))} – {fmt.format(new Date(`${departure.endDate}T00:00:00`))}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-navy/60">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {t('signupSpots', { count: departure.spotsLeft })}
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 200 }} className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-9 w-9 text-green-500" />
              </div>
              <h3 className="mb-2 text-xl font-black text-brand-navy">{signup ? t('successSignupTitle') : t('successTitle')}</h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-500">{signup ? t('successSignupDescription') : t('successDescription')}</p>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t('name')} error={errors.name?.message}>
                  <input {...register('name')} autoComplete="name" placeholder={t('namePlaceholder')} className={inputCls(!!errors.name)} />
                </Field>
                <Field label={t('email')} error={errors.email?.message}>
                  <input {...register('email')} type="email" autoComplete="email" placeholder="name@example.com" className={inputCls(!!errors.email)} />
                </Field>
                <Field label={`${t('phone')} (${t('optional')})`}>
                  <input {...register('phone')} type="tel" autoComplete="tel" placeholder="+39 ..." className={inputCls()} />
                </Field>
                <Field label={`${t('country')} (${t('optional')})`}>
                  <input {...register('country')} autoComplete="country-name" className={inputCls()} />
                </Field>
              </div>

              {!signup && (
                <>
                  <Field label={t('tour')}>
                    <select {...register('tourId')} className={cn(inputCls(), 'appearance-none bg-white')}>
                      <option value="">{t('tourNone')}</option>
                      {tours.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.title}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={t('from')}>
                      <input {...register('travelFrom')} type="date" min={today} className={inputCls()} />
                    </Field>
                    <Field label={t('to')}>
                      <input {...register('travelTo')} type="date" min={today} className={inputCls()} />
                    </Field>
                  </div>
                  <label className="flex items-center gap-3 text-sm text-brand-navy">
                    <input type="checkbox" {...register('flexible')} className="h-4 w-4 rounded border-brand-line accent-brand-gold-deep" />
                    {t('flexible')}
                  </label>
                </>
              )}

              <div className={cn('grid grid-cols-2 gap-4', !signup && 'sm:grid-cols-3')}>
                <Field label={t('adults')}>
                  <input {...register('adults')} type="number" min={1} max={signup ? departure?.spotsLeft : 50} inputMode="numeric" className={inputCls()} />
                </Field>
                <Field label={t('children')}>
                  <input {...register('children')} type="number" min={0} max={50} inputMode="numeric" className={inputCls()} />
                </Field>
                {!signup && (
                  <Field label={`${t('budget')} (€, ${t('optional')})`}>
                    <input {...register('budgetPerDay')} type="number" min={0} inputMode="numeric" placeholder="120" className={inputCls()} />
                  </Field>
                )}
              </div>

              {!signup && (
                <>
                  <fieldset>
                    <legend className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-navy/60">{t('interests')}</legend>
                    <div className="flex flex-wrap gap-2">
                      {ACTIVITIES.map(({ key }) => {
                        const on = interests.includes(key)
                        return (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleInterest(key)}
                            className={cn(
                              'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                              on ? 'border-brand-navy bg-brand-navy text-white' : 'border-brand-line bg-white text-brand-navy hover:border-brand-navy/40',
                            )}
                          >
                            {tt(`activities.${key}`)}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>

                  <Field label={t('accommodation')}>
                    <select {...register('accommodationStyle')} className={cn(inputCls(), 'appearance-none bg-white')}>
                      <option value="">{t('accommodationAny')}</option>
                      {ACCOMMODATIONS.map(({ key }) => (
                        <option key={key} value={key}>
                          {tt(`accommodationLabels.${key}`)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              )}

              <Field label={`${t('message')} (${t('optional')})`}>
                <textarea {...register('message')} rows={4} placeholder={signup ? t('signupMessagePlaceholder') : t('messagePlaceholder')} className={cn(inputCls(), 'resize-none')} />
              </Field>

              {/* Honeypot: hidden from people, filled in by bots */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input {...register('website')} tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <p className="text-xs leading-relaxed text-brand-navy/55">
                {t('privacyNote')}{' '}
                <Link href="/privacy" className="font-semibold underline">
                  {t('privacyLink')}
                </Link>
              </p>

              {submitError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{submitError}</p>}

              <Button type="submit" variant="gold" size="lg" fullWidth disabled={loading} className="mt-2 gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {signup ? t('submitSignup') : t('submit')}
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
