import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { normalizePhone, isValidPhone } from '@/lib/sms'

/**
 * POST /api/auth/verify-otp
 * Body: { phone: string, otp: string, name?: string, purpose?: 'login' | 'register' }
 *
 * Verifies the OTP against the OTPVerification table (must match phone + otp,
 * must not be expired, must not already be verified). On success it marks the
 * OTP as verified and finds-or-creates a User with provider='phone', then
 * returns the user object so the client can log in.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, otp, name, purpose = 'login' } = body

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be a 6-digit number' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)

    // Find the most recent unverified OTP for this phone + purpose
    const record = await db.oTPVerification.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        isVerified: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'No OTP request found. Please request a new OTP.' },
        { status: 404 }
      )
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    if (record.otp !== otp) {
      return NextResponse.json(
        { error: 'Incorrect OTP. Please try again.' },
        { status: 401 }
      )
    }

    // Mark the OTP as verified
    await db.oTPVerification.update({
      where: { id: record.id },
      data: { isVerified: true },
    })

    // Find-or-create a phone-based user
    let user = await db.user.findFirst({
      where: { phone: normalizedPhone, provider: 'phone' },
    })

    if (!user) {
      const displayName = name?.trim() || `User ${normalizedPhone.slice(-4)}`
      user = await db.user.create({
        data: {
          name: displayName,
          email: `${normalizedPhone.replace(/\D/g, '')}@phone.shopzone.app`,
          phone: normalizedPhone,
          provider: 'phone',
          phoneVerified: true,
          emailVerified: false,
        },
      })
    } else if (!user.phoneVerified) {
      // Backfill phone-verified flag for legacy users
      user = await db.user.update({
        where: { id: user.id },
        data: { phoneVerified: true, isActive: true },
      })
    }

    // Return the user object (excluding password)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          walletBalance: user.walletBalance,
          rewardPoints: user.rewardPoints,
        },
        message: 'OTP verified successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verify OTP API error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    )
  }
}
