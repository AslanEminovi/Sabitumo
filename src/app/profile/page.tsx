'use client'

import { useState, useEffect } from 'react'
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
  Shield,
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

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  country: string
  avatar_url?: string
  created_at: string
  email_verified: boolean
  phone_verified: boolean
}

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
  loyaltyPoints: number
  loyaltyTier: string
  totalSavings: number
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

export default function ProfilePage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  const [profileData, setProfileData] = useState<UserProfile>({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: 'Georgia',
    created_at: '',
    email_verified: false,
    phone_verified: false
  })

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
    loyaltyPoints: 0,
    loyaltyTier: 'Bronze',
    totalSavings: 0,
    spendingTrend: 0,
    topCategories: [],
    monthlyTrends: [],
    recentActivity: [],
    orderFrequency: 0,
    lastOrderDate: ''
  })

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!mounted) return
        
        if (!user) {
          router.push('/auth/login')
          return
        }
        
        setUser(user)
        
        // Load profile data from user metadata or database
        const profile: UserProfile = {
          id: user.id,
          email: user.email || '',
          firstName: user.user_metadata?.first_name || user.user_metadata?.given_name || '',
          lastName: user.user_metadata?.last_name || user.user_metadata?.family_name || '',
          phone: user.user_metadata?.phone || user.phone || '',
          address: user.user_metadata?.address || '',
          city: user.user_metadata?.city || '',
          country: user.user_metadata?.country || 'Georgia',
          avatar_url: user.user_metadata?.avatar_url,
          created_at: user.created_at,
          email_verified: user.email_confirmed_at ? true : false,
          phone_verified: user.phone_confirmed_at ? true : false
        }
        
        setProfileData(profile)
        
        // Fetch comprehensive user analytics
        await fetchUserAnalytics(user.id, user.created_at)
        
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [router])

  const fetchUserAnalytics = async (userId: string, joinDate: string) => {
    try {
      setRefreshing(true)
      
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
      const lastMonthSpending = orders?.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate >= lastMonth && orderDate <= lastMonthEnd
      }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      const spendingTrend = lastMonthSpending > 0 
        ? ((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100 
        : 0

      // Calculate loyalty metrics
      const loyaltyPoints = Math.floor(totalSpent / 10) // 1 point per 10 GEL
      const totalSavings = Math.floor(totalSpent * 0.05) // 5% savings estimation
      
      // Determine loyalty tier
      let loyaltyTier = 'Bronze'
      if (totalSpent >= 10000) loyaltyTier = 'Platinum'
      else if (totalSpent >= 5000) loyaltyTier = 'Gold'
      else if (totalSpent >= 1000) loyaltyTier = 'Silver'

      // Calculate order frequency (orders per month since joining)
      const joinedDate = new Date(joinDate)
      const monthsSinceJoining = Math.max(1, 
        (now.getFullYear() - joinedDate.getFullYear()) * 12 + 
        (now.getMonth() - joinedDate.getMonth())
      )
      const orderFrequency = totalOrders / monthsSinceJoining

      // Last order date
      const lastOrderDate = orders?.[0]?.created_at || ''

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

      // Calculate monthly trends for the last 12 months
      const monthlyTrends = []
      for (let i = 11; i >= 0; i--) {
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
          month: month.toLocaleDateString(locale, { month: 'short', year: 'numeric' }),
          spending,
          orders: orderCount
        })
      }

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
        memberSince: joinDate,
        loyaltyPoints,
        loyaltyTier,
        totalSavings,
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
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          country: profileData.country
        }
      })

      if (error) throw error

      setIsEditing(false)
      // Show success message
      alert(locale === 'ka' ? 'პროფილი წარმატებით განახლდა' : 'Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(locale === 'ka' ? 'პროფილის განახლების შეცდომა' : 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original data
    if (user) {
      setProfileData({
        ...profileData,
        firstName: user.user_metadata?.first_name || user.user_metadata?.given_name || '',
        lastName: user.user_metadata?.last_name || user.user_metadata?.family_name || '',
        phone: user.user_metadata?.phone || user.phone || '',
        address: user.user_metadata?.address || '',
        city: user.user_metadata?.city || '',
        country: user.user_metadata?.country || 'Georgia'
      })
    }
    setIsEditing(false)
  }

  const tabs = [
    { id: 'profile', label: locale === 'ka' ? 'პროფილი' : 'Profile', icon: User },
    { id: 'analytics', label: locale === 'ka' ? 'ანალიტიკა' : 'Analytics', icon: BarChart3 },
    { id: 'orders', label: locale === 'ka' ? 'შეკვეთები' : 'Orders', icon: ShoppingCart },
    { id: 'activity', label: locale === 'ka' ? 'აქტივობა' : 'Activity', icon: Activity }
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
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {locale === 'ka' ? 'ჩემი პროფილი' : 'My Profile'}
                </h1>
                <p className="text-sm text-gray-600">
                  {locale === 'ka' ? 'პირადი ინფორმაციის მართვა და ანალიტიკა' : 'Manage your personal information and view analytics'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchUserAnalytics(user.id, user.created_at)}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{locale === 'ka' ? 'განახლება' : 'Refresh'}</span>
              </button>
              
              <Link
                href="/settings"
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>{locale === 'ka' ? 'პარამეტრები' : 'Settings'}</span>
              </Link>
            </div>
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
              >
                <div className="text-center mb-6">
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      {profileData.avatar_url ? (
                        <img 
                          src={profileData.avatar_url} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {profileData.firstName || profileData.lastName 
                      ? `${profileData.firstName} ${profileData.lastName}`.trim()
                      : (locale === 'ka' ? 'უცნობი მომხმარებელი' : 'Unknown User')
                    }
                  </h2>
                  <p className="text-gray-600 mb-2">{profileData.email}</p>
                  <div className="flex items-center justify-center">
                    <Award className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="text-amber-600 font-medium">
                      {analytics.loyaltyTier} {locale === 'ka' ? 'წევრი' : 'Member'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm mt-4">
                    <div className="flex items-center space-x-1">
                      {profileData.email_verified ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={profileData.email_verified ? 'text-emerald-600' : 'text-amber-600'}>
                        {locale === 'ka' ? 'ემაილი' : 'Email'}
                      </span>
                    </div>
                    
                    {profileData.phone && (
                      <div className="flex items-center space-x-1">
                        {profileData.phone_verified ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className={profileData.phone_verified ? 'text-emerald-600' : 'text-amber-600'}>
                          {locale === 'ka' ? 'ტელეფონი' : 'Phone'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-900">{analytics.totalOrders}</p>
                        <p className="text-xs text-emerald-700">
                          {locale === 'ka' ? 'შეკვეთები' : 'Orders'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {analytics.totalSpent.toLocaleString()} ₾
                        </p>
                        <p className="text-xs text-blue-700">
                          {locale === 'ka' ? 'ჯამური ღირებულება' : 'Total Spent'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-900">{analytics.loyaltyPoints}</p>
                        <p className="text-xs text-amber-700">
                          {locale === 'ka' ? 'ლოიალურობის ქულები' : 'Loyalty Points'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          {new Date(analytics.memberSince).getFullYear()}
                        </p>
                        <p className="text-xs text-purple-700">
                          {locale === 'ka' ? 'წევრობის წელი' : 'Member Since'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {locale === 'ka' ? 'პირადი ინფორმაცია' : 'Personal Information'}
                    </h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'რედაქტირება' : 'Edit'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>{locale === 'ka' ? 'გაუქმება' : 'Cancel'}</span>
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? (locale === 'ka' ? 'შენახვა...' : 'Saving...') : (locale === 'ka' ? 'შენახვა' : 'Save')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'სახელი' : 'First Name'}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{profileData.firstName || (locale === 'ka' ? 'მითითებული არ არის' : 'Not specified')}</span>
                        </div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'გვარი' : 'Last Name'}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{profileData.lastName || (locale === 'ka' ? 'მითითებული არ არის' : 'Not specified')}</span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'ელ. ფოსტა' : 'Email'}
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{profileData.email}</span>
                        {profileData.email_verified && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'ტელეფონი' : 'Phone'}
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{profileData.phone || (locale === 'ka' ? 'მითითებული არ არის' : 'Not specified')}</span>
                          {profileData.phone_verified && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'მისამართი' : 'Address'}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{profileData.address || (locale === 'ka' ? 'მითითებული არ არის' : 'Not specified')}</span>
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'ქალაქი' : 'City'}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{profileData.city || (locale === 'ka' ? 'მითითებული არ არის' : 'Not specified')}</span>
                        </div>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'ქვეყანა' : 'Country'}
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.country}
                          onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="Georgia">{locale === 'ka' ? 'საქართველო' : 'Georgia'}</option>
                          <option value="Armenia">{locale === 'ka' ? 'სომხეთი' : 'Armenia'}</option>
                          <option value="Azerbaijan">{locale === 'ka' ? 'აზერბაიჯანი' : 'Azerbaijan'}</option>
                          <option value="Turkey">{locale === 'ka' ? 'თურქეთი' : 'Turkey'}</option>
                          <option value="Other">{locale === 'ka' ? 'სხვა' : 'Other'}</option>
                        </select>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{profileData.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Key Metrics */}
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
                      {locale === 'ka' ? 'საშუალო შეკვეთა' : 'Avg Order Value'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.averageOrderValue.toLocaleString()} ₾
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <Target className="w-6 h-6 text-emerald-600" />
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
                      {locale === 'ka' ? 'თვიური ხარჯი' : 'Monthly Spending'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.monthlySpending.toLocaleString()} ₾
                    </p>
                    <div className="flex items-center mt-1">
                      {analytics.spendingTrend >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        analytics.spendingTrend >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {Math.abs(analytics.spendingTrend).toFixed(1)}%
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
                      {locale === 'ka' ? 'შეკვეთების სიხშირე' : 'Order Frequency'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.orderFrequency.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {locale === 'ka' ? 'თვეში' : 'per month'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Activity className="w-6 h-6 text-purple-600" />
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
                      {locale === 'ka' ? 'ეკონომია' : 'Total Savings'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.totalSavings.toLocaleString()} ₾
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {locale === 'ka' ? 'ლოიალურობისთვის' : 'from loyalty'}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-full">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Spending Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'ხარჯების ტრენდი (ბოლო 12 თვე)' : 'Spending Trends (Last 12 Months)'}
              </h3>
              
              <div className="space-y-3">
                {analytics.monthlyTrends.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 w-20">{month.month}</span>
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.max((month.spending / Math.max(...analytics.monthlyTrends.map(m => m.spending))) * 100, 2)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-center">
                        {month.orders}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 w-24 text-right">
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
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'ყველაზე პოპულარული კატეგორიები' : 'Top Categories'}
              </h3>
              
              <div className="space-y-4">
                {analytics.topCategories.length > 0 ? (
                  analytics.topCategories.map((category, index) => (
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.completedOrders}</p>
                <p className="text-sm text-gray-600">{locale === 'ka' ? 'დასრულებული' : 'Completed'}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.pendingOrders}</p>
                <p className="text-sm text-gray-600">{locale === 'ka' ? 'მომლოდინე' : 'Pending'}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.cancelledOrders}</p>
                <p className="text-sm text-gray-600">{locale === 'ka' ? 'გაუქმებული' : 'Cancelled'}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                <p className="text-sm text-gray-600">{locale === 'ka' ? 'ჯამური' : 'Total'}</p>
              </motion.div>
            </div>

            {/* Order History Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'ka' ? 'შეკვეთების ისტორია' : 'Order History'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {locale === 'ka' 
                    ? 'ნახეთ თქვენი ყველა შეკვეთის დეტალური ინფორმაცია'
                    : 'View detailed information about all your orders'
                  }
                </p>
                <Link
                  href="/orders"
                  className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {locale === 'ka' ? 'შეკვეთების ნახვა' : 'View Orders'}
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'უახლესი აქტივობა' : 'Recent Activity'}
              </h3>
              
              <div className="space-y-4">
                {analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        activity.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : activity.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {locale === 'ka' ? 'აქტივობა არ არის' : 'No recent activity'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}