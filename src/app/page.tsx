'use client'

import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShoppingCart, Star, Package, Truck, Zap, MapPin, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'

interface Product {
  id: string
  name_en: string
  name_ka: string
  description_en: string
  description_ka: string
  price: number
  currency: string
  stock: number
  min_order_quantity: number
  images: string[]
  is_featured: boolean
  is_new_arrival: boolean
  is_bestseller: boolean
  sku?: string
  categories?: {
    name_en: string
    name_ka: string
  }
  brands?: {
    name: string
    logo?: string
  }
}

export default function HomePage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const { addItem } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoadingProducts(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            name_en,
            name_ka
          ),
          brands:brand_id (
            name,
            logo
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(5)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setFeaturedProducts([]) // Set empty array on error instead of throwing
        return
      }
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error fetching featured products:', error)
      setFeaturedProducts([]) // Ensure we always set something
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/shop')
    }
  }

  const handleAddToCart = (product: Product) => {
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
        selectedSize: '' // No size selected from main page - goes to product page for size selection
      })
    }
  }

  // Smooth animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }


  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 md:py-20 overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-3xl rounded-b-3xl">
        {/* Tactical Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white"></div>
          
          {/* Tactical Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tacticalHex" x="0" y="0" width="80" height="69" patternUnits="userSpaceOnUse">
                <polygon points="40,4 68,22 68,58 40,76 12,58 12,22" 
                         fill="none" 
                         stroke="currentColor" 
                         strokeWidth="1" 
                         className="text-slate-600"/>
              </pattern>
              <pattern id="tacticalGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="0.5" 
                      className="text-slate-400" 
                      opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tacticalHex)"/>
            <rect width="100%" height="100%" fill="url(#tacticalGrid)"/>
          </svg>
          
          {/* Tactical Floating Elements */}
          <div className="absolute top-20 left-10 w-8 h-8 border-2 border-slate-400/20 rotate-45 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-slate-500/10 clip-path-diamond"></div>
          <div className="absolute bottom-32 left-20 w-10 h-10 border border-slate-400/15 rotate-12 rounded-sm"></div>
          <div className="absolute bottom-20 right-10 w-4 h-4 bg-slate-600/20 rotate-45 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-5 h-5 border border-slate-500/10 rotate-45"></div>
          <div className="absolute top-1/3 right-1/3 w-7 h-7 border border-slate-400/15 rotate-12 rounded-sm"></div>
        </div>
        {/* Banner Background Image */}
        <div className="absolute inset-0 z-10">
          <Image
            src="/banner.jpg"
            alt="Premium Knives, Tactical Gear & Many more"
            fill
            priority
            quality={90}
            className="object-cover rounded-lg"
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center' // Center for mobile
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            onError={(e) => {
              console.log('Image failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log('Image loaded successfully')}
          />
          <div className="absolute inset-0 bg-black/40 sm:bg-black/30 md:bg-black/20 z-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-30">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4 sm:space-y-6"
          >
                <motion.h1 
                  className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 text-white select-text drop-shadow-lg hero-text-white px-2"
                  style={{ 
                    color: 'white !important',
                    WebkitTextFillColor: 'white !important'
                  }}
                  variants={fadeInUp}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {locale === 'ka' ? 'პრემიუმი დანები, ტაქტიკური აღჭურვილობა და მრავალი სხვა' : 'Premium Knives, Tactical Gear & Many more'}
                </motion.h1>
                <motion.p 
                  className="text-base sm:text-lg md:text-xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto select-text drop-shadow-lg px-2"
                  style={{ color: 'white !important' }}
                  variants={fadeInUp}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {locale === 'ka' 
                    ? 'ყველაზე იაფი ფასები თქვენი მაღაზიისთვის' 
                    : 'Cheapest wholesale prices for your shop - we supply all types of stores'
                  }
                </motion.p>
                
                            {/* Search Container */}
            <motion.div 
              className="mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'ka' ? 'მოძებნეთ პროდუქტები...' : 'Search products...'}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-white/30 bg-white/90 backdrop-blur-sm rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 shadow-lg hover:shadow-xl"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-lg"
                >
                  {locale === 'ka' ? 'ძიება' : 'Search'}
                </button>
              </form>
            </motion.div>
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  variants={fadeInUp}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href="/shop" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-200 inline-flex items-center justify-center min-w-[140px] h-[52px] select-none shadow-lg hover:shadow-xl">
                      {t('navigation', 'shop')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href="/categories" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-200 inline-flex items-center justify-center min-w-[140px] h-[52px] select-none shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/10">
                      {t('navigation', 'categories')}
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
        </div>
        </section>


        {/* Featured Products Section */}
        <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
          {/* Tactical Background Pattern for Featured Section */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full opacity-3" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="featuredHex" x="0" y="0" width="120" height="104" patternUnits="userSpaceOnUse">
                  <polygon points="60,6 102,32 102,84 60,110 18,84 18,32" 
                           fill="none" 
                           stroke="currentColor" 
                           strokeWidth="1" 
                           className="text-emerald-500"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#featuredHex)"/>
            </svg>
            
            {/* Tactical Accent Elements */}
            <div className="absolute top-10 right-10 w-12 h-12 border border-emerald-200/30 rotate-45"></div>
            <div className="absolute bottom-10 left-10 w-8 h-8 bg-emerald-100/50 rotate-12 rounded-sm"></div>
            <div className="absolute top-1/2 right-1/4 w-6 h-6 border border-teal-200/40 rotate-45"></div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-blue-200/10 to-indigo-300/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">

            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                    whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.15 } }}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/60 overflow-hidden hover:shadow-xl sm:hover:shadow-3xl hover:bg-white transition-all duration-200 hover:border-emerald-200/50 flex flex-col h-full"
                    style={{ 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                    }}
                  >
                    {/* Enhanced Product Image with Navigation */}
                    <div 
                      className="relative h-40 sm:h-48 overflow-hidden cursor-pointer"
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
                      
                      {/* Dynamic Badges */}
                      {(product.is_new_arrival || product.is_bestseller) && (
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {/* NEW Badge - Priority 1 */}
                          {product.is_new_arrival && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium rounded-full shadow-lg">
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              {locale === 'ka' ? 'ახალი' : 'NEW'}
                            </span>
                          )}
                          
                          {/* BESTSELLER Badge - Priority 2 (shows at top if NEW not present) */}
                          {product.is_bestseller && (
                            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-medium rounded-full shadow-lg">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {locale === 'ka' ? 'ბესტსელერი' : 'BESTSELLER'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stock Badge */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full shadow-lg">
                            {locale === 'ka' ? 'მცირე მარაგი' : 'Low Stock'}
                          </span>
                        </div>
                      )}

                      {/* Out of Stock Overlay */}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center">
                            <ShoppingCart className="w-8 h-8 text-white mx-auto mb-2 opacity-60" />
                            <span className="text-white font-semibold text-sm">
                              {locale === 'ka' ? 'გაყიდულია' : 'Out of Stock'}
                            </span>
                          </div>
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
                        <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base leading-tight group-hover:text-emerald-600 transition-colors">
                          {locale === 'ka' ? product.name_ka : product.name_en}
                        </h3>

                        {/* Enhanced Stock and Info Display */}
                        <div className="space-y-2 mb-3">
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
                        </div>

                        {/* Price and Brand Section */}
                        <div className="flex items-center justify-between mb-3">
                          {/* Price Container - Left Side */}
                          <div className="flex items-baseline space-x-1 bg-emerald-50 px-2 py-1 rounded-md">
                            <span className="text-sm sm:text-base font-bold text-gray-900">
                              {product.price}
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                              {product.currency === 'GEL' ? '₾' : product.currency}
                            </span>
                          </div>
                          
                          {/* Brand Logo - Right Side */}
                          {product.brands?.logo && (
                            <div className="w-16 h-10 relative flex-shrink-0">
                              <Image
                                src={product.brands.logo}
                                alt={product.brands.name}
                                fill
                                className="object-contain opacity-80"
                                sizes="64px"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Add to Cart Button - always at bottom */}
                      <button
                        disabled={product.stock <= 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(product)
                        }}
                        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 font-semibold text-sm touch-manipulation transform ${
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
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {locale === 'ka' ? 'რჩეული პროდუქტები არ არის' : 'No Featured Products'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {locale === 'ka' 
                    ? 'ამჟამად რჩეული პროდუქტები არ არის დამატებული'
                    : 'No featured products have been added yet'
                  }
                </p>
                <Link 
                  href="/shop"
                  className="inline-flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  {locale === 'ka' ? 'ყველა პროდუქტის ნახვა' : 'View All Products'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}

            {/* View All Products Button */}
            {featuredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mt-12"
              >
                <Link 
                  href="/shop"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  {locale === 'ka' ? 'ყველა პროდუქტის ნახვა' : 'View All Products'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* Trusted Brands Section */}
        <section className="py-16 bg-gray-50 relative overflow-hidden">
          {/* Tactical Background Pattern for Brands */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full opacity-4" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="brandsGrid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="0.5" 
                        className="text-gray-400"/>
                  <circle cx="50" cy="50" r="2" fill="currentColor" className="text-gray-300" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#brandsGrid)"/>
            </svg>
            
            {/* Tactical Corner Elements */}
            <div className="absolute top-8 left-8 w-10 h-10 border-2 border-gray-300/40 rotate-45"></div>
            <div className="absolute top-8 right-8 w-10 h-10 border-2 border-gray-300/40 rotate-45"></div>
            <div className="absolute bottom-8 left-8 w-6 h-6 bg-gray-300/30 rotate-45"></div>
            <div className="absolute bottom-8 right-8 w-6 h-6 bg-gray-300/30 rotate-45"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {locale === 'ka' ? 'საუკეთესო ბრენდები' : 'Top Quality Brands'}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {locale === 'ka' 
                  ? 'ჩვენ ვთავაზობთ მხოლოდ სანდო მწარმოებლების პროდუქტებს'
                  : 'We carry only products from trusted manufacturers worldwide'
                }
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center"
            >
              {[
                { name: 'LOWA', logo: '/lowa-boots-logo.png', alt: 'LOWA Boots' },
                { name: 'Gerber', logo: '/Gerber_Gear_logo.png.webp', alt: 'Gerber Gear' },
                { name: 'Spyderco', logo: '/Spyderco-Logo.png', alt: 'Spyderco Knives' },
                { name: '5.11 Tactical', logo: '/511_tactical_logo.jpg-removebg-preview-2.png', alt: '5.11 Tactical' },
                { name: 'Haix', logo: '/haix-logo.png', alt: 'Haix Boots' },
                { name: 'Maxpedition', logo: '/maxpedition.png', alt: 'Maxpedition' },
                { name: 'Cold Steel', logo: '/cold-steel-logo-01_1607027612__33201.original.png', alt: 'Cold Steel' }
              ].map((brand, index) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  whileHover={{ scale: 1.03, y: -2, transition: { duration: 0.15 } }}
                  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-150 border border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                  style={{ 
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                  }}
                >
                  <div className="relative h-16 w-full flex items-center justify-center">
                    <Image
                      src={brand.logo}
                      alt={brand.alt}
                      fill
                      className="object-contain transition-opacity duration-150 group-hover:opacity-100"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 14vw"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            >
              {[
                {
                  icon: Truck,
                  title: locale === 'ka' ? 'უფასო მიწოდება' : 'Free Shipping',
                  subtitle: locale === 'ka' ? '1000₾+ შეკვეთებზე' : 'On orders 1000₾+'
                },
                {
                  icon: Zap,
                  title: locale === 'ka' ? 'სწრაფი დამუშავება' : 'Fast Processing',
                  subtitle: locale === 'ka' ? 'დაუყოვნებლივ' : 'Instant order processing'
                },
                {
                  icon: MapPin,
                  title: locale === 'ka' ? 'ადგილზე აღება' : 'Pickup Available',
                  subtitle: locale === 'ka' ? 'ჩვენს მისამართზე' : 'From our location'
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.subtitle}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-800 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              {locale === 'ka' ? 'მზად ხართ დასაწყებად?' : 'Ready to Get Started?'}
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              {locale === 'ka' 
                ? 'შეუერთდით ათასობით კმაყოფილ მომხმარებელს, რომლებიც ენდობენ Sabitumo-ს თავიანთი აღჭურვილობის საჭიროებებისთვის' 
                : 'Join thousands of satisfied customers who trust Sabitumo for their equipment needs'
              }
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/shop" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                  {t('navigation', 'shop')}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-slate-800 font-semibold text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                  {t('navigation', 'contact')} {locale === 'ka' ? 'ჩვენ' : 'Us'}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        </section>
    </div>
  )
}
