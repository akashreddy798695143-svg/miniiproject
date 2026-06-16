'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth-store'
import { useNavigationStore } from '@/store/navigation-store'
import { formatPrice, products, categories, brands, sellers, coupons } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  LayoutDashboard, Users, Store, Package, ShoppingCart, FolderTree,
  Award, Image, Tag, FileText, Search, Filter, Download, Eye, Edit,
  Trash2, Check, X, MoreVertical, TrendingUp, AlertTriangle, ShieldCheck,
  Menu, ChevronLeft, DollarSign, UserCheck, RotateCcw, Clock,
  ArrowUpRight, ArrowDownRight, Activity, Star, BarChart3, PieChart as PieChartIcon,
  Plus, Upload, ToggleLeft, Copy, Mail, Phone, Calendar, Globe,
  Server, Database, Zap, RefreshCw
} from 'lucide-react'
import {
  AreaChart, LineChart, PieChart, BarChart, Area, Line, Pie, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from '@/components/ui/chart'

// ==================== MOCK DATA FOR ADMIN ====================
const mockUsers = [
  { id: 'u-1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210', role: 'customer' as const, status: 'active' as const, joined: '2024-01-15', avatar: 'RS', orders: 12, spent: 45600 },
  { id: 'u-2', name: 'Priya Patel', email: 'priya@example.com', phone: '+91 87654 32109', role: 'seller' as const, status: 'active' as const, joined: '2024-02-20', avatar: 'PP', orders: 0, spent: 0 },
  { id: 'u-3', name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 76543 21098', role: 'customer' as const, status: 'blocked' as const, joined: '2024-03-10', avatar: 'AK', orders: 5, spent: 12300 },
  { id: 'u-4', name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 65432 10987', role: 'customer' as const, status: 'active' as const, joined: '2024-04-05', avatar: 'SR', orders: 8, spent: 28900 },
  { id: 'u-5', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 54321 09876', role: 'seller' as const, status: 'active' as const, joined: '2024-05-12', avatar: 'VS', orders: 0, spent: 0 },
  { id: 'u-6', name: 'Neha Gupta', email: 'neha@example.com', phone: '+91 43210 98765', role: 'customer' as const, status: 'inactive' as const, joined: '2024-06-01', avatar: 'NG', orders: 2, spent: 5400 },
  { id: 'u-7', name: 'Arjun Menon', email: 'arjun@example.com', phone: '+91 32109 87654', role: 'admin' as const, status: 'active' as const, joined: '2023-12-01', avatar: 'AM', orders: 0, spent: 0 },
  { id: 'u-8', name: 'Kavita Joshi', email: 'kavita@example.com', phone: '+91 21098 76543', role: 'customer' as const, status: 'active' as const, joined: '2024-07-18', avatar: 'KJ', orders: 15, spent: 67200 },
]

const mockOrders = [
  { id: 'ORD-001', customer: 'Rahul Sharma', items: 3, total: 15499, status: 'delivered' as const, payment: 'Paid', date: '2024-03-15' },
  { id: 'ORD-002', customer: 'Priya Patel', items: 1, total: 8999, status: 'shipped' as const, payment: 'Paid', date: '2024-03-16' },
  { id: 'ORD-003', customer: 'Sneha Reddy', items: 2, total: 3249, status: 'processing' as const, payment: 'Paid', date: '2024-03-17' },
  { id: 'ORD-004', customer: 'Amit Kumar', items: 1, total: 59999, status: 'pending' as const, payment: 'COD', date: '2024-03-18' },
  { id: 'ORD-005', customer: 'Kavita Joshi', items: 4, total: 2399, status: 'cancelled' as const, payment: 'Refunded', date: '2024-03-19' },
  { id: 'ORD-006', customer: 'Vikram Singh', items: 2, total: 7899, status: 'returned' as const, payment: 'Refunded', date: '2024-03-20' },
  { id: 'ORD-007', customer: 'Neha Gupta', items: 1, total: 1299, status: 'delivered' as const, payment: 'Paid', date: '2024-03-21' },
  { id: 'ORD-008', customer: 'Arjun Menon', items: 3, total: 45999, status: 'processing' as const, payment: 'Paid', date: '2024-03-22' },
]

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  revenue: Math.floor(Math.random() * 80000) + 40000,
  orders: Math.floor(Math.random() * 120) + 60,
}))

const orderStatusData = [
  { name: 'Delivered', value: 45, color: '#22c55e' },
  { name: 'Shipped', value: 20, color: '#3b82f6' },
  { name: 'Processing', value: 15, color: '#f59e0b' },
  { name: 'Pending', value: 10, color: '#8b5cf6' },
  { name: 'Cancelled', value: 7, color: '#ef4444' },
  { name: 'Returned', value: 3, color: '#ec4899' },
]

const monthlySalesData = [
  { month: 'Jan', revenue: 540000, orders: 320 },
  { month: 'Feb', revenue: 620000, orders: 380 },
  { month: 'Mar', revenue: 710000, orders: 420 },
  { month: 'Apr', revenue: 680000, orders: 400 },
  { month: 'May', revenue: 790000, orders: 460 },
  { month: 'Jun', revenue: 850000, orders: 510 },
  { month: 'Jul', revenue: 920000, orders: 540 },
  { month: 'Aug', revenue: 870000, orders: 520 },
  { month: 'Sep', revenue: 950000, orders: 570 },
  { month: 'Oct', revenue: 1020000, orders: 610 },
  { month: 'Nov', revenue: 1180000, orders: 700 },
  { month: 'Dec', revenue: 1350000, orders: 820 },
]

const newUsersData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 145 },
  { month: 'Mar', users: 168 },
  { month: 'Apr', users: 155 },
  { month: 'May', users: 190 },
  { month: 'Jun', users: 210 },
  { month: 'Jul', users: 235 },
  { month: 'Aug', users: 220 },
  { month: 'Sep', users: 250 },
  { month: 'Oct', users: 280 },
  { month: 'Nov', users: 310 },
  { month: 'Dec', users: 350 },
]

