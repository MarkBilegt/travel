'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Inbox, Map, MessageSquareText } from 'lucide-react'
import { SearchConsolePanel } from '@/components/admin/SearchConsolePanel'
import { InquiriesChart, InquiryStatusChart } from '@/components/admin/InquiryCharts'
import { fetchStats } from '@/lib/api-client'
import { INQUIRY_STATUSES } from '@/lib/inquiries'
import { cn } from '@/lib/utils'

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-admin-accent/15 text-admin-accent',
  quoted: 'bg-amber-500/15 text-amber-300',
  confirmed: 'bg-emerald-500/15 text-emerald-300',
  lost: 'bg-gray-500/15 text-gray-400',
}

function Stat({ label, value, icon: Icon, href }: { label: string; value: number; icon: typeof Map; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-admin-border bg-admin-card p-5 transition-colors hover:border-gray-600">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <Icon className="h-4 w-4 text-gray-500" aria-hidden />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </Link>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading, error, refetch } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats })

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>Самбарыг ачаалж чадсангүй. Өгөгдлийн сангийн холболт болон migration-уудыг шалгана уу.</span>
          <button onClick={() => refetch()} className="font-semibold underline">
            Дахин оролдох
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Шинэ хүсэлт" value={stats?.newInquiries ?? 0} icon={Inbox} href="/admin/inquiries" />
        <Stat label="Нийт хүсэлт" value={stats?.totalInquiries ?? 0} icon={MessageSquareText} href="/admin/inquiries" />
        <Stat label="Идэвхтэй аялал" value={stats?.activeTours ?? 0} icon={Map} href="/admin/tours" />
        <Stat label="Удахгүй гарах аялал" value={stats?.upcomingDepartures ?? 0} icon={CalendarDays} href="/admin/departures" />
      </div>

      <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-3', isLoading && 'animate-pulse')}>
        <div className="rounded-xl border border-admin-border bg-admin-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-white">Сүүлийн 6 сарын хүсэлт</h2>
          <InquiriesChart data={stats?.inquiriesByMonth ?? []} />
        </div>
        <div className="rounded-xl border border-admin-border bg-admin-card p-5">
          <h2 className="mb-4 text-sm font-bold text-white">Төлвөөр</h2>
          <InquiryStatusChart data={stats?.statusChart ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-admin-border bg-admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Сүүлд ирсэн хүсэлт</h2>
            <Link href="/admin/inquiries" className="text-xs text-admin-accent hover:underline">
              Бүгдийг харах
            </Link>
          </div>
          {(stats?.recent ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">Одоогоор юу ч алга</p>
          ) : (
            <ul className="divide-y divide-admin-border">
              {stats?.recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{r.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {r.kind === 'signup' ? 'Бүлгийн аялалд бүртгүүлэх' : 'Үнийн санал хүсэлт'}
                      {r.tourTitle ? ` · ${r.tourTitle}` : ''}
                    </p>
                  </div>
                  <span className={cn('flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', STATUS_STYLE[r.status])}>
                    {INQUIRY_STATUSES.find((s) => s.key === r.status)?.label ?? r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-admin-border bg-admin-card p-5">
          <h2 className="mb-4 text-sm font-bold text-white">Хамгийн их хүсэлт ирсэн аяллууд (12 сар)</h2>
          {(stats?.topTours ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">Одоогоор юу ч алга</p>
          ) : (
            <ul className="space-y-4">
              {stats?.topTours.map((t) => (
                <li key={t.title}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="truncate pr-3 text-gray-300">{t.title}</span>
                    <span className="font-semibold text-white">{t.inquiries}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-admin-bg">
                    <div className="h-1.5 rounded-full bg-admin-accent" style={{ width: `${(t.inquiries / t.max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <SearchConsolePanel />
    </div>
  )
}
