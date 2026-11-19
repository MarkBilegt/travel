'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  /** Render the last word of the title in the italic editorial accent face. */
  accentLastWord?: boolean
  description?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  action?: React.ReactNode
  className?: string
}

/** Splits "Popular Tours" into ["Popular", "Tours"]. */
function splitLastWord(title: string): [string, string] {
  const trimmed = title.trim()
  const i = trimmed.lastIndexOf(' ')
  if (i === -1) return ['', trimmed]
  return [trimmed.slice(0, i), trimmed.slice(i + 1)]
}

export function SectionHeading({
  eyebrow,
  title,
  accentLastWord = true,
  description,
  align = 'left',
  tone = 'light',
  action,
  className,
}: SectionHeadingProps) {
  const [head, last] = accentLastWord ? splitLastWord(title) : [title, '']
  const dark = tone === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'mb-10 flex flex-col gap-6 md:mb-14',
        align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p
            className={cn(
              'mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]',
              align === 'center' && 'justify-center',
              dark ? 'text-brand-gold' : 'text-brand-gold-deep',
            )}
          >
            <span className={cn('h-px w-8', dark ? 'bg-brand-gold' : 'bg-brand-gold-deep')} aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            'text-4xl leading-[0.95] uppercase sm:text-5xl lg:text-6xl',
            dark ? 'text-white' : 'text-brand-navy',
          )}
        >
          {head}
          {head && ' '}
          {last && (
            <span
              className={cn(
                'font-accent text-[1.08em] font-medium normal-case italic tracking-normal',
                dark ? 'text-brand-gold' : 'text-brand-gold-deep',
              )}
            >
              {last.toLocaleLowerCase()}
            </span>
          )}
        </h2>
        {description && (
          <p className={cn('mt-5 max-w-xl text-base leading-relaxed', dark ? 'text-white/65' : 'text-brand-navy/65')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  )
}
