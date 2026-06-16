import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Find user by email
    let user = await db.user.findUnique({
      where: { email },
    })

    // If user not found, create one with provider='google'
    if (!user) {
      user = await db.user.create({
        data: {
          name,
          email,
          provider: 'google',
          role: 'customer',
          emailVerified: true,
        },
      })
    }

    // Return user data (excluding password)
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
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Google auth API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
