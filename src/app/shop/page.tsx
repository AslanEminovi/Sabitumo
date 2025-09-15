'use client'

import { useState, useEffect, Suspense } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Search, Filter, Grid, List, ShoppingCart, Package, ChevronLeft, ChevronRight, Heart, Eye, Zap, TrendingUp, Award, Shield, Sparkles, Clock, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { CategorySidebar } from '@/components/CategorySidebar'
import { CustomNativeSelect } from '@/components/CustomNativeSelect'
import Image from 'next/image'

interface Product {
  id: string
  name_en: string
  name_ka: string
  description_en: string
  description_ka: string
  price: number
  currency: string
  category_id: string
  subcategory: string
  images: string[]
  stock: number
  is_active: boolean
  created_at: string
  min_order_quantity?: number
  is_new_arrival: boolean
  is_bestseller: boolean
  sku?: string
  slug_en?: string
  slug_ka?: string
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

interface Category {
  id: string
  name_en: string
  name_ka: string
  slug: string
}

function ShopPageContent() {
  const { t, locale } = useTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({})

  useEffect(() => {
    // Get search query from URL
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
    
    fetchProducts()
    fetchCategories()
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
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
        .limit(50) // Add pagination limit for better performance

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      
      console.log('Fetched products:', data?.length || 0)
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name_en')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' ||
      product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_ka.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description_ka.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return (locale === 'ka' ? a.name_ka : a.name_en).localeCompare(locale === 'ka' ? b.name_ka : b.name_en)
      case 'stock':
        return b.stock - a.stock
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProductClick = (product: Product) => {
    // Use SKU as the primary identifier, fallback to slug, then ID
    const identifier = product.sku || 
                      (locale === 'ka' ? product.slug_ka : product.slug_en) || 
                      product.id
    router.push(`/products/${identifier}`)
  }

  const nextImage = (productId: string, images: string[]) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % images.length
    }))
  }

  const prevImage = (productId: string, images: string[]) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + images.length) % images.length
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
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

      <div className="relative z-10 flex min-h-screen">
        {/* Enhanced Category Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden lg:block w-72 flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
        >
          <CategorySidebar
            categories={categories}
            selectedCategoryId={selectedCategory === 'all' ? '' : selectedCategory}
            onCategorySelect={(categoryId) => setSelectedCategory(categoryId || 'all')}
            locale={locale}
            className="h-full"
          />
        </motion.div>

        {/* Main Content with enhanced styling */}
        <div className="flex-1 min-w-0 px-6 sm:px-8 lg:px-10 py-8">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 rounded-2xl p-6 border border-emerald-200/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {locale === 'ka' ? 'პროდუქტების კატალოგი' : 'Product Catalog'}
                </h2>
                <p className="text-gray-600 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-emerald-500" />
                  {locale === 'ka' 
                    ? `${sortedProducts.length} პროდუქტი ხელმისაწვდომია` 
                    : `${sortedProducts.length} products available`
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Enhanced Search */}
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder={locale === 'ka' ? 'მოძებნეთ პროდუქტები...' : 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex gap-4 items-center">
              {/* Sort */}
              <div className="w-56">
                <CustomNativeSelect
                  options={[
                    { value: 'newest', label: locale === 'ka' ? 'უახლესი' : 'Newest' },
                    { value: 'price-low', label: locale === 'ka' ? 'ფასი: დაბალი' : 'Price: Low to High' },
                    { value: 'price-high', label: locale === 'ka' ? 'ფასი: მაღალი' : 'Price: High to Low' },
                    { value: 'name', label: locale === 'ka' ? 'სახელი' : 'Name' },
                    { value: 'stock', label: locale === 'ka' ? 'მარაგი' : 'Stock' }
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(value)}
                  placeholder={locale === 'ka' ? 'სორტირება' : 'Sort by'}
                />
              </div>

              {/* Enhanced View Mode */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-200 touch-manipulation ${
                    viewMode === 'grid' 
                      ? 'bg-amber-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-200 touch-manipulation ${
                    viewMode === 'list' 
                      ? 'bg-amber-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {currentProducts.length === 0 ? (
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
                {locale === 'ka' ? 'პროდუქტები ვერ მოიძებნა' : 'No products found'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {locale === 'ka' 
                  ? 'სცადეთ სხვა ძიების ტერმინები ან შეცვალეთ ფილტრები რეზულტატებისთვის' 
                  : 'Try adjusting your search terms or filters to discover our amazing products'
                }
              </p>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  {locale === 'ka' ? 'ძიების გასუფთავება' : 'Clear Search'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory('all')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  {locale === 'ka' ? 'ყველა კატეგორია' : 'All Categories'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'
              : 'space-y-6'
            }>
              <AnimatePresence mode="popLayout">
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className={`group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                      viewMode === 'list' ? 'flex' : 'flex flex-col h-full'
                    }`}
                  >
                    {/* Enhanced Product Image with Navigation */}
                    <div 
                      className={`relative overflow-hidden cursor-pointer ${viewMode === 'list' ? 'w-64 h-48' : 'h-40 sm:h-48 md:h-56'}`}
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="absolute inset-0 bg-white"></div>
                      {product.images && product.images.length > 0 ? (
                        <>
                          <Image
                            src={product.images[currentImageIndex[product.id] || 0]}
                            alt={locale === 'ka' ? product.name_ka : product.name_en}
                            fill
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          
                          {/* Image Navigation - Only show if multiple images */}
                          {product.images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  prevImage(product.id, product.images)
                                }}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg z-10"
                              >
                                <ChevronLeft className="w-4 h-4 text-gray-700" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  nextImage(product.id, product.images)
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg z-10"
                              >
                                <ChevronRight className="w-4 h-4 text-gray-700" />
                              </button>
                              
                              {/* Image Dots Indicator - Clickable */}
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {product.images.map((_, imgIndex) => (
                                  <button
                                    key={imgIndex}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setCurrentImageIndex(prev => ({
                                        ...prev,
                                        [product.id]: imgIndex
                                      }))
                                    }}
                                    className={`w-2 h-2 rounded-full transition-colors hover:scale-125 ${
                                      (currentImageIndex[product.id] || 0) === imgIndex 
                                        ? 'bg-white' 
                                        : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Overlay Elements */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProductClick(product)
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
                        </motion.button>
                      </div>
                      
                      {/* Enhanced Badges */}
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
                      
                      {/* Low Stock Badge */}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="absolute bottom-3 right-3">
                          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full shadow-lg">
                            ⚠️ {locale === 'ka' ? 'მცირე' : 'Low'}
                          </span>
                        </div>
                      )}
                      
                      {/* Out of Stock Overlay */}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center">
                            <Package className="w-8 h-8 text-white mx-auto mb-2 opacity-60" />
                            <span className="text-white font-semibold text-sm">
                              {locale === 'ka' ? 'გაყიდულია' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Images */}
                    {product.images && product.images.length > 1 && (
                      <div className="px-4 py-2">
                        <div className="flex justify-center space-x-2">
                          {product.images.slice(0, 4).map((image, imgIndex) => (
                            <button
                              key={imgIndex}
                              onClick={(e) => {
                                e.stopPropagation()
                                setCurrentImageIndex(prev => ({
                                  ...prev,
                                  [product.id]: imgIndex
                                }))
                              }}
                              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                (currentImageIndex[product.id] || 0) === imgIndex
                                  ? 'border-emerald-500 scale-105'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Image
                                src={image}
                                alt={`${locale === 'ka' ? product.name_ka : product.name_en} ${imgIndex + 1}`}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain bg-white"
                              />
                            </button>
                          ))}
                          {product.images.length > 4 && (
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium">
                              +{product.images.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Product Info */}
                    <div 
                      className={`${viewMode === 'list' ? 'p-6 flex-1' : 'p-3 sm:p-4 flex flex-col flex-1'} cursor-pointer`}
                      onClick={() => handleProductClick(product)}
                    >
                      {viewMode === 'list' ? (
                        // List view layout (existing)
                        <>
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

                          {/* Stock and Min Order Info */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Package className="w-3 h-3 mr-1" />
                                <span>{product.stock} {locale === 'ka' ? 'ცალი' : 'in stock'}</span>
                              </div>
                              {product.min_order_quantity && product.min_order_quantity > 1 && (
                                <div className="flex items-center">
                                  <span className="text-emerald-600 font-medium">
                                    Min: {product.min_order_quantity}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price and Brand Section */}
                          <div className="flex items-center justify-between mb-6">
                            {/* Compact Price and Brand Container */}
                            <div className="flex items-center space-x-3">
                              {/* Price Container */}
                              <div className="flex items-baseline space-x-1 bg-emerald-50 px-3 py-2 rounded-md">
                                <span className="text-2xl font-bold text-gray-900">
                                  {product.price}
                                </span>
                                <span className="text-lg font-medium text-gray-600">
                                  {product.currency === 'GEL' ? '₾' : product.currency}
                                </span>
                              </div>
                              
                              {/* Brand Logo */}
                              {product.brands?.logo && (
                                <div className="w-20 h-12 relative flex-shrink-0">
                                  <Image
                                    src={product.brands.logo}
                                    alt={product.brands.name}
                                    fill
                                    className="object-contain opacity-80"
                                    sizes="80px"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        // Grid view layout with flex
                        <>
                          {/* Content that grows */}
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

                            {/* Stock and Min Order Info */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Package className="w-3 h-3 mr-1" />
                                  <span>{product.stock} {locale === 'ka' ? 'ცალი' : 'in stock'}</span>
                                </div>
                                {product.min_order_quantity && product.min_order_quantity > 1 && (
                                  <div className="flex items-center">
                                    <span className="text-emerald-600 font-medium">
                                      Min: {product.min_order_quantity}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price and Brand Section */}
                            <div className="flex items-center justify-between mb-6">
                              {/* Compact Price and Brand Container */}
                              <div className="flex items-center space-x-3">
                                {/* Price Container */}
                                <div className="flex items-baseline space-x-1 bg-emerald-50 px-2 py-1 rounded-md">
                                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                                    {product.price}
                                  </span>
                                  <span className="text-sm font-medium text-gray-600">
                                    {product.currency === 'GEL' ? '₾' : product.currency}
                                  </span>
                                </div>
                                
                                {/* Brand Logo */}
                                {product.brands?.logo && (
                                  <div className="w-20 h-12 relative flex-shrink-0">
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
                          </div>
                        </>
                      )}

                      {/* Enhanced Add to Cart Button - always at bottom in grid view */}
                      <button
                        disabled={product.stock <= 0}
                        onClick={(e) => {
                          e.stopPropagation()
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
                              selectedSize: '' // No size selected from shop page - goes to product page for size selection
                            })
                          }
                        }}
                        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 sm:space-x-3 font-semibold text-sm touch-manipulation transform ${
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

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center space-x-2 mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-4 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-3 min-w-[48px] rounded-xl font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm'
                      }`}
                    >
                      {page}
                    </motion.button>
                  );
                })}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-4 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
    </div>}>
      <ShopPageContent />
    </Suspense>
  )
}