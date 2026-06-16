import { create } from 'zustand'

export interface WishlistItemType {
  id: string
  productId: string
  name: string
  image: string
  price: number
  salePrice: number
  rating: number
  inStock: boolean
}

interface WishlistState {
  items: WishlistItemType[]
  addItem: (item: WishlistItemType) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    if (state.items.find(i => i.productId === item.productId)) return state
    return { items: [...state.items, item] }
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.productId !== productId),
  })),
  isInWishlist: (productId) => get().items.some(i => i.productId === productId),
  clearWishlist: () => set({ items: [] }),
}))
