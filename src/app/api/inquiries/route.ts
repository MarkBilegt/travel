import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { apiError, apiSuccess, verifyAdmin } from '@/lib/api-helpers'
import { createRateLimiter, getClientIp } from '@/lib/security'
import { parseInquiryInput } from '@/lib/inquiries'
import { isJoinable, mapDeparture, spotsLeft } from '@/lib/departures'
import { getTourField } from '@/lib/tour-locale'
import { sendInquiryEmails } from '@/lib/inquiry-email'

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000, globalLimit: 100 })

/**
 * POST /api/inquiries  (public) - quote request or group-departure sign-up.
 * No payment, no account. Saves the request, then e-mails the owner (Reply-To =
 * traveller) and the traveller (in their language).
 */
export async function POST(request: NextRequest) {
  if (!limiter.check(getClientIp(request))) return apiError('Too many requests', 429)
  try {
    const body = await request.json()
    // Honeypot: real visitors never fill this hidden field. Pretend success for bots.
    if (body && typeof body === 'object' && typeof (body as Record<string, unknown>).website === 'string' && (body as Record<string, string>).website !== '') {
      return apiSuccess({ success: true })
    }

    const parsed = parseInquiryInput(body)
    if (!parsed.ok) return apiError(`Invalid ${parsed.error}`, 400)
    const input = parsed.value
    const db = getSupabaseAdmin()

    // A sign-up must point at a real departure that can still take this group.
    let departure: ReturnType<typeof mapDeparture> | null = null
    if (input.departureId) {
      const { data } = await db.from('departures').select('*').eq('id', input.departureId).maybeSingle()
      if (!data) return apiError('Departure not found', 404)
      departure = mapDeparture(data)
      if (input.kind === 'signup') {
        if (!isJoinable(departure)) return apiError('Departure is not open', 409)
        if (input.adults + input.children > spotsLeft(departure)) return apiError('Not enough spots left', 409)
      }
      input.tourId = departure.tourId
    }

    let tourName: string | null = null
    if (input.tourId) {
      const { data } = await db.from('tours').select('title, translations').eq('id', input.tourId).eq('status', 'active').maybeSingle()
      if (data) tourName = getTourField({ title: data.title, translations: data.translations ?? {} }, 'title', input.locale)
      else input.tourId = null
    }

    const { error } = await db.from('inquiries').insert({
      kind: input.kind,
      name: input.name,
      email: input.email,
      phone: input.phone,
      country: input.country,
      locale: input.locale,
      tour_id: input.tourId,
      departure_id: input.departureId,
      travel_from: input.travelFrom,
      travel_to: input.travelTo,
      flexible: input.flexible,
      adults: input.adults,
      children: input.children,
      budget_per_day: input.budgetPerDay,
      interests: input.interests,
      accommodation_style: input.accommodationStyle,
      message: input.message,
    })
    if (error) {
      console.error('Inquiry save failed:', error)
      return apiError('Could not save the request', 500)
    }

    // The request is saved; e-mail problems are logged, never shown to the visitor.
    const errors = await sendInquiryEmails(input, {
      tourName,
      departure: departure ? { startDate: departure.startDate, endDate: departure.endDate } : null,
    })
    for (const e of errors) console.error('Inquiry e-mail failed:', e)

    return apiSuccess({ success: true })
  } catch {
    return apiError('Server error', 500)
  }
}

/** GET /api/inquiries  (admin) - newest first, with the tour and departure they refer to. */
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) return apiError('Unauthorized', 401)
    const { data, error } = await getSupabaseAdmin()
      .from('inquiries')
      .select('*, tours(title), departures(start_date, end_date)')
      .order('created_at', { ascending: false })
      .limit(300)
    if (error) return apiError(error.message, 500)

    return apiSuccess(
      (data ?? []).map((r) => ({
        id: r.id,
        kind: r.kind,
        status: r.status,
        name: r.name,
        email: r.email,
        phone: r.phone ?? null,
        country: r.country ?? null,
        locale: r.locale,
        tourId: r.tour_id ?? null,
        tourTitle: r.tours?.title ?? null,
        departureId: r.departure_id ?? null,
        departureStart: r.departures?.start_date ?? null,
        departureEnd: r.departures?.end_date ?? null,
        travelFrom: r.travel_from ?? null,
        travelTo: r.travel_to ?? null,
        flexible: r.flexible,
        adults: r.adults,
        children: r.children,
        budgetPerDay: r.budget_per_day === null ? null : Number(r.budget_per_day),
        interests: r.interests ?? [],
        accommodationStyle: r.accommodation_style ?? null,
        message: r.message ?? null,
        adminNotes: r.admin_notes ?? null,
        isRead: r.is_read,
        createdAt: r.created_at,
      })),
    )
  } catch {
    return apiError('Server error', 500)
  }
}
