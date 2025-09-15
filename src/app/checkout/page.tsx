'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Package, Truck, Shield, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ShippingForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  notes: string
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
}

export default function CheckoutPage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const { state: cartState, clearCart } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Georgia',
    notes: ''
  })

  useEffect(() => {
    // Redirect if cart is empty
    if (cartState.items.length === 0) {
      router.push('/cart')
      return
    }

    // Get user data
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Get additional user details from database
        const { data: userDetails } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (userDetails) {
          setUser(userDetails)
          setShippingForm({
            firstName: userDetails.first_name || '',
            lastName: userDetails.last_name || '',
            email: userDetails.email || '',
            phone: userDetails.phone || '',
            address: userDetails.address || '',
            city: userDetails.city || '',
            postalCode: userDetails.postal_code || '',
            country: userDetails.country || 'Georgia',
            notes: ''
          })
        }
      }
    }

    getUser()
  }, [cartState.items.length, router])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setShippingForm({
      ...shippingForm,
      [e.target.name]: e.target.value
    })
  }


  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form
      if (!shippingForm.firstName || !shippingForm.lastName || !shippingForm.email || 
          !shippingForm.address || !shippingForm.city) {
        setError(locale === 'ka' ? 'გთხოვთ შეავსოთ ყველა საჭირო ველი' : 'Please fill in all required fields')
        setLoading(false)
        return
      }

      // Prepare order data
      const orderData = {
        items: cartState.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          selected_size: item.selectedSize
        })),
        shipping: {
          address: `${shippingForm.firstName} ${shippingForm.lastName}, ${shippingForm.address}`,
          city: shippingForm.city,
          postal_code: shippingForm.postalCode,
          country: shippingForm.country,
          notes: shippingForm.notes
        },
        user_id: user?.id
      }

      // Create order and payment intent
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Checkout failed')
      }

      // Initialize Stripe
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // For now, just redirect to success page since payment processing is not fully implemented
      // In a real implementation, you would integrate with Stripe Elements here
      console.log('Payment would be processed here with Stripe')

      // Clear cart and redirect to success page
      await clearCart()
      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/orders/${result.order_id}`)
      }, 2000)

    } catch (error: any) {
      console.error('Checkout error:', error)
      setError(error.message || (locale === 'ka' ? 'ზარალმოუღებელი შეცდომა' : 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cartState.totalPrice
  const shipping: number = 0 // Free shipping
  const total = subtotal + shipping

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'ka' ? 'შეკვეთა მიღებულია!' : 'Order Received!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {locale === 'ka' 
              ? 'თქვენი შეკვეთა წარმატებით განთავსდა. მალე მიიღებთ დადასტურების ელფოსტას.'
              : 'Your order has been placed successfully. You will receive a confirmation email shortly.'}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/cart" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'უკან კალათაში' : 'Back to Cart'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'ka' ? 'შეკვეთის დასრულება' : 'Checkout'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">
              {locale === 'ka' ? 'მიწოდების ინფორმაცია' : 'Shipping Information'}
            </h2>

            <form onSubmit={processPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ka' ? 'სახელი' : 'First Name'} *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={shippingForm.firstName}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ka' ? 'გვარი' : 'Last Name'} *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={shippingForm.lastName}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ka' ? 'ელ-ფოსტა' : 'Email'} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={shippingForm.email}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ka' ? 'ტელეფონი' : 'Phone'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingForm.phone}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ka' ? 'მისამართი' : 'Address'} *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={shippingForm.address}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ka' ? 'ქალაქი' : 'City'} *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingForm.city}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ka' ? 'საფოსტო კოდი' : 'Postal Code'}
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingForm.postalCode}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ka' ? 'ქვეყანა' : 'Country'}
                </label>
                <select
                  name="country"
                  value={shippingForm.country}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Georgia">{locale === 'ka' ? 'საქართველო' : 'Georgia'}</option>
                  <option value="Armenia">{locale === 'ka' ? 'სომხეთი' : 'Armenia'}</option>
                  <option value="Azerbaijan">{locale === 'ka' ? 'აზერბაიჯანი' : 'Azerbaijan'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ka' ? 'დამატებითი ინფორმაცია' : 'Order Notes'}
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={shippingForm.notes}
                  onChange={handleFormChange}
                  placeholder={locale === 'ka' ? 'შეკვეთის შესახებ დამატებითი ინფორმაცია...' : 'Additional information about your order...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>{locale === 'ka' ? 'შეკვეთის დადასტურება' : 'Complete Order'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6">
              {locale === 'ka' ? 'შეკვეთის შინაარსი' : 'Order Summary'}
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartState.items.map((item) => (
                <div key={item.cartItemId} className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name_en}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {locale === 'ka' && item.name_ka ? item.name_ka : item.name_en}
                    </h3>
                    {item.selectedSize && (
                      <p className="text-sm text-gray-500">
                        {locale === 'ka' ? 'ზომა:' : 'Size:'} {item.selectedSize}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {locale === 'ka' ? 'რაოდენობა:' : 'Qty:'} {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)} ₾</p>
                  </div>
                </div>
              ))}
            </div>


            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>{locale === 'ka' ? 'ნაწყვეტი:' : 'Subtotal:'}</span>
                <span>{subtotal.toFixed(2)} ₾</span>
              </div>
              
              <div className="flex justify-between">
                <span>{locale === 'ka' ? 'მიწოდება:' : 'Shipping:'}</span>
                <span>{shipping === 0 ? (locale === 'ka' ? 'უფასო' : 'Free') : `${shipping.toFixed(2)} ₾`}</span>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{locale === 'ka' ? 'სულ:' : 'Total:'}</span>
                  <span>{total.toFixed(2)} ₾</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>
                  {locale === 'ka' 
                    ? 'თქვენი გადახდა დაცულია Stripe-ის მიერ'
                    : 'Your payment is secured by Stripe'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
