'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { getSalesAnalytics, getTopProducts } from '@/lib/analytics'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Calendar,
  Download,
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  orders: any[]
}

interface ProductAnalytics {
  product_id: string
  quantity: number
  products: {
    name_en: string
    name_ka: string
    price: number
    images: string[]
  } | null
}

export default function AnalyticsPage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([])
  const [dateRange, setDateRange] = useState('30') // days
  const [realtimeStats, setRealtimeStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    weeklyOrders: 0,
    weeklyRevenue: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0
  })

  useEffect(() => {
    checkAdminAccess()
    fetchAnalytics()
    fetchTopProducts()
    fetchRealtimeStats()
  }, [dateRange])

  const checkAdminAccess = async () => {
    const adminStatus = await isAdmin()
    if (!adminStatus) {
      router.push('/')
      return
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString()
      
      const data = await getSalesAnalytics(startDate, endDate)
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTopProducts = async () => {
    try {
      const products = await getTopProducts(10)
      setTopProducts(products)
    } catch (error) {
      console.error('Error fetching top products:', error)
    }
  }

  const fetchRealtimeStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Today's stats
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', today)

      // Weekly stats
      const { data: weeklyOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', weekAgo)

      // Monthly stats
      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', monthAgo)

      setRealtimeStats({
        todayOrders: todayOrders?.length || 0,
        todayRevenue: todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        weeklyOrders: weeklyOrders?.length || 0,
        weeklyRevenue: weeklyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        monthlyOrders: monthlyOrders?.length || 0,
        monthlyRevenue: monthlyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      })
    } catch (error) {
      console.error('Error fetching realtime stats:', error)
    }
  }

  const exportData = () => {
    if (!analytics?.orders) return

    const csvData = analytics.orders.map(order => ({
      order_id: order.id,
      date: new Date(order.created_at).toLocaleDateString(),
      total_amount: order.total_amount,
      status: order.status,
      payment_status: order.payment_status,
      items_count: order.order_items?.length || 0
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-analytics-${dateRange}days.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/products" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'უკან ადმინ პანელში' : 'Back to Admin'}
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {locale === 'ka' ? 'ანალიტიკა' : 'Analytics'}
              </h1>
              <p className="text-gray-600">
                {locale === 'ka' ? 'გაყიდვების და ბიზნეს ანალიტიკა' : 'Sales and business analytics'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">{locale === 'ka' ? 'ბოლო 7 დღე' : 'Last 7 days'}</option>
                <option value="30">{locale === 'ka' ? 'ბოლო 30 დღე' : 'Last 30 days'}</option>
                <option value="90">{locale === 'ka' ? 'ბოლო 90 დღე' : 'Last 90 days'}</option>
                <option value="365">{locale === 'ka' ? 'ბოლო წელი' : 'Last year'}</option>
              </select>
              
              <button
                onClick={exportData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{locale === 'ka' ? 'ექსპორტი' : 'Export'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'დღეს' : 'Today'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(realtimeStats.todayRevenue)}
                </p>
                <p className="text-sm text-gray-500">
                  {realtimeStats.todayOrders} {locale === 'ka' ? 'შეკვეთა' : 'orders'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'ამ კვირაში' : 'This Week'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(realtimeStats.weeklyRevenue)}
                </p>
                <p className="text-sm text-gray-500">
                  {realtimeStats.weeklyOrders} {locale === 'ka' ? 'შეკვეთა' : 'orders'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'ამ თვეში' : 'This Month'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(realtimeStats.monthlyRevenue)}
                </p>
                <p className="text-sm text-gray-500">
                  {realtimeStats.monthlyOrders} {locale === 'ka' ? 'შეკვეთა' : 'orders'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი შემოსავალი' : 'Total Revenue'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი შეკვეთები' : 'Total Orders'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.totalOrders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'საშუალო შეკვეთის ღირებულება' : 'Average Order Value'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(analytics?.averageOrderValue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              {locale === 'ka' ? 'ყველაზე გაყიდვადი პროდუქტები' : 'Top Selling Products'}
            </h2>
            
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.product_id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {product.products?.images?.[0] && (
                      <img 
                        src={product.products.images[0]} 
                        alt={product.products.name_en}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {locale === 'ka' && product.products?.name_ka 
                        ? product.products.name_ka 
                        : product.products?.name_en || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {locale === 'ka' ? 'გაყიდული:' : 'Sold:'} {product.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(product.products?.price || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {locale === 'ka' ? 'ბოლო შეკვეთები' : 'Recent Orders'}
            </h2>
            
            <div className="space-y-4">
              {analytics?.orders?.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                    <p className={`text-sm ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'processing' ? 'text-blue-600' :
                      order.status === 'cancelled' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
