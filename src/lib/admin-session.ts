import { SignJWT, jwtVerify } from 'jose'

// Edge-safe (used by src/proxy.ts and API routes): only `jose`, no Node APIs.

export const ADMIN_COOKIE = 'admin_session'
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8
const ISSUER = 'travel-site'
const AUDIENCE = 'admin'

function secretKey(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET
  // Short secrets make HS256 tokens guessable; refuse them outright.
  if (!secret || secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

export async function signAdminSession(): Promise<string | null> {
  const key = secretKey()
  if (!key) return null
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_SECONDS}s`)
    .sign(key)
}

/** True only for an unexpired HS256 token we issued, with role=admin. */
export async function verifyAdminSession(token: string | undefined | null): Promise<boolean> {
  const key = secretKey()
  if (!token || !key) return false
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    })
    return payload.role === 'admin'
  } catch {
    return false
  }
}
