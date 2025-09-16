'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  User, 
  TrendingUp,
  RefreshCw,
  DollarSign,
  BarChart3,
  Target,
  Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface DashboardData {
  recentOrders: any[]
  notifications: any[]
  userStats: any
  topCategories: any[]
  monthlySpending: any[]
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
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
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

export default function DashboardPage() {
  const { locale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    recentOrders: [],
    notifications: [],
    userStats: {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      memberSince: '',
      monthlySpending: 0,
      yearlySpending: 0,
      lastOrderAmount: 0,
      spendingTrend: 0
    },
    topCategories: [],
    monthlySpending: []
  })

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
        startDate = new Date('2020-01-01')
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }
    
    return { startDate, endDate: now }
  }, [])

  const fetchDashboardData = useCallback(async (userId: string) => {
    try {
      setRefreshing(true)
      const { startDate, endDate } = getDateRange(selectedPeriod)
      
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
              categories (
                name_en,
                name_ka
              )
            )
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      // Get recent orders (last 5)
      const recentOrders = orders?.slice(0, 5) || []

      // Calculate real analytics - no fake data
      const totalSpent = orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0
      const totalOrders = orders?.length || 0
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

      // Calculate monthly spending for the selected period
      const monthlySpendingData = []
      const monthsToShow = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : selectedPeriod === '1year' ? 12 : 12

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const month = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
        const monthEnd = new Date(endDate.getFullYear(), endDate.getMonth() - i + 1, 0)
        
        const spending = orders?.filter(o => {
          const orderDate = new Date(o.created_at)
          return orderDate >= month && orderDate <= monthEnd
        }).reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0

        monthlySpendingData.push({
          month: getMonthName(month.getMonth()),
          amount: spending
        })
      }

      // Calculate top categories - real data only
      const categoryStats: { [key: string]: { spending: number, orders: number } } = {}
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const categoryName = locale === 'ka' 
            ? item.products?.categories?.name_ka 
            : item.products?.categories?.name_en
          
          if (categoryName) {
            if (!categoryStats[categoryName]) {
              categoryStats[categoryName] = { spending: 0, orders: 0 }
            }
            categoryStats[categoryName].spending += item.quantity * (parseFloat(item.price) || 0)
            categoryStats[categoryName].orders += 1
          }
        })
      })

      const topCategories = Object.entries(categoryStats)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.spending - a.spending)
        .slice(0, 5)

      // Generate real notifications
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

      setDashboardData({
        recentOrders,
        notifications,
        userStats: {
          totalOrders,
          totalSpent,
          averageOrderValue,
          memberSince: user?.created_at || ''
        },
        topCategories,
        monthlySpending: monthlySpendingData
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setRefreshing(false)
    }
  }, [selectedPeriod, getDateRange, getMonthName, locale, user?.created_at])

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
    { id: 'profile', label: locale === 'ka' ? 'პროფილი' : 'Profile', icon: User }
  ]

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {locale === 'ka' ? 'მომხმარებლის პანელი' : 'User Dashboard'}
              </h1>
              <p className="text-gray-600">
                {locale === 'ka' ? 'თქვენი ანგარიშის მიმოხილვა' : 'Overview of your account'}
              </p>
            </div>
            <button
              onClick={() => fetchDashboardData(user?.id)}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{locale === 'ka' ? 'განახლება' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
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
                      {locale === 'ka' ? 'მთლიანი შეკვეთები' : 'Total Orders'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.totalOrders}
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
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'ka' ? 'მთლიანი ხარჯი' : 'Total Spent'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.totalSpent.toFixed(2)} ₾
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
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'ka' ? 'საშუალო შეკვეთის ღირებულება' : 'Average Order Value'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.userStats.averageOrderValue.toFixed(2)} ₾
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
                      {locale === 'ka' ? 'წევრი' : 'Member Since'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {dashboardData.userStats.memberSince 
                        ? new Date(dashboardData.userStats.memberSince).toLocaleDateString() 
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link 
                href="/analytics"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold">
                      {locale === 'ka' ? 'ანალიტიკა' : 'Analytics'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {locale === 'ka' ? 'ხარჯების ანალიზი' : 'View spending insights'}
                    </p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/orders"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <ShoppingCart className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold">
                      {locale === 'ka' ? 'შეკვეთები' : 'Orders'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {locale === 'ka' ? 'შეკვეთების ისტორია' : 'Order history'}
                    </p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/profile"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <User className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold">
                      {locale === 'ka' ? 'პროფილი' : 'Profile'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {locale === 'ka' ? 'პროფილის მართვა' : 'Manage profile'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {locale === 'ka' ? 'ბოლო შეკვეთები' : 'Recent Orders'}
                </h3>
                <Link 
                  href="/orders"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  {locale === 'ka' ? 'ყველას ნახვა' : 'View All'}
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {parseFloat(order.total_amount).toFixed(2)} ₾
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {locale === 'ka' ? 'შეკვეთები არ არის' : 'No orders found'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}


        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'შეკვეთების ისტორია' : 'Order History'}
            </h3>
            <div className="text-center py-8">
              <Link 
                href="/orders"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                <Package className="w-5 h-5" />
                <span>{locale === 'ka' ? 'შეკვეთების ნახვა' : 'View Orders'}</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'პროფილის პარამეტრები' : 'Profile Settings'}
            </h3>
            <div className="text-center py-8">
              <Link 
                href="/profile"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                <User className="w-5 h-5" />
                <span>{locale === 'ka' ? 'პროფილის ნახვა' : 'View Profile'}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}