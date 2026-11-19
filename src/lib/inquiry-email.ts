import { render } from '@react-email/render'
import { SITE_CONFIG } from '@/lib/constants'
import { deliver } from '@/lib/email'
import { getSiteSettings } from '@/lib/cms-data'
import { formatPrice } from '@/lib/utils'
import { INTL_LOCALE, toLocale } from '@/i18n/locales'
import { ACCOMMODATIONS, ACTIVITIES } from '@/lib/tour-options'
import type { InquiryInput } from '@/lib/inquiries'
import { InquiryReceived } from '@/emails/InquiryReceived'
import { InquiryNotification } from '@/emails/InquiryNotification'
import { inquiryNoticeCopy, inquiryReceivedCopy } from '@/emails/inquiry-copy'

export interface InquiryEmailContext {
  /** Tour title in the traveller's language, when the request is about a tour. */
  tourName: string | null
  /** Start and end date (YYYY-MM-DD) of the chosen group departure. */
  departure: { startDate: string; endDate: string } | null
}

const label = (list: readonly { key: string; label: string }[], key: string) => list.find((x) => x.key === key)?.label ?? key

function dateText(from: string, to: string | null, locale: string): string {
  const fmt = new Intl.DateTimeFormat(INTL_LOCALE[toLocale(locale)], { day: 'numeric', month: 'long', year: 'numeric' })
  const f = (d: string) => fmt.format(new Date(`${d}T00:00:00`))
  return to ? `${f(from)} – ${f(to)}` : f(from)
}

/**
 * Sends the owner alert (Reply-To = traveller) and the acknowledgement to the
 * traveller. Each step is independent: one failing must not hide the other.
 * Returns the errors so the caller can log them; the request itself still succeeded.
 */
export async function sendInquiryEmails(input: InquiryInput, ctx: InquiryEmailContext): Promise<unknown[]> {
  const errors: unknown[] = []
  const settings = await getSiteSettings()
  // Who gets the alert: the address set in the admin panel, else OWNER_EMAIL, else the public e-mail
  const ownerAddress = () => settings.notifyEmail || process.env.OWNER_EMAIL || settings.email
  const locale = input.locale
  const budget = input.budgetPerDay ? formatPrice(input.budgetPerDay, 'EUR', locale) : null
  const departureText = ctx.departure ? dateText(ctx.departure.startDate, ctx.departure.endDate, locale) : null

  try {
    const html = await render(
      InquiryNotification({
        kind: input.kind,
        name: input.name,
        email: input.email,
        phone: input.phone,
        country: input.country,
        locale,
        tourName: ctx.tourName,
        departureText,
        dates: input.travelFrom ? dateText(input.travelFrom, input.travelTo, locale) : null,
        flexible: input.flexible,
        adults: input.adults,
        children: input.children,
        budgetPerDay: budget,
        interests: input.interests.map((k) => label(ACTIVITIES, k)),
        accommodation: input.accommodationStyle ? label(ACCOMMODATIONS, input.accommodationStyle) : null,
        message: input.message,
      }),
    )
    await deliver({ to: ownerAddress(), replyTo: input.email, subject: inquiryNoticeCopy.subject(input.kind, input.name), html })
  } catch (e) {
    errors.push(e)
  }

  try {
    const html = await render(
      InquiryReceived({
        locale,
        kind: input.kind,
        name: input.name,
        tourName: ctx.tourName,
        departureText,
        travelFrom: input.travelFrom,
        travelTo: input.travelTo,
        flexible: input.flexible,
        adults: input.adults,
        children: input.children,
        budgetPerDay: budget,
        contact: { phone: settings.phone, email: settings.email },
      }),
    )
    await deliver({ to: input.email, replyTo: ownerAddress(), subject: inquiryReceivedCopy[locale].subject(input.kind, SITE_CONFIG.name), html })
  } catch (e) {
    errors.push(e)
  }
  return errors
}
