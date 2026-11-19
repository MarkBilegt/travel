import { getTranslations } from 'next-intl/server'
import { Star } from 'lucide-react'
import { createSupabasePublic } from '@/lib/supabase/public'
import { mapTestimonial } from '@/lib/testimonials'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * Real traveller reviews (admin-managed, consented). Renders nothing until
 * there is at least one: the site never shows invented testimonials.
 */
export async function Testimonials({ locale }: { locale: string }) {
  const { data } = await createSupabasePublic().from('testimonials').select('*').order('sort_order').order('created_at', { ascending: false }).limit(6)
  const items = (data ?? []).map(mapTestimonial)
  if (items.length === 0) return null
  const t = await getTranslations({ locale, namespace: 'testimonials' })

  return (
    <section id="testimonials" className="bg-brand-cream px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={t('label')} title={t('title')} description={t('description')} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.id} className="flex flex-col rounded-3xl border border-brand-line bg-white p-7">
              {item.rating && (
                <div className="mb-4 flex gap-0.5 text-brand-gold-deep" aria-label={`${item.rating}/5`}>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                  ))}
                </div>
              )}
              <blockquote className="flex-1 text-base leading-relaxed text-brand-navy/80">“{item.quote}”</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold text-brand-navy">{item.name}</span>
                {item.country ? <span className="text-brand-navy/55"> · {item.country}</span> : null}
                {item.trip ? <span className="block text-xs text-brand-navy/50">{item.trip}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
