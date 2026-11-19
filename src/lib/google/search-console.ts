import type { AdminSeoData, AdminSeoMetric, AdminSeoRow } from '@/types'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SEARCH_CONSOLE_BASE_URL = 'https://www.googleapis.com/webmasters/v3/sites'
const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

interface GoogleTokenResponse {
  access_token?: string
  scope?: string
  error?: string
  error_description?: string
}

interface SearchAnalyticsRow {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[]
  error?: {
    message?: string
  }
}

export class SearchConsoleError extends Error {
  constructor(message: string, public status = 502) {
    super(message)
    this.name = 'SearchConsoleError'
  }
}

function emptyMetric(): AdminSeoMetric {
  return { clicks: 0, impressions: 0, ctr: 0, position: 0 }
}

function isConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
  )
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function getDateRange() {
  const today = new Date()
  const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1))
  const startDate = addDays(endDate, -27)
  const previousEndDate = addDays(startDate, -1)
  const previousStartDate = addDays(previousEndDate, -27)

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    previousStartDate: formatDate(previousStartDate),
    previousEndDate: formatDate(previousEndDate),
  }
}

function toMetric(row?: SearchAnalyticsRow): AdminSeoMetric {
  return {
    clicks: Math.round(row?.clicks ?? 0),
    impressions: Math.round(row?.impressions ?? 0),
    ctr: Number(((row?.ctr ?? 0) * 100).toFixed(2)),
    position: Number((row?.position ?? 0).toFixed(1)),
  }
}

function toRows(rows?: SearchAnalyticsRow[]): AdminSeoRow[] {
  return (rows ?? []).map((row) => ({
    key: row.keys?.[0] ?? 'Unknown',
    ...toMetric(row),
  }))
}

function metricChanges(current: AdminSeoMetric, previous: AdminSeoMetric): AdminSeoMetric {
  return {
    clicks: previous.clicks > 0 ? Number((((current.clicks - previous.clicks) / previous.clicks) * 100).toFixed(1)) : 0,
    impressions: previous.impressions > 0
      ? Number((((current.impressions - previous.impressions) / previous.impressions) * 100).toFixed(1))
      : 0,
    ctr: Number((current.ctr - previous.ctr).toFixed(2)),
    position: Number((previous.position - current.position).toFixed(1)),
  }
}

async function getAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? '',
    grant_type: 'refresh_token',
  })

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const json = await response.json() as GoogleTokenResponse

  if (!response.ok || !json.access_token) {
    throw new SearchConsoleError(
      json.error_description ?? json.error ?? 'Could not authenticate with Google Search Console',
      response.status || 502
    )
  }

  if (json.scope && !json.scope.includes(SEARCH_CONSOLE_SCOPE)) {
    throw new SearchConsoleError('Google refresh token is missing Search Console read access', 403)
  }

  return json.access_token
}

async function querySearchAnalytics(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[] = [],
  rowLimit = 10
): Promise<SearchAnalyticsResponse> {
  const response = await fetch(`${SEARCH_CONSOLE_BASE_URL}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit,
      searchType: 'web',
    }),
  })
  const json = await response.json() as SearchAnalyticsResponse

  if (!response.ok) {
    throw new SearchConsoleError(
      json.error?.message ?? 'Could not load Google Search Console data',
      response.status || 502
    )
  }

  return json
}

export async function getSearchConsoleDashboard(): Promise<AdminSeoData> {
  const dateRange = getDateRange()
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? null

  if (!isConfigured()) {
    return {
      configured: false,
      siteUrl,
      dateRange,
      summary: emptyMetric(),
      previousSummary: emptyMetric(),
      changes: emptyMetric(),
      topQueries: [],
      topPages: [],
      countries: [],
    }
  }

  const accessToken = await getAccessToken()
  const [summary, previousSummary, topQueries, topPages, countries] = await Promise.all([
    querySearchAnalytics(accessToken, siteUrl!, dateRange.startDate, dateRange.endDate, [], 1),
    querySearchAnalytics(accessToken, siteUrl!, dateRange.previousStartDate, dateRange.previousEndDate, [], 1),
    querySearchAnalytics(accessToken, siteUrl!, dateRange.startDate, dateRange.endDate, ['query'], 10),
    querySearchAnalytics(accessToken, siteUrl!, dateRange.startDate, dateRange.endDate, ['page'], 10),
    querySearchAnalytics(accessToken, siteUrl!, dateRange.startDate, dateRange.endDate, ['country'], 10),
  ])

  const currentMetric = toMetric(summary.rows?.[0])
  const previousMetric = toMetric(previousSummary.rows?.[0])

  return {
    configured: true,
    siteUrl,
    dateRange,
    summary: currentMetric,
    previousSummary: previousMetric,
    changes: metricChanges(currentMetric, previousMetric),
    topQueries: toRows(topQueries.rows),
    topPages: toRows(topPages.rows),
    countries: toRows(countries.rows),
  }
}
