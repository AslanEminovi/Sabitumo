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
  Eye,
  BarChart3,
  PlusCircle,
  Settings,
  Brain,
  Upload,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  todayRevenue: number
  totalUsers: number
  recentOrders: any[]
  topProducts: any[]
}

export default function AdminDashboard() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalUsers: 0,
    recentOrders: [],
    topProducts: []
  })

  useEffect(() => {
    checkAdminAccess()
    fetchDashboardStats()
  }, [])

  const checkAdminAccess = async () => {
    const adminStatus = await isAdmin()
    if (!adminStatus) {
      router.push('/')
      return
    }
  }

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Fetch all stats in parallel
      const [
        productsResult,
        ordersResult,
        usersResult,
        revenueResult,
        recentOrdersResult,
        topProductsResult
      ] = await Promise.all([
        // Products stats
        supabase.from('products').select('id, stock, is_active'),
        // Orders stats
        supabase.from('orders').select('id, status, total_amount, created_at'),
        // Users count
        supabase.from('users').select('id'),
        // Today's revenue
        supabase
          .from('orders')
          .select('total_amount')
          .eq('payment_status', 'paid')
          .gte('created_at', new Date().toISOString().split('T')[0]),
        // Recent orders
        supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            users (first_name, last_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        // Top products (most ordered)
        supabase
          .from('order_items')
          .select(`
            quantity,
            products (id, name_en, name_ka, price)
          `)
          .limit(5)
      ])

      // Process products stats
      const products = productsResult.data || []
      const activeProducts = products.filter(p => p.is_active).length
      const lowStockProducts = products.filter(p => p.stock < 10).length

      // Process orders stats
      const orders = ordersResult.data || []
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + order.total_amount, 0)

      // Process today's revenue
      const todayRevenue = (revenueResult.data || [])
        .reduce((sum, order) => sum + order.total_amount, 0)

      setStats({
        totalProducts: products.length,
        activeProducts,
        lowStockProducts,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
        todayRevenue,
        totalUsers: usersResult.data?.length || 0,
        recentOrders: recentOrdersResult.data || [],
        topProducts: topProductsResult.data || []
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ka' ? 'ka-GE' : 'en-US', {
      style: 'currency',
      currency: 'GEL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const quickActions = [
    {
      title: locale === 'ka' ? 'პროდუქტის დამატება' : 'Add Product',
      href: '/admin/products/add',
      icon: PlusCircle,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: locale === 'ka' ? 'AI ანალიზი' : 'AI Analysis',
      href: '/admin/products/add-ai',
      icon: Brain,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: locale === 'ka' ? 'ანალიტიკა' : 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: locale === 'ka' ? 'ბალკ იმპორტი' : 'Bulk Import',
      href: '/admin/products/bulk-import',
      icon: Upload,
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'ka' ? 'ადმინ დეშბორდი' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600">
            {locale === 'ka' 
              ? 'მართეთ თქვენი ონლაინ მაღაზია და ნახეთ ანალიტიკა' 
              : 'Manage your online store and view analytics'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი პროდუქტები' : 'Total Products'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-green-600">
                  {stats.activeProducts} {locale === 'ka' ? 'აქტიური' : 'active'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი შემოსავალი' : 'Total Revenue'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-green-600">
                  {formatCurrency(stats.todayRevenue)} {locale === 'ka' ? 'დღეს' : 'today'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Total Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი შეკვეთები' : 'Total Orders'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-orange-600">
                  {stats.pendingOrders} {locale === 'ka' ? 'მოლოდინში' : 'pending'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი მომხმარებლები' : 'Total Users'}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                {stats.lowStockProducts > 0 && (
                  <p className="text-sm text-red-600">
                    {stats.lowStockProducts} {locale === 'ka' ? 'დაბალი მარაგი' : 'low stock'}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {locale === 'ka' ? 'სწრაფი მოქმედებები' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className={`${action.color} text-white p-6 rounded-xl transition-colors flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-6 h-6" />
                  <span className="font-medium">{action.title}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {locale === 'ka' ? 'ბოლო შეკვეთები' : 'Recent Orders'}
              </h2>
              <Link 
                href="/admin/orders" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {locale === 'ka' ? 'ყველას ნახვა' : 'View All'}
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.users?.first_name} {order.users?.last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {locale === 'ka' ? 'შეკვეთები ვერ მოიძებნა' : 'No orders found'}
                </p>
              )}
            </div>
          </motion.div>

          {/* Management Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {locale === 'ka' ? 'მართვა' : 'Management'}
            </h2>
            
            <div className="space-y-3">
              <Link
                href="/admin/products"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{locale === 'ka' ? 'პროდუქტების მართვა' : 'Manage Products'}</span>
              </Link>
              
              <Link
                href="/admin/orders"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{locale === 'ka' ? 'შეკვეთების მართვა' : 'Manage Orders'}</span>
              </Link>
              
              <Link
                href="/admin/analytics"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{locale === 'ka' ? 'ანალიტიკა და რეპორტები' : 'Analytics & Reports'}</span>
              </Link>
              
              <Link
                href="/admin/users"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{locale === 'ka' ? 'მომხმარებლების მართვა' : 'Manage Users'}</span>
              </Link>
              
              <Link
                href="/admin/settings"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{locale === 'ka' ? 'პარამეტრები' : 'Settings'}</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
