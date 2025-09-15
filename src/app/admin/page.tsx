'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  PlusCircle,
  Brain,
  Upload,
  RefreshCw,
  ArrowUpRight,
  ArrowLeft,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  todayRevenue: number
  monthlyRevenue: number
  totalUsers: number
  newUsersToday: number
  recentOrders: any[]
  topProducts: any[]
  salesGrowth: number
  orderGrowth: number
}

interface QuickAction {
  title: string
  titleKa: string
  description: string
  descriptionKa: string
  icon: any
  href: string
  color: string
  bgColor: string
}

export default function AdminDashboard() {
  const { locale } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalUsers: 0,
    newUsersToday: 0,
    recentOrders: [],
    topProducts: [],
    salesGrowth: 0,
    orderGrowth: 0
  })

  // Check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      if (!(await isAdmin())) {
        router.push('/')
        return
      }
      fetchDashboardData()
    }
    checkAdmin()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch products stats
      const { data: products } = await supabase
        .from('products')
        .select('id, stock, price, is_active')

      // Fetch orders stats  
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')

      // Fetch users stats
      const { data: users } = await supabase
        .from('profiles')
        .select('id, created_at')

      // Fetch recent orders with product details
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            quantity,
            price,
            products (
              name_en,
              name_ka,
              images
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      // Calculate stats
      const totalProducts = products?.length || 0
      const activeProducts = products?.filter(p => p.is_active).length || 0
      const lowStockProducts = products?.filter(p => p.stock > 0 && p.stock <= 5).length || 0
      const outOfStockProducts = products?.filter(p => p.stock === 0).length || 0

      const totalOrders = orders?.length || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayRevenue = orders?.filter(o => new Date(o.created_at) >= today)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const monthlyRevenue = orders?.filter(o => new Date(o.created_at) >= monthStart)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      const totalUsers = users?.length || 0
      const newUsersToday = users?.filter(u => new Date(u.created_at) >= today).length || 0

      // Calculate growth rates (mock data for now)
      const salesGrowth = Math.floor(Math.random() * 20) + 5 // 5-25%
      const orderGrowth = Math.floor(Math.random() * 15) + 3 // 3-18%

      setStats({
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        totalUsers,
        newUsersToday,
        recentOrders: recentOrders || [],
        topProducts: [], // Will be implemented with proper analytics
        salesGrowth,
        orderGrowth
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Add Product',
      titleKa: 'პროდუქტის დამატება',
      description: 'Add new product to inventory',
      descriptionKa: 'ახალი პროდუქტის დამატება',
      icon: PlusCircle,
      href: '/admin/products/add',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100'
    },
    {
      title: 'AI Product Analysis',
      titleKa: 'AI პროდუქტის ანალიზი',
      description: 'Analyze product with AI',
      descriptionKa: 'პროდუქტის AI ანალიზი',
      icon: Brain,
      href: '/admin/products/add-ai',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Bulk Import',
      titleKa: 'ბალკ იმპორტი',
      description: 'Import products from CSV',
      descriptionKa: 'CSV-დან პროდუქტების იმპორტი',
      icon: Upload,
      href: '/admin/products/bulk-import',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Analytics',
      titleKa: 'ანალიტიკა',
      description: 'View detailed analytics',
      descriptionKa: 'დეტალური ანალიტიკის ნახვა',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {locale === 'ka' ? 'ადმინ პანელი' : 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  {locale === 'ka' ? 'სისტემის მართვა' : 'System Management'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{locale === 'ka' ? 'განახლება' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'პროდუქტები' : 'Products'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-emerald-600 font-medium">
                    {stats.activeProducts} {locale === 'ka' ? 'აქტიური' : 'active'}
                  </span>
                  {stats.lowStockProducts > 0 && (
                    <span className="ml-2 text-sm text-amber-600">
                      {stats.lowStockProducts} {locale === 'ka' ? 'მცირე მარაგი' : 'low stock'}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Orders Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'შეკვეთები' : 'Orders'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">
                      +{stats.orderGrowth}%
                    </span>
                  </div>
                  {stats.pendingOrders > 0 && (
                    <span className="ml-2 text-sm text-amber-600">
                      {stats.pendingOrders} {locale === 'ka' ? 'მომლოდინე' : 'pending'}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          {/* Revenue Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'შემოსავალი' : 'Revenue'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString()} ₾
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">
                      +{stats.salesGrowth}%
                    </span>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {locale === 'ka' ? 'ამ თვე' : 'this month'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-full">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </motion.div>

          {/* Users Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მომხმარებლები' : 'Users'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-emerald-600 font-medium">
                    +{stats.newUsersToday} {locale === 'ka' ? 'დღეს' : 'today'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {locale === 'ka' ? 'სწრაფი მოქმედებები' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`${action.bgColor} p-6 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-lg transform hover:scale-105`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {locale === 'ka' ? action.titleKa : action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {locale === 'ka' ? action.descriptionKa : action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {locale === 'ka' ? 'უახლესი შეკვეთები' : 'Recent Orders'}
                </h3>
                <Link
                  href="/admin/orders"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                >
                  {locale === 'ka' ? 'ყველას ნახვა' : 'View All'}
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {stats.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentOrders.map((order, index) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.total_amount?.toLocaleString()} ₾
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {locale === 'ka' ? 'შეკვეთები არ არის' : 'No recent orders'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === 'ka' ? 'სისტემის სტატუსი' : 'System Status'}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-700">
                      {locale === 'ka' ? 'ონლაინ მაღაზია' : 'Online Store'}
                    </span>
                  </div>
                  <span className="text-emerald-600 font-medium">
                    {locale === 'ka' ? 'მუშაობს' : 'Operational'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-700">
                      {locale === 'ka' ? 'გადახდის სისტემა' : 'Payment System'}
                    </span>
                  </div>
                  <span className="text-emerald-600 font-medium">
                    {locale === 'ka' ? 'მუშაობს' : 'Operational'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-700">
                      {locale === 'ka' ? 'მცირე მარაგი' : 'Low Stock Alert'}
                    </span>
                  </div>
                  <span className="text-amber-600 font-medium">
                    {stats.lowStockProducts} {locale === 'ka' ? 'პროდუქტი' : 'products'}
                  </span>
                </div>

                {stats.outOfStockProducts > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">
                        {locale === 'ka' ? 'მარაგი ამოიწურა' : 'Out of Stock'}
                      </span>
                    </div>
                    <span className="text-red-600 font-medium">
                      {stats.outOfStockProducts} {locale === 'ka' ? 'პროდუქტი' : 'products'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}