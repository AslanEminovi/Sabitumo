'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import { useCart } from '@/context/CartContext'
import { Plus, Minus, Trash2, Package, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { t, locale } = useTranslation()
  const { state, removeItem, updateQuantity, clearCart, isGlobalMinimumMet, getGlobalMinimumRemaining, getGlobalMinimum } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    // TODO: Implement checkout functionality
    setTimeout(() => {
      alert(locale === 'ka' ? 'ჩეკაუტი მალე ხელმისაწვდომი იქნება!' : 'Checkout coming soon!')
      setIsCheckingOut(false)
    }, 1000)
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency === 'GEL' ? '₾' : currency}`
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Tactical Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-3" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cartHex" x="0" y="0" width="100" height="87" patternUnits="userSpaceOnUse">
              <polygon points="50,3 85,25 85,69 50,91 15,69 15,25" 
                       fill="none" 
                       stroke="currentColor" 
                       strokeWidth="0.8" 
                       className="text-gray-300"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cartHex)"/>
        </svg>
        
        {/* Tactical Corner Elements */}
        <div className="absolute top-10 left-10 w-8 h-8 border border-gray-300/40 rotate-45"></div>
        <div className="absolute top-10 right-10 w-6 h-6 bg-gray-300/20 rotate-12"></div>
        <div className="absolute bottom-10 left-10 w-10 h-10 border border-gray-300/30 rotate-45"></div>
        <div className="absolute bottom-10 right-10 w-5 h-5 bg-gray-300/25 rotate-45"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-8">
            <Link href="/shop" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'ka' ? 'შოპინგის გაგრძელება' : 'Continue Shopping'}
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                {locale === 'ka' ? 'კალათა' : 'Shopping Cart'}
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              {state.totalItems > 0 
                ? locale === 'ka' 
                  ? `${state.totalItems} ნივთი თქვენს კალათაში` 
                  : `${state.totalItems} ${state.totalItems === 1 ? 'item' : 'items'} in your cart`
                : locale === 'ka' ? 'თქვენი კალათა ცარიელია' : 'Your cart is empty'
              }
            </p>
          </div>
        </motion.div>

        {state.items.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-16 max-w-lg mx-auto text-center" 
                 style={{ 
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                 }}>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {locale === 'ka' ? 'კალათა ცარიელია' : 'Your cart is empty'}
              </h2>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                {locale === 'ka' 
                  ? 'დაამატეთ პროდუქტები რომ დაიწყოთ შეკვეთის შექმნა' 
                  : 'Add products to start building your order'
                }
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="w-6 h-6 mr-3" />
                {locale === 'ka' ? 'პროდუქტების დათვალიერება' : 'Browse Products'}
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Cart Items List */}
            <div className="xl:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-200"
                style={{ 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                }}
              >
                <div className="p-8 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {locale === 'ka' ? 'კალათის ნივთები' : 'Cart Items'}
                    </h2>
                    {state.items.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 font-medium"
                      >
                        {locale === 'ka' ? 'კალათის გასუფთავება' : 'Clear Cart'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {state.items.map((item, index) => (
                    <motion.div
                      key={item.cartItemId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Product Image */}
                        <div className="md:col-span-2">
                          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={locale === 'ka' ? item.name_ka : item.name_en}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="md:col-span-5 text-center md:text-left">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {locale === 'ka' ? item.name_ka : item.name_en}
                          </h3>
                          {item.selectedSize && (
                            <div className="mb-3">
                              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                                {locale === 'ka' ? 'ზომა:' : 'Size:'} {item.selectedSize}
                              </span>
                            </div>
                          )}
                          <p className="text-2xl font-bold text-emerald-600 mb-2">
                            {formatPrice(item.price, item.currency)}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                            <p>{locale === 'ka' ? 'მარაგში:' : 'In stock:'} {item.stock}</p>
                            {item.min_order_quantity && item.min_order_quantity > 1 && (
                              <p className="text-emerald-600 font-medium">
                                {locale === 'ka' 
                                  ? `მინ. შეკვეთა: ${item.min_order_quantity}` 
                                  : `Min. order: ${item.min_order_quantity}`
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="md:col-span-3 flex items-center justify-center md:justify-center">
                          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="p-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= (item.min_order_quantity || 1)}
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            
                            <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-center font-semibold min-w-[3rem] shadow-sm">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="p-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Total Price and Remove */}
                        <div className="md:col-span-2 flex flex-col items-center md:items-end space-y-3">
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity, item.currency)}
                          </p>
                          
                          <button
                            onClick={() => removeItem(item.cartItemId)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 sticky top-8"
                style={{ 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  {locale === 'ka' ? 'შეკვეთის ჯამური' : 'Order Summary'}
                </h2>

                <div className="space-y-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        {locale === 'ka' ? 'ქვეჯამური:' : 'Subtotal:'}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(state.totalPrice, '₾')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        {locale === 'ka' ? 'მიწოდება:' : 'Shipping:'}
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {locale === 'ka' ? 'უფასო' : 'Free'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        {locale === 'ka' ? 'გადასახადი:' : 'Tax:'}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(0, '₾')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">
                        {locale === 'ka' ? 'სულ:' : 'Total:'}
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatPrice(state.totalPrice, '₾')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Minimum Order Validation */}
                {!isGlobalMinimumMet() && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-amber-800 mb-2">
                      <Package className="w-5 h-5" />
                      <span className="font-semibold">
                        {locale === 'ka' ? 'მინიმალური შეკვეთა' : 'Minimum Order'}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700">
                      {locale === 'ka' 
                        ? `მინიმალური შეკვეთის ღირებულება ${getGlobalMinimum()}₾-ია. დაამატეთ კიდევ ${getGlobalMinimumRemaining().toFixed(2)}₾-ის ღირებულების პროდუქტი.`
                        : `Minimum order value is ${getGlobalMinimum()}₾. Add ${getGlobalMinimumRemaining().toFixed(2)}₾ more to proceed.`
                      }
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !isGlobalMinimumMet()}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg ${
                    isCheckingOut || !isGlobalMinimumMet()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl'
                  } text-white`}
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>{locale === 'ka' ? 'დამუშავება...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      <span>{locale === 'ka' ? 'შეკვეთის გაფორმება' : 'Proceed to Checkout'}</span>
                    </>
                  )}
                </button>

                {/* Security Note */}
                <p className="text-sm text-gray-500 text-center mt-6 flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                  </span>
                  <span>
                    {locale === 'ka' 
                      ? 'უსაფრთხო და დაცული გადახდა' 
                      : 'Secure and protected payment'
                    }
                  </span>
                </p>

                {/* Continue Shopping */}
                <Link
                  href="/shop"
                  className="block w-full text-center text-emerald-600 py-3 mt-4 hover:text-emerald-700 transition-colors font-medium"
                >
                  {locale === 'ka' ? 'შოპინგის გაგრძელება' : 'Continue Shopping'}
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
