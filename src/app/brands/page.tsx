'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { BrandCard } from '@/components/BrandCard'
import { supabase } from '@/lib/supabase'

interface Brand {
  id: string
  name: string
  description_en?: string
  description_ka?: string
  logo?: string
  website?: string
  slug: string
  is_active: boolean
  created_at: string
  productCount: number
}

export default function BrandsPage() {
  const { t, locale } = useTranslation()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch brands from database
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        
        // Get brands with product counts
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (brandsError) throw brandsError

        // Get product counts for each brand
        const brandsWithCounts = await Promise.all(
          (brandsData || []).map(async (brand) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('brand_id', brand.id)
              .eq('is_active', true)

            return {
              ...brand,
              productCount: count || 0
            }
          })
        )

        setBrands(brandsWithCounts)
      } catch (error) {
        console.error('Error fetching brands:', error)
        setBrands([])
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = searchQuery === '' ||
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })


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
            {locale === 'ka' ? 'მთავარ გვერდზე დაბრუნება' : 'Back to Home'}
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'ka' ? 'ბრენდები' : 'Brands'}
          </h1>
          <p className="text-gray-600">
            {locale === 'ka' 
              ? `${filteredBrands.length} ბრენდი ნაპოვნია` 
              : `Found ${filteredBrands.length} brands`
            }
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200"
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={locale === 'ka' ? 'მოძებნეთ ბრენდები...' : 'Search brands...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </motion.div>

        {/* Brands Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {filteredBrands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <BrandCard
                brand={{
                  id: brand.id,
                  name: brand.name,
                  description: '', // No description needed for simplified design
                  logo: '', // Will be handled by logo mapping in BrandCard
                  website: brand.website || '#',
                  country: '',
                  founded: 0,
                  productCount: brand.productCount
                }}
                locale={locale}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredBrands.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'ka' ? 'ბრენდები ვერ მოიძებნა' : 'No brands found'}
            </h3>
            <p className="text-gray-600">
              {locale === 'ka' ? 'სცადეთ სხვა ძიების ტერმინები ან ფილტრები' : 'Try different search terms or filters'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
