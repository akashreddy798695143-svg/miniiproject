import { create } from 'zustand'

export type ViewMode = 
  | 'home' 
  | 'products' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'auth' 
  | 'user-dashboard' 
  | 'seller-panel' 
  | 'admin-panel'

interface NavigationState {
  currentView: ViewMode
  selectedProductId: string | null
  selectedCategory: string | null
  searchQuery: string
  dashboardTab: string
  sellerTab: string
  adminTab: string
  authMode: 'login' | 'register' | 'otp' | 'forgot-password'
  navigate: (view: ViewMode, options?: { productId?: string; category?: string; query?: string; tab?: string }) => void
  setSearchQuery: (query: string) => void
  setAuthMode: (mode: 'login' | 'register' | 'otp' | 'forgot-password') => void
  setDashboardTab: (tab: string) => void
  setSellerTab: (tab: string) => void
  setAdminTab: (tab: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'home',
  selectedProductId: null,
  selectedCategory: null,
  searchQuery: '',
  dashboardTab: 'profile',
  sellerTab: 'dashboard',
  adminTab: 'dashboard',
  authMode: 'login',
  navigate: (view, options) => set({
    currentView: view,
    selectedProductId: options?.productId ?? null,
    selectedCategory: options?.category ?? null,
    searchQuery: options?.query ?? '',
    dashboardTab: options?.tab ?? 'profile',
    sellerTab: options?.tab ?? 'dashboard',
    adminTab: options?.tab ?? 'dashboard',
  }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setAuthMode: (mode) => set({ authMode: mode }),
  setDashboardTab: (tab) => set({ dashboardTab: tab }),
  setSellerTab: (tab) => set({ sellerTab: tab }),
  setAdminTab: (tab) => set({ adminTab: tab }),
}))
