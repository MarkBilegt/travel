import { SITE_CONFIG } from '@/lib/constants'
import { Resend } from 'resend'

// Created on first use: a missing key must only break e-mail sending, never
// the import of a route that merely contains an e-mail step.
let resendClient: Resend | null = null
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return (resendClient ??= new Resend(key))
}

const fromAddress = () => process.env.RESEND_FROM_EMAIL ?? SITE_CONFIG.emailFrom

/** Sends one e-mail and throws if Resend rejects it, so callers can log or ignore it uniformly. */
export async function deliver(message: { to: string; subject: string; html: string; replyTo?: string; from?: string }) {
  const result = await getResend().emails.send({ from: fromAddress(), ...message })
  if (result.error) throw new Error(`Resend rejected the e-mail: ${result.error.message}`)
  return result
}
