'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, IndianRupee,
  Tag, Settings, Plus, Edit, Trash2, Search, Filter, Download,
  Eye, TrendingUp, Users, ArrowUpRight, ArrowDownRight,
  ChevronLeft, Menu, X, Upload, MoreVertical, CheckCircle,
  Clock, Truck, XCircle, AlertCircle, Wallet, Banknote,
  CreditCard, Store, Star, Copy, ToggleLeft, ToggleRight,
  MapPin, Phone, Mail, Globe, FileText, Shield, Image as ImageIcon,
  ChevronDown, ChevronRight, RefreshCcw
} from 'lucide-react'

import { useAuthStore } from '@/store/auth-store'
import { useNavigationStore } from '@/store/navigation-store'
import { formatPrice, products, categories } from '@/lib/mock-data'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

import {
  AreaChart, LineChart, PieChart, BarChart,
  Area, Line, Pie, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// ==================== MOCK DATA ====================
const revenueData = [
  { day: 'Mon', revenue: 42000, orders: 32 },
  { day: 'Tue', revenue: 38000, orders: 28 },
  { day: 'Wed', revenue: 55000, orders: 41 },
  { day: 'Thu', revenue: 49000, orders: 36 },
  { day: 'Fri', revenue: 62000, orders: 48 },
  { day: 'Sat', revenue: 71000, orders: 55 },
  { day: 'Sun', revenue: 65000, orders: 50 },
]

const monthlySalesData = [
  { month: 'Jan', sales: 285000, expenses: 180000 },
  { month: 'Feb', sales: 310000, expenses: 195000 },
  { month: 'Mar', sales: 345000, expenses: 210000 },
  { month: 'Apr', sales: 298000, expenses: 188000 },
  { month: 'May', sales: 380000, expenses: 225000 },
  { month: 'Jun', sales: 420000, expenses: 240000 },
  { month: 'Jul', sales: 395000, expenses: 235000 },
  { month: 'Aug', sales: 450000, expenses: 255000 },
  { month: 'Sep', sales: 410000, expenses: 230000 },
  { month: 'Oct', sales: 480000, expenses: 265000 },
  { month: 'Nov', sales: 520000, expenses: 280000 },
  { month: 'Dec', sales: 580000, expenses: 310000 },
]

const ordersByStatusData = [
  { name: 'Delivered', value: 450, color: '#22c55e' },
  { name: 'Processing', value: 120, color: '#f59e0b' },
  { name: 'Shipped', value: 85, color: '#3b82f6' },
  { name: 'Pending', value: 65, color: '#8b5cf6' },
  { name: 'Cancelled', value: 30, color: '#ef4444' },
]

const topCategoriesData = [
  { name: 'Electronics', sales: 2450000 },
  { name: 'Fashion', sales: 1850000 },
  { name: 'Home', sales: 980000 },
  { name: 'Beauty', sales: 750000 },
  { name: 'Sports', sales: 620000 },
  { name: 'Books', sales: 480000 },
]

const recentOrders = [
  { id: 'ORD-7845', customer: 'Rahul Sharma', items: 3, total: 4599, status: 'Delivered' as const, date: '2024-01-15' },
  { id: 'ORD-7844', customer: 'Priya Patel', items: 1, total: 1299, status: 'Processing' as const, date: '2024-01-15' },
  { id: 'ORD-7843', customer: 'Amit Kumar', items: 2, total: 8999, status: 'Shipped' as const, date: '2024-01-14' },
  { id: 'ORD-7842', customer: 'Sneha Reddy', items: 5, total: 3499, status: 'Pending' as const, date: '2024-01-14' },
  { id: 'ORD-7841', customer: 'Vikram Singh', items: 1, total: 54999, status: 'Cancelled' as const, date: '2024-01-13' },
]

const allOrders = [
  { id: 'ORD-7845', customer: 'Rahul Sharma', email: 'rahul@email.com', items: [{ name: 'Samsung Galaxy S24', qty: 1, price: 109999 }, { name: 'Case', qty: 2, price: 499 }], total: 110997, status: 'Delivered' as const, date: '2024-01-15', address: '123 MG Road, Bangalore, KA 560001' },
  { id: 'ORD-7844', customer: 'Priya Patel', email: 'priya@email.com', items: [{ name: 'Nike Air Max', qty: 1, price: 12999 }], total: 12999, status: 'Processing' as const, date: '2024-01-15', address: '45 Park Street, Mumbai, MH 400001' },
  { id: 'ORD-7843', customer: 'Amit Kumar', email: 'amit@email.com', items: [{ name: 'Sony WH-1000XM5', qty: 1, price: 29990 }, { name: 'Carrying Case', qty: 1, price: 1499 }], total: 31489, status: 'Shipped' as const, date: '2024-01-14', address: '78 Sector 15, Noida, UP 201301' },
  { id: 'ORD-7842', customer: 'Sneha Reddy', email: 'sneha@email.com', items: [{ name: 'T-Shirt Pack', qty: 3, price: 999 }, { name: 'Jeans', qty: 1, price: 2499 }, { name: 'Sneakers', qty: 1, price: 3999 }], total: 9496, status: 'Pending' as const, date: '2024-01-14', address: '22 Jubilee Hills, Hyderabad, TS 500033' },
  { id: 'ORD-7841', customer: 'Vikram Singh', email: 'vikram@email.com', items: [{ name: 'iPhone 15 Pro Max', qty: 1, price: 144900 }], total: 144900, status: 'Cancelled' as const, date: '2024-01-13', address: '56 Civil Lines, Delhi, DL 110054' },
  { id: 'ORD-7840', customer: 'Anita Desai', email: 'anita@email.com', items: [{ name: 'Lakme Lipstick Set', qty: 2, price: 899 }, { name: 'Foundation', qty: 1, price: 1599 }], total: 3397, status: 'Delivered' as const, date: '2024-01-13', address: '12 Koregaon Park, Pune, MH 411001' },
  { id: 'ORD-7839', customer: 'Ravi Verma', email: 'ravi@email.com', items: [{ name: 'Dumbbell Set', qty: 1, price: 4999 }], total: 4999, status: 'Shipped' as const, date: '2024-01-12', address: '89 Salt Lake, Kolkata, WB 700091' },
  { id: 'ORD-7838', customer: 'Meera Joshi', email: 'meera@email.com', items: [{ name: 'Cookware Set', qty: 1, price: 7999 }, { name: 'Kitchen Knife Set', qty: 1, price: 2499 }], total: 10498, status: 'Delivered' as const, date: '2024-01-12', address: '34 Anna Nagar, Chennai, TN 600040' },
]

const sellerCoupons = [
  { id: 'c-1', code: 'SAVE20', type: 'percentage' as const, value: 20, minOrder: 500, maxDiscount: 200, expiry: '2024-03-31', isActive: true, usedCount: 234 },
  { id: 'c-2', code: 'FLAT100', type: 'fixed' as const, value: 100, minOrder: 1000, maxDiscount: 100, expiry: '2024-02-28', isActive: true, usedCount: 567 },
  { id: 'c-3', code: 'NEWUSER15', type: 'percentage' as const, value: 15, minOrder: 0, maxDiscount: 150, expiry: '2024-04-30', isActive: false, usedCount: 89 },
  { id: 'c-4', code: 'SUPER50', type: 'fixed' as const, value: 50, minOrder: 300, maxDiscount: 50, expiry: '2024-02-15', isActive: true, usedCount: 1234 },
  { id: 'c-5', code: 'MEGA30', type: 'percentage' as const, value: 30, minOrder: 2000, maxDiscount: 500, expiry: '2024-05-31', isActive: true, usedCount: 45 },
]

const transactionHistory = [
  { id: 'tx-1', date: '2024-01-15', type: 'Order Payment', amount: 4599, status: 'completed' as const },
  { id: 'tx-2', date: '2024-01-14', type: 'Withdrawal', amount: -25000, status: 'completed' as const },
  { id: 'tx-3', date: '2024-01-13', type: 'Order Payment', amount: 8999, status: 'completed' as const },
  { id: 'tx-4', date: '2024-01-12', type: 'Refund', amount: -1299, status: 'completed' as const },
  { id: 'tx-5', date: '2024-01-11', type: 'Order Payment', amount: 3499, status: 'pending' as const },
  { id: 'tx-6', date: '2024-01-10', type: 'Order Payment', amount: 54999, status: 'completed' as const },
  { id: 'tx-7', date: '2024-01-09', type: 'Withdrawal', amount: -50000, status: 'completed' as const },
  { id: 'tx-8', date: '2024-01-08', type: 'Order Payment', amount: 12999, status: 'completed' as const },
]

const topSellingProducts = [
  { name: 'Samsung Galaxy S24 Ultra', sold: 1520, revenue: 167280000 },
  { name: 'iPhone 15 Pro Max', sold: 1850, revenue: 268065000 },
  { name: 'Nike Air Max 270', sold: 980, revenue: 12740000 },
  { name: 'Sony WH-1000XM5', sold: 760, revenue: 22792400 },
  { name: 'OnePlus 12', sold: 890, revenue: 48949890 },
]

// Chart configs
const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#f97316' },
}

