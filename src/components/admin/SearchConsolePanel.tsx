'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  ExternalLink,
  FileText,
  Globe2,
  MousePointerClick,
  Search,
  TrendingUp,
} from 'lucide-react'
import { fetchSeoStats } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { AdminSeoMetric, AdminSeoRow } from '@/types'

type TabKey = 'queries' | 'pages' | 'countries'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'queries', label: 'Хайлтууд', icon: <Search className="w-4 h-4" /> },
  { key: 'pages', label: 'Хуудсууд', icon: <FileText className="w-4 h-4" /> },
  { key: 'countries', label: 'Улсууд', icon: <Globe2 className="w-4 h-4" /> },
]

const COUNTRY_NAMES: Record<string, string> = {
  mng: 'Монгол',
  usa: 'АНУ',
  kor: 'Өмнөд Солонгос',
  jpn: 'Япон',
  chn: 'Хятад',
  rus: 'Орос',
  deu: 'Герман',
  gbr: 'Их Британи',
  aus: 'Австрали',
  can: 'Канад',
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

function formatPosition(value: number): string {
  return value > 0 ? value.toFixed(1) : '-'
}

function formatChange(value: number, suffix = '%'): string {
  if (value === 0) return `0${suffix}`
  return `${value > 0 ? '+' : ''}${value}${suffix}`
}

function metricCards(summary: AdminSeoMetric, changes: AdminSeoMetric) {
  return [
    {
      label: 'Товшилт',
      value: formatNumber(summary.clicks),
      change: formatChange(changes.clicks),
      positive: changes.clicks >= 0,
      icon: <MousePointerClick className="w-4 h-4" />,
    },
    {
      label: 'Харагдац',
      value: formatNumber(summary.impressions),
      change: formatChange(changes.impressions),
      positive: changes.impressions >= 0,
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: 'CTR',
      value: formatPercent(summary.ctr),
      change: formatChange(changes.ctr, ' pts'),
      positive: changes.ctr >= 0,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      label: 'Дундаж байр',
      value: formatPosition(summary.position),
      change: formatChange(changes.position, ''),
      positive: changes.position >= 0,
      icon: <Search className="w-4 h-4" />,
    },
  ]
}

function rowLabel(row: AdminSeoRow, activeTab: TabKey): string {
  if (activeTab === 'countries') return COUNTRY_NAMES[row.key.toLowerCase()] ?? row.key.toUpperCase()
  if (activeTab === 'pages') {
    try {
      const url = new URL(row.key)
      return `${url.pathname}${url.search}`
    } catch {
      return row.key
    }
  }
  return row.key
}

function SeoRowsTable({ rows, activeTab }: { rows: AdminSeoRow[]; activeTab: TabKey }) {
  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Энэ хугацаанд Search Console-ийн мэдээлэл олдсонгүй.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-b border-admin-border text-xs uppercase tracking-wider text-gray-500">
            <th className="py-3 pr-4 font-semibold">{activeTab}</th>
            <th className="py-3 px-4 font-semibold text-right">Товшилт</th>
            <th className="py-3 px-4 font-semibold text-right">Харагдац</th>
            <th className="py-3 px-4 font-semibold text-right">CTR</th>
            <th className="py-3 pl-4 font-semibold text-right">Байр</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-border">
          {rows.map((row) => (
            <tr key={`${activeTab}-${row.key}`} className="text-sm">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <span className="max-w-[360px] truncate text-gray-200">{rowLabel(row, activeTab)}</span>
                  {activeTab === 'pages' && (
                    <a
                      href={row.key}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-500 hover:text-admin-accent"
                      aria-label="Хуудас нээх"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right text-white font-semibold">{formatNumber(row.clicks)}</td>
              <td className="py-3 px-4 text-right text-gray-300">{formatNumber(row.impressions)}</td>
              <td className="py-3 px-4 text-right text-gray-300">{formatPercent(row.ctr)}</td>
              <td className="py-3 pl-4 text-right text-gray-300">{formatPosition(row.position)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SearchConsolePanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('queries')
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-seo'],
    queryFn: fetchSeoStats,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const rows = useMemo(() => {
    if (!data) return []
    if (activeTab === 'pages') return data.topPages
    if (activeTab === 'countries') return data.countries
    return data.topQueries
  }, [activeTab, data])

  if (isLoading) {
    return (
      <section className="bg-admin-card border border-admin-border rounded-xl p-5 animate-pulse">
        <div className="h-5 w-48 bg-admin-bg rounded mb-5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 bg-admin-bg rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-admin-bg rounded-xl" />
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-admin-card border border-red-500/20 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-white font-semibold text-sm">Google SEO</p>
            <p className="text-red-300 text-sm mt-1">
              {error instanceof Error ? error.message : 'Google Search Console-ийн мэдээллийг ачаалж чадсангүй.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-2 rounded-lg bg-admin-accent text-white text-sm font-semibold hover:bg-admin-accent/90"
          >
            Дахин оролдох
          </button>
        </div>
      </section>
    )
  }

  if (!data?.configured) {
    return (
      <section className="bg-admin-card border border-admin-border rounded-xl p-5">
        <p className="text-white font-semibold text-sm">Google SEO</p>
        <p className="text-gray-400 text-sm mt-2">
          Google Search Console тохируулагдаагүй байна. Серверийн орчинд GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
          GOOGLE_REFRESH_TOKEN, GOOGLE_SEARCH_CONSOLE_SITE_URL нэмнэ үү.
        </p>
      </section>
    )
  }

  const cards = metricCards(data.summary, data.changes)

  return (
    <section className="bg-admin-card border border-admin-border rounded-xl p-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-5">
        <div>
          <p className="text-white font-semibold text-sm">Google SEO</p>
          <p className="text-gray-500 text-xs mt-1">
            {data.siteUrl} · {data.dateRange.startDate} to {data.dateRange.endDate}
          </p>
        </div>
        <p className="text-gray-500 text-xs max-w-md">
          {data.dateRange.previousStartDate} – {data.dateRange.previousEndDate} хугацаатай харьцуулсан.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-admin-bg border border-admin-border rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{card.label}</p>
              <div className="text-gray-500">{card.icon}</div>
            </div>
            <p className="text-white text-2xl font-bold">{card.value}</p>
            <p className={cn('text-xs font-semibold mt-2', card.positive ? 'text-green-400' : 'text-red-400')}>
              {card.change}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors',
              activeTab === tab.key
                ? 'bg-admin-accent text-white'
                : 'bg-admin-bg text-gray-400 hover:text-white'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <SeoRowsTable rows={rows} activeTab={activeTab} />
    </section>
  )
}
