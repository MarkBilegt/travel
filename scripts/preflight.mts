/**
 * Checks that the server settings are ready before deploying to Hostinger (or anywhere).
 *   npm run preflight                 uses the environment (and .env.local when present)
 *   npm run preflight -- --env-file=.env.production
 * It never prints a secret, and only reads from Supabase.
 */
import { existsSync, readFileSync } from 'node:fs'

const arg = process.argv.find((a) => a.startsWith('--env-file='))?.slice('--env-file='.length)
const file = arg ?? '.env.local'
const env: Record<string, string> = {}
if (existsSync(file)) {
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
  }
}
for (const [k, v] of Object.entries(process.env)) if (v && !(k in env)) env[k] = v

let failures = 0
let warnings = 0
const ok = (m: string) => console.log(`  ok    ${m}`)
const fail = (m: string) => (failures++, console.log(`  FAIL  ${m}`))
const warn = (m: string) => (warnings++, console.log(`  warn  ${m}`))
const check = (cond: unknown, good: string, bad: string) => {
  if (cond) ok(good)
  else fail(bad)
}

console.log(`Environment from ${existsSync(file) ? file : 'the process environment'}\n`)

console.log('Required settings')
for (const k of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'OWNER_EMAIL', 'NEXT_PUBLIC_APP_URL', 'ADMIN_PASSWORD', 'ADMIN_JWT_SECRET']) {
  check(env[k], k, `${k} is not set`)
}

console.log('\nValues')
const app = env.NEXT_PUBLIC_APP_URL
if (app) {
  if (!/^https:\/\/[^/\s]+$/.test(app)) fail('NEXT_PUBLIC_APP_URL must be the https address without a trailing slash, e.g. https://sainsanaa.net')
  else if (/example\.com|localhost/.test(app)) fail('NEXT_PUBLIC_APP_URL still points at a placeholder or localhost')
  else ok(`NEXT_PUBLIC_APP_URL = ${app}`)
}
if (env.ADMIN_PASSWORD) check(env.ADMIN_PASSWORD.length >= 12, 'ADMIN_PASSWORD has 12+ characters', 'ADMIN_PASSWORD must have at least 12 characters')
if (env.ADMIN_JWT_SECRET) check(env.ADMIN_JWT_SECRET.length >= 32, 'ADMIN_JWT_SECRET has 32+ characters', 'ADMIN_JWT_SECRET must have at least 32 characters')
if (env.NEXT_PUBLIC_DEMO_MODE === 'true') fail('NEXT_PUBLIC_DEMO_MODE=true must NOT be set in production (it shows sample tours)')
else ok('demo mode is off')
if (env.NEXT_PUBLIC_SUPABASE_URL && !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(env.NEXT_PUBLIC_SUPABASE_URL)) warn('NEXT_PUBLIC_SUPABASE_URL does not look like https://<project>.supabase.co')
if (env.RESEND_FROM_EMAIL && !/@/.test(env.RESEND_FROM_EMAIL)) fail('RESEND_FROM_EMAIL must contain an e-mail address')
if (env.RESEND_API_KEY && !env.RESEND_API_KEY.startsWith('re_')) warn('RESEND_API_KEY does not start with re_')
if (env.OWNER_EMAIL === env.RESEND_FROM_EMAIL) warn('OWNER_EMAIL and RESEND_FROM_EMAIL are the same address')

console.log('\nSupabase (read only)')
if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const base = env.NEXT_PUBLIC_SUPABASE_URL
  const headers = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' })
  const probe = async (table: string, key: string) => {
    try {
      const r = await fetch(`${base}/rest/v1/${table}?select=*`, { headers: headers(key) })
      return { status: r.status, count: r.headers.get('content-range')?.split('/')[1] ?? '?' }
    } catch {
      return null
    }
  }
  const first = await probe('tours', env.SUPABASE_SERVICE_ROLE_KEY)
  if (!first) fail('Cannot reach Supabase: check NEXT_PUBLIC_SUPABASE_URL and the internet connection')
  else if (first.status === 401 || first.status === 403) fail('Supabase refused the service-role key (wrong key or wrong project)')
  else {
    ok('Supabase reachable, service-role key accepted')
    for (const t of ['tours', 'departures', 'inquiries', 'testimonials', 'partners', 'articles', 'site_settings', 'site_texts', 'content_photos']) {
      const p = await probe(t, env.SUPABASE_SERVICE_ROLE_KEY)
      check(p && p.status < 300, `table ${t} (${p?.count} rows)`, `table ${t} is missing: run the migrations (001 to 020) in the SQL editor`)
    }
    const col = await fetch(`${base}/rest/v1/content_photos?select=storage_path&limit=1`, { headers: headers(env.SUPABASE_SERVICE_ROLE_KEY) }).catch(() => null)
    check(col?.ok, 'content_photos.storage_path (migration 020)', 'migration 020 is not applied')
    const tours = await probe('tours', env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    check(tours && tours.status < 300, 'the public (anon) key can read tours', 'the public (anon) key cannot read tours: check NEXT_PUBLIC_SUPABASE_ANON_KEY')
    const inquiriesAnon = await probe('inquiries', env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const leaks = inquiriesAnon && inquiriesAnon.status < 300 && inquiriesAnon.count !== '0'
    check(!leaks, 'visitors cannot read inquiries', 'SECURITY: the public key can read inquiries. Check that migration 014 enabled row level security')
    const bucket = await fetch(`${base}/storage/v1/bucket/media`, { headers: headers(env.SUPABASE_SERVICE_ROLE_KEY) }).catch(() => null)
    check(bucket?.ok, 'storage bucket "media" exists', 'storage bucket "media" is missing (migration 003/008)')
  }
}

console.log(`\n${failures === 0 ? 'READY' : 'NOT READY'}: ${failures} problem(s), ${warnings} warning(s)`)
process.exit(failures === 0 ? 0 : 1)
