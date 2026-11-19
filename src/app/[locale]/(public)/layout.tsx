import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createSupabasePublic } from '@/lib/supabase/public'
import { DEMO_TOURS, isDemoMode } from '@/data/demo-tours'
import type { Tour } from '@/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const toursRes = await
    // Cached (5 min) public client: the same list for every visitor.
    createSupabasePublic()
      .from('tours')
      .select('title, translations, slug, regions')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(100)

  const tourRows = (toursRes.data ?? []).length === 0 && isDemoMode()
    ? DEMO_TOURS.map((t) => ({ title: t.title, translations: t.translations, slug: t.slug, regions: t.regions }))
    : (toursRes.data ?? [])

  const footerTours = tourRows
    .slice(0, 6)
    .map((t) => ({ title: t.title, translations: (t.translations ?? {}) as Tour['translations'], slug: t.slug }))

  const uniqueRegions = [
    ...new Set(tourRows.flatMap((t) => t.regions ?? []).filter(Boolean) as string[]),
  ]

  return (
    <>
      <Navbar regions={uniqueRegions} />
      <main>{children}</main>
      <Footer tours={footerTours} />
    </>
  )
}
