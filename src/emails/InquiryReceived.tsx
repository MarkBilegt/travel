import { Section, Text } from '@react-email/components'
import { BRAND_COLORS } from '@/lib/constants'
import type { EmailLocale } from './copy'
import { inquiryReceivedCopy } from './inquiry-copy'
import { ContactBlock, DetailTable, EmailShell, Row, formatEmailDate } from './layout'

export interface InquiryReceivedData {
  locale: EmailLocale
  kind: 'quote' | 'signup'
  name: string
  tourName: string | null
  /** Display text of the chosen departure, e.g. "10 Jul 2027 – 18 Jul 2027" */
  departureText: string | null
  travelFrom: string | null
  travelTo: string | null
  flexible: boolean
  adults: number
  children: number
  /** Already formatted, e.g. "120 €" */
  budgetPerDay: string | null
  /** Phone and e-mail shown at the bottom (from the contact settings) */
  contact?: { phone: string; email: string }
}

const { navy, goldDeep } = BRAND_COLORS

/** Acknowledgement to the traveller in their language. */
export function InquiryReceived(data: InquiryReceivedData) {
  const { locale, kind } = data
  const c = inquiryReceivedCopy[locale]
  const dates =
    data.travelFrom && data.travelTo
      ? `${formatEmailDate(data.travelFrom, locale)} – ${formatEmailDate(data.travelTo, locale)}`
      : data.travelFrom
        ? formatEmailDate(data.travelFrom, locale)
        : null

  return (
    <EmailShell locale={locale} preview={c.preview(kind)} footerNote={c.ignore}>
      <Section style={{ padding: '32px 32px 8px' }}>
        <Text style={{ margin: '0 0 18px', color: navy, fontSize: '26px', lineHeight: '32px', fontWeight: 700 }}>{c.heading(kind)}</Text>
        <Text style={{ margin: '0 0 8px', color: navy, fontSize: '15px', lineHeight: '24px' }}>{c.greeting(data.name)}</Text>
        <Text style={{ margin: 0, color: '#374151', fontSize: '15px', lineHeight: '24px' }}>{c.intro(kind, data.tourName)}</Text>
      </Section>

      <Section style={{ padding: '20px 32px 0' }}>
        <Text style={{ margin: '0 0 4px', color: navy, fontSize: '13px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          {c.summaryTitle}
        </Text>
        <DetailTable>
          {data.tourName && <Row label={c.tour} value={data.tourName} />}
          {data.departureText && <Row label={c.departure} value={data.departureText} strong />}
          {!data.departureText && dates && <Row label={c.dates} value={dates} />}
          {!data.departureText && data.flexible && <Row label={c.flexible} value="✓" />}
          <Row label={c.travelers} value={c.travelersValue(data.adults, data.children)} />
          {data.budgetPerDay && <Row label={c.budget} value={c.budgetValue(data.budgetPerDay)} />}
        </DetailTable>
      </Section>

      <Section style={{ padding: '24px 32px 0' }}>
        <Text style={{ margin: '0 0 4px', color: goldDeep, fontSize: '13px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          {c.nextTitle}
        </Text>
        <Text style={{ margin: 0, color: '#374151', fontSize: '14px', lineHeight: '22px' }}>{c.nextSteps(kind)}</Text>
      </Section>

      <ContactBlock label={c.questions} phone={data.contact?.phone} email={data.contact?.email} />
    </EmailShell>
  )
}
