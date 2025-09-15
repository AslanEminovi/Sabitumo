'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Eye, Truck, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Real orders data - will be fetched from your database
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // Fetch real orders from your database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (
                name_en,
                name_ka,
                price,
                currency
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setOrders(data || [])
        setLoadingOrders(false)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setLoadingOrders(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: locale === 'ka' ? 'მიწოდებული' : 'Delivered'
        }
      case 'shipped':
        return {
          icon: Truck,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: locale === 'ka' ? 'გაგზავნილი' : 'Shipped'
        }
      case 'processing':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: locale === 'ka' ? 'მუშავდება' : 'Processing'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: locale === 'ka' ? 'გაუქმებული' : 'Cancelled'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: locale === 'ka' ? 'უცნობი' : 'Unknown'
        }
    }
  }

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'დეშბორდზე დაბრუნება' : 'Back to Dashboard'}
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'ka' ? 'შეკვეთები' : 'Orders'}
          </h1>
          <p className="text-gray-600">
            {locale === 'ka' 
              ? 'თქვენი შეკვეთების ისტორია და სტატუსი' 
              : 'Your order history and status'
            }
          </p>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {locale === 'ka' ? 'ჯერ არ გაქვთ შეკვეთები' : 'You don\'t have any orders yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {locale === 'ka' 
                  ? 'დაიწყეთ შეძენა და თქვენი პირველი შეკვეთა გამოჩნდება აქ' 
                  : 'Start shopping and your first order will appear here'
                }
              </p>
              <Link 
                href="/shop" 
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Package className="w-4 h-4 mr-2" />
                {locale === 'ka' ? 'მაღაზიაში წასვლა' : 'Go to Shop'}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                          <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {order.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString(
                                locale === 'ka' ? 'ka-GE' : 'en-US',
                                { year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            ₾{order.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        {locale === 'ka' ? 'პროდუქტები' : 'Products'}
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {locale === 'ka' ? item.nameKa : item.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {locale === 'ka' ? 'რაოდენობა' : 'Quantity'}: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-gray-900">
                              ₾{item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>
                              {locale === 'ka' ? 'მისამართი' : 'Address'}: {order.shippingAddress}
                            </span>
                          </div>
                          {order.trackingNumber && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Truck className="w-4 h-4" />
                              <span>
                                {locale === 'ka' ? 'საგზაო ნომერი' : 'Tracking'}: {order.trackingNumber}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <Eye className="w-4 h-4 mr-2" />
                            {locale === 'ka' ? 'დეტალები' : 'Details'}
                          </button>
                          {order.status === 'shipped' && (
                            <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                              <Truck className="w-4 h-4 mr-2" />
                              {locale === 'ka' ? 'საგზაო' : 'Track'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
