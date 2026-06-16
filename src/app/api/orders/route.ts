import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { extractTokenFromRequest, getUserIdFromToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request)
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = { userId }
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  basePrice: true,
                  salePrice: true,
                },
              },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Orders GET API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request)
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { addressId, paymentMethod, couponCode, notes } = body

    if (!addressId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Address and payment method are required' },
        { status: 400 }
      )
    }

    // Verify address belongs to user
    const address = await db.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    // Get user's cart
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    let subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.basePrice
      return sum + price * item.quantity
    }, 0)

    let discount = 0
    // Apply coupon if provided
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode },
      })

      if (coupon && coupon.isActive && coupon.usedCount < (coupon.usageLimit || Infinity)) {
        if (subtotal >= coupon.minOrder) {
          if (coupon.type === 'percentage') {
            discount = Math.min(
              (subtotal * coupon.value) / 100,
              coupon.maxDiscount || Infinity
            )
          } else {
            discount = Math.min(coupon.value, coupon.maxDiscount || Infinity)
          }
          // Increment coupon usage
          await db.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          })
        }
      }
    }

    const tax = (subtotal - discount) * 0.18 // 18% GST
    const shipping = subtotal > 500 ? 0 : 49 // Free shipping above ₹500
    const total = subtotal - discount + tax + shipping

    // Generate order number
    const orderNumber = `SZ${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create order
    const order = await db.order.create({
      data: {
        userId,
        orderNumber,
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        paymentMethod,
        subtotal,
        discount,
        tax: Math.round(tax * 100) / 100,
        shipping,
        total: Math.round(total * 100) / 100,
        couponCode: couponCode || null,
        addressId,
        notes: notes || null,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            sellerId: item.product.sellerId,
            quantity: item.quantity,
            price: item.product.basePrice,
            salePrice: item.product.salePrice,
            total: (item.product.salePrice || item.product.basePrice) * item.quantity,
            status: 'pending',
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    })

    // Update product stock and sold count
    for (const item of cart.items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          totalSold: { increment: item.quantity },
        },
      })
    }

    // Clear cart
    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    // Create notification
    await db.notification.create({
      data: {
        userId,
        title: 'Order Placed Successfully!',
        message: `Your order #${orderNumber} has been placed. Total: ₹${total.toFixed(2)}`,
        type: 'order',
        link: `/orders/${order.id}`,
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Orders POST API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
