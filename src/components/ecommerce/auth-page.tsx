'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth-store'
import { useNavigationStore } from '@/store/navigation-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  ArrowRight,
  Chrome,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'

// ── User data type ────────────────────────────────────────────────────
interface UserData {
  id?: string
  name?: string
  email?: string
  phone?: string
  role?: string
  walletBalance?: number
  rewardPoints?: number
}

// ── Main Component ────────────────────────────────────────────────────

export function AuthPage() {
  const authMode = useNavigationStore((s) => s.authMode)
  const setAuthMode = useNavigationStore((s) => s.setAuthMode)
  const navigate = useNavigationStore((s) => s.navigate)
  const { login } = useAuthStore()

  const handleLoginSuccess = (userData: UserData) => {
    login({
      id: userData.id || 'user-' + Date.now(),
      name: userData.name || 'User',
      email: userData.email || '',
      phone: userData.phone || '',
      avatar: '',
      role: (userData.role as 'customer' | 'seller' | 'admin') || 'customer',
      walletBalance: userData.walletBalance || 0,
      rewardPoints: userData.rewardPoints || 0,
    })
    navigate('home')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0 overflow-hidden rounded-2xl shadow-2xl border border-border/30">
        {/* Left: Illustration / Gradient */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-8 relative overflow-hidden min-h-[560px]"
        >
          {/* Background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
              className="w-28 h-28 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center"
            >
              <ShoppingBag className="w-14 h-14 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-3"
            >
              Welcome to ShopZone
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 max-w-sm mx-auto text-sm leading-relaxed"
            >
              Discover millions of products at unbeatable prices. Your one-stop
              destination for everything you need.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-6 mt-8 text-white/70 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Premium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Millions of Products</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <div className="bg-background p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {authMode === 'login' && (
              <FormWrapper key="login">
                <LoginForm
                  onLogin={handleLoginSuccess}
                  onForgotPassword={() => setAuthMode('forgot-password')}
                  onRegister={() => setAuthMode('register')}
                  onOtpLogin={() => setAuthMode('otp')}
                />
              </FormWrapper>
            )}
            {authMode === 'register' && (
              <FormWrapper key="register">
                <RegisterForm
                  onRegister={handleLoginSuccess}
                  onLogin={() => setAuthMode('login')}
                />
              </FormWrapper>
            )}
            {authMode === 'otp' && (
              <FormWrapper key="otp">
                <OtpForm
                  onVerify={handleLoginSuccess}
                  onBack={() => setAuthMode('login')}
                />
              </FormWrapper>
            )}
            {authMode === 'forgot-password' && (
              <FormWrapper key="forgot">
                <ForgotPasswordForm
                  onBack={() => setAuthMode('login')}
                  onSuccess={() => setAuthMode('login')}
                />
              </FormWrapper>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ── Form animation wrapper ─────────────────────────────────────────────

function FormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// ── Google Login Dialog ────────────────────────────────────────────────

function GoogleLoginDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (userData: UserData) => void
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Please enter your Gmail address'); return }
    if (!email.includes('@gmail.com') && !email.includes('@googlemail.com')) {
      setError('Please enter a valid Gmail address')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || email.split('@')[0],
        }),
      })
      const data = await res.json()
      setIsLoading(false)

      if (res.ok && data.user) {
        onSuccess(data.user)
        onOpenChange(false)
        setEmail('')
        setName('')
        setError('')
      } else {
        setError(data.error || 'Google login failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            Sign in with Google
          </DialogTitle>
          <DialogDescription>
            Enter your Gmail address to sign in or create a ShopZone account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="google-email">Gmail Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="google-email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="google-name">Your Name (optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="google-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continue with Google
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Login Form ─────────────────────────────────────────────────────────

function LoginForm({
  onLogin,
  onForgotPassword,
  onRegister,
  onOtpLogin,
}: {
  onLogin: (userData: UserData) => void
  onForgotPassword: () => void
  onRegister: () => void
  onOtpLogin: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter your email or phone'); return }
    if (!password) { setError('Please enter your password'); return }
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid email or password')
        setIsLoading(false)
        return
      }
      setIsLoading(false)
      onLogin(data.user)
    } catch {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to your ShopZone account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="login-email">Email or Phone</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="login-email"
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground font-medium">OR</span>
        <Separator className="flex-1" />
      </div>

      {/* Social login buttons */}
      <div className="space-y-3">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl font-medium"
            onClick={() => setGoogleDialogOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl font-medium"
            onClick={onOtpLogin}
          >
            <Phone className="w-4 h-4 mr-2" />
            Login with OTP
          </Button>
        </motion.div>
      </div>

      {/* Google Login Dialog */}
      <GoogleLoginDialog
        open={googleDialogOpen}
        onOpenChange={setGoogleDialogOpen}
        onSuccess={onLogin}
      />

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        New to ShopZone?{' '}
        <button
          type="button"
          onClick={onRegister}
          className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold"
        >
          Register
        </button>
      </p>
    </div>
  )
}

// ── Register Form ──────────────────────────────────────────────────────

function RegisterForm({
  onRegister,
  onLogin,
}: {
  onRegister: (userData: UserData) => void
  onLogin: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    const levels = [
      { level: 1, label: 'Weak', color: 'bg-red-500' },
      { level: 2, label: 'Fair', color: 'bg-orange-500' },
      { level: 3, label: 'Good', color: 'bg-yellow-500' },
      { level: 4, label: 'Strong', color: 'bg-green-500' },
    ]
    return levels[score - 1] || { level: 0, label: '', color: '' }
  }

  const strength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      })
      const data = await res.json()
      setIsLoading(false)
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      // Pass user data from the API response so the name is the one they entered
      onRegister(data.user)
    } catch {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Join ShopZone and start shopping today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="reg-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reg-phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {/* Password strength indicator */}
          {password && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= strength.level ? strength.color : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength:{' '}
                <span className="font-medium">{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="reg-confirm"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-referral" className="text-muted-foreground">
            Referral Code (Optional)
          </Label>
          <Input
            id="reg-referral"
            type="text"
            placeholder="Enter referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="rounded-lg"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        <div className="flex items-start gap-2">
          <Checkbox
            id="reg-terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            className="mt-0.5"
          />
          <Label htmlFor="reg-terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            I agree to the{' '}
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              Privacy Policy
            </span>
          </Label>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Register
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onLogin}
          className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold"
        >
          Login
        </button>
      </p>
    </div>
  )
}

