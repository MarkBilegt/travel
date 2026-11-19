import { cache } from 'react'
import { createSupabasePublic } from '@/lib/supabase/public'
import { mergeSettings, type SiteSettings } from '@/lib/site-settings'

/**
 * Settings saved in the admin panel, over the built-in defaults. Never throws:
 * if the database is unreachable (or the table does not exist yet) the
 * defaults are used, so a missing migration cannot take the site down.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const { data } = await createSupabasePublic().from('site_settings').select('value').eq('key', 'site').maybeSingle()
    return mergeSettings(data?.value)
  } catch {
    return mergeSettings(null)
  }
})

/** Edited text groups for one language: { namespace: data }. Empty when none are saved. */
export const getTextOverrides = cache(async (locale: string): Promise<Record<string, unknown>> => {
  try {
    const { data } = await createSupabasePublic().from('site_texts').select('namespace, data').eq('locale', locale)
    return Object.fromEntries((data ?? []).map((r) => [r.namespace, r.data]))
  } catch {
    return {}
  }
})
