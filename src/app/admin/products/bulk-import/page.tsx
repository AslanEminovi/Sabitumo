'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useIsAdmin } from '@/lib/admin'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Upload, Download, FileText, AlertCircle, CheckCircle, X, Package } from 'lucide-react'
import Papa from 'papaparse'

interface CSVProduct {
  name_en: string
  name_ka: string
  description_en: string
  description_ka: string
  price: number
  currency: string
  category_id: string
  brand_id: string
  stock: number
  sku: string
  images: string
  sizes: string
  min_order_quantity: number
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export default function BulkImportPage() {
  const { t, locale } = useTranslation()
  const { isAdminUser, loading: adminLoading } = useIsAdmin()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [csvData, setCsvData] = useState<CSVProduct[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])

  // Fetch categories and brands for reference
  const fetchReferences = React.useCallback(async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true),
        supabase.from('brands').select('*').eq('is_active', true)
      ])
      
      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (brandsRes.data) setBrands(brandsRes.data)
    } catch (error) {
      console.error('Error fetching references:', error)
    }
  }, [])

  React.useEffect(() => {
    if (!adminLoading && !isAdminUser) {
      router.push('/')
      return
    }
    
    if (isAdminUser) {
      fetchReferences()
    }
  }, [isAdminUser, adminLoading, router, fetchReferences])

  // Show loading or redirect if not admin
  if (adminLoading) {
    return <div>Loading...</div>
  }

  if (!isAdminUser) {
    return null
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validData = results.data.filter((row: any) => 
          row.name_en && row.price
        ) as CSVProduct[]
        setCsvData(validData)
        setImportResult(null)
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
        alert('Error parsing CSV file')
      }
    })
  }

  const downloadTemplate = () => {
    const template = [
      {
        name_en: 'Example Product',
        name_ka: 'მაგალითი პროდუქტი',
        description_en: 'Product description in English',
        description_ka: 'პროდუქტის აღწერა ქართულად',
        price: 99.99,
        currency: 'GEL',
        category_id: 'category-id-here',
        brand_id: 'brand-id-here',
        stock: 100,
        sku: 'PROD-001',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
        sizes: 'S,M,L,XL',
        min_order_quantity: 1
      }
    ]
    
    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const importProducts = async () => {
    if (csvData.length === 0) return

    setImporting(true)
    const result: ImportResult = { success: 0, failed: 0, errors: [] }

    for (const product of csvData) {
      try {
        // Validate required fields (Georgian name is optional)
        if (!product.name_en || !product.price) {
          result.failed++
          result.errors.push(`Missing required fields for product: ${product.name_en || 'Unknown'}`)
          continue
        }

        // Process images array
        const images = product.images ? product.images.split(',').map(img => img.trim()) : []
        
        // Process sizes array
        const sizes = product.sizes ? product.sizes.split(',').map(size => size.trim()) : []

        const productData = {
          name_en: product.name_en,
          name_ka: product.name_ka,
          description_en: product.description_en || '',
          description_ka: product.description_ka || '',
          price: parseFloat(product.price.toString()),
          currency: product.currency || 'GEL',
          category_id: product.category_id || null,
          brand_id: product.brand_id || null,
          stock: parseInt(product.stock?.toString() || '0'),
          sku: product.sku || `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          images: images,
          sizes: sizes,
          min_order_quantity: parseInt(product.min_order_quantity?.toString() || '1'),
          is_active: true,
          is_featured: false
        }

        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) {
          result.failed++
          result.errors.push(`Failed to import ${product.name_en}: ${error.message}`)
        } else {
          result.success++
        }
      } catch (error) {
        result.failed++
        result.errors.push(`Error processing ${product.name_en}: ${error}`)
      }
    }

    setImportResult(result)
    setImporting(false)
    
    if (result.success > 0) {
      setCsvData([]) // Clear the data on successful import
    }
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full opacity-15 blur-xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/admin/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'პროდუქტების მართვაში დაბრუნება' : 'Back to Products'}
          </Link>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {locale === 'ka' ? 'ბულკ იმპორტი' : 'Bulk Product Import'}
            </h1>
            <p className="text-gray-600">
              {locale === 'ka' 
                ? 'CSV ფაილის საშუალებით მრავალი პროდუქტის ერთდროული დამატება' 
                : 'Import multiple products at once using a CSV file'
              }
            </p>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'ka' ? 'ინსტრუქციები' : 'Instructions'}
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">1</span>
              </div>
              <p>{locale === 'ka' ? 'ჩამოტვირთეთ CSV შაბლონი ქვემოთ მოცემული ღილაკის დახმარებით' : 'Download the CSV template using the button below'}</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">2</span>
              </div>
              <p>{locale === 'ka' ? 'შეავსეთ შაბლონი თქვენი პროდუქტების მონაცემებით' : 'Fill the template with your product data'}</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">3</span>
              </div>
              <p>{locale === 'ka' ? 'ატვირთეთ შევსებული CSV ფაილი' : 'Upload the completed CSV file'}</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-semibold text-xs">4</span>
              </div>
              <p>{locale === 'ka' ? 'დააჭირეთ იმპორტის ღილაკს' : 'Click the import button'}</p>
            </div>
          </div>
        </motion.div>

        {/* Download Template */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200"
        >
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {locale === 'ka' ? 'CSV შაბლონი' : 'CSV Template'}
            </h3>
            <p className="text-gray-600 mb-4">
              {locale === 'ka' 
                ? 'ჩამოტვირთეთ შაბლონი სწორი ფორმატის გასაგებად' 
                : 'Download the template to understand the correct format'
              }
            </p>
            <button
              onClick={downloadTemplate}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              <span>{locale === 'ka' ? 'შაბლონის ჩამოტვირთვა' : 'Download Template'}</span>
            </button>
          </div>
        </motion.div>

        {/* File Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'ka' ? 'CSV ფაილის ატვირთვა' : 'Upload CSV File'}
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {locale === 'ka' 
                ? 'აირჩიეთ CSV ფაილი ან გადაიტანეთ აქ' 
                : 'Choose a CSV file or drag and drop here'
              }
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {locale === 'ka' ? 'ფაილის არჩევა' : 'Choose File'}
            </button>
          </div>
        </motion.div>

        {/* Preview Data */}
        {csvData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === 'ka' ? 'მონაცემების წინასწარი ნახვა' : 'Data Preview'}
              </h3>
              <span className="text-sm text-gray-600">
                {csvData.length} {locale === 'ka' ? 'პროდუქტი' : 'products'}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {locale === 'ka' ? 'სახელი (EN)' : 'Name (EN)'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {locale === 'ka' ? 'სახელი (KA)' : 'Name (KA)'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {locale === 'ka' ? 'ფასი' : 'Price'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {locale === 'ka' ? 'მარაგი' : 'Stock'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {csvData.slice(0, 5).map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{product.name_en}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{product.name_ka}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{product.price} {product.currency}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 5 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {locale === 'ka' ? `და კიდევ ${csvData.length - 5} პროდუქტი...` : `and ${csvData.length - 5} more products...`}
                </p>
              )}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={importProducts}
                disabled={importing}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package className="w-5 h-5" />
                <span>
                  {importing 
                    ? (locale === 'ka' ? 'იმპორტირება...' : 'Importing...') 
                    : (locale === 'ka' ? 'პროდუქტების იმპორტი' : 'Import Products')
                  }
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Import Results */}
        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'იმპორტის შედეგები' : 'Import Results'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">
                      {locale === 'ka' ? 'წარმატებული' : 'Successful'}
                    </p>
                    <p className="text-2xl font-bold text-green-900">{importResult.success}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center">
                  <X className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-600">
                      {locale === 'ka' ? 'ვერ მოხერხდა' : 'Failed'}
                    </p>
                    <p className="text-2xl font-bold text-red-900">{importResult.failed}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {locale === 'ka' ? 'შეცდომები:' : 'Errors:'}
                </h4>
                <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700 mb-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {importResult.success > 0 && (
              <div className="mt-4 text-center">
                <Link
                  href="/admin/products"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Package className="w-5 h-5" />
                  <span>{locale === 'ka' ? 'პროდუქტების ნახვა' : 'View Products'}</span>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
