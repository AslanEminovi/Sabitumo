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
  Activity,
  Filter,
  RefreshCw,
  Eye,
  Star,
  Clock,
  Target,
  Zap,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  orders: any[]
  revenueGrowth: number
  orderGrowth: number
  conversionRate: number
  topCategories: any[]
  salesByMonth: any[]
  ordersByStatus: any[]
}

interface ProductAnalytics {
  product_id: string
  quantity: number
  revenue: number
  products: {
    name_en: string
    name_ka: string
    price: number
    images: string[]
    categories?: {
      name_en: string
      name_ka: string
    }
  } | null
}

interface TimeRange {
  value: string
  label: string
  labelKa: string
}

export default function AnalyticsPage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([])
  const [dateRange, setDateRange] = useState('30') // days
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const timeRanges: TimeRange[] = [
    { value: '7', label: 'Last 7 days', labelKa: 'ბოლო 7 დღე' },
    { value: '30', label: 'Last 30 days', labelKa: 'ბოლო 30 დღე' },
    { value: '90', label: 'Last 3 months', labelKa: 'ბოლო 3 თვე' },
    { value: '365', label: 'Last year', labelKa: 'ბოლო წელი' }
  ]

  // Check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      if (!(await isAdmin())) {
        router.push('/')
        return
      }
      fetchAnalytics()
    }
    checkAdmin()
  }, [router, dateRange])

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - parseInt(dateRange))

      // Fetch orders data
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            quantity,
            price,
            product_id,
            products (
              name_en,
              name_ka,
              price,
              images,
              categories (
                name_en,
                name_ka
              )
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      // Calculate analytics
      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calculate growth (mock data for demonstration)
      const revenueGrowth = Math.floor(Math.random() * 30) + 5 // 5-35%
      const orderGrowth = Math.floor(Math.random() * 25) + 3 // 3-28%
      const conversionRate = Math.floor(Math.random() * 5) + 2 // 2-7%

      // Group orders by status
      const ordersByStatus = [
        { status: 'completed', count: orders?.filter(o => o.status === 'completed').length || 0 },
        { status: 'pending', count: orders?.filter(o => o.status === 'pending').length || 0 },
        { status: 'cancelled', count: orders?.filter(o => o.status === 'cancelled').length || 0 }
      ]

      // Calculate top products
      const productStats: { [key: string]: { quantity: number, revenue: number, product: any } } = {}
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const productId = item.product_id
          if (!productStats[productId]) {
            productStats[productId] = {
              quantity: 0,
              revenue: 0,
              product: item.products
            }
          }
          productStats[productId].quantity += item.quantity
          productStats[productId].revenue += item.price * item.quantity
        })
      })

      const topProductsData = Object.entries(productStats)
        .map(([productId, stats]) => ({
          product_id: productId,
          quantity: stats.quantity,
          revenue: stats.revenue,
          products: stats.product
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Mock sales by month data
      const salesByMonth = [
        { month: 'Jan', revenue: Math.floor(Math.random() * 50000) + 10000 },
        { month: 'Feb', revenue: Math.floor(Math.random() * 50000) + 10000 },
        { month: 'Mar', revenue: Math.floor(Math.random() * 50000) + 10000 },
        { month: 'Apr', revenue: Math.floor(Math.random() * 50000) + 10000 },
        { month: 'May', revenue: Math.floor(Math.random() * 50000) + 10000 },
        { month: 'Jun', revenue: Math.floor(Math.random() * 50000) + 10000 }
      ]

      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        orders: orders || [],
        revenueGrowth,
        orderGrowth,
        conversionRate,
        topCategories: [], // Will be implemented
        salesByMonth,
        ordersByStatus
      })

      setTopProducts(topProductsData)

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const exportData = () => {
    if (!analytics) return
    
    const data = {
      period: `${dateRange} days`,
      totalRevenue: analytics.totalRevenue,
      totalOrders: analytics.totalOrders,
      averageOrderValue: analytics.averageOrderValue,
      topProducts: topProducts.slice(0, 5),
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${dateRange}-days.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {locale === 'ka' ? 'ანალიტიკა' : 'Analytics'}
                </h1>
                <p className="text-sm text-gray-600">
                  {locale === 'ka' ? 'გაყიდვების ანალიზი' : 'Sales Analytics & Insights'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {locale === 'ka' ? range.labelKa : range.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{locale === 'ka' ? 'ექსპორტი' : 'Export'}</span>
              </button>
              
              <button
                onClick={fetchAnalytics}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{locale === 'ka' ? 'განახლება' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'ka' ? 'მთლიანი შემოსავალი' : 'Total Revenue'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.totalRevenue.toLocaleString()} ₾
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 font-medium">
                        +{analytics.revenueGrowth}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'ka' ? 'მთლიანი შეკვეთები' : 'Total Orders'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-600 font-medium">
                        +{analytics.orderGrowth}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'ka' ? 'საშუალო შეკვეთის ღირებულება' : 'Average Order Value'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics.averageOrderValue.toLocaleString()} ₾
                    </p>
                    <div className="flex items-center mt-2">
                      <Target className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-sm text-purple-600 font-medium">
                        {locale === 'ka' ? 'საშუალო' : 'Average'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'ka' ? 'კონვერტაციის მაჩვენებელი' : 'Conversion Rate'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.conversionRate}%</p>
                    <div className="flex items-center mt-2">
                      <Zap className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-amber-600 font-medium">
                        {locale === 'ka' ? 'კონვერტაცია' : 'Conversion'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-full">
                    <Zap className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Sales Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {locale === 'ka' ? 'გაყიდვების ტრენდი' : 'Sales Trend'}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.salesByMonth.map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{month.month}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(month.revenue / 60000) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                            {month.revenue.toLocaleString()} ₾
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Order Status Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {locale === 'ka' ? 'შეკვეთების სტატუსი' : 'Order Status'}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.ordersByStatus.map((status, index) => {
                      const colors = {
                        completed: 'bg-emerald-500',
                        pending: 'bg-amber-500',
                        cancelled: 'bg-red-500'
                      }
                      const percentage = analytics.totalOrders > 0 
                        ? (status.count / analytics.totalOrders) * 100 
                        : 0
                      
                      return (
                        <div key={status.status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${colors[status.status as keyof typeof colors]}`}></div>
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {status.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${colors[status.status as keyof typeof colors]} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                              {status.count}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {locale === 'ka' ? 'ყველაზე გაყიდვადი პროდუქტები' : 'Top Selling Products'}
                </h3>
              </div>
              <div className="p-6">
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.product_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                            <span className="text-sm font-bold text-emerald-600">#{index + 1}</span>
                          </div>
                          {product.products?.images?.[0] && (
                            <img 
                              src={product.products.images[0]} 
                              alt={locale === 'ka' ? product.products.name_ka : product.products.name_en}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {locale === 'ka' ? product.products?.name_ka : product.products?.name_en}
                            </p>
                            <p className="text-sm text-gray-600">
                              {locale === 'ka' ? 'გაყიდული:' : 'Sold:'} {product.quantity} {locale === 'ka' ? 'ცალი' : 'units'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {product.revenue.toLocaleString()} ₾
                          </p>
                          <div className="flex items-center justify-end">
                            <Award className="w-4 h-4 text-amber-500 mr-1" />
                            <span className="text-sm text-amber-600">
                              {locale === 'ka' ? 'ტოპ გამყიდველი' : 'Top Seller'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {locale === 'ka' ? 'მონაცემები არ არის' : 'No data available'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}