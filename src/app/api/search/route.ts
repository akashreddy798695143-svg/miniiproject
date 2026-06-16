import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!q.trim()) {
      return NextResponse.json({ results: [], suggestions: [] })
    }

    // Search products
    const results = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { shortDesc: { contains: q } },
          { tags: { contains: q } },
          { sku: { contains: q } },
        ],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
      },
      take: limit,
      orderBy: { totalSold: 'desc' },
    })

    // Generate suggestions from category and brand names
    const categorySuggestions = await db.category.findMany({
      where: {
        isActive: true,
        name: { contains: q },
      },
      select: { name: true, slug: true },
      take: 3,
    })

    const brandSuggestions = await db.brand.findMany({
      where: {
        isActive: true,
        name: { contains: q },
      },
      select: { name: true, slug: true },
      take: 3,
    })

    const suggestions = [
      ...categorySuggestions.map(c => ({
        text: c.name,
        type: 'category' as const,
        slug: c.slug,
      })),
      ...brandSuggestions.map(b => ({
        text: b.name,
        type: 'brand' as const,
        slug: b.slug,
      })),
      ...results.slice(0, 4).map(p => ({
        text: p.name,
        type: 'product' as const,
        slug: p.slug,
      })),
    ]

    return NextResponse.json({ results, suggestions })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
