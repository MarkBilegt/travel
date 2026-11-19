'use client'

import { motion } from 'framer-motion'
import * as Accordion from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/ui/SectionHeading'

type FAQItem = { q: string; a: string }
type FAQSection = { section: string; items: FAQItem[] }

export function FAQAccordion() {
  const t = useTranslations('contact.faq')
  const sections = t.raw('sections') as FAQSection[]

  return (
    <section className="bg-brand-cream px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading eyebrow={t('label')} title={t('title')} className="!mb-0" />
          </div>
        </div>

        <div className="space-y-12 lg:col-span-8">
          {sections.map((sec, sIdx) => (
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: sIdx * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-brand-gold-deep">
                {sec.section}
              </h3>
              <Accordion.Root type="single" collapsible className="divide-y divide-brand-line border-y border-brand-line">
                {sec.items.map((faq, i) => (
                  <Accordion.Item key={i} value={`sec-${sIdx}-faq-${i}`}>
                    <Accordion.Header>
                      <Accordion.Trigger
                        className={cn(
                          'group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left',
                          'text-base font-semibold text-brand-navy transition-colors hover:text-brand-gold-deep',
                        )}
                      >
                        <span>{faq.q}</span>
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-brand-navy/15 transition-colors duration-300 group-hover:border-brand-gold group-data-[state=open]:border-brand-gold group-data-[state=open]:bg-brand-gold">
                          <Plus className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-45" />
                        </span>
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <p className="max-w-2xl pb-6 pr-14 text-sm leading-relaxed text-brand-navy/70">{faq.a}</p>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
