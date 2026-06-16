import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth-utils'
import {
  categories,
  brands,
  sellers,
  products,
  coupons,
  banners,
} from '@/lib/mock-data'

export async function POST() {
  try {
    console.log('🌱 Seeding database...')

    // ==================== CATEGORIES ====================
    console.log('Creating categories...')
    for (const cat of categories) {
      await db.category.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          icon: cat.icon,
          parentId: cat.parentId,
          isActive: cat.isActive,
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          icon: cat.icon,
          parentId: cat.parentId,
          isActive: cat.isActive,
        },
      })
    }

    // ==================== BRANDS ====================
    console.log('Creating brands...')
    for (const brand of brands) {
      await db.brand.upsert({
        where: { id: brand.id },
        update: {
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo,
          description: brand.description,
        },
        create: {
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo,
          description: brand.description,
        },
      })
    }

    // ==================== USERS (for sellers + admin) ====================
    console.log('Creating users and sellers...')

    // Create admin user
    const adminPassword = hashPassword('admin123')
    await db.user.upsert({
      where: { email: 'admin@shopzone.com' },
      update: {},
      create: {
        email: 'admin@shopzone.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'admin',
        isActive: true,
      },
    })

    // Create demo customer
    const customerPassword = hashPassword('customer123')
    await db.user.upsert({
      where: { email: 'customer@shopzone.com' },
      update: {},
      create: {
        email: 'customer@shopzone.com',
        name: 'Demo Customer',
        phone: '9876543210',
        password: customerPassword,
        role: 'customer',
        isActive: true,
      },
    })

    // Create seller users and seller profiles
    for (const sellerData of sellers) {
      const sellerEmail = `${sellerData.storeSlug}@shopzone.com`
      const sellerPassword = hashPassword('seller123')

      const user = await db.user.upsert({
        where: { email: sellerEmail },
        update: {},
        create: {
          email: sellerEmail,
          name: sellerData.storeName,
          password: sellerPassword,
          role: 'seller',
          isActive: true,
        },
      })

      await db.seller.upsert({
        where: { id: sellerData.id },
        update: {
          storeName: sellerData.storeName,
          storeSlug: sellerData.storeSlug,
          storeLogo: sellerData.storeLogo,
          rating: sellerData.rating,
          totalProducts: sellerData.totalProducts,
          totalSales: sellerData.totalSales,
          isVerified: sellerData.isVerified,
        },
        create: {
          id: sellerData.id,
          userId: user.id,
          storeName: sellerData.storeName,
          storeSlug: sellerData.storeSlug,
          storeLogo: sellerData.storeLogo,
          rating: sellerData.rating,
          totalProducts: sellerData.totalProducts,
          totalSales: sellerData.totalSales,
          isVerified: sellerData.isVerified,
        },
      })
    }

    // ==================== PRODUCTS ====================
    console.log('Creating products...')
    let productsCreated = 0
    for (const product of products) {
      try {
        await db.product.upsert({
          where: { id: product.id },
          update: {
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDesc: product.shortDesc,
            categoryId: product.categoryId,
            brandId: product.brandId,
            sellerId: product.sellerId,
            basePrice: product.basePrice,
            salePrice: product.salePrice,
            images: JSON.stringify(product.images),
            colors: product.colors ? JSON.stringify(product.colors) : null,
            sizes: product.sizes ? JSON.stringify(product.sizes) : null,
            specifications: product.specifications
              ? JSON.stringify(product.specifications)
              : null,
            tags: product.tags ? JSON.stringify(product.tags) : null,
            highlights: product.highlights
              ? JSON.stringify(product.highlights)
              : null,
            stock: product.stock,
            sku: product.sku,
            weight: product.weight,
            isFeatured: product.isFeatured,
            isNewArrival: product.isNewArrival,
            isTrending: product.isTrending,
            isBestSeller: product.isBestSeller,
            isActive: product.isActive,
            avgRating: product.avgRating,
            totalReviews: product.totalReviews,
            totalSold: product.totalSold,
            discount: product.discount,
            deliveryDays: product.deliveryDays,
            isFreeDelivery: product.isFreeDelivery,
            returnPolicy: product.returnPolicy,
            warranty: product.warranty,
          },
          create: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDesc: product.shortDesc,
            categoryId: product.categoryId,
            brandId: product.brandId,
            sellerId: product.sellerId,
            basePrice: product.basePrice,
            salePrice: product.salePrice,
            images: JSON.stringify(product.images),
            colors: product.colors ? JSON.stringify(product.colors) : null,
            sizes: product.sizes ? JSON.stringify(product.sizes) : null,
            specifications: product.specifications
              ? JSON.stringify(product.specifications)
              : null,
            tags: product.tags ? JSON.stringify(product.tags) : null,
            highlights: product.highlights
              ? JSON.stringify(product.highlights)
              : null,
            stock: product.stock,
            sku: product.sku,
            weight: product.weight,
            isFeatured: product.isFeatured,
            isNewArrival: product.isNewArrival,
            isTrending: product.isTrending,
            isBestSeller: product.isBestSeller,
            isActive: product.isActive,
            avgRating: product.avgRating,
            totalReviews: product.totalReviews,
            totalSold: product.totalSold,
            discount: product.discount,
            deliveryDays: product.deliveryDays,
            isFreeDelivery: product.isFreeDelivery,
            returnPolicy: product.returnPolicy,
            warranty: product.warranty,
          },
        })
        productsCreated++
      } catch (error) {
        console.error(`Error creating product ${product.id}:`, error)
      }
    }

    // ==================== COUPONS ====================
    console.log('Creating coupons...')
    const now = new Date()
    for (const coupon of coupons) {
      await db.coupon.upsert({
        where: { id: coupon.id },
        update: {
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minOrder: coupon.minOrder,
          maxDiscount: coupon.maxDiscount,
          isActive: coupon.isActive,
        },
        create: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minOrder: coupon.minOrder,
          maxDiscount: coupon.maxDiscount,
          isActive: coupon.isActive,
          startsAt: now,
          expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
      })
    }

    // ==================== BANNERS ====================
    console.log('Creating banners...')
    for (const banner of banners) {
      await db.banner.upsert({
        where: { id: banner.id },
        update: {
          title: banner.title,
          subtitle: banner.subtitle,
          image: banner.image,
          link: banner.link,
          position: banner.position,
          isActive: banner.isActive,
        },
        create: {
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle,
          image: banner.image,
          link: banner.link,
          position: banner.position,
          isActive: banner.isActive,
        },
      })
    }

    // ==================== SAMPLE NOTIFICATIONS ====================
    console.log('Creating sample notifications...')
    const customerUser = await db.user.findUnique({
      where: { email: 'customer@shopzone.com' },
    })

    if (customerUser) {
      // Create cart for customer
      await db.cart.upsert({
        where: { userId: customerUser.id },
        update: {},
        create: { userId: customerUser.id },
      })

      // Create sample notifications
      const sampleNotifications = [
        {
          title: 'Welcome to ShopZone!',
          message: 'Start exploring our amazing deals and products.',
          type: 'system',
        },
        {
          title: 'Mega Electronics Sale',
          message: 'Up to 70% off on top electronics brands. Shop now!',
          type: 'promo',
        },
        {
          title: 'Your order has been confirmed',
          message: 'Order #SZ1234 has been confirmed and is being processed.',
          type: 'order',
          link: '/orders',
        },
        {
          title: 'New arrival: Samsung Galaxy S24 Ultra',
          message: 'Check out the latest flagship phone from Samsung.',
          type: 'promo',
          link: '/products/p-1',
        },
        {
          title: 'Flash Sale starts in 2 hours!',
          message: 'Get ready for incredible deals. Don\'t miss out!',
          type: 'promo',
        },
      ]

      for (const notif of sampleNotifications) {
        await db.notification.create({
          data: {
            userId: customerUser.id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            link: notif.link || null,
            isRead: Math.random() > 0.5,
          },
        })
      }
    }

    // ==================== SAMPLE REVIEWS ====================
    console.log('Creating sample reviews...')
    const reviewUsers = await db.user.findMany({ take: 5 })
    const sampleProducts = await db.product.findMany({ take: 10 })

    for (const product of sampleProducts) {
      for (let i = 0; i < Math.min(reviewUsers.length, 3); i++) {
        const user = reviewUsers[i]
        if (!user) continue

        const existingReview = await db.review.findFirst({
          where: { productId: product.id, userId: user.id },
        })

        if (!existingReview) {
          const rating = Math.floor(Math.random() * 3) + 3 // 3-5 rating
          await db.review.create({
            data: {
              productId: product.id,
              userId: user.id,
              rating,
              title: [
                'Great product!',
                'Good value for money',
                'Exceeded expectations',
                'Solid purchase',
                'Very satisfied',
              ][Math.floor(Math.random() * 5)],
              comment: [
                'Really impressed with the quality. Would recommend to others.',
                'Good product overall. Delivery was quick and packaging was great.',
                'Best purchase I\'ve made this year. Totally worth it!',
                'Decent product for the price. No complaints.',
                'Love it! Exactly as described and arrived on time.',
              ][Math.floor(Math.random() * 5)],
              isVerified: true,
              helpful: Math.floor(Math.random() * 100),
            },
          })
        }
      }
    }

    console.log('✅ Seeding complete!')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      stats: {
        categories: categories.length,
        brands: brands.length,
        sellers: sellers.length,
        products: productsCreated,
        coupons: coupons.length,
        banners: banners.length,
      },
      demoAccounts: {
        admin: { email: 'admin@shopzone.com', password: 'admin123' },
        customer: { email: 'customer@shopzone.com', password: 'customer123' },
        seller: { email: '{store-slug}@shopzone.com', password: 'seller123' },
      },
    })
  } catch (error) {
    console.error('Seed API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 }
    )
  }
}
