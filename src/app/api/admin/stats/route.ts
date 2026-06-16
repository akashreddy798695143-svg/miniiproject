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

    // Verify admin role
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get various stats
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalSellers,
      totalCategories,
      totalBrands,
      totalRevenue,
      recentOrders,
      ordersByStatus,
      topCategories,
      topProducts,
      monthlyRevenue,
    ] = await Promise.all([
      // Total users
      db.user.count(),
      // Total products
      db.product.count({ where: { isActive: true } }),
      // Total orders
      db.order.count(),
      // Total sellers
      db.seller.count({ where: { isActive: true } }),
      // Total categories
      db.category.count({ where: { isActive: true } }),
      // Total brands
      db.brand.count({ where: { isActive: true } }),
      // Total revenue
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'paid' },
      }),
      // Recent orders
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, images: true } },
            },
          },
        },
      }),
      // Orders by status
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // Top categories by product count
      db.category.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
        take: 10,
      }),
      // Top selling products
      db.product.findMany({
        where: { isActive: true },
        orderBy: { totalSold: 'desc' },
        take: 10,
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
      }),
      // Monthly revenue (last 6 months)
      db.order.findMany({
        where: {
          paymentStatus: 'paid',
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: { total: true, createdAt: true },
      }),
    ])

    // Calculate monthly revenue
    const revenueByMonth: Record<string, number> = {}
    monthlyRevenue.forEach(order => {
      const monthKey = order.createdAt.toISOString().substring(0, 7)
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + order.total
    })

    // New users today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newUsersToday = await db.user.count({
      where: { createdAt: { gte: today } },
    })

    // New orders today
    const newOrdersToday = await db.order.count({
      where: { createdAt: { gte: today } },
    })

    // Today's revenue
    const todayRevenue = await db.order.aggregate({
      _sum: { total: true },
      where: {
        paymentStatus: 'paid',
        createdAt: { gte: today },
      },
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSellers,
        totalCategories,
        totalBrands,
        totalRevenue: totalRevenue._sum.total || 0,
        newUsersToday,
        newOrdersToday,
        todayRevenue: todayRevenue._sum.total || 0,
      },
      recentOrders,
      ordersByStatus: ordersByStatus.map(o => ({
        status: o.status,
        count: o._count.status,
      })),
      topCategories: topCategories.map(c => ({
        ...c,
        productCount: c._count.products,
      })),
      topProducts,
      revenueByMonth,
    })
  } catch (error) {
    console.error('Admin Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
