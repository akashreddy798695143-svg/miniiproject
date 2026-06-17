import { randomInt } from 'crypto'

/**
 * SMS / OTP Service
 * ------------------
 * Generates real 6-digit OTPs and sends them to a mobile number via SMS.
 *
 * In production, set one of the supported SMS provider environment variables
 * (e.g. MSG91_AUTH_KEY, TWILIO_*) and OTPs will be delivered to the user's
 * phone for real.
 *
 * In the sandbox / demo environment (no provider configured), the OTP is
 * returned to the caller so the UI can surface it to the user via a toast /
 * info box. This keeps the flow fully functional end-to-end while making it
 * clear that a real SMS gateway is not wired up.
 */

export interface SendOtpResult {
  delivered: boolean
  otp: string
  demo: boolean
  message: string
  provider?: string
}

/** Generate a cryptographically-random 6-digit OTP. */
export function generateOtp(): string {
  // randomInt(100000, 1000000) → [100000, 999999]
  return String(randomInt(100000, 1000000))
}

/** Normalise an Indian-style phone number to E.164-ish (+91XXXXXXXXXX). */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  // Remove leading 91 if present and re-add as +91
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2)
  }
  // Strip a leading 0
  if (digits.startsWith('0')) digits = digits.slice(1)
  return `+91${digits}`
}

/** Validate that the phone has a 10-digit Indian mobile number. */
export function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, '')
  const ten = digits.startsWith('91') && digits.length === 12
    ? digits.slice(2)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits
  return /^[6-9]\d{9}$/.test(ten)
}

/**
 * Send an OTP to the given phone number.
 * Returns delivery status + the OTP (so the demo UI can display it).
 */
export async function sendOtpSms(phone: string, otp: string): Promise<SendOtpResult> {
  const to = normalizePhone(phone)

  // ── Provider: MSG91 ────────────────────────────────────────────────
  const msg91Key = process.env.MSG91_AUTH_KEY
  const msg91Sender = process.env.MSG91_SENDER_ID || 'SHOZNE'
  const msg91Template = process.env.MSG91_TEMPLATE_ID

  if (msg91Key) {
    try {
      const url = new URL('https://api.msg91.com/api/v5/otp')
      url.searchParams.set('authkey', msg91Key)
      url.searchParams.set('mobile', to)
      url.searchParams.set('template_id', msg91Template || '')
      url.searchParams.set('otp', otp)
      url.searchParams.set('sender', msg91Sender)

      const res = await fetch(url.toString(), { method: 'GET' })
      const data = await res.json().catch(() => ({}))
      const ok = res.ok && data.type !== 'error'
      return {
        delivered: ok,
        otp,
        demo: false,
        provider: 'msg91',
        message: ok
          ? `OTP sent to ${to} via SMS`
          : `SMS provider returned an error: ${data.message || res.statusText}`,
      }
    } catch (err) {
      console.error('MSG91 send error:', err)
      // fall through to demo mode
    }
  }

  // ── Provider: Twilio (REST API) ────────────────────────────────────
  const twilioSid = process.env.TWILIO_ACCOUNT_SID
  const twilioToken = process.env.TWILIO_AUTH_TOKEN
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: twilioFrom,
            Body: `${otp} is your ShopZone login OTP. Valid for 10 minutes. Do not share it with anyone.`,
          }),
        }
      )
      const ok = res.ok
      return {
        delivered: ok,
        otp,
        demo: false,
        provider: 'twilio',
        message: ok ? `OTP sent to ${to} via SMS` : 'SMS provider returned an error',
      }
    } catch (err) {
      console.error('Twilio send error:', err)
      // fall through to demo mode
    }
  }

  // ── Demo fallback (sandbox / no provider configured) ───────────────
  console.info(`[SMS Demo Mode] OTP for ${to}: ${otp}`)
  return {
    delivered: false,
    otp,
    demo: true,
    message: `Demo mode: No SMS provider configured. OTP is ${otp}`,
  }
}
