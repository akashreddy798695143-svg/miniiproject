import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      )
    }

    // Generate a random 6-digit OTP
    const otp = randomBytes(3).toString('hex').toUpperCase().slice(0, 6)

    // Store OTP in OTPVerification table
    await db.oTPVerification.create({
      data: {
        email,
        otp,
        purpose: 'forgotPassword',
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      },
    })

    // Return OTP (in production you'd email it, for demo we return it)
    return NextResponse.json(
      {
        message: 'OTP sent to your email',
        otp,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
