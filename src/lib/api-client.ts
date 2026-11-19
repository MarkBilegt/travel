import type {
  Tour,
  Partner,
  ContentVideo,
  AdminStats,
  AdminSeoData,
} from '@/types'

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Request failed')
  return json.data as T
}

export interface ToursParams {
  status?: string
  category?: string
  featured?: boolean
  page?: number
  limit?: number
}

export async function fetchTours(params?: ToursParams): Promise<Tour[]> {
  const sp = new URLSearchParams()
  if (params?.status) sp.set('status', params.status)
  if (params?.category) sp.set('category', params.category)
  if (params?.featured) sp.set('featured', 'true')
  if (params?.page) sp.set('page', String(params.page))
  if (params?.limit) sp.set('limit', String(params.limit))
  return fetchJSON<Tour[]>(`/api/tours?${sp}`)
}

export async function fetchTour(idOrSlug: string): Promise<Tour> {
  return fetchJSON<Tour>(`/api/tours/${idOrSlug}`)
}

export async function fetchStats(): Promise<AdminStats> {
  return fetchJSON<AdminStats>('/api/admin/stats')
}

export async function fetchSeoStats(): Promise<AdminSeoData> {
  return fetchJSON<AdminSeoData>('/api/admin/seo')
}

export async function fetchPartners(): Promise<{ partners: Partner[] }> {
  return fetchJSON<{ partners: Partner[] }>('/api/partners')
}

export async function fetchVideos(): Promise<ContentVideo[]> {
  return fetchJSON<ContentVideo[]>('/api/content/videos')
}
