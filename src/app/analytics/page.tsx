'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Camera,
  Calendar,
  Package,
  ShoppingCart,
  Heart,
  Settings,
  Bell,
  CreditCard,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Star,
  DollarSign,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserAnalytics {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  cancelledOrders: number
  totalSpent: number
  averageOrderValue: number
  monthlySpending: number
  yearlySpending: number
  favoriteProducts: number
  memberSince: string
  spendingTrend: number
  topCategories: any[]
  monthlyTrends: any[]
  recentActivity: Array<{
    id: string
    type: string
    title: string
    description: string
    date: string
    status: string
  }>
  orderFrequency: number
  lastOrderDate: string
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
    { id: '3months', label: locale === 'ka' ? '3 თვე' : '3 Months' },
    { id: '6months', label: locale === 'ka' ? '6 თვე' : '6 Months' },
    { id: '1year', label: locale === 'ka' ? '1 წელი' : '1 Year' },
    { id: 'all', label: locale === 'ka' ? 'ყველა' : 'All Time' }
  ]

  return (
    <div className="flex space-x-2 mb-6">
      {periods.map((period) => (
        <button
          key={period.id}
          onClick={() => onPeriodChange(period.id)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            selectedPeriod === period.id
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

export default function UserAnalyticsPage() {
  const { locale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    monthlySpending: 0,
    yearlySpending: 0,
    favoriteProducts: 0,
    memberSince: '',
    spendingTrend: 0,
    topCategories: [],
    monthlyTrends: [],
    recentActivity: [],
    orderFrequency: 0,
    lastOrderDate: ''
  })

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

  const fetchUserAnalytics = useCallback(async (userId: string, userCreatedAt: string) => {
    try {
      setRefreshing(true)
      
      const { startDate, endDate } = getDateRange(selectedPeriod)
      
      // Fetch all orders with comprehensive data
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
            products (
              name_en,
              name_ka,
              categories (
                name_en,
                name_ka
              )
            )
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      // Calculate basic order statistics
      const totalOrders = orders?.length || 0
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0
      
      // Calculate spending analytics
      const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
      
      // Monthly and yearly spending
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const yearStart = new Date(now.getFullYear(), 0, 1)
      
      const monthlySpending = orders?.filter(o => new Date(o.created_at) >= monthStart)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      
      const yearlySpending = orders?.filter(o => new Date(o.created_at) >= yearStart)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // Calculate spending trend (compare last 2 months)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0)

      const lastMonthSpending = orders?.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate >= lastMonth && orderDate <= lastMonthEnd
      }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      const previousMonthSpending = orders?.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate >= previousMonth && orderDate <= previousMonthEnd
      }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      const spendingTrend = previousMonthSpending > 0 
        ? ((lastMonthSpending - previousMonthSpending) / previousMonthSpending) * 100 
        : 0

      // Calculate order frequency (orders per month)
      const joinDate = new Date(userCreatedAt)
      const monthsSinceJoin = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      const orderFrequency = monthsSinceJoin > 0 ? totalOrders / monthsSinceJoin : 0

      // Find last order date
      const lastOrderDate = totalOrders > 0 ? orders?.[0]?.created_at || '' : ''

      // Calculate top categories
      const categoryStats: { [key: string]: { count: number, spending: number, name_en: string, name_ka: string } } = {}
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (item.products?.categories) {
            const category = item.products.categories
            const key = category.name_en
            if (!categoryStats[key]) {
              categoryStats[key] = {
                count: 0,
                spending: 0,
                name_en: category.name_en,
                name_ka: category.name_ka
              }
            }
            categoryStats[key].count += item.quantity
            categoryStats[key].spending += item.price * item.quantity
          }
        })
      })

      const topCategories = Object.values(categoryStats)
        .sort((a, b) => b.spending - a.spending)
        .slice(0, 5)

      // Calculate monthly trends based on selected period
      const monthsToShow = selectedPeriod === '3months' ? 3 : 
                          selectedPeriod === '6months' ? 6 : 
                          selectedPeriod === '1year' ? 12 : 12

      const monthlyTrends = []
      // Generate months in chronological order (oldest to newest)
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        const spending = orders?.filter(o => {
          const orderDate = new Date(o.created_at)
          return orderDate >= month && orderDate <= monthEnd
        }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        const orderCount = orders?.filter(o => {
          const orderDate = new Date(o.created_at)
          return orderDate >= month && orderDate <= monthEnd
        }).length || 0

        monthlyTrends.push({
          month: getMonthName(month.getMonth()),
          spending,
          orders: orderCount,
          date: month // Add date for proper sorting
        })
      }

      // Ensure chronological order (oldest to newest)
      monthlyTrends.sort((a, b) => a.date.getTime() - b.date.getTime())

      // Generate recent activity
      const recentActivity: Array<{
        id: string
        type: string
        title: string
        description: string
        date: string
        status: string
      }> = []
      
      // Recent orders
      orders?.slice(0, 5).forEach(order => {
        recentActivity.push({
          id: `order-${order.id}`,
          type: 'order',
          title: locale === 'ka' ? 'შეკვეთა განთავსდა' : 'Order Placed',
          description: `${order.total_amount?.toLocaleString()} ₾`,
          date: order.created_at,
          status: order.status
        })
      })

      setAnalytics({
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalSpent,
        averageOrderValue,
        monthlySpending,
        yearlySpending,
        favoriteProducts: 0, // TODO: Implement favorites
        memberSince: userCreatedAt,
        spendingTrend,
        topCategories,
        monthlyTrends,
        recentActivity,
        orderFrequency,
        lastOrderDate
      })

    } catch (error) {
      console.error('Error fetching user analytics:', error)
    } finally {
      setRefreshing(false)
    }
  }, [selectedPeriod, getDateRange, getMonthName, locale])

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      if (mounted) {
        setUser(user)
        await fetchUserAnalytics(user.id, user.created_at!)
        setLoading(false)
      }
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [router, fetchUserAnalytics])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {locale === 'ka' ? 'ჩემი ანალიტიკა' : 'My Analytics'}
                </h1>
                <p className="text-sm text-gray-600">
                  {locale === 'ka' ? 'პირადი შეკვეთების და ხარჯების ანალიტიკა' : 'Personal order and spending analytics'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => fetchUserAnalytics(user.id, user.created_at)}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{locale === 'ka' ? 'განახლება' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Time Period Selector */}
        <TimePeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          locale={locale}
        />

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
                  {locale === 'ka' ? 'მთლიანი ხარჯი' : 'Total Spent'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalSpent.toLocaleString()} ₾
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
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
                  {locale === 'ka' ? 'შეკვეთები' : 'Total Orders'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalOrders}
                </p>
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
                  {locale === 'ka' ? 'საშუალო შეკვეთა' : 'Avg Order Value'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.averageOrderValue.toLocaleString()} ₾
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <Target className="w-6 h-6 text-indigo-600" />
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
                  {locale === 'ka' ? 'ტრენდი' : 'Spending Trend'}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.spendingTrend > 0 ? '+' : ''}{analytics.spendingTrend.toFixed(1)}%
                  </p>
                  {analytics.spendingTrend > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : analytics.spendingTrend < 0 ? (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Spending Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'ხარჯების ტრენდი' : 'Spending Trend'}
            </h3>
            <div className="space-y-4">
              {analytics.monthlyTrends.length > 0 ? (
                analytics.monthlyTrends.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {month.month}
                    </span>
                    <span className="text-sm text-gray-900">
                      {month.spending.toFixed(2)} ₾
                    </span>
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
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'ყველაზე პოპულარული კატეგორიები' : 'Top Categories'}
            </h3>
            <div className="space-y-4">
              {analytics.topCategories.length > 0 ? (
                analytics.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {locale === 'ka' ? category.name_ka : category.name_en}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {category.spending.toFixed(2)} ₾
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.count} {locale === 'ka' ? 'ნივთი' : 'items'}
                      </div>
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'ka' ? 'ბოლო აქტივობა' : 'Recent Activity'}
          </h3>
          <div className="space-y-4">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                    <p className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {activity.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                {locale === 'ka' ? 'აქტივობა არ არის' : 'No activity found'}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
