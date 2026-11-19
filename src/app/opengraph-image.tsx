import { SITE_CONFIG } from '@/lib/constants'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = `${SITE_CONFIG.name} - Mongolia Travel Cooperative`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0E1A22',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Gold accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#E2733A',
          }}
        />

        {/* Gold globe icon placeholder */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#E2733A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            fontSize: 40,
          }}
        >
          ✈
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#E2733A',
            marginBottom: 20,
          }}
        >
          TRAVEL AGENCY
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: -2,
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          {SITE_CONFIG.name.toUpperCase()}
        </div>

        <div
          style={{
            fontSize: 28,
            color: '#1E5B66',
            background: 'rgba(30,91,102,0.15)',
            padding: '10px 32px',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {SITE_CONFIG.domain}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: '#1E5B66',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