// ── OTP Verification Form ──────────────────────────────────────────────

function OtpForm({
  onVerify,
  onBack,
}: {
  onVerify: (userData: UserData) => void
  onBack: () => void
}) {
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setOtpSent(true)
      setResendTimer(30)
    }
  }

  const handleVerify = () => {
    if (otp.length === 6) {
      setIsLoading(true)
      // Simulate OTP verification and login with phone-based user
      setTimeout(() => {
        setIsLoading(false)
        onVerify({
          id: 'user-phone-' + Date.now(),
          name: name || phone,
          email: '',
          phone: phone,
          role: 'customer',
          walletBalance: 0,
          rewardPoints: 0,
        })
      }, 1000)
    }
  }

  const handleResend = () => {
    setResendTimer(30)
    setOtp('')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">OTP Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {otpSent
            ? `We've sent a 6-digit code to ${phone}`
            : 'Enter your phone number to receive an OTP'}
        </p>
      </div>

      {!otpSent ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp-name">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="otp-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="otp-phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
          <Button
            onClick={handleSendOtp}
            disabled={phone.length < 10}
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold"
          >
            Send OTP
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-center block">Enter 6-digit OTP</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-11 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-11 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-11 h-12 text-lg" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="w-11 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-11 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-11 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={handleVerify}
              disabled={otp.length < 6 || isLoading}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Verify
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>

          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend OTP in{' '}
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {resendTimer}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="block mx-auto text-sm text-muted-foreground hover:text-foreground mt-6"
      >
        &larr; Back to Login
      </button>
    </div>
  )
}

// ── Forgot Password Form ───────────────────────────────────────────────

function ForgotPasswordForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [error, setError] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  const handleSendOtp = async () => {
    if (!email.trim()) return
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      setIsLoading(false)
      if (res.ok) {
        setStep('otp')
        setResendTimer(30)
        setGeneratedOtp(data.otp || '')
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setStep('reset')
      }, 800)
    }
  }

  const handleResetPassword = () => {
    setError('')
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSuccess()
    }, 1000)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Forgot Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 'email' && 'Enter your email to receive a verification code'}
          {step === 'otp' && `Enter the OTP sent to ${email}`}
          {step === 'reset' && 'Set your new password'}
        </p>
      </div>

      {step === 'email' && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fp-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="fp-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-lg"
                required
              />
            </div>
          </div>
          <Button
            onClick={handleSendOtp}
            disabled={!email || isLoading}
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Send OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          {generatedOtp && (
            <div className="p-3 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
              Demo OTP: <span className="font-bold">{generatedOtp}</span>
            </div>
          )}
          <div className="space-y-3">
            <Label className="text-center block">Enter 6-digit OTP</Label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-11 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-11 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-11 h-12 text-lg" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="w-11 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-11 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-11 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button
            onClick={handleVerifyOtp}
            disabled={otp.length < 6 || isLoading}
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify OTP'
            )}
          </Button>

          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend OTP in{' '}
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {resendTimer}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setResendTimer(30)}
                className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'reset' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fp-new-pass">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="fp-new-pass"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fp-confirm-pass">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="fp-confirm-pass"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 rounded-lg"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <Button
            onClick={handleResetPassword}
            disabled={!newPassword || !confirmPassword || isLoading}
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="block mx-auto text-sm text-muted-foreground hover:text-foreground mt-6"
      >
        &larr; Back to Login
      </button>
    </div>
  )
}
