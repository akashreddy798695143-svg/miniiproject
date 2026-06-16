import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const formatted = brands.map(brand => ({
      ...brand,
      productCount: brand._count.products,
    }))

    return NextResponse.json({ brands: formatted })
  } catch (error) {
    console.error('Brands API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
