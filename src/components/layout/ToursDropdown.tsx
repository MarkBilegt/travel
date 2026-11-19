'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MapPin, ArrowRight, Globe2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'

interface ToursDropdownProps {
  label: string
  regions: string[]
}

export function ToursDropdown({ label, regions }: ToursDropdownProps) {
  const navT = useTranslations('nav')
  const toursT = useTranslations('tours')
  const regionLabels = toursT.raw('regionLabels') as Record<string, string>
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  if (regions.length === 0) {
    return (
      <Link
        href="/tours"
        className="text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
      >
        {label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/tours"
        className={cn(
          'flex items-center gap-1',
          'text-sm font-medium whitespace-nowrap',
          'text-white/80 hover:text-white transition-colors',
          open && 'text-white',
        )}
      >
        {label}
        <ChevronDown
          size={12}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
          >
            <div
              className={cn(
                'bg-brand-navy/95 backdrop-blur-xl',
                'border border-white/10 rounded-2xl shadow-2xl',
                'p-2 min-w-[200px]',
              )}
            >
              {regions.map((region) => (
                <Link
                  key={region}
                  href={`/tours?region=${encodeURIComponent(region)}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3',
                    'px-4 py-2.5 rounded-xl',
                    'text-white/80 hover:text-white',
                    'hover:bg-white/10',
                    'transition-colors duration-150',
                    'text-sm font-medium',
                    'group',
                  )}
                >
                  <MapPin className="h-4 w-4 text-brand-gold" />
                  <span className="flex-1">{regionLabels[region] ?? region}</span>
                  <span
                    className={cn(
                      'text-brand-gold opacity-0 group-hover:opacity-100',
                      'transition-opacity text-xs',
                    )}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}

              <div className="h-px bg-white/10 mx-2 my-1.5" />

              <Link
                href="/tours"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3',
                  'px-4 py-2.5 rounded-xl',
                  'text-brand-gold hover:bg-brand-gold/10',
                  'transition-colors duration-150',
                  'text-sm font-semibold',
                )}
              >
                <Globe2 className="h-4 w-4" />
                {navT('allTours')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
