'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useIsAdmin } from '@/lib/admin'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X, Plus, Tag, AlertCircle, Sparkles, Zap } from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { CustomNativeSelect } from '@/components/CustomNativeSelect'

interface Category {
  id: string
  name_en: string
  name_ka: string
  slug: string
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface ProductForm {
  name_en: string
  name_ka: string
  description_en: string
  description_ka: string
  price: string
  currency: string
  category_id: string
  subcategory: string
  stock: string
  is_active: boolean
  brand_id: string
  tags: string[]
  sku: string
  weight: string
  dimensions: string
  material: string
  color: string
  min_order_quantity: string
  is_featured: boolean
  is_new_arrival: boolean
  is_bestseller: boolean
  sizes: { size: string; available: boolean; stock: number }[]
}

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
}

interface AIAnalysisResult {
  name_en: string
  name_ka: string
  description_en: string
  description_ka: string
  category_suggestion: string
  brand_suggestion: string
  tags: string[]
  material: string
  color: string
  estimated_price: number
  confidence: number
}

export default function EditProductPage() {
  const { t, locale } = useTranslation()
  const { isAdminUser, loading: adminLoading } = useIsAdmin()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [errors, setErrors] = useState<Partial<ProductForm>>({})
  const [productImages, setProductImages] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [productNotFound, setProductNotFound] = useState(false)
  const [newSize, setNewSize] = useState('')
  const [newSizeStock, setNewSizeStock] = useState('') 
  
  // AI Analysis states
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState('')
  
  const [formData, setFormData] = useState<ProductForm>({
    name_en: '',
    name_ka: '',
    description_en: '',
    description_ka: '',
    price: '',
    currency: 'GEL',
    category_id: '',
    subcategory: '',
    stock: '0',
    is_active: true,
    brand_id: '',
    tags: [],
    sku: '',
    weight: '',
    dimensions: '',
    material: '',
    color: '',
    min_order_quantity: '1',
    is_featured: false,
    is_new_arrival: false,
    is_bestseller: false,
    sizes: []
  })

  useEffect(() => {
    if (!adminLoading && !isAdminUser) {
      router.push('/')
      return
    }

    if (isAdminUser && productId) {
      fetchCategories()
      fetchBrands()
      fetchProduct()
    }
  }, [isAdminUser, adminLoading, router, productId])

  const fetchProduct = async () => {
    try {
      setLoadingProduct(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        setProductNotFound(true)
        return
      }

      if (data) {
        // Convert product data to form format
        setFormData({
          name_en: data.name_en || '',
          name_ka: data.name_ka || '',
          description_en: data.description_en || '',
          description_ka: data.description_ka || '',
          price: data.price?.toString() || '',
          currency: data.currency || 'GEL',
          category_id: data.category_id || '',
          subcategory: data.subcategory || '',
          stock: data.stock?.toString() || '0',
          is_active: data.is_active ?? true,
          brand_id: data.brand_id || '',
          tags: data.tags || [],
          sku: data.sku || '',
          weight: data.weight?.toString() || '',
          dimensions: data.dimensions || '',
          material: data.material || '',
          color: data.color || '',
          min_order_quantity: data.min_order_quantity?.toString() || '1',
          is_featured: data.is_featured ?? false,
          is_new_arrival: data.is_new_arrival ?? false,
          is_bestseller: data.is_bestseller ?? false,
          sizes: data.sizes || []
        })
        setProductImages(data.images || [])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setProductNotFound(true)
    } finally {
      setLoadingProduct(false)
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

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      setBrands(data || [])
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductForm> = {}

    if (!formData.name_en.trim()) {
      newErrors.name_en = locale === 'ka' ? 'სახელი (ინგლისური) აუცილებელია' : 'English name is required'
    }
    // Georgian name is optional - no validation needed
    if (!formData.description_en.trim()) {
      newErrors.description_en = locale === 'ka' ? 'აღწერა (ინგლისური) აუცილებელია' : 'English description is required'
    }
    // Georgian description is optional - no validation needed
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = locale === 'ka' ? 'ფასი უნდა იყოს დადებითი რიცხვი' : 'Price must be a positive number'
    }
    if (!formData.category_id) {
      newErrors.category_id = locale === 'ka' ? 'კატეგორია აუცილებელია' : 'Category is required'
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = locale === 'ka' ? 'მარაგი უნდა იყოს 0 ან მეტი' : 'Stock must be 0 or greater'
    }
    if (!formData.min_order_quantity || parseInt(formData.min_order_quantity) < 1) {
      newErrors.min_order_quantity = locale === 'ka' ? 'მინიმალური შეკვეთის რაოდენობა უნდა იყოს 1 ან მეტი' : 'Minimum order quantity must be 1 or greater'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      // Prepare the product data
      const productData = {
        name_en: formData.name_en.trim(),
        name_ka: formData.name_ka.trim(),
        description_en: formData.description_en.trim(),
        description_ka: formData.description_ka.trim(),
        price: parseFloat(formData.price),
        currency: formData.currency,
        category_id: formData.category_id || null,
        subcategory: formData.subcategory.trim() || null,
        stock: parseInt(formData.stock),
        is_active: formData.is_active,
        images: productImages,
        brand_id: formData.brand_id || null,
        tags: formData.tags,
        sku: formData.sku.trim() || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions.trim() || null,
        material: formData.material.trim() || null,
        color: formData.color.trim() || null,
        min_order_quantity: parseInt(formData.min_order_quantity),
        is_featured: formData.is_featured,
        is_new_arrival: formData.is_new_arrival,
        is_bestseller: formData.is_bestseller,
        sizes: formData.sizes || [],
        updated_at: new Date().toISOString()
      }

      console.log('Updating product data:', productData)

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Product updated successfully:', data)
      
      // Navigate to products page
      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error updating product:', error)
      const errorMessage = error?.message || 'Unknown error occurred'
      setSubmitError(locale === 'ka' 
        ? `პროდუქტის განახლება ვერ მოხერხდა: ${errorMessage}` 
        : `Failed to update product: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof ProductForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addSize = () => {
    if (newSize.trim() && newSizeStock.trim() && !isNaN(Number(newSizeStock))) {
      const currentSizes = formData.sizes || []
      const sizeExists = currentSizes.some(size => size.size === newSize.trim())
      if (!sizeExists) {
        setFormData(prev => ({
          ...prev,
          sizes: [...currentSizes, {
            size: newSize.trim(),
            available: true,
            stock: parseInt(newSizeStock.trim())
          }]
        }))
        setNewSize('')
        setNewSizeStock('')
      }
    }
  }

  const removeSize = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter(size => size.size !== sizeToRemove)
    }))
  }

  const toggleSizeAvailability = (sizeToToggle: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).map(size => 
        size.size === sizeToToggle 
          ? { ...size, available: !size.available }
          : size
      )
    }))
  }

  const updateSizeStock = (sizeToUpdate: string, newStock: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).map(size => 
        size.size === sizeToUpdate 
          ? { ...size, stock: newStock, available: newStock > 0 }
          : size
      )
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (adminLoading || loadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loadingProduct 
              ? (locale === 'ka' ? 'პროდუქტის ჩატვირთვა...' : 'Loading product...')
              : (locale === 'ka' ? 'ჩატვირთვა...' : 'Loading...')
            }
          </p>
        </div>
      </div>
    )
  }

  if (!isAdminUser) {
    return null
  }

  if (productNotFound) {
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
              : 'The requested product does not exist or has been deleted'
            }
          </p>
          <Link
            href="/admin/products"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'პროდუქტების სიაში დაბრუნება' : 'Back to Products'}
          </Link>
        </div>
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
          <Link href="/admin/products" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'პროდუქტების მართვაში დაბრუნება' : 'Back to Products'}
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {locale === 'ka' ? 'პროდუქტის რედაქტირება' : 'Edit Product'}
              </h1>
              <p className="text-gray-600">
                {locale === 'ka' 
                  ? 'შეცვალეთ პროდუქტის ინფორმაცია და შენახეთ ცვლილებები' 
                  : 'Modify product information and save changes'
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'ძირითადი ინფორმაცია' : 'Basic Information'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* English Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'სახელი (ინგლისური)' : 'Name (English)'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    value={formData.name_en}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                      errors.name_en ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name in English"
                  />
                  {errors.name_en && (
                    <p className="mt-1 text-sm text-red-600">{errors.name_en}</p>
                  )}
                </div>

                {/* Georgian Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'სახელი (ქართული)' : 'Name (Georgian)'}
                    <span className="text-gray-400 text-xs ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="name_ka"
                    value={formData.name_ka}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                      errors.name_ka ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="შეიყვანეთ პროდუქტის სახელი ქართულად"
                  />
                  {errors.name_ka && (
                    <p className="mt-1 text-sm text-red-600">{errors.name_ka}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* English Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'აღწერა (ინგლისური)' : 'Description (English)'}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description_en"
                    value={formData.description_en}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors resize-none ${
                      errors.description_en ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product description in English"
                  />
                  {errors.description_en && (
                    <p className="mt-1 text-sm text-red-600">{errors.description_en}</p>
                  )}
                </div>

                {/* Georgian Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'აღწერა (ქართული)' : 'Description (Georgian)'}
                    <span className="text-gray-400 text-xs ml-1">(optional)</span>
                  </label>
                  <textarea
                    name="description_ka"
                    value={formData.description_ka}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors resize-none ${
                      errors.description_ka ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="შეიყვანეთ პროდუქტის აღწერა ქართულად"
                  />
                  {errors.description_ka && (
                    <p className="mt-1 text-sm text-red-600">{errors.description_ka}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'ფასი და მარაგი' : 'Pricing & Inventory'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'ფასი' : 'Price'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                {/* Currency */}
                <div>
                  <CustomNativeSelect
                    label={locale === 'ka' ? 'ვალუტა' : 'Currency'}
                    options={[
                      { value: 'GEL', label: 'GEL (₾)' },
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' }
                    ]}
                    value={formData.currency}
                    onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    placeholder={locale === 'ka' ? 'აირჩიეთ ვალუტა' : 'Select currency'}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'მარაგი' : 'Stock'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                  )}
                </div>

                {/* Minimum Order Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'მინიმალური შეკვეთის რაოდენობა' : 'Minimum Order Quantity'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="min_order_quantity"
                    value={formData.min_order_quantity}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                      errors.min_order_quantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.min_order_quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.min_order_quantity}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {locale === 'ka' 
                      ? 'მინიმალური რაოდენობა, რომელიც უნდა შეუკვეთოს მომხმარებელმა' 
                      : 'Minimum quantity that customers must order'
                    }
                  </p>
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'SKU' : 'SKU'}
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="PROD-001"
                  />
                </div>
              </div>
            </div>

            {/* Category & Brand */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'კატეგორია და ბრენდი' : 'Category & Brand'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <CustomNativeSelect
                    label={locale === 'ka' ? 'კატეგორია' : 'Category'}
                    options={[
                      { value: '', label: locale === 'ka' ? 'აირჩიეთ კატეგორია' : 'Select category' },
                      ...categories.map(category => ({
                        value: category.id,
                        label: locale === 'ka' ? category.name_ka : category.name_en
                      }))
                    ]}
                    value={formData.category_id}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, category_id: value }))
                      if (errors.category_id) {
                        setErrors(prev => ({ ...prev, category_id: undefined }))
                      }
                    }}
                    placeholder={locale === 'ka' ? 'აირჩიეთ კატეგორია' : 'Select category'}
                    error={errors.category_id}
                  />
                </div>

                {/* Brand - Temporarily hidden until brands table is created */}
                {brands.length > 0 && (
                  <div>
                    <CustomNativeSelect
                      label={locale === 'ka' ? 'ბრენდი' : 'Brand'}
                      options={[
                        { value: '', label: locale === 'ka' ? 'აირჩიეთ ბრენდი' : 'Select brand' },
                        ...brands.map(brand => ({
                          value: brand.id,
                          label: brand.name
                        }))
                      ]}
                      value={formData.brand_id}
                      onChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}
                      placeholder={locale === 'ka' ? 'აირჩიეთ ბრენდი' : 'Select brand'}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Subcategory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'ქვეკატეგორია' : 'Subcategory'}
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={locale === 'ka' ? 'არასავალდებულო' : 'Optional'}
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'მასალა' : 'Material'}
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={locale === 'ka' ? 'მაგ. ფოლადი, ალუმინი' : 'e.g. Steel, Aluminum'}
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'ტეგები' : 'Tags'}
              </h2>
              
              <div className="space-y-4">
                {/* Add Tag Input */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={locale === 'ka' ? 'დაამატეთ ტეგი...' : 'Add a tag...'}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{locale === 'ka' ? 'დამატება' : 'Add'}</span>
                  </button>
                </div>

                {/* Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-amber-900 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Specifications */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'პროდუქტის მახასიათებლები' : 'Product Specifications'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'წონა (კგ)' : 'Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'ზომები (სმ)' : 'Dimensions (cm)'}
                  </label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="L x W x H"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'ფერი' : 'Color'}
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={locale === 'ka' ? 'მაგ. შავი, ლურჯი' : 'e.g. Black, Blue'}
                  />
                </div>
              </div>

            </div>

            {/* Product Images */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'პროდუქტის სურათები' : 'Product Images'}
              </h2>
              
              <ImageUpload
                onImagesChange={setProductImages}
                initialImages={productImages}
                maxImages={10}
                multiple={true}
                className="mb-6"
              />
            </div>

            {/* Status & Features */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'სტატუსი და პარამეტრები' : 'Status & Features'}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {locale === 'ka' ? 'პროდუქტი აქტიური და ხელმისაწვდომია' : 'Product is active and available'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {locale === 'ka' ? 'რჩეული პროდუქტი (მთავარ გვერდზე ჩვენება)' : 'Featured product (show on homepage)'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_new_arrival"
                    checked={formData.is_new_arrival}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {locale === 'ka' ? 'ახალი ნაწარმი (ნაჩვენები "NEW" ნიშნით)' : 'New arrival (show "NEW" badge)'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_bestseller"
                    checked={formData.is_bestseller}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {locale === 'ka' ? 'ბესტსელერი (ნაჩვენები "BESTSELLER" ნიშნით)' : 'Bestseller (show "BESTSELLER" badge)'}
                  </label>
                </div>
              </div>
            </div>

            {/* Product Sizes */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'პროდუქტის ზომები' : 'Product Sizes'}
              </h2>
              
              <div className="space-y-4">
                {/* Add Size Form */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ka' ? 'ზომა' : 'Size'}
                    </label>
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder={locale === 'ka' ? 'მაგ: 41, M, XL, 28W, EU40...' : 'e.g: 41, M, XL, 28W, EU40...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ka' ? 'მარაგი' : 'Stock'}
                    </label>
                    <input
                      type="number"
                      value={newSizeStock}
                      onChange={(e) => setNewSizeStock(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addSize}
                      className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors duration-200 whitespace-nowrap"
                    >
                      {locale === 'ka' ? 'დამატება' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Sizes List */}
                {formData.sizes && formData.sizes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      {locale === 'ka' ? 'დამატებული ზომები:' : 'Added Sizes:'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(formData.sizes || []).map((size, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            size.available 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${
                              size.available ? 'text-green-900' : 'text-gray-500'
                            }`}>
                              Size: {size.size}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSize(size.size)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={size.available || false}
                                onChange={() => toggleSizeAvailability(size.size)}
                                className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="ml-1 text-xs text-gray-600">
                                {locale === 'ka' ? 'ხელმისაწვდომი' : 'Available'}
                              </span>
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">
                              {locale === 'ka' ? 'მარაგი:' : 'Stock:'}
                            </label>
                            <input
                              type="number"
                              value={size.stock || 0}
                              onChange={(e) => updateSizeStock(size.size, parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!formData.sizes || formData.sizes.length === 0) && (
                  <p className="text-sm text-gray-500 italic">
                    {locale === 'ka' 
                      ? 'ზომები არ არის დამატებული. დაამატეთ ნებისმიერი ზომის ფორმატი (ციფრები, ასოები, კომბინაცია).'
                      : 'No sizes added. Add any size format you need (numbers, letters, combinations).'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {locale === 'ka' ? 'შეცდომა მოხდა' : 'Error occurred'}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {submitError}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/products"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {locale === 'ka' ? 'გაუქმება' : 'Cancel'}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{locale === 'ka' ? 'შენახვა...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{locale === 'ka' ? 'ცვლილებების შენახვა' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

