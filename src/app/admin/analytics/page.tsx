'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
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
  RefreshCw,
  Target,
  Zap,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalUsers: number
  topProducts: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
  }>
  salesByMonth: Array<{
    month: string
    monthName: string
    revenue: number
    orders: number
  }>
  ordersByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  topCategories: Array<{
    name: string
    orders: number
    revenue: number
  }>
}

const TimePeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  locale 
}: { 
  selectedPeriod: string
  onPeriodChange: (period: string) => void
  locale: string 
}) => {
  const periods = [
    { value: '3months', label: locale === 'ka' ? '3 თვე' : '3 Months' },
    { value: '6months', label: locale === 'ka' ? '6 თვე' : '6 Months' },
    { value: '1year', label: locale === 'ka' ? '1 წელი' : '1 Year' },
    { value: 'all', label: locale === 'ka' ? 'ყველა' : 'All Time' }
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedPeriod === period.value
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

export default function AdminAnalytics() {
  const { locale } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalUsers: 0,
    topProducts: [],
    salesByMonth: [],
    ordersByStatus: [],
    topCategories: []
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !(await isAdmin(user.id))) {
        router.push('/auth/login')
        return
      }
      await fetchAnalytics()
      setLoading(false)
    }
    checkAuth()
  }, [router, selectedPeriod])

  const getDateRange = useCallback((period: string) => {
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date('2020-01-01') // Far back date
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }
    
    return { startDate: startDate.toISOString(), endDate: now.toISOString() }
  }, [])

  const getMonthName = useCallback((monthIndex: number) => {
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    
    const englishMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    return locale === 'ka' ? georgianMonths[monthIndex] : englishMonths[monthIndex]
  }, [locale])

  const fetchAnalytics = useCallback(async () => {
    try {
      setRefreshing(true)
      const { startDate, endDate } = getDateRange(selectedPeriod)

      // Fetch orders with products
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            products (
              id,
              name_en,
              name_ka,
              categories (
                name_en,
                name_ka
              )
            )
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (ordersError) throw ordersError

      // Fetch total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true })

      if (usersError) console.error('Error fetching users count:', usersError)

      // Process analytics data
      const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0) || 0
      const totalOrders = orders?.length || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Process sales by month
      const monthlyData: { [key: string]: { revenue: number, orders: number } } = {}
      
      orders?.forEach(order => {
        const date = new Date(order.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, orders: 0 }
        }
        
        monthlyData[monthKey].revenue += parseFloat(order.total_amount || '0')
        monthlyData[monthKey].orders += 1
      })

      const salesByMonth = Object.entries(monthlyData)
        .map(([monthKey, data]) => {
          const [year, month] = monthKey.split('-')
          return {
            month: monthKey,
            monthName: getMonthName(parseInt(month) - 1),
            revenue: data.revenue,
            orders: data.orders
          }
        })
        .sort((a, b) => a.month.localeCompare(b.month))

      // Process orders by status
      const statusCounts: { [key: string]: number } = {}
      orders?.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
      })

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
      }))

      // Process top products
      const productStats: { [key: string]: { name: string, quantity: number, revenue: number } } = {}
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const productId = item.products?.id
          const productName = locale === 'ka' ? item.products?.name_ka : item.products?.name_en
          
          if (!productStats[productId]) {
            productStats[productId] = { name: productName || 'Unknown', quantity: 0, revenue: 0 }
          }
          
          productStats[productId].quantity += item.quantity
          productStats[productId].revenue += item.quantity * parseFloat(item.price || '0')
        })
      })

      const topProducts = Object.entries(productStats)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Process top categories
      const categoryStats: { [key: string]: { orders: number, revenue: number } } = {}
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const categoryName = locale === 'ka' 
            ? item.products?.categories?.name_ka 
            : item.products?.categories?.name_en
          
          if (categoryName) {
            if (!categoryStats[categoryName]) {
              categoryStats[categoryName] = { orders: 0, revenue: 0 }
            }
            categoryStats[categoryName].orders += 1
            categoryStats[categoryName].revenue += item.quantity * parseFloat(item.price || '0')
          }
        })
      })

      const topCategories = Object.entries(categoryStats)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalUsers: totalUsers || 0,
        topProducts,
        salesByMonth,
        ordersByStatus,
        topCategories
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setRefreshing(false)
    }
  }, [selectedPeriod, getDateRange, getMonthName, locale])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{locale === 'ka' ? 'იტვირთება...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {locale === 'ka' ? 'ანალიტიკა' : 'Analytics'}
                </h1>
                <p className="text-gray-600">
                  {locale === 'ka' ? 'ბიზნეს ანალიტიკა და სტატისტიკა' : 'Business analytics and statistics'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchAnalytics}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{locale === 'ka' ? 'განახლება' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Time Period Selector */}
        <TimePeriodSelector 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          locale={locale}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი შემოსავალი' : 'Total Revenue'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalRevenue.toFixed(2)} ₾
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი შეკვეთები' : 'Total Orders'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalOrders}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'საშუალო შეკვეთის ღირებულება' : 'Average Order Value'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.averageOrderValue.toFixed(2)} ₾
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'ka' ? 'მთლიანი მომხმარებლები' : 'Total Users'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales by Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'გაყიდვების ტრენდი' : 'Sales Trend'}
            </h3>
            <div className="space-y-4">
              {analytics.salesByMonth.length > 0 ? (
                analytics.salesByMonth.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {month.monthName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">
                        {month.revenue.toFixed(2)} ₾
                      </span>
                      <span className="text-xs text-gray-500">
                        ({month.orders} {locale === 'ka' ? 'შეკვეთა' : 'orders'})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {locale === 'ka' ? 'მონაცემები არ არის' : 'No data available'}
                </p>
              )}
            </div>
          </motion.div>

          {/* Orders by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'შეკვეთები სტატუსით' : 'Orders by Status'}
            </h3>
            <div className="space-y-4">
              {analytics.ordersByStatus.length > 0 ? (
                analytics.ordersByStatus.map((status, index) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {status.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">
                        {status.count}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({status.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {locale === 'ka' ? 'მონაცემები არ არის' : 'No data available'}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Products and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'ტოპ პროდუქტები' : 'Top Products'}
            </h3>
            <div className="space-y-4">
              {analytics.topProducts.length > 0 ? (
                analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {product.revenue.toFixed(2)} ₾
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.quantity} {locale === 'ka' ? 'ცალი' : 'sold'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {locale === 'ka' ? 'მონაცემები არ არის' : 'No data available'}
                </p>
              )}
            </div>
          </motion.div>

          {/* Top Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'ტოპ კატეგორიები' : 'Top Categories'}
            </h3>
            <div className="space-y-4">
              {analytics.topCategories.length > 0 ? (
                analytics.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {category.revenue.toFixed(2)} ₾
                      </p>
                      <p className="text-xs text-gray-500">
                        {category.orders} {locale === 'ka' ? 'შეკვეთა' : 'orders'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {locale === 'ka' ? 'მონაცემები არ არის' : 'No data available'}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}