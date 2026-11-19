import { createClient } from '@supabase/supabase-js'

export function createSupabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) => fetch(input, {
          ...init,
          next: { revalidate: 300, tags: ['cms'] },
        }),
      },
    },
  )
}
