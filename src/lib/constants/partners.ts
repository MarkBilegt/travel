export interface PartnerEntry {
  name: string
  logo: string | null
  url: string
  displayOrder: number
}

const TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN
/** Builds a logo URL from a domain via logo.dev (needs NEXT_PUBLIC_LOGO_DEV_TOKEN). */
export const logo = (domain: string): string | null =>
  TOKEN ? `https://img.logo.dev/${domain}?token=${TOKEN}&size=160&format=png` : null

// TODO(client): the client's real partners. The homepage "Partners" section is
// hidden while this list is empty. Example entry:
//   { name: 'Partner name', logo: logo('partner.mn'), url: 'https://partner.mn', displayOrder: 1 },
export const PARTNERS: PartnerEntry[] = []
