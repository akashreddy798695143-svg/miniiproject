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

    // Get seller profile
    const seller = await db.seller.findUnique({
      where: { userId },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { sellerId: seller.id }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          variants: true,
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Seller Products GET API error:', error)
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

    const seller = await db.seller.findUnique({
      where: { userId },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      shortDesc,
      categoryId,
      brandId,
      basePrice,
      salePrice,
      images,
      colors,
      sizes,
      specifications,
      tags,
      highlights,
      stock,
      sku,
      weight,
      isFeatured,
      isNewArrival,
      isTrending,
      isBestSeller,
      deliveryDays,
      isFreeDelivery,
      returnPolicy,
      warranty,
    } = body

    if (!name || !description || !categoryId || !basePrice || stock === undefined) {
      return NextResponse.json(
        { error: 'Name, description, category, base price, and stock are required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check for slug uniqueness
    const existingSlug = await db.product.findUnique({ where: { slug } })
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug

    const product = await db.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        shortDesc: shortDesc || null,
        categoryId,
        brandId: brandId || null,
        sellerId: seller.id,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: JSON.stringify(images || []),
        colors: colors ? JSON.stringify(colors) : null,
        sizes: sizes ? JSON.stringify(sizes) : null,
        specifications: specifications ? JSON.stringify(specifications) : null,
        tags: tags ? JSON.stringify(tags) : null,
        highlights: highlights ? JSON.stringify(highlights) : null,
        stock: parseInt(stock),
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        isFeatured: isFeatured || false,
        isNewArrival: isNewArrival || false,
        isTrending: isTrending || false,
        isBestSeller: isBestSeller || false,
        deliveryDays: deliveryDays || 5,
        isFreeDelivery: isFreeDelivery || false,
        returnPolicy: returnPolicy || null,
        warranty: warranty || null,
        discount: salePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    })

    // Update seller total products
    await db.seller.update({
      where: { id: seller.id },
      data: { totalProducts: { increment: 1 } },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Seller Products POST API error:', error)
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

    const seller = await db.seller.findUnique({
      where: { userId },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verify product belongs to seller
    const product = await db.product.findUnique({
      where: { id },
    })

    if (!product || product.sellerId !== seller.id) {
      return NextResponse.json(
        { error: 'Product not found or not owned by you' },
        { status: 404 }
      )
    }

    // Prepare update data
    const data: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'description', 'shortDesc', 'categoryId', 'brandId',
      'basePrice', 'salePrice', 'images', 'colors', 'sizes',
      'specifications', 'tags', 'highlights', 'stock', 'sku', 'weight',
      'isFeatured', 'isNewArrival', 'isTrending', 'isBestSeller', 'isActive',
      'deliveryDays', 'isFreeDelivery', 'returnPolicy', 'warranty',
    ]

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (['images', 'colors', 'sizes', 'specifications', 'tags', 'highlights'].includes(field)) {
          data[field] = JSON.stringify(updateData[field])
        } else if (['basePrice', 'salePrice', 'weight'].includes(field)) {
          data[field] = parseFloat(updateData[field])
        } else if (['stock', 'deliveryDays'].includes(field)) {
          data[field] = parseInt(updateData[field])
        } else if (['isFeatured', 'isNewArrival', 'isTrending', 'isBestSeller', 'isActive', 'isFreeDelivery'].includes(field)) {
          data[field] = Boolean(updateData[field])
        } else {
          data[field] = updateData[field]
        }
      }
    }

    // Recalculate discount if prices changed
    if (data.basePrice && data.salePrice) {
      data.discount = Math.round(
        ((parseFloat(data.basePrice as string) - parseFloat(data.salePrice as string)) /
          parseFloat(data.basePrice as string)) * 100
      )
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json({ product: updatedProduct })
  } catch (error) {
    console.error('Seller Products PUT API error:', error)
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

    const seller = await db.seller.findUnique({
      where: { userId },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product || product.sellerId !== seller.id) {
      return NextResponse.json(
        { error: 'Product not found or not owned by you' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await db.product.update({
      where: { id: productId },
      data: { isActive: false },
    })

    // Update seller total products
    await db.seller.update({
      where: { id: seller.id },
      data: { totalProducts: { decrement: 1 } },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Seller Products DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
