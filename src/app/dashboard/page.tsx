'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  Heart, 
  Bell, 
  User, 
  Settings, 
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  Truck,
  RefreshCw,
  DollarSign,
  Award,
  BarChart3,
  Target,
  Zap,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface DashboardData {
  recentOrders: any[]
  favoriteProducts: any[]
  recommendations: any[]
  notifications: any[]
  orderStats: {
    total: number
    pending: number
    completed: number
    cancelled: number
    shipped: number
  }
  spendingAnalytics: {
    totalSpent: number
    averageOrderValue: number
    monthlySpending: number
    yearlySpending: number
    lastOrderAmount: number
    spendingTrend: number
  }
  membershipInfo: {
    joinDate: string
    loyaltyTier: string
    pointsEarned: number
    totalSavings: number
  }
  topCategories: any[]
  monthlySpending: any[]
}

export default function DashboardPage() {
  const { locale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    recentOrders: [],
    favoriteProducts: [],
    recommendations: [],
    notifications: [],
    orderStats: { total: 0, pending: 0, completed: 0, cancelled: 0, shipped: 0 },
    spendingAnalytics: {
      totalSpent: 0,
      averageOrderValue: 0,
      monthlySpending: 0,
      yearlySpending: 0,
      lastOrderAmount: 0,
      spendingTrend: 0
    },
    membershipInfo: {
      joinDate: '',
      loyaltyTier: 'Bronze',
      pointsEarned: 0,
      totalSavings: 0
    },
    topCategories: [],
    monthlySpending: []
  })

  const fetchDashboardData = useCallback(async (userId: string) => {
    try {
      setRefreshing(true)
      
      // Fetch all orders with detailed information
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
              images,
              slug_en,
              slug_ka,
              categories (
                name_en,
                name_ka
              )
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Get recent orders (last 5)
      const recentOrders = orders?.slice(0, 5) || []

      // Calculate comprehensive order statistics
      const orderStats = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        completed: orders?.filter(o => o.status === 'completed').length || 0,
        cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
        shipped: orders?.filter(o => o.status === 'shipped').length || 0
      }

      // Calculate spending analytics
      const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const averageOrderValue = orderStats.total > 0 ? totalSpent / orderStats.total : 0
      
      // Monthly spending (current month)
      const currentMonth = new Date()
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const monthlySpending = orders?.filter(o => new Date(o.created_at) >= monthStart)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // Yearly spending
      const yearStart = new Date(currentMonth.getFullYear(), 0, 1)
      const yearlySpending = orders?.filter(o => new Date(o.created_at) >= yearStart)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // Last order amount
      const lastOrderAmount = orders?.[0]?.total_amount || 0

      // Calculate spending trend (compare last 2 months)
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
      const lastMonthSpending = orders?.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate >= lastMonth && orderDate <= lastMonthEnd
      }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      const spendingTrend = lastMonthSpending > 0 
        ? ((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100 
        : 0

      // Calculate monthly spending for the last 6 months
      const monthlySpendingData = []
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1)
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i + 1, 0)
        const spending = orders?.filter(o => {
          const orderDate = new Date(o.created_at)
          return orderDate >= month && orderDate <= monthEnd
        }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        monthlySpendingData.push({
          month: month.toLocaleDateString(locale, { month: 'short' }),
          spending
        })
      }

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

      // Membership and loyalty calculations
      const joinDate = user?.created_at || ''
      const pointsEarned = Math.floor(totalSpent / 10) // 1 point per 10 GEL spent
      const totalSavings = Math.floor(totalSpent * 0.05) // Assume 5% savings for loyal customers
      
      // Determine loyalty tier based on total spending
      let loyaltyTier = 'Bronze'
      if (totalSpent >= 10000) loyaltyTier = 'Platinum'
      else if (totalSpent >= 5000) loyaltyTier = 'Gold'
      else if (totalSpent >= 1000) loyaltyTier = 'Silver'

      // Generate real notifications based on order status
      const notifications: Array<{
        id: string
        type: string
        message: string
        time: string
        read: boolean
      }> = []
      
      // Check for recent order updates
      const recentPendingOrders = orders?.filter(o => 
        o.status === 'pending' && 
        new Date(o.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ) || []
      
      recentPendingOrders.forEach(order => {
        notifications.push({
          id: `order-${order.id}`,
          type: 'order',
          message: locale === 'ka' 
            ? `თქვენი შეკვეთა #${order.id.slice(0, 8)} მუშავდება`
            : `Your order #${order.id.slice(0, 8)} is being processed`,
          time: new Date(order.created_at).toLocaleDateString(),
          read: false
        })
      })

      // Check for completed orders
      const recentCompletedOrders = orders?.filter(o => 
        o.status === 'completed' && 
        new Date(o.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      ) || []
      
      recentCompletedOrders.forEach(order => {
        notifications.push({
          id: `completed-${order.id}`,
          type: 'success',
          message: locale === 'ka' 
            ? `შეკვეთა #${order.id.slice(0, 8)} დასრულდა`
            : `Order #${order.id.slice(0, 8)} has been completed`,
          time: new Date(order.created_at).toLocaleDateString(),
          read: true
        })
      })

      setDashboardData({
        recentOrders,
        favoriteProducts: [], // TODO: Implement favorites
        recommendations: [], // TODO: Implement recommendations
        notifications,
        orderStats,
        spendingAnalytics: {
          totalSpent,
          averageOrderValue,
          monthlySpending,
          yearlySpending,
          lastOrderAmount,
          spendingTrend
        },
        membershipInfo: {
          joinDate,
          loyaltyTier,
          pointsEarned,
          totalSavings
        },
        topCategories,
        monthlySpending: monthlySpendingData
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setRefreshing(false)
    }
  }, [locale])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      await fetchDashboardData(user.id)
      setLoading(false)
    }
    checkAuth()
  }, [router, fetchDashboardData])

  const tabs = [
    { id: 'overview', label: locale === 'ka' ? 'მიმოხილვა' : 'Overview', icon: BarChart3 },
    { id: 'orders', label: locale === 'ka' ? 'შეკვეთები' : 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: locale === 'ka' ? 'ანალიტიკა' : 'Analytics', icon: TrendingUp },
    { id: 'profile', label: locale === 'ka' ? 'პროფილი' : 'Profile', icon: User }
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
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locale === 'ka' ? 'ჩემი დაშბორდი' : 'My Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">
                {locale === 'ka' ? `კეთილი იყოს თქვენი დაბრუნება, ${dashboardData.membershipInfo.loyaltyTier} წევრო!` : `Welcome back, ${dashboardData.membershipInfo.loyaltyTier} member!`}
              </p>
            </div>
            
            <button
              onClick={() => fetchDashboardData(user.id)}
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
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'ka' ? 'ჯამური შეკვეთები' : 'Total Orders'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.orderStats.total}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-emerald-600 font-medium">
                        {dashboardData.orderStats.completed} {locale === 'ka' ? 'დასრულებული' : 'completed'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-emerald-600" />
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
                      {locale === 'ka' ? 'ჯამური ღირებულება' : 'Total Spent'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.spendingAnalytics.totalSpent.toLocaleString()} ₾
                    </p>
                    <div className="flex items-center mt-2">
                      {dashboardData.spendingAnalytics.spendingTrend >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        dashboardData.spendingAnalytics.spendingTrend >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {Math.abs(dashboardData.spendingAnalytics.spendingTrend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <DollarSign className="w-6 h-6 text-blue-600" />
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
                      {locale === 'ka' ? 'საშუალო შეკვეთა' : 'Average Order'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.spendingAnalytics.averageOrderValue.toLocaleString()} ₾
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
                      {locale === 'ka' ? 'ლოიალური ქულები' : 'Loyalty Points'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.membershipInfo.pointsEarned}</p>
                    <div className="flex items-center mt-2">
                      <Award className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-sm text-amber-600 font-medium">
                        {dashboardData.membershipInfo.loyaltyTier}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-full">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Orders and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {locale === 'ka' ? 'უახლესი შეკვეთები' : 'Recent Orders'}
                      </h3>
                      <Link
                        href="/orders"
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                      >
                        {locale === 'ka' ? 'ყველას ნახვა' : 'View All'}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {dashboardData.recentOrders.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.recentOrders.map((order, index) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.order_items?.length || 0} {locale === 'ka' ? 'პროდუქტი' : 'items'}
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
                                  : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
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
                        <p className="text-gray-500 mb-4">
                          {locale === 'ka' ? 'შეკვეთები არ არის' : 'No orders yet'}
                        </p>
                        <Link
                          href="/shop"
                          className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          {locale === 'ka' ? 'შოპინგის დაწყება' : 'Start Shopping'}
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {locale === 'ka' ? 'სწრაფი მოქმედებები' : 'Quick Actions'}
                  </h3>
                  
                  <div className="space-y-3">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <User className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium text-emerald-900">
                        {locale === 'ka' ? 'პროფილი' : 'Profile'}
                      </span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Settings className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        {locale === 'ka' ? 'პარამეტრები' : 'Settings'}
                      </span>
                    </Link>

                    <button className="w-full flex items-center space-x-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900">
                        {locale === 'ka' ? 'რჩეული' : 'Wishlist'}
                      </span>
                    </button>

                    <Link
                      href="/cart"
                      className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <Package className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">
                        {locale === 'ka' ? 'კალათა' : 'Cart'}
                      </span>
                    </Link>
                  </div>
                </motion.div>

                {/* Notifications */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {locale === 'ka' ? 'შეტყობინებები' : 'Notifications'}
                  </h3>
                  
                  <div className="space-y-3">
                    {dashboardData.notifications.length > 0 ? (
                      dashboardData.notifications.slice(0, 3).map((notification, index) => (
                        <div key={notification.id} className={`p-3 rounded-lg border ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.read ? 'bg-gray-400' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {locale === 'ka' ? 'შეტყობინებები არ არის' : 'No notifications'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Spending Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'ხარჯების ტრენდი (ბოლო 6 თვე)' : 'Spending Trends (Last 6 Months)'}
              </h3>
              
              <div className="space-y-4">
                {dashboardData.monthlySpending.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{month.month}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max((month.spending / Math.max(...dashboardData.monthlySpending.map(m => m.spending))) * 100, 5)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                        {month.spending.toLocaleString()} ₾
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'ყველაზე პოპულარული კატეგორიები' : 'Top Categories'}
              </h3>
              
              <div className="space-y-4">
                {dashboardData.topCategories.length > 0 ? (
                  dashboardData.topCategories.map((category, index) => (
                    <div key={category.name_en} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                          <span className="text-sm font-bold text-emerald-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {locale === 'ka' ? category.name_ka : category.name_en}
                          </p>
                          <p className="text-sm text-gray-600">
                            {category.count} {locale === 'ka' ? 'პროდუქტი' : 'items'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {category.spending.toLocaleString()} ₾
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {locale === 'ka' ? 'მონაცემები არ არის' : 'No data available'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            {/* Order Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.orderStats.completed}</p>
                <p className="text-sm text-gray-600">{locale === 'ka' ? 'დასრულებული' : 'Completed'}</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.orderStats.pending}</p>
                <p className="text-sm text-gray-600">{locale === 'ka' ? 'მომლოდინე' : 'Pending'}</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.orderStats.shipped}</p>
                <p className="text-sm text-gray-600">{locale === 'ka' ? 'გაგზავნილი' : 'Shipped'}</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.orderStats.cancelled}</p>
                <p className="text-sm text-gray-600">{locale === 'ka' ? 'გაუქმებული' : 'Cancelled'}</p>
              </div>
            </div>

            {/* All Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {locale === 'ka' ? 'ყველა შეკვეთა' : 'All Orders'}
                </h3>
                <Link
                  href="/orders"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  {locale === 'ka' ? 'დეტალური ნახვა' : 'View Details'}
                </Link>
              </div>
              
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order, index) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.order_items?.length || 0} {locale === 'ka' ? 'პროდუქტი' : 'items'}
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
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {locale === 'ka' ? 'პროფილის ინფორმაცია' : 'Profile Information'}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user?.user_metadata?.first_name || user?.user_metadata?.given_name || 'User'}
                      </p>
                      <p className="text-gray-600">{user?.email}</p>
                      <p className="text-sm text-emerald-600 font-medium">
                        {dashboardData.membershipInfo.loyaltyTier} {locale === 'ka' ? 'წევრი' : 'Member'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.membershipInfo.pointsEarned}</p>
                      <p className="text-sm text-gray-600">{locale === 'ka' ? 'ქულები' : 'Points'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.membershipInfo.totalSavings} ₾</p>
                      <p className="text-sm text-gray-600">{locale === 'ka' ? 'ეკონომია' : 'Savings'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link
                    href="/profile"
                    className="w-full flex items-center justify-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {locale === 'ka' ? 'პროფილის რედაქტირება' : 'Edit Profile'}
                  </Link>
                </div>
              </motion.div>

              {/* Membership Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {locale === 'ka' ? 'წევრობის პრივილეგიები' : 'Membership Benefits'}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-900">
                        {locale === 'ka' ? 'ლოიალური ქულები' : 'Loyalty Points'}
                      </p>
                      <p className="text-sm text-emerald-700">
                        {locale === 'ka' ? '1 ქულა ყოველ 10₾-ზე' : '1 point per 10₾ spent'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Star className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        {locale === 'ka' ? 'ექსკლუზიური შეთავაზებები' : 'Exclusive Offers'}
                      </p>
                      <p className="text-sm text-blue-700">
                        {locale === 'ka' ? 'წევრებისთვის განკუთვნილი აქციები' : 'Special deals for members'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">
                        {locale === 'ka' ? 'პრიორიტეტული მხარდაჭერა' : 'Priority Support'}
                      </p>
                      <p className="text-sm text-purple-700">
                        {locale === 'ka' ? 'სწრაფი პასუხები' : 'Faster response times'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}