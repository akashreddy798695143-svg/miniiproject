import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()

    const coupons = await db.coupon.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        expiresAt: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error('Coupons GET API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, cartTotal } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'This coupon is no longer active' },
        { status: 400 }
      )
    }

    if (coupon.startsAt > now) {
      return NextResponse.json(
        { error: 'This coupon is not yet active' },
        { status: 400 }
      )
    }

    if (coupon.expiresAt < now) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      )
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'This coupon has reached its usage limit' },
        { status: 400 }
      )
    }

    if (cartTotal && cartTotal < coupon.minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${coupon.minOrder}` },
        { status: 400 }
      )
    }

    // Calculate discount
    let discount = 0
    const total = cartTotal || 0

    if (coupon.type === 'percentage') {
      discount = (total * coupon.value) / 100
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
    } else {
      discount = Math.min(coupon.value, total)
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
      },
      discount: Math.round(discount * 100) / 100,
    })
  } catch (error) {
    console.error('Coupons POST API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