const banners = [
  { id: 'b-1', title: 'Summer Sale', subtitle: 'Up to 70% off on fashion', image: 'https://picsum.photos/seed/banner1/600/200', position: 'Home', isActive: true, sortOrder: 1 },
  { id: 'b-2', title: 'Electronics Fest', subtitle: 'Best deals on gadgets', image: 'https://picsum.photos/seed/banner2/600/200', position: 'Home', isActive: true, sortOrder: 2 },
  { id: 'b-3', title: 'New Arrivals', subtitle: 'Fresh styles every week', image: 'https://picsum.photos/seed/banner3/600/200', position: 'Category', isActive: false, sortOrder: 3 },
  { id: 'b-4', title: 'Mega Deals', subtitle: 'Grab before they\'re gone', image: 'https://picsum.photos/seed/banner4/600/200', position: 'Product', isActive: true, sortOrder: 4 },
]

// ==================== NAVIGATION CONFIG ====================
const navTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sellers', label: 'Sellers', icon: Store },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'brands', label: 'Brands', icon: Award },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'reports', label: 'Reports', icon: FileText },
]

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-600',
  blocked: 'bg-red-100 text-red-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  shipped: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-violet-100 text-violet-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-pink-100 text-pink-700',
  paid: 'bg-emerald-100 text-emerald-700',
  verified: 'bg-emerald-100 text-emerald-700',
  unverified: 'bg-amber-100 text-amber-700',
}

