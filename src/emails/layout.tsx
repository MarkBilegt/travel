import { INTL_LOCALE } from '@/i18n/locales'
import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'
import { BRAND_COLORS, SITE_CONFIG } from '@/lib/constants'
import { formatPrice, type Currency } from '@/lib/utils'
import type { ShellLocale } from './copy'

const { navy } = BRAND_COLORS
export const EMAIL_LINE = '#E2D9CB'

/** Outer frame shared by every e-mail: brand header, white card, dark footer. */
export function EmailShell({
  locale,
  preview,
  footerNote,
  children,
}: {
  locale: ShellLocale
  preview: string
  footerNote?: string
  children: React.ReactNode
}) {
  const brand = SITE_CONFIG.name
  const legal = SITE_CONFIG.legalName

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: '24px 12px', backgroundColor: '#F1ECE3', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden' }}>
          <Section style={{ backgroundColor: navy, padding: '22px 32px' }}>
            <Text style={{ margin: 0, color: '#ffffff', fontSize: '15px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
              {brand}
            </Text>
          </Section>
          {children}
          <Section style={{ backgroundColor: navy, padding: '16px 32px', textAlign: 'center' }}>
            {footerNote && <Text style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{footerNote}</Text>}
            <Text style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
              © {new Date().getFullYear()} {legal}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

/** One label/value line of a details table. */
export function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <tr>
      <td style={{ padding: '9px 0', color: '#6b7280', fontSize: '14px', borderBottom: `1px solid ${EMAIL_LINE}`, width: '40%', verticalAlign: 'top' }}>{label}</td>
      <td style={{ padding: '9px 0', color: navy, fontSize: '14px', fontWeight: strong ? 700 : 500, borderBottom: `1px solid ${EMAIL_LINE}`, textAlign: 'right', wordBreak: 'break-word' }}>
        {value}
      </td>
    </tr>
  )
}

export function DetailTable({ children }: { children: React.ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ borderCollapse: 'collapse' }}>
      <tbody>{children}</tbody>
    </table>
  )
}

/** "Questions? phone · email" block. */
export function ContactBlock({ label, phone = SITE_CONFIG.phone, email = SITE_CONFIG.email }: { label: string; phone?: string; email?: string }) {
  const tel = phone.replace(/[^+\d]/g, '')
  return (
    <Section style={{ padding: '16px 32px 28px' }}>
      <Hr style={{ borderColor: EMAIL_LINE, margin: '0 0 18px' }} />
      <Text style={{ margin: '0 0 6px', color: '#374151', fontSize: '14px' }}>{label}</Text>
      <Text style={{ margin: 0, fontSize: '14px', lineHeight: '22px' }}>
        <Link href={`tel:${tel}`} style={{ color: navy, fontWeight: 700, textDecoration: 'none' }}>{phone}</Link>
        {'  ·  '}
        <Link href={`mailto:${email}`} style={{ color: navy, fontWeight: 700, textDecoration: 'none' }}>{email}</Link>
      </Text>
    </Section>
  )
}

export const formatMoney = (n: number, currency: Currency = 'EUR', locale?: string) => formatPrice(n, currency, locale)

export function formatEmailDate(iso: string, locale: ShellLocale): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale === 'mn' ? 'mn-MN' : INTL_LOCALE[locale], { year: 'numeric', month: 'long', day: 'numeric' })
}
