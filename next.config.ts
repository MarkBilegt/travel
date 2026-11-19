import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'
import { LEGACY_REDIRECTS } from './src/lib/legacy-redirects'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const isDev = process.env.NODE_ENV !== 'production'
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin
  } catch {
    return ''
  }
})()

// Content-Security-Policy. 'unsafe-inline' for scripts/styles is required by
// Next.js hydration and Framer Motion inline styles unless nonces are wired up;
// the rest of the policy still blocks foreign scripts, plugins, framing by
// other sites and form posts to other origins. Add hosts here when embedding
// new third-party content.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace(/^https/, 'wss')}${isDev ? ' ws: http://localhost:*' : ''}`.trim(),
  'frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.facebook.com https://maps.google.com https://www.google.com',
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
]

const nextConfig: NextConfig = {
  compress: true,
  // Do not advertise the framework in a response header
  poweredByHeader: false,
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'img.logo.dev' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // 301-equivalent (308) redirects from the old WordPress site, to keep search rankings
  async redirects() {
    return LEGACY_REDIRECTS.map((x) => ({ ...x, permanent: true }))
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      // No custom rule for /_next/static: Next.js already serves hashed build
      // assets as immutable in production, and forcing it in dev makes the
      // browser keep stale bundles after code changes.
    ]
  },
};

export default withNextIntl(nextConfig);
