'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import { supabase } from '@/lib/supabase'
import { ShoppingCart, Star, Eye, Heart, Package, Zap, TrendingUp, Clock, ArrowLeft, Sparkles } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CustomNativeSelect } from '@/components/CustomNativeSelect'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name_en: string
  name_ka: string
  description_en: string
  description_ka: string
  price: number
  currency: string
  images: string[]
  category_id: string
  subcategory: string
  stock: number
  created_at: string
  min_order_quantity?: number
  is_new_arrival: boolean
  is_bestseller: boolean
  sku?: string
  categories?: {
    id: string
    name_en: string
    name_ka: string
    slug: string
  }
  brands?: {
    id: string
    name: string
    slug: string
    logo?: string
  }
}

export default function NewItemsPage() {
  const { t, locale } = useTranslation()
  const { addItem } = useCart()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'name'>('newest')

  useEffect(() => {
    fetchNewItems()
  }, [sortBy])

  const fetchNewItems = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            id,
            name_en,
            name_ka,
            slug
          ),
          brands:brand_id (
            id,
            name,
            slug,
            logo
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20)

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name_en', { ascending: true })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching new items:', error)
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'ka' ? 'ka-GE' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading new items...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-96 h-96 bg-gradient-to-br from-emerald-100/40 to-teal-200/30 rounded-full opacity-60 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-100/30 to-indigo-200/20 rounded-full opacity-40 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-br from-purple-100/20 to-pink-200/15 rounded-full opacity-30 blur-xl"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-32 right-1/4 w-4 h-4 bg-emerald-400/20 rotate-45 animate-bounce"></div>
        <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-blue-400/15 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-green-400/20 rotate-12"></div>
      </div>


      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 rounded-2xl p-6 border border-emerald-200/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {locale === 'ka' ? 'ახალი კოლექცია' : 'New Collection'}
                </h2>
                <p className="text-gray-600 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-emerald-500" />
                  {locale === 'ka' 
                    ? `${products.length} ახალი პროდუქტი ხელმისაწვდომია` 
                    : `${products.length} new products available`
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-emerald-600">{products.filter(p => p.stock > 0).length}</div>
                <div className="text-gray-600 text-sm">{locale === 'ka' ? 'მარაგშია' : 'In Stock'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {locale === 'ka' ? 'სორტირება:' : 'Sort by:'}
              </span>
              <div className="w-48">
                <CustomNativeSelect
                  options={[
                    { value: 'newest', label: locale === 'ka' ? 'უახლესი' : 'Newest First' },
                    { value: 'price_low', label: locale === 'ka' ? 'ფასი: დაბალი' : 'Price: Low to High' },
                    { value: 'price_high', label: locale === 'ka' ? 'ფასი: მაღალი' : 'Price: High to Low' },
                    { value: 'name', label: locale === 'ka' ? 'სახელი' : 'Name A-Z' }
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(value as any)}
                  placeholder={locale === 'ka' ? 'აირჩიეთ სორტირება' : 'Choose sorting'}
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <strong>{products.length}</strong> {locale === 'ka' ? 'ახალი პროდუქტი' : 'new items'}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {products.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Package className="mx-auto h-20 w-20 text-gray-300 mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {locale === 'ka' ? 'ახალი პროდუქტები ვერ მოიძებნა' : 'No new items yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {locale === 'ka' 
                  ? 'ახალი პროდუქტები მალე დაემატება. გთხოვთ, შეამოწმოთ მოგვიანებით' 
                  : 'New products will be added soon. Please check back later for the latest arrivals'
                }
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/shop"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {locale === 'ka' ? 'ყველა პროდუქტის ნახვა' : 'Browse All Products'}
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                    whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
                    className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 overflow-hidden hover:shadow-3xl hover:bg-white transition-all duration-500 hover:border-emerald-200/50 flex flex-col h-full"
                    style={{ 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                    }}
                  >
                    {/* Enhanced Product Image */}
                    <div 
                      className="relative h-48 sm:h-56 overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/products/${product.sku || product.id}`)}
                    >
                      <div className="absolute inset-0 bg-white"></div>
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={locale === 'ka' ? product.name_ka : product.name_en}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">No Image</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay Elements */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
                        </motion.button>
                      </div>
                      
                      {/* Dynamic Badges */}
                      {(product.is_new_arrival || product.is_bestseller) && (
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {/* NEW Badge - Priority 1 */}
                          {product.is_new_arrival && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-flex items-center px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium rounded-full shadow-lg"
                            >
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              {locale === 'ka' ? 'ახალი' : 'NEW'}
                            </motion.span>
                          )}
                          
                          {/* BESTSELLER Badge - Priority 2 */}
                          {product.is_bestseller && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-medium rounded-full shadow-lg"
                            >
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {locale === 'ka' ? 'ბესტსელერი' : 'BESTSELLER'}
                            </motion.span>
                          )}
                        </div>
                      )}
                      
                      {/* Stock Badge */}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full shadow-lg">
                            ⚠️ {locale === 'ka' ? 'მცირე' : 'Low'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Product Info */}
                    <div 
                      className="p-3 sm:p-4 cursor-pointer flex flex-col flex-1"
                      onClick={() => router.push(`/products/${product.sku || product.id}`)}
                    >
                      {/* Card Content - this grows to fill available space */}
                      <div className="flex-1">
                        {/* Category Badge */}
                        {product.categories && (
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              {locale === 'ka' ? product.categories.name_ka : product.categories.name_en}
                            </span>
                          </div>
                        )}

                        {/* Product Name */}
                        <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight group-hover:text-emerald-600 transition-colors">
                          {locale === 'ka' ? product.name_ka : product.name_en}
                        </h3>

                        {/* SKU */}
                        {product.sku && (
                          <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                        )}

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {(locale === 'ka' ? product.description_ka : product.description_en).slice(0, 150)}...
                        </p>

                        {/* Enhanced Stock and Info Display */}
                        <div className="space-y-3 mb-4">
                          {/* Stock Level with Visual Indicator */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                product.stock > 20 ? 'bg-green-500' : 
                                product.stock > 5 ? 'bg-yellow-500' : 
                                product.stock > 0 ? 'bg-red-500' : 'bg-gray-400'
                              }`}></div>
                              <span className={`text-xs font-medium ${
                                product.stock > 20 ? 'text-green-600' : 
                                product.stock > 5 ? 'text-yellow-600' : 
                                product.stock > 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {product.stock > 20 ? (locale === 'ka' ? 'მარაგში' : 'In Stock') :
                                 product.stock > 5 ? `${product.stock} ${locale === 'ka' ? 'ცალი' : 'left'}` :
                                 product.stock > 0 ? `${locale === 'ka' ? 'მხოლოდ' : 'Only'} ${product.stock} ${locale === 'ka' ? 'ცალი!' : 'left!'}` :
                                 (locale === 'ka' ? 'გაყიდულია' : 'Sold Out')}
                              </span>
                            </div>
                            
                            {/* Min Order Badge */}
                            {product.min_order_quantity && product.min_order_quantity > 1 && (
                              <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                Min: {product.min_order_quantity}
                              </span>
                            )}
                          </div>
                          
                          {/* Stock Bar */}
                          {product.stock > 0 && product.stock <= 20 && (
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full transition-all duration-300 ${
                                  product.stock > 10 ? 'bg-green-500' : 
                                  product.stock > 5 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }}
                              ></div>
                            </div>
                          )}

                          {/* Added Date */}
                          <div className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {locale === 'ka' ? 'დამატებულია:' : 'Added:'} {formatDate(product.created_at)}
                          </div>
                        </div>

                        {/* Price and Brand Section */}
                        <div className="flex items-center justify-between mb-6">
                          {/* Compact Price Container */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-baseline space-x-1 bg-emerald-50 px-3 py-2 rounded-lg">
                              <span className="text-xl font-bold text-gray-900">
                                {product.price}
                              </span>
                              <span className="text-sm font-medium text-gray-600">
                                {product.currency === 'GEL' ? '₾' : product.currency}
                              </span>
                            </div>
                            
                            {/* Brand Logo */}
                            {product.brands?.logo && (
                              <div className="w-16 h-10 relative">
                                <Image
                                  src={(() => {
                                    const brandLogos: { [key: string]: string } = {
                                      'LOWA': '/lowa-boots-logo.png',
                                      'Gerber': '/Gerber_Gear_logo.png.webp',
                                      'Spyderco': '/Spyderco-Logo.png',
                                      '5.11 Tactical': '/511_tactical_logo.jpg-removebg-preview-2.png',
                                      'Haix': '/haix-logo.png',
                                      'Maxpedition': '/maxpedition.png',
                                      'Cold Steel': '/cold-steel-logo-01_1607027612__33201.original.png',
                                      'Browning': '/browning-logo-logo-png-transparent.png',
                                      'Microtech': '/MT-Logo-Simple-Red-1200x628.png.webp'
                                    };
                                    return brandLogos[product.brands.name] || product.brands.logo || '';
                                  })()}
                                  alt={product.brands.name}
                                  fill
                                  className="object-contain opacity-80"
                                  sizes="64px"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Add to Cart Button - always at bottom */}
                      <button
                        disabled={product.stock <= 0}
                        onClick={() => {
                          if (product.stock > 0) {
                            addItem({
                              id: product.id,
                              name_en: product.name_en,
                              name_ka: product.name_ka,
                              price: product.price,
                              currency: product.currency,
                              image: product.images?.[0],
                              stock: product.stock,
                              min_order_quantity: product.min_order_quantity || 1,
                              selectedSize: '' // No size selected from new-items page - goes to product page for size selection
                            })
                          }
                        }}
                        className={`w-full py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 font-semibold text-sm transform ${
                          product.stock > 0
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>
                          {product.stock > 0
                            ? (locale === 'ka' ? 'კალათაში დამატება' : 'Add to Cart')
                            : (locale === 'ka' ? 'გაყიდულია' : 'Out of Stock')
                          }
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

