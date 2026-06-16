import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'customer' | 'seller' | 'admin'
  walletBalance: number
  rewardPoints: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
  updateProfile: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null,
  })),
}))
