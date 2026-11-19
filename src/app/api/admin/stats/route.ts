import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { INQUIRY_STATUSES } from '@/lib/inquiries'
import type { AdminStats } from '@/types'

// PostgREST silently truncates unpaged results at 1000 rows: ask for an explicit range.
const ROW_LIMIT = 10_000
const STATUS_COLORS: Record<string, string> = { new: '#4f7ef7', quoted: '#F59E0B', confirmed: '#22C55E', lost: '#6B7280' }

type RecentRow = { id: string; kind: 'quote' | 'signup'; status: string; name: string; created_at: string; tours: { title: string } | null }
type TopRow = { tours: { title: string } | null }

/** GET /api/admin/stats - dashboard numbers built from tours, departures and inquiries. */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)

    const db = getSupabaseAdmin()
    const now = new Date()
    const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()
    const topStart = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()
    const today = now.toISOString().slice(0, 10)

    const [toursCount, departuresCount, windowRes, statusRes, topRes, recentRes] = await Promise.all([
      db.from('tours').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      db.from('departures').select('*', { count: 'exact', head: true }).neq('status', 'cancelled').gte('start_date', today),
      db.from('inquiries').select('created_at').gte('created_at', windowStart).limit(ROW_LIMIT),
      db.from('inquiries').select('status').limit(ROW_LIMIT),
      db.from('inquiries').select('tours(title)').not('tour_id', 'is', null).gte('created_at', topStart).limit(ROW_LIMIT),
      db.from('inquiries').select('id, kind, status, name, created_at, tours(title)').order('created_at', { ascending: false }).limit(5),
    ])

    const inquiriesByMonth = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return {
        month: d.toLocaleDateString('en-GB', { month: 'short' }),
        inquiries: (windowRes.data ?? []).filter((r) => r.created_at?.startsWith(key)).length,
      }
    })

    const statusCounts = new Map<string, number>()
    for (const r of statusRes.data ?? []) statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1)

    const perTour = new Map<string, number>()
    for (const r of (topRes.data ?? []) as unknown as TopRow[]) {
      if (r.tours) perTour.set(r.tours.title, (perTour.get(r.tours.title) ?? 0) + 1)
    }
    const top = [...perTour.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    const max = Math.max(1, ...top.map(([, n]) => n))

    const stats: AdminStats = {
      activeTours: toursCount.count ?? 0,
      upcomingDepartures: departuresCount.count ?? 0,
      newInquiries: statusCounts.get('new') ?? 0,
      totalInquiries: statusRes.data?.length ?? 0,
      inquiriesByMonth,
      statusChart: INQUIRY_STATUSES.map((s) => ({ name: s.label, value: statusCounts.get(s.key) ?? 0, color: STATUS_COLORS[s.key] })),
      topTours: top.map(([title, inquiries]) => ({ title, inquiries, max })),
      recent: ((recentRes.data ?? []) as unknown as RecentRow[]).map((r) => ({
        id: r.id,
        kind: r.kind,
        status: r.status,
        name: r.name,
        tourTitle: r.tours?.title ?? null,
        createdAt: r.created_at,
      })),
    }
    return apiSuccess(stats)
  } catch {
    return apiError('Server error', 500)
  }
}
