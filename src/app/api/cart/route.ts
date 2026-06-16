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

    // Get or create cart
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true } },
                brand: { select: { id: true, name: true, slug: true } },
              },
            },
          },
          orderBy: { cartId: 'desc' },
        },
      },
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true, slug: true } },
                  brand: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      })
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.basePrice
      return sum + price * item.quantity
    }, 0)

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      cart,
      subtotal,
      totalItems,
    })
  } catch (error) {
    console.error('Cart GET API error:', error)
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
    const { productId, variantId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verify product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found or unavailable' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Get or create cart
    let cart = await db.cart.findUnique({
      where: { userId },
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
      })
    }

    // Check if item already in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        )
      }
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Add new item
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      })
    }

    // Return updated cart
    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true } },
                brand: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    })

    const subtotal = updatedCart!.items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.basePrice
      return sum + price * item.quantity
    }, 0)

    return NextResponse.json({
      cart: updatedCart,
      subtotal,
      totalItems: updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0),
      message: 'Item added to cart',
    })
  } catch (error) {
    console.error('Cart POST API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { itemId, quantity } = body

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      )
    }

    // Verify the cart item belongs to the user
    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    })

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    if (cartItem.product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    // Return updated cart
    const updatedCart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true } },
                brand: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    })

    const subtotal = updatedCart!.items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.basePrice
      return sum + price * item.quantity
    }, 0)

    return NextResponse.json({
      cart: updatedCart,
      subtotal,
      totalItems: updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0),
      message: 'Cart updated',
    })
  } catch (error) {
    console.error('Cart PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Verify the cart item belongs to the user
    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    await db.cartItem.delete({
      where: { id: itemId },
    })

    // Return updated cart
    const updatedCart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true } },
                brand: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    })

    const subtotal = (updatedCart?.items || []).reduce((sum, item) => {
      const price = item.product.salePrice || item.product.basePrice
      return sum + price * item.quantity
    }, 0)

    return NextResponse.json({
      cart: updatedCart,
      subtotal,
      totalItems: (updatedCart?.items || []).reduce((sum, item) => sum + item.quantity, 0),
      message: 'Item removed from cart',
    })
  } catch (error) {
    console.error('Cart DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
