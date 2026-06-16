'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  ShoppingCart,
  X,
  Filter,
} from 'lucide-react'
import { products, categories, brands, formatPrice, type Product } from '@/lib/mock-data'
import { useNavigationStore } from '@/store/navigation-store'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import { useIsMobile } from '@/hooks/use-mobile'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

// ==================== COLOR HELPER ====================
const colorHexMap: Record<string, string> = {
  'Titanium Gray': '#8C8C8C',
  'Titanium Black': '#2D2D2D',
  'Titanium Violet': '#7B68AE',
  'Titanium Yellow': '#E8C84A',
  'Natural Titanium': '#A0937D',
  'Blue Titanium': '#4A6FA5',
  'White Titanium': '#E8E8E8',
  'Black Titanium': '#1A1A1A',
  'Silky Black': '#1C1C1C',
  'Flowy Emerald': '#2E8B57',
  'Black': '#1A1A1A',
  'White': '#F5F5F5',
  'Green': '#2E8B57',
  'Awesome Iceblue': '#A8D8EA',
  'Awesome Lilac': '#C8A2C8',
  'Awesome Lemon': '#FFF44F',
  'Awesome Navy': '#000080',
  'Pioneer Green': '#3B7A3B',
  'Pioneer White': '#FAFAFA',
  'Midnight': '#1C1C2E',
  'Starlight': '#F5E6CA',
  'Space Gray': '#6E6E73',
  'Silver': '#C0C0C0',
  'Natural Silver': '#C4BAA2',
  'Fog Blue': '#B0C4DE',
  'Arctic Grey': '#D3D3D3',
  'Abyss Blue': '#1B3A5C',
  'Platinum Silver': '#D3D3D3',
  'Frost White': '#FFFAFA',
  'Midnight Blue': '#191970',
  'Active Black': '#1A1A1A',
  'Cider Cyan': '#00CED1',
  'Cherry Blossom': '#FFB7C5',
  'Blue': '#4169E1',
  'Beige': '#F5F5DC',
  'Mid Indigo': '#4B0082',
  'Dark Wash': '#1A237E',
  'Black/Anthracite': '#2F4F4F',
  'White/Sail': '#F5F5DC',
  'University Red': '#CC0000',
  'Light Blue': '#ADD8E6',
  'Navy': '#000080',
  'Olive': '#808000',
  'Core Black': '#1A1A1A',
  'Cloud White': '#FFFAFA',
  'Pulse Lime': '#BFFF00',
  'Blue Floral': '#6495ED',
  'Pink Floral': '#FFB6C1',
  'Power Pink': '#FF69B4',
  'Maroon': '#800000',
  'Teal': '#008080',
  'Coral': '#FF7F50',
  'Graphite': '#383838',
  'Gold': '#FFD700',
  'Rose Gold': '#B76E79',
  'Red': '#FF0000',
  'Purple': '#800080',
  'Pink': '#FFC0CB',
  'Orange': '#FF8C00',
  'Yellow': '#FFD700',
  'Grey': '#808080',
  'Brown': '#8B4513',
  'Cream': '#FFFDD0',
  'Magenta': '#FF00FF',
  'Lavender': '#E6E6FA',
  'Burgundy': '#800020',
  'Charcoal': '#36454F',
  'Copper': '#B87333',
  'Bronze': '#CD7F32',
  'Khaki': '#C3B091',
  'Tan': '#D2B48C',
  'Turquoise': '#40E0D0',
  'Indigo': '#4B0082',
  'Rust': '#B7410E',
  'Sage': '#BCB88A',
  'Mauve': '#E0B0FF',
  'Cyan': '#00FFFF',
  'Sky Blue': '#87CEEB',
  'Steel Blue': '#4682B4',
  'Royal Blue': '#4169E1',
  'Nude': '#E3BC9A',
  'Wine': '#722F37',
  'Olive Green': '#556B2F',
  'Mint': '#3EB489',
  'Peach': '#FFDAB9',
  'Champagne': '#F7E7CE',
  'Espresso': '#3C1414',
  'Midnight Black': '#0D0D0D',
  'Phantom Black': '#0A0A0A',
  'Frosted Silver': '#C0C0C0',
  'Arctic White': '#FAFAFA',
  'Aurora': '#00FF7F',
  'Mystic Silver': '#B8B8B8',
  'Glacier Blue': '#6CB4EE',
}

