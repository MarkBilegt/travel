'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'
import { SafeImage } from '@/components/ui/SafeImage'

const EASE = [0.16, 1, 0.3, 1] as const

export interface PageHeroProps {
  eyebrow?: string
  /** Display lines (uppercase poster face). */
  title: string[]
  /** Optional line rendered in the italic editorial accent face, after the title. */
  accent?: string
  description?: string
  image: string
  imageAlt?: string
  breadcrumbs?: { label: string; href?: string }[]
  /** Right-hand slot on desktop (stats, contact chips…); stacks below on phones. */
  aside?: React.ReactNode
  size?: 'md' | 'lg'
  className?: string
}

/** Shared hero for inner pages: photo, gradient, bottom-left editorial title. */
export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  image,
  imageAlt = '',
  breadcrumbs,
  aside,
  size = 'md',
  className,
}: PageHeroProps) {
  const reduceMotion = useReducedMotion()
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  }

  return (
    <section
      className={cn(
        'relative isolate flex items-end overflow-hidden bg-brand-navy',
        size === 'lg' ? 'min-h-[88svh]' : 'min-h-[68svh] md:min-h-[600px]',
        className,
      )}
    >
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ scale: reduceMotion ? 1 : 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 2.4, ease: EASE }}
      >
        <SafeImage src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy via-brand-navy/45 to-brand-navy/25" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy/70 via-transparent to-transparent" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
        className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-14 pt-36 sm:px-8 md:pb-20 lg:grid-cols-12 lg:items-end"
      >
        <div className="lg:col-span-8">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <motion.nav variants={item} aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-white/60">
                {breadcrumbs.map((b, i) => (
                  <li key={`${b.label}-${i}`} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
                    {b.href ? (
                      <Link href={b.href} className="transition-colors hover:text-white">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-white/90" aria-current="page">
                        {b.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </motion.nav>
          )}

          {eyebrow && (
            <motion.p
              variants={item}
              className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold"
            >
              <span aria-hidden className="h-px w-8 bg-brand-gold" />
              {eyebrow}
            </motion.p>
          )}

          <h1 className="text-white">
            {title.map((line, i) => (
              <span key={`${line}-${i}`} className="block overflow-hidden pb-1">
                <motion.span
                  variants={{ hidden: { y: '105%' }, show: { y: 0, transition: { duration: 0.9, ease: EASE } } }}
                  className="block text-[clamp(2.75rem,8vw,6.5rem)] font-bold uppercase leading-[0.9]"
                >
                  {line}
                </motion.span>
              </span>
            ))}
            {accent && (
              <span className="block overflow-hidden pb-2">
                <motion.span
                  variants={{ hidden: { y: '110%' }, show: { y: 0, transition: { duration: 0.9, ease: EASE } } }}
                  className="block font-accent text-[clamp(2rem,5vw,4rem)] font-medium italic leading-[1.05] text-white/95"
                >
                  {accent}
                </motion.span>
              </span>
            )}
          </h1>

          {description && (
            <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              {description}
            </motion.p>
          )}
        </div>

        {aside && (
          <motion.div variants={item} className="lg:col-span-4">
            {aside}
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
