import { Button, Section, Text } from '@react-email/components'
import { BRAND_COLORS, SITE_URL } from '@/lib/constants'
import { inquiryNoticeCopy as c } from './inquiry-copy'
import { DetailTable, EmailShell, Row } from './layout'

export interface InquiryNotificationData {
  kind: 'quote' | 'signup'
  name: string
  email: string
  phone: string | null
  country: string | null
  locale: string
  tourName: string | null
  departureText: string | null
  dates: string | null
  flexible: boolean
  adults: number
  children: number
  budgetPerDay: string | null
  interests: string[]
  accommodation: string | null
  message: string | null
}

const { navy, gold } = BRAND_COLORS

/** Owner alert for a new quote request or sign-up. Team-facing, Mongolian. */
export function InquiryNotification(d: InquiryNotificationData) {
  return (
    <EmailShell locale="mn" preview={c.preview(d.name)}>
      <Section style={{ padding: '32px 32px 8px' }}>
        <Text style={{ margin: '0 0 12px', color: navy, fontSize: '24px', lineHeight: '30px', fontWeight: 700 }}>{c.heading(d.kind)}</Text>
        <Text style={{ margin: 0, color: '#374151', fontSize: '15px', lineHeight: '24px' }}>{c.body}</Text>
      </Section>

      <Section style={{ padding: '16px 32px 0' }}>
        <DetailTable>
          <Row label={c.name} value={d.name} strong />
          <Row label={c.email} value={d.email} />
          <Row label={c.phone} value={d.phone || '-'} />
          <Row label={c.country} value={d.country || '-'} />
          <Row label={c.language} value={d.locale.toUpperCase()} />
          <Row label={c.tour} value={d.tourName || '-'} />
          {d.departureText && <Row label={c.departure} value={d.departureText} strong />}
          {d.dates && <Row label={c.dates} value={d.dates} />}
          {d.flexible && <Row label={c.flexible} value="✓" />}
          <Row label={c.travelers} value={c.travelersValue(d.adults, d.children)} />
          {d.budgetPerDay && <Row label={c.budget} value={d.budgetPerDay} />}
          {d.interests.length > 0 && <Row label={c.interests} value={d.interests.join(', ')} />}
          {d.accommodation && <Row label={c.accommodation} value={d.accommodation} />}
        </DetailTable>
      </Section>

      {d.message && (
        <Section style={{ padding: '16px 32px 0' }}>
          <Text style={{ margin: '0 0 4px', color: navy, fontSize: '13px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{c.message}</Text>
          <Text style={{ margin: 0, color: '#374151', fontSize: '14px', lineHeight: '22px', whiteSpace: 'pre-wrap' }}>{d.message}</Text>
        </Section>
      )}

      <Section style={{ padding: '24px 32px 32px', textAlign: 'center' }}>
        <Button
          href={`${SITE_URL}/admin/inquiries`}
          style={{ backgroundColor: gold, color: navy, fontSize: '15px', fontWeight: 700, padding: '14px 32px', borderRadius: '999px', textDecoration: 'none', display: 'inline-block' }}
        >
          {c.button}
        </Button>
      </Section>
    </EmailShell>
  )
}
