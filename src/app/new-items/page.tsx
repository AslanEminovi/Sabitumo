'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Star, ShoppingCart, Package, Clock } from 'lucide-react'
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
  is_new_arrival: boolean
  is_bestseller: boolean
  sku?: string
  slug_en?: string
  slug_ka?: string
  images: string[]
  min_order_quantity?: number
  categories?: {
    name_en: string
    name_ka: string
  }
  brands?: {
    name: string
    logo?: string
  }
}

const getProductSlug = (product: Product) => {
  return product.sku || 
         (product.slug_en && product.slug_ka ? 
          (product.slug_en) : '') || 
         product.id
}

export default function NewItemsPage() {
  const { t, locale } = useTranslation()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewItems()
  }, [])

  const fetchNewItems = async () => {
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
        .eq('is_new_arrival', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) {
        console.error('Error fetching new items:', error)
        setProducts([])
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Error in fetchNewItems:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_ka: product.name_ka,
      price: product.price,
      currency: product.currency,
      image: product.images?.[0] || '/sabitumo1.png',
      stock: product.stock,
      min_order_quantity: product.min_order_quantity || 1,
      selectedSize: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {locale === 'ka' ? 'ახალი პროდუქტები' : 'New Items'}
                </h1>
                <p className="text-gray-600 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
                  {locale === 'ka' 
                    ? 'უახლესი არრივალები და ლიმიტირებული კოლექცია' 
                    : 'Latest arrivals and limited collection'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{locale === 'ka' ? 'ახლად დამატებული' : 'Just Added'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse flex flex-col h-full">
                <div className="h-40 sm:h-48 md:h-56 bg-gray-200"></div>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.1 } }}
                className="group bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-100 flex flex-col h-full"
              >
                {/* Product Image */}
                <Link href={`/products/${getProductSlug(product)}`}>
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={locale === 'ka' ? product.name_ka : product.name_en}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-150"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* NEW Badge */}
                    {product.is_new_arrival && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {locale === 'ka' ? 'ახალი' : 'NEW'}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
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
                    <div className="flex items-center justify-between">
                      {/* Price Container - Left Side */}
                      <div className="flex items-baseline space-x-1 bg-emerald-50 px-2 py-1 rounded-md">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">
                          {product.price}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          {product.currency === 'GEL' ? '₾' : product.currency}
                        </span>
                      </div>
                      
                      {/* Brand Logo - Right Side */}
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

                  {/* Details Button */}
                  <div className="px-4 pb-4">
                    <Link
                      href={`/products/${getProductSlug(product)}`}
                      className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      <span>{locale === 'ka' ? 'დეტალები' : 'Details'}</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg max-w-md mx-auto">
              <Sparkles className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {locale === 'ka' ? 'ახალი პროდუქტები მალე!' : 'New Items Coming Soon!'}
              </h3>
              <p className="text-gray-600 mb-6">
                {locale === 'ka' 
                  ? 'დაბრუნდით მალე ჩვენი უახლესი კოლექციისთვის' 
                  : 'Stay tuned for our latest collection drops'
                }
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                {locale === 'ka' ? 'მაღაზიის დათვალიერება' : 'Browse Shop'}
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}