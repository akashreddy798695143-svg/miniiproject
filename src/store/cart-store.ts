import { create } from 'zustand'

export interface CartItemType {
  id: string
  productId: string
  name: string
  image: string
  price: number
  salePrice: number
  quantity: number
  color?: string
  size?: string
  variantId?: string
  stock: number
  saveForLater: boolean
}

interface CartState {
  items: CartItemType[]
  couponCode: string
  couponDiscount: number
  addItem: (item: CartItemType) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  toggleSaveForLater: (id: string) => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  clearCart: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  couponDiscount: 0,
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.productId === item.productId && i.color === item.color && i.size === item.size)
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      }
    }
    return { items: [...state.items, item] }
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id),
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i),
  })),
  toggleSaveForLater: (id) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, saveForLater: !i.saveForLater } : i),
  })),
  applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
  removeCoupon: () => set({ couponCode: '', couponDiscount: 0 }),
  clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),
  getSubtotal: () => get().items.filter(i => !i.saveForLater).reduce((sum, i) => sum + (i.salePrice || i.price) * i.quantity, 0),
  getDiscount: () => {
    const subtotal = get().getSubtotal()
    return get().couponDiscount > 0 ? subtotal * (get().couponDiscount / 100) : 0
  },
  getTotal: () => {
    const subtotal = get().getSubtotal()
    const discount = get().getDiscount()
    const shipping = subtotal > 500 ? 0 : 49
    return subtotal - discount + shipping
  },
  getItemCount: () => get().items.filter(i => !i.saveForLater).reduce((sum, i) => sum + i.quantity, 0),
}))
