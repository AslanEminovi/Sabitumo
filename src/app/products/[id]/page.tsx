'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Package, 
  Shield, 
  Truck, 
  RefreshCw,
  Check,
  AlertCircle,
  Minus,
  Plus,
  Sparkles,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react'

interface Product {
  id: string
  name_en: string
  name_ka: string
  description_en: string
  description_ka: string
  price: number
  currency: string
  category_id: string
  subcategory: string | null
  stock: number
  is_active: boolean
  brand_id: string | null
  tags: string[]
  sku: string | null
  weight: number | null
  dimensions: string | null
  material: string | null
  color: string | null
  min_order_quantity: number
  images: string[]
  created_at: string
  sizes?: { size: string; available: boolean; stock: number }[]
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

export default function ProductDetailPage() {
  const { locale } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('')

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // Update quantity when product loads to respect minimum order quantity
  useEffect(() => {
    if (product?.min_order_quantity && product.min_order_quantity > 1) {
      setQuantity(product.min_order_quantity)
    }
  }, [product?.min_order_quantity])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      
      const baseQuery = supabase
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
      
      // Check if productId looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId)
      
      let data = null
      let error = null
      
      if (isUUID) {
        // Lookup by UUID (for backward compatibility)
        const result = await baseQuery.eq('id', productId).single()
        data = result.data
        error = result.error
      } else {
        console.log('Looking for product with identifier:', productId)
        
        // Try to find by SKU first
        let result = await baseQuery.eq('sku', productId).maybeSingle()
        console.log('SKU search result:', result)
        
        if (!result.data && !result.error) {
          // If not found by SKU, try by English slug
          result = await baseQuery.eq('slug_en', productId).maybeSingle()
          console.log('English slug search result:', result)
        }
        
        if (!result.data && !result.error) {
          // If not found by English slug, try by Georgian slug
          result = await baseQuery.eq('slug_ka', productId).maybeSingle()
          console.log('Georgian slug search result:', result)
        }
        
        data = result.data
        error = result.error
        
        // If still not found, create a "not found" error
        if (!data && !error) {
          console.log('Product not found in any field')
          error = { message: 'Product not found' }
        }
      }

      if (error) throw error
      if (!data) throw new Error('Product not found')
      
      console.log('Fetched product data:', data)
      console.log('Brand data:', data.brands)
      
      setProduct(data)
      setQuantity(data.min_order_quantity || 1)
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Product not found')
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return

    // Check if sizes are available and size is required but not selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert(locale === 'ka' ? 'გთხოვთ აირჩიოთ ზომა' : 'Please select a size')
      return
    }

