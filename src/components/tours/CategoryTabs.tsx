'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

export interface CategoryTab {
  value: string
  label: string
  count: number
}

interface CategoryTabsProps {
  tabs: CategoryTab[]
  active: string
  onChange: (value: string) => void
}

export function CategoryTabs({ tabs, active, onChange }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative">
      {/* Fade edge right */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                'flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-200',
                isActive
                  ? 'border-brand-navy bg-brand-navy text-white'
                  : 'border-brand-line text-brand-navy/70 hover:border-brand-navy/40 hover:text-brand-navy',
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'text-xs rounded-full px-2 py-0.5 font-bold',
                  isActive ? 'bg-brand-gold text-brand-navy' : 'bg-brand-cream text-brand-navy/60',
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