const salesChartConfig: ChartConfig = {
  sales: { label: 'Sales', color: '#f97316' },
  expenses: { label: 'Expenses', color: '#ef4444' },
}

const categoriesChartConfig: ChartConfig = {
  sales: { label: 'Sales', color: '#f97316' },
}

// Status helpers
const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Shipped: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Pending: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusIcons: Record<string, React.ReactNode> = {
  Delivered: <CheckCircle className="h-3.5 w-3.5" />,
  Processing: <Clock className="h-3.5 w-3.5" />,
  Shipped: <Truck className="h-3.5 w-3.5" />,
  Pending: <AlertCircle className="h-3.5 w-3.5" />,
  Cancelled: <XCircle className="h-3.5 w-3.5" />,
}

// Nav tabs definition
const navTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'earnings', label: 'Earnings', icon: IndianRupee },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'settings', label: 'Store Settings', icon: Settings },
]

// ==================== MAIN COMPONENT ====================
export default function SellerPanel() {
  const { sellerTab } = useNavigationStore()
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(sellerTab || 'dashboard')
  const [productSearch, setProductSearch] = useState('')
  const [productFilter, setProductFilter] = useState('all')
  const [orderFilter, setOrderFilter] = useState('All')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [createCouponOpen, setCreateCouponOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())

  // Sync with store
  const currentTab = sellerTab || activeTab

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  // Filter products for this seller
  const sellerProducts = useMemo(() => {
    return products.filter(p => p.sellerId === 'sel-1')
  }, [])

  const filteredProducts = useMemo(() => {
    let result = sellerProducts
    if (productSearch) {
      const q = productSearch.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    if (productFilter === 'active') result = result.filter(p => p.isActive)
    if (productFilter === 'inactive') result = result.filter(p => !p.isActive)
    if (productFilter === 'low-stock') result = result.filter(p => p.stock < 20)
    return result
  }, [sellerProducts, productSearch, productFilter])

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'All') return allOrders
    return allOrders.filter(o => o.status === orderFilter)
  }, [orderFilter])

  const toggleOrderSelect = (id: string) => {
    const next = new Set(selectedOrders)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedOrders(next)
  }

  const toggleAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
              TW
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">TechWorld India</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Verified Seller</p>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navTabs.map(tab => {
              const Icon = tab.icon
              const isActive = currentTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{tab.label}</span>
                  {tab.id === 'orders' && (
                    <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-orange-500 text-white">{allOrders.filter(o => o.status === 'Pending').length}</Badge>
                  )}
                </motion.button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{user?.name || 'TechWorld Admin'}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Seller Account</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 lg:px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                {navTabs.find(t => t.id === currentTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Welcome back, {user?.name || 'TechWorld Admin'}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+12.5%</span>
                <span className="text-gray-500 dark:text-zinc-400">vs last month</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="text-sm">
                <span className="text-gray-500 dark:text-zinc-400">Today: </span>
                <span className="font-semibold text-gray-900 dark:text-zinc-100">{formatPrice(28500)}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentTab === 'dashboard' && <DashboardTab key="dashboard" />}
            {currentTab === 'products' && (
              <ProductsTab
                key="products"
                products={filteredProducts}
                search={productSearch}
                setSearch={setProductSearch}
                filter={productFilter}
                setFilter={setProductFilter}
                addProductOpen={addProductOpen}
                setAddProductOpen={setAddProductOpen}
              />
            )}
            {currentTab === 'orders' && (
              <OrdersTab
                key="orders"
                orders={filteredOrders}
                filter={orderFilter}
                setFilter={setOrderFilter}
                expandedOrder={expandedOrder}
                setExpandedOrder={setExpandedOrder}
                selectedOrders={selectedOrders}
                toggleOrderSelect={toggleOrderSelect}
                toggleAllOrders={toggleAllOrders}
              />
            )}
            {currentTab === 'analytics' && <AnalyticsTab key="analytics" />}
            {currentTab === 'earnings' && (
              <EarningsTab
                key="earnings"
                withdrawOpen={withdrawOpen}
                setWithdrawOpen={setWithdrawOpen}
              />
            )}
            {currentTab === 'coupons' && (
              <CouponsTab
                key="coupons"
                createCouponOpen={createCouponOpen}
                setCreateCouponOpen={setCreateCouponOpen}
              />
            )}
            {currentTab === 'settings' && <SettingsTab key="settings" />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ==================== DASHBOARD TAB ====================
function DashboardTab() {
  const { navigate } = useNavigationStore()

  const stats = [
    { title: 'Total Revenue', value: formatPrice(4865000), change: '+12.5%', up: true, icon: IndianRupee, color: 'from-orange-500 to-amber-500' },
    { title: 'Total Orders', value: '1,234', change: '+8.2%', up: true, icon: ShoppingCart, color: 'from-emerald-500 to-teal-500' },
    { title: 'Total Products', value: '120', change: '+3', up: true, icon: Package, color: 'from-violet-500 to-purple-500' },
    { title: 'Total Customers', value: '856', change: '+15.3%', up: true, icon: Users, color: 'from-sky-500 to-blue-500' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Chart + Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <CardDescription>Last 7 days revenue</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-zinc-700" />
                <XAxis dataKey="day" className="text-xs" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatPrice(value), 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#fillRevenue)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Selling Products</CardTitle>
            <CardDescription>By revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-4">
                {topSellingProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i < 3 ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-gray-300 dark:bg-zinc-600'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{product.sold.toLocaleString()} sold</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{formatPrice(product.revenue / 1000)}k</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => navigate('seller-panel', { tab: 'orders' })}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Order</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs">{order.id}</TableCell>
                      <TableCell className="text-xs">{order.customer}</TableCell>
                      <TableCell className="text-xs font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status]} text-[10px] gap-1`}>
                          {statusIcons[order.status]}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-zinc-400">{order.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full justify-start gap-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                onClick={() => navigate('seller-panel', { tab: 'products' })}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => navigate('seller-panel', { tab: 'orders' })}
              >
                <ShoppingCart className="h-4 w-4" />
                View Orders
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => navigate('seller-panel', { tab: 'settings' })}
              >
                <Store className="h-4 w-4" />
                Manage Store
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => navigate('seller-panel', { tab: 'analytics' })}
              >
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => navigate('seller-panel', { tab: 'coupons' })}
              >
                <Tag className="h-4 w-4" />
                Create Coupon
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// ==================== PRODUCTS TAB ====================
function ProductsTab({ products: productList, search, setSearch, filter, setFilter, addProductOpen, setAddProductOpen }: {
  products: typeof products
  search: string
  setSearch: (s: string) => void
  filter: string
  setFilter: (f: string) => void
  addProductOpen: boolean
  setAddProductOpen: (o: boolean) => void
}) {
  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId)
    return cat?.name || 'Unknown'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the product details below</DialogDescription>
              </DialogHeader>
              <AddProductForm onClose={() => setAddProductOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Count */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
        <span>Showing {productList.length} product{productList.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Price</TableHead>
                  <TableHead className="text-xs">Stock</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500 dark:text-zinc-400">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-zinc-600" />
                      <p className="font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  productList.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-zinc-700"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate max-w-[200px]">{product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">{product.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{getCategoryName(product.categoryId)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{formatPrice(product.salePrice)}</p>
                          {product.discount > 0 && (
                            <p className="text-xs text-gray-500 dark:text-zinc-400 line-through">{formatPrice(product.basePrice)}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${product.stock < 20 ? 'text-red-600' : 'text-gray-900 dark:text-zinc-100'}`}>
                            {product.stock}
                          </span>
                          {product.stock < 20 && (
                            <Badge variant="destructive" className="text-[10px] px-1">Low</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={product.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== ADD PRODUCT FORM ====================
function AddProductForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', brand: '', basePrice: '',
    salePrice: '', stock: '', colors: '', sizes: '', specifications: '',
    tags: '', highlights: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input placeholder="Enter product name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Brand</Label>
          <Input placeholder="Enter brand" value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Enter product description" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.filter(c => !c.parentId).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stock</Label>
          <Input type="number" placeholder="0" value={formData.stock} onChange={(e) => handleChange('stock', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Base Price (₹)</Label>
          <Input type="number" placeholder="0" value={formData.basePrice} onChange={(e) => handleChange('basePrice', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Sale Price (₹)</Label>
          <Input type="number" placeholder="0" value={formData.salePrice} onChange={(e) => handleChange('salePrice', e.target.value)} />
        </div>
      </div>

      {/* Image Upload Area */}
      <div className="space-y-2">
        <Label>Product Images</Label>
        <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-zinc-400">Click or drag to upload images</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">PNG, JPG up to 5MB each</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Colors (comma separated)</Label>
          <Input placeholder="e.g., Red, Blue, Black" value={formData.colors} onChange={(e) => handleChange('colors', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Sizes (comma separated)</Label>
          <Input placeholder="e.g., S, M, L, XL" value={formData.sizes} onChange={(e) => handleChange('sizes', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Specifications</Label>
        <Textarea placeholder="Key:Value per line (e.g., Display:6.7&quot; AMOLED)" rows={3} value={formData.specifications} onChange={(e) => handleChange('specifications', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input placeholder="e.g., premium, 5g, new" value={formData.tags} onChange={(e) => handleChange('tags', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Highlights (comma separated)</Label>
          <Input placeholder="e.g., Fast Charging, AMOLED" value={formData.highlights} onChange={(e) => handleChange('highlights', e.target.value)} />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white" onClick={onClose}>
          Add Product
        </Button>
      </DialogFooter>
    </div>
  )
}

// ==================== ORDERS TAB ====================
function OrdersTab({ orders, filter, setFilter, expandedOrder, setExpandedOrder, selectedOrders, toggleOrderSelect, toggleAllOrders }: {
  orders: typeof allOrders
  filter: string
  setFilter: (f: string) => void
  expandedOrder: string | null
  setExpandedOrder: (id: string | null) => void
  selectedOrders: Set<string>
  toggleOrderSelect: (id: string) => void
  toggleAllOrders: () => void
}) {
  const statusFilters = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map(s => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            className={filter === s ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : ''}
            onClick={() => setFilter(s)}
          >
            {s}
            {s !== 'All' && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                {allOrders.filter(o => o.status === s).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
        >
          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
            {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
          </span>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Mark Shipped
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Mark Delivered
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-red-500">
            <XCircle className="h-3.5 w-3.5" /> Cancel
          </Button>
        </motion.div>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-10">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleAllOrders}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead className="text-xs">Order #</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Items</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <>
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelect(order.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-xs">{order.id}</TableCell>
                      <TableCell className="text-xs">{order.customer}</TableCell>
                      <TableCell className="text-xs">{order.items.length} item{order.items.length > 1 ? 's' : ''}</TableCell>
                      <TableCell className="text-xs font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status]} text-[10px] gap-1`}>
                          {statusIcons[order.status]}
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-zinc-400">{order.date}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {expandedOrder === order.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Expanded Order Detail */}
                    <AnimatePresence key={`${order.id}-detail`}>
                      {expandedOrder === order.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 dark:bg-zinc-800/50"
                        >
                          <TableCell colSpan={8} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Items */}
                              <div className="md:col-span-2">
                                <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-zinc-100">Order Items</h4>
                                <div className="space-y-2">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm bg-white dark:bg-zinc-900 rounded-lg p-2.5">
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-zinc-100">{item.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400">Qty: {item.qty}</p>
                                      </div>
                                      <p className="font-medium text-gray-900 dark:text-zinc-100">{formatPrice(item.price * item.qty)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Customer Info & Status Update */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-zinc-100">Customer</h4>
                                  <div className="text-sm space-y-1">
                                    <p className="text-gray-900 dark:text-zinc-100">{order.customer}</p>
                                    <p className="text-gray-500 dark:text-zinc-400">{order.email}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-zinc-100">Address</h4>
                                  <p className="text-xs text-gray-500 dark:text-zinc-400">{order.address}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-zinc-100">Update Status</h4>
                                  <Select defaultValue={order.status}>
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                      <SelectItem value="Processing">Processing</SelectItem>
                                      <SelectItem value="Shipped">Shipped</SelectItem>
                                      <SelectItem value="Delivered">Delivered</SelectItem>
                                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== ANALYTICS TAB ====================
function AnalyticsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Sales Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Sales Overview</CardTitle>
              <CardDescription>Monthly sales and expenses comparison</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-gray-600 dark:text-zinc-400">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-zinc-400">Expenses</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
            <LineChart data={monthlySalesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-zinc-700" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'currentColor', fontSize: 12 }} />
              <YAxis className="text-xs" tick={{ fill: 'currentColor', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip
                formatter={(value: number, name: string) => [formatPrice(value), name === 'sales' ? 'Sales' : 'Expenses']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[280px] w-full">
              <PieChart>
                <Pie
                  data={ordersByStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ordersByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} orders`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {ordersByStatusData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-zinc-400">{item.name}</span>
                  <span className="font-medium text-gray-900 dark:text-zinc-100">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Categories</CardTitle>
            <CardDescription>Sales by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoriesChartConfig} className="h-[280px] w-full">
              <BarChart data={topCategoriesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-zinc-700" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'currentColor', fontSize: 10 }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  formatter={(value: number) => [formatPrice(value), 'Sales']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
          <CardDescription>Yearly comparison with profit margin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(4865000)}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{formatPrice(2803000)}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-orange-600 dark:text-orange-400">Net Profit</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{formatPrice(2062000)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-zinc-400">Profit Margin</span>
                <span className="font-medium text-emerald-600">42.4%</span>
              </div>
              <Progress value={42.4} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-zinc-400">Revenue Target</span>
                <span className="font-medium text-orange-600">81.1%</span>
              </div>
              <Progress value={81.1} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Demographics</CardTitle>
          <CardDescription>Top customer locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { region: 'Maharashtra', customers: 234, percentage: 27 },
              { region: 'Karnataka', customers: 189, percentage: 22 },
              { region: 'Delhi NCR', customers: 156, percentage: 18 },
              { region: 'Tamil Nadu', customers: 134, percentage: 16 },
              { region: 'Telangana', customers: 78, percentage: 9 },
              { region: 'West Bengal', customers: 42, percentage: 5 },
              { region: 'Gujarat', customers: 15, percentage: 2 },
              { region: 'Others', customers: 8, percentage: 1 },
            ].map(item => (
              <div key={item.region} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{item.region}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={item.percentage} className="h-1.5 flex-1" />
                    <span className="text-xs text-gray-500 dark:text-zinc-400">{item.customers}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== EARNINGS TAB ====================
function EarningsTab({ withdrawOpen, setWithdrawOpen }: {
  withdrawOpen: boolean
  setWithdrawOpen: (o: boolean) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Earnings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5" />
                <p className="text-sm font-medium text-white/80">Total Earnings</p>
              </div>
              <p className="text-3xl font-bold">{formatPrice(4865000)}</p>
              <p className="text-sm text-white/70 mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="h-5 w-5" />
                <p className="text-sm font-medium text-white/80">Available for Withdrawal</p>
              </div>
              <p className="text-3xl font-bold">{formatPrice(2345000)}</p>
              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>Transfer funds to your bank account</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Available Balance</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(2345000)}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input type="number" placeholder="Enter amount" />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Account</Label>
                      <Select defaultValue="acc-1">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acc-1">HDFC Bank - ****4532</SelectItem>
                          <SelectItem value="acc-2">SBI - ****7891</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Withdrawal will be processed within 2-3 business days</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white" onClick={() => setWithdrawOpen(false)}>
                      Confirm Withdrawal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Card className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <p className="text-sm font-medium text-white/80">Pending Clearance</p>
              </div>
              <p className="text-3xl font-bold">{formatPrice(892000)}</p>
              <p className="text-sm text-white/70 mt-1">Will clear in 3-5 days</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Transaction History</CardTitle>
              <CardDescription>All earnings and withdrawal records</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionHistory.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs text-gray-500 dark:text-zinc-400">{tx.date}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-zinc-100">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-xs font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatPrice(Math.abs(tx.amount))}
                    </TableCell>
                    <TableCell>
                      <Badge className={tx.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }>
                        {tx.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== COUPONS TAB ====================
function CouponsTab({ createCouponOpen, setCreateCouponOpen }: {
  createCouponOpen: boolean
  setCreateCouponOpen: (o: boolean) => void
}) {
  const [couponToggles, setCouponToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(sellerCoupons.map(c => [c.id, c.isActive]))
  )

  const toggleCoupon = (id: string) => {
    setCouponToggles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Your Coupons</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{sellerCoupons.length} active coupons</p>
        </div>
        <Dialog open={createCouponOpen} onOpenChange={setCreateCouponOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>Create a discount coupon for your customers</DialogDescription>
            </DialogHeader>
            <CreateCouponForm onClose={() => setCreateCouponOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sellerCoupons.map(coupon => (
          <motion.div
            key={coupon.id}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className={`relative overflow-hidden ${!couponToggles[coupon.id] ? 'opacity-60' : ''}`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-amber-500" />
              <CardContent className="p-4 pl-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-orange-500" />
                    <span className="font-bold text-lg text-gray-900 dark:text-zinc-100">{coupon.code}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => navigator.clipboard?.writeText(coupon.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Switch
                    checked={couponToggles[coupon.id]}
                    onCheckedChange={() => toggleCoupon(coupon.id)}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3">
                  {coupon.type === 'percentage' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}
                  {coupon.minOrder > 0 && ` on orders above ${formatPrice(coupon.minOrder)}`}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
                  <span>Max: {formatPrice(coupon.maxDiscount)}</span>
                  <span>Used: {coupon.usedCount}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Expires: {coupon.expiry}</span>
                  <Badge className={couponToggles[coupon.id]
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }>
                    {couponToggles[coupon.id] ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ==================== CREATE COUPON FORM ====================
function CreateCouponForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiry: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Coupon Code</Label>
          <Input placeholder="e.g., SUMMER20" value={formData.code} onChange={(e) => handleChange('code', e.target.value.toUpperCase())} />
        </div>
        <div className="space-y-2">
          <Label>Discount Type</Label>
          <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{formData.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}</Label>
          <Input type="number" placeholder="0" value={formData.value} onChange={(e) => handleChange('value', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Minimum Order (₹)</Label>
          <Input type="number" placeholder="0" value={formData.minOrder} onChange={(e) => handleChange('minOrder', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Maximum Discount (₹)</Label>
          <Input type="number" placeholder="0" value={formData.maxDiscount} onChange={(e) => handleChange('maxDiscount', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Expiry Date</Label>
          <Input type="date" value={formData.expiry} onChange={(e) => handleChange('expiry', e.target.value)} />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white" onClick={onClose}>
          Create Coupon
        </Button>
      </DialogFooter>
    </div>
  )
}

// ==================== SETTINGS TAB ====================
function SettingsTab() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'TechWorld India',
    description: 'Your one-stop destination for premium electronics and gadgets. We offer authentic products with manufacturer warranty and fast delivery across India.',
    gstNumber: '27AABCU9603R1ZP',
    panNumber: 'AABCU9603R',
    bankName: 'HDFC Bank',
    accountNumber: '50100XXXXX4532',
    ifscCode: 'HDFC0001234',
    accountHolder: 'TechWorld India Pvt Ltd',
    shippingFreeAbove: '500',
    shippingCharge: '49',
    returnPolicy: '7-day return policy for all products. Items must be in original packaging with all accessories. Refund will be processed within 5-7 business days after receiving the returned item.',
  })

  const handleChange = (field: string, value: string) => {
    setStoreSettings(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="h-4 w-4 text-orange-500" />
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input value={storeSettings.storeName} onChange={(e) => handleChange('storeName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Store Logo</Label>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                  TW
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Logo
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Store Banner</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-zinc-400">Click to upload store banner</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Recommended: 1200x300px</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Store Description</Label>
            <Textarea
              rows={3}
              value={storeSettings.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            Tax Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input value={storeSettings.gstNumber} onChange={(e) => handleChange('gstNumber', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>PAN Number</Label>
              <Input value={storeSettings.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-orange-500" />
            Bank Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input value={storeSettings.bankName} onChange={(e) => handleChange('bankName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Account Holder</Label>
              <Input value={storeSettings.accountHolder} onChange={(e) => handleChange('accountHolder', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input value={storeSettings.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input value={storeSettings.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-3.5 w-3.5" />
                Add Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-500" />
            Shipping Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Free Shipping Above (₹)</Label>
              <Input type="number" value={storeSettings.shippingFreeAbove} onChange={(e) => handleChange('shippingFreeAbove', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Shipping Charge (₹)</Label>
              <Input type="number" value={storeSettings.shippingCharge} onChange={(e) => handleChange('shippingCharge', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-orange-500" />
            Return Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={storeSettings.returnPolicy}
            onChange={(e) => handleChange('returnPolicy', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Discard Changes</Button>
        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2">
          <CheckCircle className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </motion.div>
  )
}
