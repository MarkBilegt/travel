const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD',
  'ADMIN_JWT_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'OWNER_EMAIL',
  'NEXT_PUBLIC_APP_URL',
]

export function validateEnv() {
  if (process.env.NODE_ENV !== 'production') {
    const missing = required.filter((key) => !process.env[key])
    if (missing.length > 0) {
      console.warn(`Missing env variables: ${missing.join(', ')}`)
    }
  }
}