function getColorHex(colorName: string): string {
  return colorHexMap[colorName] || '#' + colorName.split(' ').map(w => w[0]).join('').slice(0, 3).padEnd(3, '8')
}

// ==================== FILTER STATE ====================
interface FilterState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  rating: number | null
  discount: number | null
  colors: string[]
  sizes: string[]
  freeDelivery: boolean
  express: boolean
}

const defaultFilters: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, 200000],
  rating: null,
  discount: null,
  sizes: [],
  colors: [],
  freeDelivery: false,
  express: false,
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popularity'
type ViewMode = 'grid' | 'list'

const ITEMS_PER_PAGE = 12

// ==================== PRODUCT CARD ====================
function ProductCard({ product, viewMode }: { product: Product; viewMode: ViewMode }) {
  const navigate = useNavigationStore((s) => s.navigate)
  const addItem = useCartStore((s) => s.addItem)
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore()
  const wishlisted = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.basePrice,
      salePrice: product.salePrice,
      quantity: 1,
      color: product.colors[0],
      size: product.sizes[0],
      stock: product.stock,
      saveForLater: false,
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (wishlisted) {
      removeWishlist(product.id)
    } else {
      addWishlist({
        id: product.id,
        productId: product.id,
        name: product.name,
        image: product.images[0],
        price: product.basePrice,
        salePrice: product.salePrice,
        rating: product.avgRating,
        inStock: product.stock > 0,
      })
    }
  }

  const handleCardClick = () => {
    navigate('product-detail', { productId: product.id })
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 group"
          onClick={handleCardClick}
        >
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-56 h-56 sm:h-auto flex-shrink-0 overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.discount > 0 && (
                <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white text-xs">
                  {product.discount}% OFF
                </Badge>
              )}
              {product.isNewArrival && (
                <Badge className="absolute top-2 right-10 bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                  NEW
                </Badge>
              )}
            </div>
            <CardContent className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {brands.find(b => b.id === product.brandId)?.name}
                </p>
                <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.shortDesc}</p>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                    {product.avgRating} <Star className="w-3 h-3 fill-white ml-0.5" />
                  </div>
                  <span className="text-xs text-muted-foreground">({product.totalReviews.toLocaleString()})</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{formatPrice(product.salePrice)}</span>
                  {product.basePrice > product.salePrice && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.basePrice)}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {product.discount}% off
                      </Badge>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={handleWishlist}
                  >
                    <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button size="sm" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
              {product.isFreeDelivery && (
                <p className="text-xs text-emerald-600 mt-1">Free Delivery</p>
              )}
            </CardContent>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group h-full flex flex-col"
        onClick={handleCardClick}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white text-xs">
              {product.discount}% OFF
            </Badge>
          )}
          {product.isNewArrival && (
            <Badge className="absolute top-2 right-10 bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
              NEW
            </Badge>
          )}
          {product.isTrending && (
            <Badge className="absolute top-8 right-10 bg-orange-500 hover:bg-orange-600 text-white text-xs">
              TRENDING
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleWishlist}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        <CardContent className="p-3 flex-1 flex flex-col">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
            {brands.find(b => b.id === product.brandId)?.name}
          </p>
          <h3 className="font-medium text-sm line-clamp-2 mb-1.5 min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">
              {product.avgRating} <Star className="w-2.5 h-2.5 fill-white ml-0.5" />
            </div>
            <span className="text-[10px] text-muted-foreground">
              ({product.totalReviews.toLocaleString()})
            </span>
          </div>
          <div className="mt-auto">
            <div className="flex items-baseline gap-1.5 mb-1.5">
              <span className="text-base font-bold">{formatPrice(product.salePrice)}</span>
              {product.basePrice > product.salePrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
            {product.isFreeDelivery && (
              <p className="text-[10px] text-emerald-600 font-medium">Free Delivery</p>
            )}
            <Button
              size="sm"
              className="w-full mt-2 h-8 text-xs"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== FILTER SIDEBAR ====================
function FilterSidebar({
  filters,
  setFilters,
  onClose,
}: {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  onClose?: () => void
}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    brand: false,
    rating: true,
    discount: false,
    color: false,
    size: false,
    delivery: false,
  })

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const topLevelCategories = useMemo(() => categories.filter((c) => c.parentId === null), [])
  const subCategories = useMemo(
    () => categories.filter((c) => c.parentId !== null),
    []
  )
  const allColors = useMemo(() => {
    const colorSet = new Set<string>()
    products.forEach((p) => p.colors.forEach((c) => colorSet.add(c)))
    return Array.from(colorSet)
  }, [])
  const allSizes = useMemo(() => {
    const sizeSet = new Set<string>()
    products.forEach((p) => p.sizes.forEach((s) => sizeSet.add(s)))
    return Array.from(sizeSet)
  }, [])

  const brandCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    products.forEach((p) => {
      map[p.brandId] = (map[p.brandId] || 0) + 1
    })
    return map
  }, [])

  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    products.forEach((p) => {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1
    })
    return map
  }, [])

  const clearAll = () => {
    setFilters(defaultFilters)
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.categories.length > 0) count++
    if (filters.brands.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 200000) count++
    if (filters.rating !== null) count++
    if (filters.discount !== null) count++
    if (filters.colors.length > 0) count++
    if (filters.sizes.length > 0) count++
    if (filters.freeDelivery) count++
    if (filters.express) count++
    return count
  }, [filters])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <h2 className="font-semibold text-base">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">{activeFilterCount} active</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-700" onClick={clearAll}>
              Clear All
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {/* Category */}
          <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground/80">
              Category
              {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pb-3">
                {topLevelCategories.map((cat) => {
                  const subCats = subCategories.filter((sc) => sc.parentId === cat.id)
                  const count = (categoryCountMap[cat.id] || 0) + subCats.reduce((sum, sc) => sum + (categoryCountMap[sc.id] || 0), 0)
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={filters.categories.includes(cat.id)}
                          onCheckedChange={(checked) => {
                            setFilters((prev) => ({
                              ...prev,
                              categories: checked
                                ? [...prev.categories, cat.id, ...subCats.map((sc) => sc.id)]
                                : prev.categories.filter((c) => c !== cat.id && !subCats.some((sc) => sc.id === c)),
                            }))
                          }}
                        />
                        <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer flex-1">
                          {cat.name}
                        </label>
                        <span className="text-xs text-muted-foreground">({count})</span>
                      </div>
                      {subCats.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {subCats.map((subCat) => (
                            <div key={subCat.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`cat-${subCat.id}`}
                                checked={filters.categories.includes(subCat.id)}
                                onCheckedChange={(checked) => {
                                  setFilters((prev) => ({
                                    ...prev,
                                    categories: checked
                                      ? [...prev.categories, subCat.id]
                                      : prev.categories.filter((c) => c !== subCat.id),
                                  }))
                                }}
                              />
                              <label htmlFor={`cat-${subCat.id}`} className="text-sm cursor-pointer flex-1">
                                {subCat.name}
                              </label>
                              <span className="text-xs text-muted-foreground">
                                ({categoryCountMap[subCat.id] || 0})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Price Range */}
          <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground/80">
              Price Range
              {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pb-3">
                <Slider
                  value={filters.priceRange}
                  min={0}
                  max={200000}
                  step={1000}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: value as [number, number],
                    }))
                  }
                  className="mt-2"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0] || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [Number(e.target.value) || 0, prev.priceRange[1]],
                      }))
                    }
                    className="h-8 text-xs"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1] || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], Number(e.target.value) || 200000],
                      }))
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPrice(filters.priceRange[0])} — {formatPrice(filters.priceRange[1])}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Brand */}
          <Collapsible open={openSections.brand} onOpenChange={() => toggleSection('brand')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground/80">
              Brand
              {openSections.brand ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pb-3 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={filters.brands.includes(brand.id)}
                      onCheckedChange={(checked) => {
                        setFilters((prev) => ({
                          ...prev,
                          brands: checked
                            ? [...prev.brands, brand.id]
                            : prev.brands.filter((b) => b !== brand.id),
                        }))
                      }}
                    />
                    <label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer flex-1">
                      {brand.name}
                    </label>
                    <span className="text-xs text-muted-foreground">
                      ({brandCountMap[brand.id] || 0})
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Rating */}
          <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground/80">
              Customer Rating
              {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pb-3">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                      filters.rating === rating
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: prev.rating === rating ? null : rating,
                      }))
                    }
                  >
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span>& up</span>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Discount */}
          <Collapsible open={openSections.discount} onOpenChange={() => toggleSection('discount')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground/80">
              Discount
              {openSections.discount ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pb-3">
                {[10, 20, 30, 40, 50, 60].map((d) => (
                  <button
                    key={d}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                      filters.discount === d
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        discount: prev.discount === d ? null : d,
                      }))
                    }
                  >
                    {d}% or more
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Color Swatches */}
          <Collapsible open={openSections.color} onOpenChange={() => toggleSection('color')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground/80">
              Color
              {openSections.color ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-wrap gap-2 pb-3">
                {allColors.slice(0, 20).map((color) => {
                  const isSelected = filters.colors.includes(color)
                  return (
                    <button
                      key={color}
                      title={color}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        isSelected ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          colors: isSelected
                            ? prev.colors.filter((c) => c !== color)
                            : [...prev.colors, color],
                        }))
                      }
                    />
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Size */}
          {allSizes.length > 0 && (
            <>
              <Collapsible open={openSections.size} onOpenChange={() => toggleSection('size')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground/80">
                  Size
                  {openSections.size ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-wrap gap-2 pb-3">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                          filters.sizes.includes(size)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-gray-300 hover:border-primary hover:text-primary'
                        }`}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            sizes: filters.sizes.includes(size)
                              ? prev.sizes.filter((s) => s !== size)
                              : [...prev.sizes, size],
                          }))
                        }
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Delivery Options */}
          <Collapsible open={openSections.delivery} onOpenChange={() => toggleSection('delivery')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-foreground/80">
              Delivery Options
              {openSections.delivery ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free-delivery"
                    checked={filters.freeDelivery}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({ ...prev, freeDelivery: !!checked }))
                    }
                  />
                  <label htmlFor="free-delivery" className="text-sm cursor-pointer">
                    Free Delivery
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="express-delivery"
                    checked={filters.express}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({ ...prev, express: !!checked }))
                    }
                  />
                  <label htmlFor="express-delivery" className="text-sm cursor-pointer">
                    Express Delivery (1-2 days)
                  </label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export default function ProductsPage() {
  const isMobile = useIsMobile()
  const { searchQuery, selectedCategory } = useNavigationStore()
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    categories: selectedCategory ? [selectedCategory] : [],
  })
  const [sortOption, setSortOption] = useState<SortOption>('relevance')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // selectedCategory is applied directly in the filter logic below

  // Apply filters and search
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isActive)

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.shortDesc.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    // Category filter (include subcategories + navigation category)
    const categoryFilter = [...filters.categories]
    if (selectedCategory && !categoryFilter.includes(selectedCategory)) {
      categoryFilter.push(selectedCategory)
    }
    if (categoryFilter.length > 0) {
      const allCategoryIds = new Set<string>()
      categoryFilter.forEach(catId => {
        allCategoryIds.add(catId)
        // Add child categories
        categories.filter(c => c.parentId === catId).forEach(c => allCategoryIds.add(c.id))
      })
      result = result.filter((p) => allCategoryIds.has(p.categoryId))
    }

    // Brand filter
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brandId))
    }

    // Price range
    result = result.filter(
      (p) => p.salePrice >= filters.priceRange[0] && p.salePrice <= filters.priceRange[1]
    )

    // Rating
    if (filters.rating !== null) {
      result = result.filter((p) => p.avgRating >= filters.rating!)
    }

    // Discount
    if (filters.discount !== null) {
      result = result.filter((p) => p.discount >= filters.discount!)
    }

    // Color
    if (filters.colors.length > 0) {
      result = result.filter((p) => p.colors.some((c) => filters.colors.includes(c)))
    }

    // Size
    if (filters.sizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)))
    }

    // Free delivery
    if (filters.freeDelivery) {
      result = result.filter((p) => p.isFreeDelivery)
    }

    // Express delivery
    if (filters.express) {
      result = result.filter((p) => p.deliveryDays <= 2)
    }

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.salePrice - b.salePrice)
        break
      case 'price-desc':
        result.sort((a, b) => b.salePrice - a.salePrice)
        break
      case 'rating':
        result.sort((a, b) => b.avgRating - a.avgRating)
        break
      case 'newest':
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0))
        break
      case 'popularity':
        result.sort((a, b) => b.totalSold - a.totalSold)
        break
      default:
        // Relevance: featured first, then trending, then best seller
        result.sort(
          (a, b) =>
            (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) ||
            (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0)
        )
    }

    return result
  }, [searchQuery, filters, sortOption, selectedCategory])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  // Reset page when filters change
  const handleFilterChange: React.Dispatch<React.SetStateAction<FilterState>> = useCallback(
    (action) => {
      setFilters(action)
      setCurrentPage(1)
    },
    []
  )

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption)
    setCurrentPage(1)
  }

  const paginationRange = useMemo(() => {
    const range: number[] = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  }, [currentPage, totalPages])

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-4">
          {searchQuery.trim() && (
            <div className="mb-2">
              <h1 className="text-xl sm:text-2xl font-bold">
                Search results for &ldquo;{searchQuery}&rdquo;
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          )}
          {!searchQuery.trim() && selectedCategory && (
            <div className="mb-2">
              <h1 className="text-xl sm:text-2xl font-bold">
                {categories.find((c) => c.id === selectedCategory)?.name || 'Products'}
              </h1>
            </div>
          )}
          {!searchQuery.trim() && !selectedCategory && (
            <h1 className="text-xl sm:text-2xl font-bold">All Products</h1>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-4 bg-white rounded-lg border shadow-sm overflow-hidden">
                <FilterSidebar filters={filters} setFilters={handleFilterChange} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white rounded-lg border shadow-sm p-3 mb-4">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <SheetHeader className="sr-only">
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <FilterSidebar
                        filters={filters}
                        setFilters={handleFilterChange}
                        onClose={() => setMobileFilterOpen(false)}
                      />
                    </SheetContent>
                  </Sheet>
                )}
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </SelectContent>
                </Select>

                {!isMobile && (
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Tags */}
            {(filters.categories.length > 0 || filters.brands.length > 0 || filters.rating !== null || filters.discount !== null || filters.colors.length > 0 || filters.sizes.length > 0 || filters.freeDelivery || filters.express) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.categories.map((catId) => {
                  const cat = categories.find((c) => c.id === catId)
                  return cat ? (
                    <Badge key={catId} variant="secondary" className="gap-1 pr-1">
                      {cat.name}
                      <button
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            categories: prev.categories.filter((c) => c !== catId),
                          }))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null
                })}
                {filters.brands.map((brandId) => {
                  const brand = brands.find((b) => b.id === brandId)
                  return brand ? (
                    <Badge key={brandId} variant="secondary" className="gap-1 pr-1">
                      {brand.name}
                      <button
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            brands: prev.brands.filter((b) => b !== brandId),
                          }))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null
                })}
                {filters.rating !== null && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {filters.rating}+ Stars
                    <button
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                      onClick={() => setFilters((prev) => ({ ...prev, rating: null }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.discount !== null && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {filters.discount}%+ Off
                    <button
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                      onClick={() => setFilters((prev) => ({ ...prev, discount: null }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.freeDelivery && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Free Delivery
                    <button
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                      onClick={() => setFilters((prev) => ({ ...prev, freeDelivery: false }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.express && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Express Delivery
                    <button
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                      onClick={() => setFilters((prev) => ({ ...prev, express: false }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-500 hover:text-red-700 h-6"
                  onClick={() => setFilters(defaultFilters)}
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Product Grid */}
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters(defaultFilters)
                    setCurrentPage(1)
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} viewMode={viewMode} />
                    ))}
                  </div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {paginationRange[0] > 1 && (
                          <>
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(1)
                                }}
                                className="cursor-pointer"
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            {paginationRange[0] > 2 && (
                              <PaginationItem>
                                <span className="flex h-9 w-9 items-center justify-center">...</span>
                              </PaginationItem>
                            )}
                          </>
                        )}
                        {paginationRange.map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === page}
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(page)
                              }}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        {paginationRange[paginationRange.length - 1] < totalPages && (
                          <>
                            {paginationRange[paginationRange.length - 1] < totalPages - 1 && (
                              <PaginationItem>
                                <span className="flex h-9 w-9 items-center justify-center">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(totalPages)
                                }}
                                className="cursor-pointer"
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
