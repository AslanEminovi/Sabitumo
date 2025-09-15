'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Package, CreditCard, User, Settings, ShoppingBag, Star, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full opacity-15 blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'მთავარი გვერდზე დაბრუნება' : 'Back to Home'}
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'ka' ? 'დეშბორდი' : 'Dashboard'}
          </h1>
                        <p className="text-gray-600">
                {locale === 'ka' 
                  ? t('dashboard', 'welcome') + ', ' + (user?.user_metadata?.first_name || user?.user_metadata?.given_name || user?.email?.split('@')[0] || 'User')
                  : t('dashboard', 'welcome') + ', ' + (user?.user_metadata?.first_name || user?.user_metadata?.given_name || user?.email?.split('@')[0] || 'User')
                }
              </p>
        </motion.div>

        {/* Quick Stats - Only show when user has real data */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'ანგარიშის ინფორმაცია' : 'Account Information'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ka' ? 'შეკვეთების რაოდენობა' : 'Total Orders'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {locale === 'ka' ? 'ჯერ არ არის' : 'None yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ka' ? 'რეგისტრაციის თარიღი' : 'Registration Date'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString(
                      locale === 'ka' ? 'ka-GE' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    ) : (locale === 'ka' ? 'უცნობი' : 'Unknown')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Link href="/shop" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-amber-300">
              <div className="p-3 bg-blue-100 rounded-lg w-fit group-hover:bg-blue-200 transition-colors">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                {t('navigation', 'shop')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('dashboard', 'browseProducts')}
              </p>
            </div>
          </Link>

          <Link href="/profile" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-amber-300">
              <div className="p-3 bg-green-100 rounded-lg w-fit group-hover:bg-green-200 transition-colors">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                {t('navigation', 'profile')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('dashboard', 'editProfile')}
              </p>
            </div>
          </Link>

          <Link href="/settings" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-amber-300">
              <div className="p-3 bg-purple-100 rounded-lg w-fit group-hover:bg-purple-200 transition-colors">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                {t('dashboard', 'accountSettings')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('dashboard', 'accountSettings')}
              </p>
            </div>
          </Link>

          <Link href="/orders" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-amber-300">
              <div className="p-3 bg-amber-100 rounded-lg w-fit group-hover:bg-amber-200 transition-colors">
                <CreditCard className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                {t('dashboard', 'orders')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('dashboard', 'orderHistory')}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('dashboard', 'recentOrders')}
          </h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {t('dashboard', 'noOrders')}
              </p>
              <Link 
                href="/shop" 
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t('dashboard', 'placeFirstOrder')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Order items would go here */}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