    addItem({
      id: product.id,
      name_en: product.name_en,
      name_ka: product.name_ka,
      price: product.price,
      currency: product.currency,
      image: product.images?.[0],
      stock: product.stock,
      min_order_quantity: product.min_order_quantity,
      quantity: quantity,
      selectedSize: selectedSize
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    const minQty = product?.min_order_quantity || 1
    const maxQty = product?.stock || 0

    if (newQuantity >= minQty && newQuantity <= maxQty) {
      setQuantity(newQuantity)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {locale === 'ka' ? 'პროდუქტის ჩატვირთვა...' : 'Loading product...'}
          </p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'ka' ? 'პროდუქტი ვერ მოიძებნა' : 'Product Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {locale === 'ka' 
              ? 'მოთხოვნილი პროდუქტი არ არსებობს ან იქნა წაშლილი' 
              : 'The requested product does not exist or has been removed'
            }
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'მაღაზიაში დაბრუნება' : 'Back to Shop'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-96 h-96 bg-gradient-to-br from-emerald-100/40 to-teal-200/30 rounded-full opacity-60 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-100/30 to-indigo-200/20 rounded-full opacity-40 blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              {locale === 'ka' ? 'მთავარი' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-emerald-600 transition-colors">
              {locale === 'ka' ? 'მაღაზია' : 'Shop'}
            </Link>
            <span>/</span>
            {product.categories && (
              <>
                <span className="text-gray-400">
                  {locale === 'ka' ? product.categories.name_ka : product.categories.name_en}
                </span>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">
              {locale === 'ka' ? product.name_ka : product.name_en}
            </span>
          </nav>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Link
            href="/shop"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'მაღაზიაში დაბრუნება' : 'Back to Shop'}
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden group">
              {product.images && product.images.length > 0 ? (
                <>
                  <Image
                    src={product.images[currentImageIndex]}
                    alt={locale === 'ka' ? product.name_ka : product.name_en}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-lg"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {product.images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-300" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {locale === 'ka' ? 'ახალი' : 'NEW'}
                  </span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full shadow-lg">
                    ⚠️ {locale === 'ka' ? 'მცირე მარაგი' : 'Low Stock'}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      currentImageIndex === index
                        ? 'border-emerald-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${locale === 'ka' ? product.name_ka : product.name_en} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain p-2 bg-white"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications */}
            {(product.material || product.weight || product.dimensions || product.color) && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {locale === 'ka' ? 'მახასიათებლები' : 'Specifications'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.material && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        {locale === 'ka' ? 'მასალა:' : 'Material:'}
                      </span>
                      <p className="text-gray-900">{product.material}</p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        {locale === 'ka' ? 'წონა:' : 'Weight:'}
                      </span>
                      <p className="text-gray-900">{product.weight} kg</p>
                    </div>
                  )}
                  {product.dimensions && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        {locale === 'ka' ? 'ზომები:' : 'Dimensions:'}
                      </span>
                      <p className="text-gray-900">{product.dimensions}</p>
                    </div>
                  )}
                  {product.color && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        {locale === 'ka' ? 'ფერი:' : 'Color:'}
                      </span>
                      <p className="text-gray-900">{product.color}</p>
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      {locale === 'ka' ? 'ტეგები:' : 'Tags:'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category & Brand */}
            <div className="flex items-center gap-3">
              {product.categories && (
                <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                  {locale === 'ka' ? product.categories.name_ka : product.categories.name_en}
                </span>
              )}
              {product.brands && (
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  {product.brands.name}
                </span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {locale === 'ka' ? product.name_ka : product.name_en}
              </h1>
              {product.sku && (
                <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
              )}
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {locale === 'ka' ? `დამატებულია: ${formatDate(product.created_at)}` : `Added: ${formatDate(product.created_at)}`}
              </span>
            </div>

            {/* Main Product Info Container */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6 space-y-6">
              {/* Price and Brand Logo Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Section */}
                <div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {product.price}
                    </span>
                    <span className="text-xl font-medium text-gray-600">
                      {product.currency === 'GEL' ? '₾' : product.currency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? 'ფასი ერთეულზე' : 'Price per unit'}
                  </p>
                </div>

                {/* Brand Logo Section */}
                {product.brands?.name && (() => {
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
                  
                  const logoSrc = brandLogos[product.brands.name];
                  
                  return logoSrc ? (
                    <div className="flex items-center justify-center md:justify-end">
                      <div className="w-32 h-20 relative">
                        <Image
                          src={logoSrc}
                          alt={product.brands.name}
                          fill
                          className="object-contain"
                          sizes="128px"
                        />
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
              {/* Stock Status */}
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">
                    {product.stock > 0 
                      ? (locale === 'ka' ? `მარაგშია (${product.stock})` : `In Stock (${product.stock})`)
                      : (locale === 'ka' ? 'გაყიდულია' : 'Out of Stock')
                    }
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      {locale === 'ka' ? 'რაოდენობა:' : 'Quantity:'}
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= (product.min_order_quantity || 1)}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setQuantity(product.min_order_quantity || 1);
                            return;
                          }
                          const newQuantity = parseInt(value);
                          if (!isNaN(newQuantity) && newQuantity >= (product.min_order_quantity || 1) && newQuantity <= product.stock) {
                            setQuantity(newQuantity);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        min={product.min_order_quantity || 1}
                        max={product.stock}
                        className="px-4 py-2 w-20 text-center font-medium border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {product.min_order_quantity && product.min_order_quantity > 1 && (
                    <p className="text-sm text-gray-500">
                      {locale === 'ka' 
                        ? `მინიმალური შეკვეთის რაოდენობა: ${product.min_order_quantity}` 
                        : `Minimum order quantity: ${product.min_order_quantity}`
                      }
                    </p>
                  )}
                  
                  {/* Global Minimum Order Notice */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{locale === 'ka' ? 'ინფორმაცია:' : 'Info:'}</strong> {locale === 'ka' ? 'მინიმალური შეკვეთის ღირებულება 200₾-ია' : 'Minimum order value is 200₾'}
                    </p>
                  </div>
                </div>
              )}

              {/* Product Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {locale === 'ka' ? 'ზომის არჩევა:' : 'Select Size:'}
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                      {product.sizes.map((size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSize(size.available ? size.size : '')}
                          disabled={!size.available}
                          className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                            selectedSize === size.size
                              ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                              : size.available
                                ? 'border-gray-300 bg-white text-gray-900 hover:border-emerald-300 hover:bg-emerald-50'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {size.size}
                          {size.available && size.stock <= 5 && size.stock > 0 && (
                            <div className="text-xs mt-1 opacity-75">
                              {size.stock} {locale === 'ka' ? 'ცალი' : 'left'}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {selectedSize && (
                    <div className="text-sm text-emerald-600 font-medium">
                      {locale === 'ka' ? `არჩეული ზომა: ${selectedSize}` : `Selected size: ${selectedSize}`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Order Summary */}
              {selectedSize && quantity > 0 && product.stock > 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-emerald-800 mb-2">
                    {locale === 'ka' ? 'შეკვეთის შედეგი' : 'Order Summary'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{locale === 'ka' ? 'ზომა:' : 'Size:'}</span>
                      <span className="font-medium">{selectedSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'ka' ? 'რაოდენობა:' : 'Quantity:'}</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>{locale === 'ka' ? 'ჯამი:' : 'Total:'}</span>
                      <span>{product.price * quantity} {product.currency === 'GEL' ? '₾' : product.currency}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || (!selectedSize && product.sizes && product.sizes.length > 0)}
                className={`w-full py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 font-semibold text-lg ${
                  product.stock > 0 && (selectedSize || !product.sizes || product.sizes.length === 0)
                    ? addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-6 h-6" />
                    <span>{locale === 'ka' ? 'კალათაში დაემატა!' : 'Added to Cart!'}</span>
                  </>
                ) : product.stock <= 0 ? (
                  <>
                    <AlertCircle className="w-6 h-6" />
                    <span>{locale === 'ka' ? 'გაყიდულია' : 'Out of Stock'}</span>
                  </>
                ) : (!selectedSize && product.sizes && product.sizes.length > 0) ? (
                  <>
                    <Package className="w-6 h-6" />
                    <span>{locale === 'ka' ? 'ზომა აირჩიეთ' : 'Select Size'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    <span>
                      {locale === 'ka' ? 'კალათაში დამატება' : 'Add to Cart'}
                    </span>
                  </>
                )}
              </button>

              <div className="flex space-x-4">
                <button className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>{locale === 'ka' ? 'ფავორიტებში' : 'Add to Wishlist'}</span>
                </button>
                <button className="flex-1 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                  <Share2 className="w-5 h-5" />
                  <span>{locale === 'ka' ? 'გაზიარება' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {locale === 'ka' ? 'პროდუქტის აღწერა' : 'Product Description'}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {locale === 'ka' ? product.description_ka : product.description_en}
              </p>
            </div>


            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {locale === 'ka' ? 'სწრაფი მიწოდება' : 'Fast Delivery'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? 'ან მისვლა მისამართზე' : 'Or pickup available'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {locale === 'ka' ? 'მყისიერი დამუშავება' : 'Instant Processing'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? 'შეკვეთის სწრაფი დამუშავება' : 'Quick order processing'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {locale === 'ka' ? 'უფასო მიწოდება' : 'Free Shipping'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? '1000₾+ შეკვეთებზე' : 'On orders 1000₾+'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
