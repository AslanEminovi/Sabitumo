'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useIsAdmin } from '@/lib/admin'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Save, AlertCircle, CheckCircle, Package, DollarSign, Warehouse, Upload, X, GripVertical, Star } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CustomNativeSelect } from '@/components/CustomNativeSelect'
import AIProductAnalysis from '@/components/AIProductAnalysis'

interface AIAnalysisResult {
  name_en: string
  name_ka: string
  description_en: string
  description_ka: string
  category: string
  brand: string
  subcategory: string
  material: string
  tags: string[]
  weight: string
  dimensions: string
  color: string
  confidence: number
}

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

export default function AIAddProductPage() {
  const { t, locale } = useTranslation()
  const { isAdminUser, loading: adminLoading } = useIsAdmin()
  const router = useRouter()

  // Sortable Image Item Component
  function SortableImageItem({ image, index, onRemove }: { image: string; index: number; onRemove: () => void }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: `image-${index}` })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group transition-all duration-200 ${
          isDragging ? 'rotate-3 scale-105 z-50 opacity-50' : ''
        }`}
      >
        {/* Thumbnail Badge */}
        {index === 0 && (
          <div className="absolute -top-2 -left-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10 shadow-lg">
            <Star className="w-3 h-3 fill-current" />
          </div>
        )}
        
        {/* Drag Handle - Always visible on mobile */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 bg-black/50 text-white rounded p-2 sm:p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 touch-manipulation"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <GripVertical className="w-4 h-4 sm:w-3 sm:h-3" />
        </div>
        
        {/* Image */}
        <img
          src={image}
          alt={`Product ${index + 1}`}
          className={`w-full h-24 object-cover rounded-lg border-2 transition-all duration-200 ${
            index === 0 
              ? 'border-amber-400 shadow-lg' 
              : 'border-gray-200 group-hover:border-purple-300'
          } ${isDragging ? 'shadow-2xl' : ''}`}
        />
        
        {/* Remove Button - Always visible on mobile */}
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 touch-manipulation"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <X className="w-4 h-4 sm:w-3 sm:h-3" />
        </button>
        
        {/* Order Number */}
        <div className="absolute bottom-1 right-1 bg-black/50 text-white rounded px-2 py-1 text-xs font-medium">
          {index + 1}
        </div>
      </div>
    )
  }
  
  // States
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form data - AI fills most, user fills price/stock/sizes
  const [formData, setFormData] = useState({
    // AI-filled fields
    name_en: '',
    name_ka: '',
    description_en: '',
    description_ka: '',
    category_id: '',
    brand_id: '',
    subcategory: '',
    material: '',
    tags: [] as string[],
    weight: '',
    dimensions: '',
    color: '',
    
    // User-filled fields
    price: '',
    currency: 'GEL',
    stock: '',
    min_order_quantity: '1',
    sku: '',
    is_active: true,
    is_featured: false,
    
    // Sizes with individual stocks
    sizes: [] as { size: string; stock: number }[],
    
    // Images
    images: [] as string[]
  })

  // Size management
  const [newSize, setNewSize] = useState('')
  const [newSizeStock, setNewSizeStock] = useState('')
  
  // Image management
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!adminLoading && !isAdminUser) {
      router.push('/')
      return
    }

    if (isAdminUser) {
      fetchCategories()
      fetchBrands()
    }
  }, [isAdminUser, adminLoading, router])

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

  const handleAIAnalysisComplete = (result: AIAnalysisResult) => {
    // Find matching category and brand IDs
    const matchingCategory = categories.find(cat => 
      cat.name_en.toLowerCase().includes(result.category.toLowerCase()) ||
      cat.name_ka.toLowerCase().includes(result.category.toLowerCase())
    )
    
    const matchingBrand = result.brand ? brands.find(brand => 
      brand.name.toLowerCase().includes(result.brand.toLowerCase())
    ) : null

    setFormData(prev => ({
      ...prev,
      name_en: result.name_en,
      name_ka: result.name_ka,
      description_en: result.description_en,
      description_ka: result.description_ka,
      category_id: matchingCategory?.id || '',
      brand_id: matchingBrand?.id || '',
      subcategory: result.subcategory,
      material: result.material,
      tags: result.tags,
      weight: result.weight,
      dimensions: result.dimensions,
      color: result.color,
    }))

    setSuccess(`AI analysis completed with ${Math.round(result.confidence * 100)}% confidence. Please review and add pricing/inventory information.`)
    setError(null)
  }

  const addSize = () => {
    if (newSize && newSizeStock) {
      const sizeStock = parseInt(newSizeStock)
      if (sizeStock > 0) {
        setFormData(prev => ({
          ...prev,
          sizes: [...prev.sizes, { size: newSize, stock: sizeStock }]
        }))
        setNewSize('')
        setNewSizeStock('')
      }
    }
  }

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Convert to base64 for now (temporary solution)
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        
        const base64Image = await base64Promise
        newImages.push(base64Image)
      }

      setUploadedImages(prev => [...prev, ...newImages])
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))
    } catch (error) {
      console.error('Image upload error:', error)
      setError('Failed to upload images')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = uploadedImages.findIndex((_, index) => `image-${index}` === active.id)
      const newIndex = uploadedImages.findIndex((_, index) => `image-${index}` === over?.id)
      
      const newImages = arrayMove(uploadedImages, oldIndex, newIndex)
      setUploadedImages(newImages)
      setFormData(prev => ({
        ...prev,
        images: newImages
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name_en || !formData.price || !formData.stock) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Calculate total stock
      const totalStock = formData.sizes.length > 0 
        ? formData.sizes.reduce((sum, size) => sum + size.stock, 0)
        : parseInt(formData.stock)

      const productData = {
        name_en: formData.name_en,
        name_ka: formData.name_ka,
        description_en: formData.description_en,
        description_ka: formData.description_ka,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        subcategory: formData.subcategory,
        stock: totalStock,
        min_order_quantity: parseInt(formData.min_order_quantity),
        sku: formData.sku || `AI-${Date.now()}`,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        material: formData.material,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions,
        color: formData.color,
        tags: formData.tags,
        sizes: formData.sizes.length > 0 ? formData.sizes : null,
        images: formData.images
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()

      if (error) throw error

      setSuccess('Product created successfully with AI assistance!')
      setTimeout(() => {
        router.push('/admin/products')
      }, 2000)

    } catch (error) {
      console.error('Error creating product:', error)
      setError('Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (adminLoading) {
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
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full opacity-15 blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/admin/products" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'პროდუქტებზე დაბრუნება' : 'Back to Products'}
          </Link>

          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {locale === 'ka' ? 'AI პროდუქტის დამატება' : 'AI Product Addition'}
              </h1>
              <p className="text-gray-600">
                {locale === 'ka' 
                  ? 'ატვირთეთ სურათები და AI ავტომატურად შეავსებს ინფორმაციას' 
                  : 'Upload images and AI will automatically fill product information'
                }
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  {locale === 'ka' 
                    ? '💡 რჩევა: AI ანალიზის შემდეგ დაამატეთ პროდუქტის სურათები ლამაზი გამოჩენისთვის' 
                    : '💡 Tip: After AI analysis, add product images for better display'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* AI Analysis Button */}
          {!formData.name_en && (
            <button
              onClick={() => setShowAIAnalysis(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-3 shadow-lg"
            >
              <Sparkles className="w-6 h-6" />
              <span className="text-lg font-semibold">
                {locale === 'ka' ? 'AI ანალიზის დაწყება' : 'Start AI Analysis'}
              </span>
            </button>
          )}
        </motion.div>

        {/* Success/Error Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </motion.div>
        )}

        {/* Main Form */}
        {formData.name_en && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* AI-Generated Information (Read-only display) */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>{locale === 'ka' ? 'AI-ს მიერ გენერირებული ინფორმაცია' : 'AI-Generated Information'}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    {locale === 'ka' ? 'სახელი (ინგლისური)' : 'Name (English)'}
                  </label>
                  <p className="bg-white p-3 rounded-lg border">{formData.name_en}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    {locale === 'ka' ? 'სახელი (ქართული)' : 'Name (Georgian)'}
                  </label>
                  <p className="bg-white p-3 rounded-lg border">{formData.name_ka}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    {locale === 'ka' ? 'აღწერა (ინგლისური)' : 'Description (English)'}
                  </label>
                  <p className="bg-white p-3 rounded-lg border text-sm">{formData.description_en}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    {locale === 'ka' ? 'აღწერა (ქართული)' : 'Description (Georgian)'}
                  </label>
                  <p className="bg-white p-3 rounded-lg border text-sm">{formData.description_ka}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    {locale === 'ka' ? 'მასალა' : 'Material'}
                  </label>
                  <p className="bg-white p-3 rounded-lg border">{formData.material}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    {locale === 'ka' ? 'ფერი' : 'Color'}
                  </label>
                  <p className="bg-white p-3 rounded-lg border">{formData.color}</p>
                </div>

                {formData.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                      {locale === 'ka' ? 'ტეგები' : 'Tags'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Input Fields */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>{locale === 'ka' ? 'ფასი და ინვენტარი' : 'Pricing & Inventory'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'ფასი*' : 'Price*'}
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="px-3 py-3 border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                    >
                      <option value="GEL">₾</option>
                      <option value="USD">$</option>
                      <option value="EUR">€</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'მარაგი*' : 'Stock*'}
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ka' ? 'მინ. რაოდენობა' : 'Min Quantity'}
                  </label>
                  <input
                    type="number"
                    value={formData.min_order_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_quantity: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Category and Brand Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <CustomNativeSelect
                  label={locale === 'ka' ? 'კატეგორია' : 'Category'}
                  options={categories.map(cat => ({
                    value: cat.id,
                    label: locale === 'ka' ? cat.name_ka : cat.name_en
                  }))}
                  value={formData.category_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  placeholder={locale === 'ka' ? 'აირჩიეთ კატეგორია' : 'Select category'}
                />

                <CustomNativeSelect
                  label={locale === 'ka' ? 'ბრენდი' : 'Brand'}
                  options={brands.map(brand => ({
                    value: brand.id,
                    label: brand.name
                  }))}
                  value={formData.brand_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}
                  placeholder={locale === 'ka' ? 'აირჩიეთ ბრენდი' : 'Select brand'}
                />
              </div>

              {/* SKU */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU {locale === 'ka' ? '(არასავალდებულო)' : '(Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder={`AI-${Date.now()}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>{locale === 'ka' ? 'პროდუქტის სურათები' : 'Product Images'}</span>
              </h3>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ka' ? 'სურათების ატვირთვა' : 'Upload Images'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">
                    {locale === 'ka' 
                      ? 'გადაიტანეთ სურათები აქ ან დააკლიკეთ არჩევისთვის' 
                      : 'Drop images here or click to select'
                    }
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{locale === 'ka' ? 'იტვირთება...' : 'Uploading...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'სურათების არჩევა' : 'Select Images'}</span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {locale === 'ka' 
                    ? 'მხარდაჭერილია: JPEG, PNG, WebP. მაქს. 5MB ყოველი' 
                    : 'Supported: JPEG, PNG, WebP. Max 5MB each'
                  }
                </p>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      {locale === 'ka' ? `ატვირთული სურათები (${uploadedImages.length}/10)` : `Uploaded Images (${uploadedImages.length}/10)`}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {locale === 'ka' ? 'გადაიტანეთ ხელახლა დალაგებისთვის' : 'Drag to reorder'}
                    </p>
                  </div>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={uploadedImages.map((_, index) => `image-${index}`)} strategy={horizontalListSortingStrategy}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {uploadedImages.map((image, index) => (
                          <SortableImageItem
                            key={`image-${index}`}
                            image={image}
                            index={index}
                            onRemove={() => removeImage(index)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  
                  {/* Instructions */}
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Star className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-amber-800 font-medium mb-1">
                          {locale === 'ka' ? 'მთავარი სურათი' : 'Thumbnail Image'}
                        </p>
                        <p className="text-amber-700">
                          {locale === 'ka' 
                            ? 'პირველი სურათი (ვარსკვლავით) გამოჩნდება როგორც მთავარი სურათი ყველა გვერდზე' 
                            : 'The first image (with star) will appear as the main thumbnail on all pages'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Sizes */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Warehouse className="w-5 h-5" />
                <span>{locale === 'ka' ? 'ზომები (არასავალდებულო)' : 'Sizes (Optional)'}</span>
              </h3>

              {/* Add Size */}
              <div className="flex space-x-4 mb-4">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder={locale === 'ka' ? 'ზომა' : 'Size'}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <input
                  type="number"
                  value={newSizeStock}
                  onChange={(e) => setNewSizeStock(e.target.value)}
                  placeholder={locale === 'ka' ? 'მარაგი' : 'Stock'}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {locale === 'ka' ? 'დამატება' : 'Add'}
                </button>
              </div>

              {/* Size List */}
              {formData.sizes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {locale === 'ka' ? 'დამატებული ზომები:' : 'Added Sizes:'}
                  </h4>
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span>
                        {locale === 'ka' ? 'ზომა:' : 'Size:'} <strong>{size.size}</strong> - 
                        {locale === 'ka' ? ' მარაგი:' : ' Stock:'} <strong>{size.stock}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Toggles */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {locale === 'ka' ? 'სტატუსი' : 'Status'}
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    {locale === 'ka' ? 'პროდუქტი აქტიურია და ხელმისაწვდომია' : 'Product is active and available'}
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    {locale === 'ka' ? 'რჩეული პროდუქტი (მთავარ გვერდზე ჩვენება)' : 'Featured product (show on homepage)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <Link
                href="/admin/products"
                className="flex-1 text-center py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {locale === 'ka' ? 'გაუქმება' : 'Cancel'}
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{locale === 'ka' ? 'ინახება...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{locale === 'ka' ? 'პროდუქტის შენახვა' : 'Save Product'}</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* AI Analysis Modal */}
        {showAIAnalysis && (
          <AIProductAnalysis
            onAnalysisComplete={handleAIAnalysisComplete}
            onClose={() => setShowAIAnalysis(false)}
          />
        )}
      </div>
    </div>
  )
}
