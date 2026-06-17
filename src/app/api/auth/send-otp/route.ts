import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOtp, sendOtpSms, isValidPhone, normalizePhone } from '@/lib/sms'

/**
 * POST /api/auth/send-otp
 * Body: { phone: string, name?: string, purpose?: 'login' | 'register' }
 *
 * Generates a real 6-digit OTP, stores it in the OTPVerification table
 * (10-minute expiry) and dispatches it to the user's mobile via SMS.
 *
 * In demo mode (no SMS provider configured) the generated OTP is returned
 * in the response so the UI can surface it to the user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name, purpose = 'login' } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)

    // Rate-limit: prevent a new OTP if an unverified one was issued < 30s ago
    const recent = await db.oTPVerification.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        isVerified: false,
        createdAt: { gt: new Date(Date.now() - 30 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (recent) {
      return NextResponse.json(
        { error: 'Please wait a few seconds before requesting another OTP' },
        { status: 429 }
      )
    }

    // Generate a fresh OTP
    const otp = generateOtp()

    // Persist it (expires in 10 minutes)
    await db.oTPVerification.create({
      data: {
        phone: normalizedPhone,
        otp,
        purpose,
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    // Send via SMS (returns demo info when no provider is configured)
    const sms = await sendOtpSms(normalizedPhone, otp)

    return NextResponse.json(
      {
        message: sms.delivered
          ? `OTP sent to ${normalizedPhone} via SMS`
          : sms.message,
        demo: sms.demo,
        otp: sms.demo ? otp : undefined, // only expose OTP in demo mode
        phone: normalizedPhone,
        provider: sms.provider,
        name,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send OTP API error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    )
  }
}
