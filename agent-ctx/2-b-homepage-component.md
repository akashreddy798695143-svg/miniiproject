# Task 2-b: Homepage Component Agent

## Task
Create the Homepage component for the ShopZone e-commerce marketplace.

## Output File
`/home/z/my-project/src/components/ecommerce/homepage.tsx`

## Key Details
- 'use client' component with all 12 sections fully implemented
- Uses: framer-motion, shadcn/ui (Button, Badge, Card, Input, ScrollArea, Carousel), lucide-react
- Stores: useNavigationStore, useCartStore, useWishlistStore
- Mock data: banners, getTopLevelCategories, getFeaturedProducts, getTrendingProducts, getNewArrivals, getBestSellers, getFlashSaleProducts, formatPrice, reviews, brands, products
- Color scheme: orange/amber/emerald (no blue/indigo)
- No lint errors, dev server compiles successfully

## Sections Implemented
1. Hero Banner Carousel (auto-play 3s, AnimatePresence fade, dots+arrows)
2. Category Showcase (horizontal scroll, circular images, click navigation)
3. Flash Sale (countdown timer, gradient border, urgency badges)
4. Featured Products Grid (4-col responsive, staggered animations)
5. Promotional Banner (gradient, "Mega Sale - Up to 80% Off")
6. Trending Products (horizontal scroll, trending badge)
7. Top Brands (logo grid, responsive)
8. New Arrivals (4-col grid, NEW badge)
9. Best Sellers (horizontal scroll, rank badges #1-#10)
10. Customer Reviews (animated carousel, stars, verified badges)
11. App Download (phone mockup, QR, store buttons)
12. Newsletter (email input, subscribe, 10% off incentive)

## Reusable Components
- ProductCard: image, wishlist toggle, discount badge, brand, name, rating, prices, free delivery, hover quick view, add to cart
- AnimatedSection: whileInView scroll animation wrapper
- SectionHeader: title/subtitle/icon/action button
- HorizontalScroll: overflow-x-auto container
- StarRating: full/half/empty stars with count