// ==================== MAIN COMPONENT ====================
export default function AdminPanel() {
  const { adminTab } = useNavigationStore()
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterOrderStatus, setFilterOrderStatus] = useState('all')
  const [filterProductStatus, setFilterProductStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'add'>('view')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [reportRange, setReportRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const activeTab = adminTab || 'dashboard'

  const filteredUsers = useMemo(() => {
    let result = mockUsers
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (filterRole !== 'all') result = result.filter(u => u.role === filterRole)
    if (filterStatus !== 'all') result = result.filter(u => u.status === filterStatus)
    return result
  }, [searchQuery, filterRole, filterStatus])

  const filteredOrders = useMemo(() => {
    let result = mockOrders
    if (filterOrderStatus !== 'all') result = result.filter(o => o.status === filterOrderStatus)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q))
    }
    return result
  }, [searchQuery, filterOrderStatus])

  const filteredProducts = useMemo(() => {
    let result = products
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }
    if (filterProductStatus !== 'all') {
      if (filterProductStatus === 'featured') result = result.filter(p => p.isFeatured)
      else if (filterProductStatus === 'active') result = result.filter(p => p.isActive)
      else if (filterProductStatus === 'low-stock') result = result.filter(p => p.stock < 20)
    }
    if (filterCategory !== 'all') result = result.filter(p => p.categoryId === filterCategory)
    return result
  }, [searchQuery, filterProductStatus, filterCategory])

  const totalRevenue = products.reduce((sum, p) => sum + p.salePrice * p.totalSold, 0)
  const totalOrders = mockOrders.length
  const totalUsers = mockUsers.length
  const activeSellers = sellers.filter(s => s.isVerified).length
  const pendingReturns = mockOrders.filter(o => o.status === 'returned').length

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A'
  const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || 'N/A'
  const getSellerName = (id: string) => sellers.find(s => s.id === id)?.storeName || 'N/A'

  const openDialog = (mode: 'view' | 'edit' | 'add', item?: any) => {
    setDialogMode(mode)
    setSelectedItem(item || null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSelectedItem(null)
  }

  // ==================== DASHBOARD TAB ====================
  const renderDashboard = () => {
    const statCards = [
      { label: 'Total Revenue', value: formatPrice(totalRevenue), change: '+12.5%', up: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Total Users', value: totalUsers.toLocaleString(), change: '+8.2%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Orders', value: totalOrders.toLocaleString(), change: '+5.1%', up: true, icon: ShoppingCart, color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Total Products', value: products.length.toLocaleString(), change: '+3.4%', up: true, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Active Sellers', value: activeSellers.toString(), change: '+2.1%', up: true, icon: Store, color: 'text-teal-600', bg: 'bg-teal-50' },
      { label: 'Pending Returns', value: pendingReturns.toString(), change: '-1.3%', up: false, icon: RotateCcw, color: 'text-rose-600', bg: 'bg-rose-50' },
    ]

    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <Badge variant="secondary" className={`text-xs ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stat.up ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Revenue Overview</CardTitle>
                  <CardDescription>Last 30 days performance</CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-600">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12.5%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ChartContainer config={{ revenue: { label: 'Revenue', color: '#f97316' }, orders: { label: 'Orders', color: '#8b5cf6' } }}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" interval={4} />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#revenueGrad)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Orders by Status Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Orders by Status</CardTitle>
              <CardDescription>Distribution breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ChartContainer config={{ delivered: { label: 'Delivered', color: '#22c55e' }, shipped: { label: 'Shipped', color: '#3b82f6' }, processing: { label: 'Processing', color: '#f59e0b' }, pending: { label: 'Pending', color: '#8b5cf6' }, cancelled: { label: 'Cancelled', color: '#ef4444' }, returned: { label: 'Returned', color: '#ec4899' } }}>
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Users</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.slice(0, 5).map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-semibold">{u.avatar}</div>
                          <div>
                            <p className="font-medium text-sm">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{u.role}</Badge></TableCell>
                      <TableCell><Badge className={`text-xs ${statusColors[u.status] || ''}`}>{u.status}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.joined}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.slice(0, 5).map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium text-sm">{o.id}</TableCell>
                      <TableCell className="text-sm">{o.customer}</TableCell>
                      <TableCell className="text-sm font-medium">{formatPrice(o.total)}</TableCell>
                      <TableCell><Badge className={`text-xs ${statusColors[o.status] || ''}`}>{o.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.filter(p => p.isBestSeller).slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.totalSold.toLocaleString()} sold</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(p.salePrice)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Server Uptime', value: 99.9, color: 'bg-emerald-500', status: 'Excellent' },
                  { label: 'API Response Time', value: 85, color: 'bg-emerald-500', status: '45ms avg' },
                  { label: 'CPU Usage', value: 34, color: 'bg-blue-500', status: 'Normal' },
                  { label: 'Memory Usage', value: 62, color: 'bg-amber-500', status: 'Moderate' },
                  { label: 'Disk Usage', value: 48, color: 'bg-blue-500', status: 'Normal' },
                  { label: 'Database Health', value: 95, color: 'bg-emerald-500', status: 'Healthy' },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.label}
                      </span>
                      <span className="text-muted-foreground text-xs">{item.status} ({item.value}%)</span>
                    </div>
                    <Progress value={item.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ==================== USERS TAB ====================
  const renderUsers = () => (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-semibold">{u.avatar}</div>
                      <span className="font-medium text-sm">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm">{u.phone}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{u.role}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[u.status] || ''}`}>{u.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.joined}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog('view', u)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog('edit', u)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" >
                        {u.status === 'blocked' ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-red-500" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={dialogOpen && !!selectedItem?.email} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'view' ? 'User Details' : 'Edit User'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'view' ? 'Viewing user information' : 'Modify user details'}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-lg font-semibold">{selectedItem.avatar}</div>
                <div>
                  <p className="font-semibold">{selectedItem.name}</p>
                  <Badge className={`text-xs ${statusColors[selectedItem.status] || ''}`}>{selectedItem.status}</Badge>
                </div>
              </div>
              <Separator />
              {dialogMode === 'view' ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{selectedItem.email}</p></div>
                  <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{selectedItem.phone}</p></div>
                  <div><span className="text-muted-foreground">Role:</span><p className="font-medium capitalize">{selectedItem.role}</p></div>
                  <div><span className="text-muted-foreground">Joined:</span><p className="font-medium">{selectedItem.joined}</p></div>
                  <div><span className="text-muted-foreground">Orders:</span><p className="font-medium">{selectedItem.orders}</p></div>
                  <div><span className="text-muted-foreground">Total Spent:</span><p className="font-medium">{formatPrice(selectedItem.spent)}</p></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div><Label>Name</Label><Input defaultValue={selectedItem.name} /></div>
                  <div><Label>Email</Label><Input defaultValue={selectedItem.email} /></div>
                  <div><Label>Phone</Label><Input defaultValue={selectedItem.phone} /></div>
                  <div><Label>Role</Label>
                    <Select defaultValue={selectedItem.role}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                {dialogMode === 'edit' && <Button className="bg-orange-500 hover:bg-orange-600">Save Changes</Button>}
                {dialogMode === 'view' && selectedItem.status === 'active' && (
                  <Button variant="destructive" size="sm">Block User</Button>
                )}
                {dialogMode === 'view' && selectedItem.status === 'blocked' && (
                  <Button className="bg-emerald-500 hover:bg-emerald-600" size="sm">Unblock User</Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  // ==================== SELLERS TAB ====================
  const renderSellers = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img src={s.storeLogo} alt={s.storeName} className="h-full w-full object-cover" />
                      </div>
                      <span className="font-medium text-sm">{s.storeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">Owner</TableCell>
                  <TableCell className="text-sm">{s.totalProducts}</TableCell>
                  <TableCell className="text-sm font-medium">{s.totalSales.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm">{s.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.isVerified ? (
                      <Badge className="text-xs bg-emerald-100 text-emerald-700"><Check className="h-3 w-3 mr-0.5" />Verified</Badge>
                    ) : (
                      <Badge className="text-xs bg-amber-100 text-amber-700"><Clock className="h-3 w-3 mr-0.5" />Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog('view', s)}><Eye className="h-3.5 w-3.5" /></Button>
                      {!s.isVerified && (
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Check className="h-3.5 w-3.5 text-emerald-500" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Seller Detail Dialog */}
      <Dialog open={dialogOpen && !!selectedItem?.storeName} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>Store information and metrics</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden">
                  <img src={selectedItem.storeLogo} alt={selectedItem.storeName} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{selectedItem.storeName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm">{selectedItem.rating}</span>
                    </div>
                    {selectedItem.isVerified && <Badge className="text-xs bg-emerald-100 text-emerald-700">Verified</Badge>}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Products:</span><p className="font-medium">{selectedItem.totalProducts}</p></div>
                <div><span className="text-muted-foreground">Total Sales:</span><p className="font-medium">{selectedItem.totalSales.toLocaleString()}</p></div>
              </div>
              <div><Label>Commission Rate (%)</Label><Input type="number" defaultValue="10" /></div>
              <DialogFooter>
                {!selectedItem.isVerified && (
                  <Button className="bg-emerald-500 hover:bg-emerald-600">Verify Seller</Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  // ==================== PRODUCTS TAB ====================
  const renderProducts = () => (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => !c.parentId).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProductStatus} onValueChange={setFilterProductStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.slice(0, 15).map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[180px]">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{getBrandName(p.brandId)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getCategoryName(p.categoryId)}</TableCell>
                    <TableCell className="text-sm">{getSellerName(p.sellerId)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{formatPrice(p.salePrice)}</p>
                        {p.discount > 0 && <p className="text-xs text-muted-foreground line-through">{formatPrice(p.basePrice)}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${p.stock < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {p.stock}
                      </span>
                      {p.stock < 20 && <AlertTriangle className="h-3 w-3 text-red-500 ml-1 inline" />}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.isFeatured && <Badge className="text-xs bg-amber-100 text-amber-700">Featured</Badge>}
                        {p.isActive ? (
                          <Badge className="text-xs bg-emerald-100 text-emerald-700">Active</Badge>
                        ) : (
                          <Badge className="text-xs bg-gray-100 text-gray-600">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {p.isFeatured ? <X className="h-3.5 w-3.5 text-red-500" /> : <Star className="h-3.5 w-3.5 text-amber-500" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )

  // ==================== ORDERS TAB ====================
  const renderOrders = () => (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterOrderStatus} onValueChange={setFilterOrderStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-sm">{o.id}</TableCell>
                  <TableCell className="text-sm">{o.customer}</TableCell>
                  <TableCell className="text-sm">{o.items}</TableCell>
                  <TableCell className="text-sm font-medium">{formatPrice(o.total)}</TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[o.status] || ''}`}>{o.status}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${o.payment === 'Paid' ? 'text-emerald-600' : o.payment === 'Refunded' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {o.payment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog('view', o)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={dialogOpen && !!selectedItem?.items} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order {selectedItem?.id}</DialogTitle>
            <DialogDescription>Order details and management</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Customer:</span><p className="font-medium">{selectedItem.customer}</p></div>
                <div><span className="text-muted-foreground">Date:</span><p className="font-medium">{selectedItem.date}</p></div>
                <div><span className="text-muted-foreground">Items:</span><p className="font-medium">{selectedItem.items}</p></div>
                <div><span className="text-muted-foreground">Total:</span><p className="font-medium">{formatPrice(selectedItem.total)}</p></div>
              </div>
              <Separator />
              <div>
                <Label>Update Status</Label>
                <Select defaultValue={selectedItem.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2">
                <Button className="bg-orange-500 hover:bg-orange-600">Update Status</Button>
                {selectedItem.payment === 'Paid' && (
                  <Button variant="outline" className="text-red-600">Process Refund</Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  // ==================== CATEGORIES TAB ====================
  const renderCategories = () => {
    const topLevel = categories.filter(c => !c.parentId)
    const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div></div>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => openDialog('add')}>
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLevel.map(cat => (
                  <>
                    <TableRow key={cat.id} className="bg-muted/30">
                      <TableCell>
                        <div className="h-9 w-9 rounded-lg bg-muted overflow-hidden">
                          <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">—</TableCell>
                      <TableCell className="text-sm">{cat.productCount}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {getSubcategories(cat.id).map(sub => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="h-9 w-9 rounded-lg bg-muted overflow-hidden ml-4">
                            <img src={sub.image} alt={sub.name} className="h-full w-full object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm pl-6">└ {sub.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{sub.slug}</TableCell>
                        <TableCell className="text-sm">{cat.name}</TableCell>
                        <TableCell className="text-sm">{sub.productCount}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${sub.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Category Dialog */}
        <Dialog open={dialogOpen && !selectedItem?.email && !selectedItem?.storeName && !selectedItem?.items} onOpenChange={closeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{dialogMode === 'add' ? 'Add Category' : 'Edit Category'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'add' ? 'Create a new product category' : 'Modify category details'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input placeholder="Category name" /></div>
              <div><Label>Slug</Label><Input placeholder="category-slug" /></div>
              <div><Label>Parent Category</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="None (Top Level)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {topLevel.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Image</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-orange-300 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload image</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked /><Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-orange-500 hover:bg-orange-600">
                {dialogMode === 'add' ? 'Create Category' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ==================== BRANDS TAB ====================
  const renderBrands = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div></div>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => openDialog('add')}>
          <Plus className="h-4 w-4 mr-1" /> Add Brand
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map(b => {
                const brandProducts = products.filter(p => p.brandId === b.id).length
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="h-9 w-9 rounded-lg bg-muted overflow-hidden">
                        <img src={b.logo} alt={b.name} className="h-full w-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{b.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.slug}</TableCell>
                    <TableCell className="text-sm">{brandProducts}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Brand Dialog */}
      <Dialog open={dialogOpen && dialogMode === 'add' && activeTab === 'brands'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add Brand' : 'Edit Brand'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Create a new brand' : 'Modify brand details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input placeholder="Brand name" /></div>
            <div><Label>Slug</Label><Input placeholder="brand-slug" /></div>
            <div><Label>Logo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-orange-300 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload logo</p>
              </div>
            </div>
            <div><Label>Description</Label><Textarea placeholder="Brand description" /></div>
          </div>
          <DialogFooter>
            <Button className="bg-orange-500 hover:bg-orange-600">
              {dialogMode === 'add' ? 'Create Brand' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ==================== BANNERS TAB ====================
  const renderBanners = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div></div>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => openDialog('add')}>
          <Plus className="h-4 w-4 mr-1" /> Add Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(b => (
          <Card key={b.id} className="overflow-hidden">
            <div className="relative h-36 bg-gradient-to-r overflow-hidden">
              <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-semibold text-sm">{b.title}</p>
                <p className="text-white/80 text-xs">{b.subtitle}</p>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{b.position}</Badge>
                  <Badge className={`text-xs ${b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Banner Dialog */}
      <Dialog open={dialogOpen && dialogMode === 'add' && activeTab === 'banners'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add Banner' : 'Edit Banner'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Create a new promotional banner' : 'Modify banner details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input placeholder="Banner title" /></div>
            <div><Label>Subtitle</Label><Input placeholder="Banner subtitle" /></div>
            <div><Label>Position</Label>
              <Select defaultValue="home">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Page</SelectItem>
                  <SelectItem value="category">Category Page</SelectItem>
                  <SelectItem value="product">Product Page</SelectItem>
                  <SelectItem value="checkout">Checkout Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Image</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-orange-300 transition-colors">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click or drag to upload banner image</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended: 1200×400px</p>
              </div>
            </div>
            <div><Label>Link</Label><Input placeholder="/products?category=..." /></div>
            <div><Label>Sort Order</Label><Input type="number" defaultValue="1" /></div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked /><Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-orange-500 hover:bg-orange-600">
              {dialogMode === 'add' ? 'Create Banner' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ==================== COUPONS TAB ====================
  const renderCoupons = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div></div>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => openDialog('add')}>
          <Plus className="h-4 w-4 mr-1" /> Add Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Max Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{c.code}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{c.type}</Badge></TableCell>
                  <TableCell className="text-sm font-medium">
                    {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                  </TableCell>
                  <TableCell className="text-sm">{formatPrice(c.minOrder)}</TableCell>
                  <TableCell className="text-sm">{formatPrice(c.maxDiscount)}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {c.isActive ? <ToggleLeft className="h-3.5 w-3.5 text-amber-500" /> : <Check className="h-3.5 w-3.5 text-emerald-500" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Coupon Dialog */}
      <Dialog open={dialogOpen && dialogMode === 'add' && activeTab === 'coupons'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add Coupon' : 'Edit Coupon'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Create a new discount coupon' : 'Modify coupon details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Code</Label><Input placeholder="COUPON CODE" className="uppercase" /></div>
            <div><Label>Description</Label><Textarea placeholder="Coupon description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select defaultValue="percentage">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Value</Label><Input type="number" placeholder="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Min Order</Label><Input type="number" placeholder="0" /></div>
              <div><Label>Max Discount</Label><Input type="number" placeholder="0" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked /><Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-orange-500 hover:bg-orange-600">
              {dialogMode === 'add' ? 'Create Coupon' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ==================== REPORTS TAB ====================
  const renderReports = () => {
    const lowStockProducts = products.filter(p => p.stock < 20).slice(0, 5)

    return (
      <div className="space-y-6">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <Button
              key={range}
              variant={reportRange === range ? 'default' : 'outline'}
              size="sm"
              className={reportRange === range ? 'bg-orange-500 hover:bg-orange-600' : ''}
              onClick={() => setReportRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="ml-auto">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatPrice(9600000), change: '+12.5%', up: true },
            { label: 'Total Orders', value: '5,430', change: '+8.2%', up: true },
            { label: 'Avg Order Value', value: formatPrice(1768), change: '+3.1%', up: true },
            { label: 'Refund Rate', value: '2.3%', change: '-0.5%', up: false },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
                <Badge variant="secondary" className={`text-xs mt-1 ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {stat.change}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ChartContainer config={{ revenue: { label: 'Revenue', color: '#f97316' } }}>
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Orders Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ChartContainer config={{ orders: { label: 'Orders', color: '#8b5cf6' } }}>
                  <AreaChart data={monthlySalesData}>
                    <defs>
                      <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="orders" stroke="#8b5cf6" fill="url(#ordersGrad)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Report & Product Report */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Users Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ChartContainer config={{ users: { label: 'New Users', color: '#22c55e' } }}>
                  <LineChart data={newUsersData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">{p.stock} left</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.sort((a, b) => (b.salePrice * b.totalSold) - (a.salePrice * a.totalSold)).slice(0, 10).map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-sm">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-muted overflow-hidden flex-shrink-0">
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getCategoryName(p.categoryId)}</TableCell>
                    <TableCell className="text-sm">{formatPrice(p.salePrice)}</TableCell>
                    <TableCell className="text-sm">{p.totalSold.toLocaleString()}</TableCell>
                    <TableCell className="text-sm font-semibold">{formatPrice(p.salePrice * p.totalSold)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== TAB CONTENT ROUTER ====================
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard()
      case 'users': return renderUsers()
      case 'sellers': return renderSellers()
      case 'products': return renderProducts()
      case 'orders': return renderOrders()
      case 'categories': return renderCategories()
      case 'brands': return renderBrands()
      case 'banners': return renderBanners()
      case 'coupons': return renderCoupons()
      case 'reports': return renderReports()
      default: return renderDashboard()
    }
  }

  // ==================== RENDER ====================
  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-zinc-900 text-white transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm">ShopZone Admin</span>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 lg:flex hidden"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav Tabs */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    useNavigationStore.setState({ adminTab: tab.id })
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-400 font-medium'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <tab.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-orange-400' : ''}`} />
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                  {isActive && !sidebarCollapsed && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400"
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-zinc-500">Super Admin</p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 lg:px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
            <p className="text-xs text-muted-foreground">Welcome back, {user?.name || 'Admin'}</p>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-semibold">{formatPrice(totalRevenue)}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Orders:</span>
              <span className="font-semibold">{totalOrders}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Users:</span>
              <span className="font-semibold">{totalUsers}</span>
            </div>
          </div>

          {/* Refresh */}
          <Button variant="outline" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
