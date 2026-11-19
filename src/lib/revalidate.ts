import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Call after every change made in the admin panel so visitors see it at once.
 * Public pages are cached for speed (ISR); without this an edit would only
 * appear after the cache expires.
 */
export function revalidateSite() {
  try {
    revalidateTag('cms', { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    // Not running inside Next.js (for example in a script): nothing to refresh.
  }
}
