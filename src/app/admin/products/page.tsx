'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useIsAdmin } from '@/lib/admin'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Eye, Package, DollarSign, BarChart, Brain, Upload, X } from 'lucide-react'
import { CustomNativeSelect } from '@/components/CustomNativeSelect'
import AIProductAnalysis from '@/components/AIProductAnalysis'

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
  updated_at: string
  categories?: {
    name_en: string
    name_ka: string
  }
}

interface Category {
  id: string
  name_en: string
  name_ka: string
  slug: string
}

export default function AdminProductsPage() {
  const { t, locale } = useTranslation()
  const { isAdminUser, loading: adminLoading } = useIsAdmin()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAIModal, setShowAIModal] = useState(false)

  useEffect(() => {
    let mounted = true

    const handleAuth = async () => {
      if (!adminLoading && !isAdminUser) {
        router.push('/')
        return
      }

      if (isAdminUser && mounted) {
        await Promise.all([
          fetchProducts(),
          fetchCategories()
        ])
      }
    }

    handleAuth()

    return () => {
      mounted = false
    }
  }, [isAdminUser, adminLoading]) // Removed router dependency

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            name_en,
            name_ka
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
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

  const deleteProduct = async (productId: string) => {
    if (!confirm(locale === 'ka' ? 'დარწმუნებული ხართ რომ გსურთ ამ პროდუქტის წაშლა?' : 'Are you sure you want to delete this product?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(locale === 'ka' ? 'პროდუქტის წაშლა ვერ მოხერხდა' : 'Failed to delete product')
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) throw error
      
      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ))
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    const matchesSearch = searchQuery === '' || 
      product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_ka.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!isAdminUser) {
    return null
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
          <Link href="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'დეშბორდზე დაბრუნება' : 'Back to Dashboard'}
          </Link>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {locale === 'ka' ? 'პროდუქტების მართვა' : 'Product Management'}
              </h1>
              <p className="text-gray-600">
                {locale === 'ka' 
                  ? 'დაამატეთ, დაარედაქტირეთ და მართეთ თქვენი პროდუქტები' 
                  : 'Add, edit and manage your products'
                }
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products/add"
                className="group relative bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <span className="font-medium">{locale === 'ka' ? 'ახალი პროდუქტი' : 'Add Product'}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-200"></div>
              </Link>

              <Link
                href="/admin/analytics"
                className="group relative bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <BarChart className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <span className="font-medium">{locale === 'ka' ? 'ანალიტიკა' : 'Analytics'}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200"></div>
              </Link>
              
              <button
                onClick={() => setShowAIModal(true)}
                className="group relative bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Brain className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <span className="font-medium">{locale === 'ka' ? 'AI ანალიზი' : 'AI Analysis'}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-200"></div>
              </button>
              
              <Link
                href="/admin/products/bulk-import"
                className="group relative bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <span className="font-medium">{locale === 'ka' ? 'ბულკ იმპორტი' : 'Bulk Import'}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 transition-all duration-200"></div>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ka' ? 'მთლიანი პროდუქტები' : 'Total Products'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ka' ? 'აქტიური პროდუქტები' : 'Active Products'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.is_active).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <BarChart className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ka' ? 'მარაგში არსებული' : 'In Stock'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.stock > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {locale === 'ka' ? 'საშუალო ფასი' : 'Average Price'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length > 0 ? 
                      Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) 
                      : 0
                    } ₾
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ka' ? 'ძებნა' : 'Search'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === 'ka' ? 'პროდუქტის სახელი...' : 'Product name...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex-1 max-w-md">
              <CustomNativeSelect
                label={locale === 'ka' ? 'კატეგორია' : 'Category'}
                options={[
                  { value: 'all', label: locale === 'ka' ? 'ყველა კატეგორია' : 'All Categories' },
                  ...categories.map(category => ({
                    value: category.id,
                    label: locale === 'ka' ? category.name_ka : category.name_en
                  }))
                ]}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                placeholder={locale === 'ka' ? 'აირჩიეთ კატეგორია' : 'Select category'}
              />
            </div>

          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ka' ? 'პროდუქტი' : 'Product'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ka' ? 'კატეგორია' : 'Category'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ka' ? 'ფასი' : 'Price'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ka' ? 'მარაგი' : 'Stock'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ka' ? 'სტატუსი' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ka' ? 'მოქმედებები' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {locale === 'ka' ? product.name_ka : product.name_en}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {locale === 'ka' ? product.description_ka : product.description_en}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.categories ? 
                        (locale === 'ka' ? product.categories.name_ka : product.categories.name_en) 
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price} {product.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {product.is_active ? 
                          (locale === 'ka' ? 'აქტიური' : 'Active') : 
                          (locale === 'ka' ? 'არააქტიური' : 'Inactive')
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {locale === 'ka' ? 'პროდუქტები ვერ მოიძებნა' : 'No products found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {locale === 'ka' ? 'სცადეთ სხვა ფილტრები ან დაამატეთ ახალი პროდუქტი' : 'Try different filters or add a new product'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAIModal(false)}
            ></div>

            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {/* Modal header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {locale === 'ka' ? 'AI პროდუქტის ანალიზი' : 'AI Product Analysis'}
                  </h3>
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* AI Analysis Component */}
                <AIProductAnalysis
                  onAnalysisComplete={(result) => {
                    // After analysis, close modal and navigate to add page with pre-filled data
                    setShowAIModal(false)
                    // Store the result in localStorage for the add page to pick up
                    localStorage.setItem('aiAnalysisResult', JSON.stringify(result))
                    router.push('/admin/products/add')
                  }}
                  onClose={() => setShowAIModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

