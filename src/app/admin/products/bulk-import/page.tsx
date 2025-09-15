'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useIsAdmin } from '@/lib/admin'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Package,
  RefreshCw,
  Eye,
  Trash2,
  Play,
  Pause,
  SkipForward,
  AlertTriangle,
  Info,
  Zap,
  Clock,
  Target
} from 'lucide-react'
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
  warnings: string[]
  skipped: number
}

interface ValidationError {
  row: number
  field: string
  message: string
  severity: 'error' | 'warning'
}

export default function BulkImportPage() {
  const { t, locale } = useTranslation()
  const { isAdminUser, loading: adminLoading } = useIsAdmin()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [csvData, setCsvData] = useState<CSVProduct[]>([])
  const [importing, setImporting] = useState(false)
  const [validating, setValidating] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<'upload' | 'validate' | 'preview' | 'import' | 'complete'>('upload')

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
    if (isAdminUser) {
      fetchReferences()
    } else if (!adminLoading && !isAdminUser) {
      router.push('/')
    }
  }, [isAdminUser, adminLoading, router, fetchReferences])

  const downloadTemplate = () => {
    const template = [
      {
        name_en: 'Sample Product',
        name_ka: 'სანიმუშო პროდუქტი',
        description_en: 'This is a sample product description',
        description_ka: 'ეს არის სანიმუშო პროდუქტის აღწერა',
        price: 99.99,
        currency: 'GEL',
        category_id: 'category-uuid-here',
        brand_id: 'brand-uuid-here',
        stock: 100,
        sku: 'SAMPLE-001',
        images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
        sizes: 'S,M,L,XL',
        min_order_quantity: 1
      }
    ]

    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVProduct[]
        setCsvData(data)
        setCurrentStep('validate')
        validateData(data)
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        alert(locale === 'ka' ? 'CSV ფაილის წაკითხვის შეცდომა' : 'Error parsing CSV file')
      }
    })
  }

  const validateData = async (data: CSVProduct[]) => {
    setValidating(true)
    const errors: ValidationError[] = []
    
    data.forEach((row, index) => {
      const rowNum = index + 1

      // Required field validation
      if (!row.name_en?.trim()) {
        errors.push({
          row: rowNum,
          field: 'name_en',
          message: 'English name is required',
          severity: 'error'
        })
      }

      if (!row.name_ka?.trim()) {
        errors.push({
          row: rowNum,
          field: 'name_ka',
          message: 'Georgian name is required',
          severity: 'error'
        })
      }

      if (!row.price || row.price <= 0) {
        errors.push({
          row: rowNum,
          field: 'price',
          message: 'Valid price is required',
          severity: 'error'
        })
      }

      if (!row.sku?.trim()) {
        errors.push({
          row: rowNum,
          field: 'sku',
          message: 'SKU is required',
          severity: 'error'
        })
      }

      // Category validation
      if (row.category_id && !categories.find(c => c.id === row.category_id)) {
        errors.push({
          row: rowNum,
          field: 'category_id',
          message: 'Invalid category ID',
          severity: 'warning'
        })
      }

      // Brand validation
      if (row.brand_id && !brands.find(b => b.id === row.brand_id)) {
        errors.push({
          row: rowNum,
          field: 'brand_id',
          message: 'Invalid brand ID',
          severity: 'warning'
        })
      }

      // Stock validation
      if (row.stock < 0) {
        errors.push({
          row: rowNum,
          field: 'stock',
          message: 'Stock cannot be negative',
          severity: 'warning'
        })
      }
    })

    setValidationErrors(errors)
    setValidating(false)
    
    if (errors.filter(e => e.severity === 'error').length === 0) {
      setCurrentStep('preview')
    }
  }

  const importProducts = async () => {
    if (!csvData.length) return

    setImporting(true)
    setImportProgress(0)
    setCurrentStep('import')
    
    const results: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      warnings: [],
      skipped: 0
    }

    try {
      for (let i = 0; i < csvData.length; i++) {
        const product = csvData[i]
        setImportProgress(((i + 1) / csvData.length) * 100)

        try {
          // Check if product with same SKU exists
          const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('sku', product.sku)
            .single()

          if (existingProduct) {
            results.skipped++
            results.warnings.push(`Row ${i + 1}: Product with SKU ${product.sku} already exists`)
            continue
          }

          // Prepare product data
          const productData = {
            name_en: product.name_en,
            name_ka: product.name_ka,
            description_en: product.description_en || '',
            description_ka: product.description_ka || '',
            price: parseFloat(product.price.toString()),
            currency: product.currency || 'GEL',
            category_id: product.category_id || null,
            brand_id: product.brand_id || null,
            stock: parseInt(product.stock.toString()) || 0,
            sku: product.sku,
            images: product.images ? product.images.split(',').map(img => img.trim()) : [],
            sizes: product.sizes ? product.sizes.split(',').map(size => size.trim()) : [],
            min_order_quantity: parseInt(product.min_order_quantity?.toString()) || 1,
            is_active: true,
            is_featured: false,
            is_new_arrival: false,
            is_bestseller: false
          }

          const { error } = await supabase
            .from('products')
            .insert([productData])

          if (error) {
            results.failed++
            results.errors.push(`Row ${i + 1}: ${error.message}`)
          } else {
            results.success++
          }
        } catch (error) {
          results.failed++
          results.errors.push(`Row ${i + 1}: ${error}`)
        }

        // Small delay to prevent overwhelming the database
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setImportResult(results)
      setImporting(false)
      setImportProgress(100)
      setCurrentStep('complete')
    }
  }

  const resetImport = () => {
    setCsvData([])
    setImportResult(null)
    setValidationErrors([])
    setImportProgress(0)
    setCurrentStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!isAdminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/products" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {locale === 'ka' ? 'ბალკ იმპორტი' : 'Bulk Import'}
                </h1>
                <p className="text-sm text-gray-600">
                  {locale === 'ka' ? 'CSV ფაილიდან პროდუქტების იმპორტი' : 'Import products from CSV file'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{locale === 'ka' ? 'შაბლონი' : 'Template'}</span>
              </button>
              
              {currentStep !== 'upload' && (
                <button
                  onClick={resetImport}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{locale === 'ka' ? 'თავიდან დაწყება' : 'Start Over'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: 'upload', label: locale === 'ka' ? 'ატვირთვა' : 'Upload', icon: Upload },
              { key: 'validate', label: locale === 'ka' ? 'ვალიდაცია' : 'Validate', icon: CheckCircle },
              { key: 'preview', label: locale === 'ka' ? 'გადახედვა' : 'Preview', icon: Eye },
              { key: 'import', label: locale === 'ka' ? 'იმპორტი' : 'Import', icon: Play },
              { key: 'complete', label: locale === 'ka' ? 'დასრულება' : 'Complete', icon: Target }
            ].map((step, index) => {
              const IconComponent = step.icon
              const isActive = currentStep === step.key
              const isCompleted = ['upload', 'validate', 'preview', 'import'].indexOf(step.key) < ['upload', 'validate', 'preview', 'import', 'complete'].indexOf(currentStep)
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 4 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Upload Step */}
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8"
            >
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <Upload className="w-12 h-12 text-emerald-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {locale === 'ka' ? 'CSV ფაილის ატვირთვა' : 'Upload CSV File'}
                </h2>
                
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  {locale === 'ka' 
                    ? 'აირჩიეთ CSV ფაილი პროდუქტების ბალკ იმპორტისთვის. დარწმუნდით, რომ ფაილი შეესაბამება ჩვენს შაბლონს.'
                    : 'Choose a CSV file to bulk import products. Make sure your file follows our template format.'
                  }
                </p>

                <div className="max-w-md mx-auto">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">
                          {locale === 'ka' ? 'დააჭირეთ ატვირთვისთვის' : 'Click to upload'}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">CSV files only</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-left">
                      <h4 className="font-medium text-blue-900 mb-2">
                        {locale === 'ka' ? 'მნიშვნელოვანი ინფორმაცია' : 'Important Information'}
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• {locale === 'ka' ? 'გამოიყენეთ მხოლოდ CSV ფორმატი' : 'Use CSV format only'}</li>
                        <li>• {locale === 'ka' ? 'ჩამოტვირთეთ შაბლონი სწორი ფორმატისთვის' : 'Download template for correct format'}</li>
                        <li>• {locale === 'ka' ? 'დარწმუნდით, რომ SKU უნიკალურია' : 'Ensure SKUs are unique'}</li>
                        <li>• {locale === 'ka' ? 'სურათების URL-ები უნდა იყოს ვალიდური' : 'Image URLs must be valid'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Validation Step */}
          {currentStep === 'validate' && (
            <motion.div
              key="validate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8"
            >
              <div className="text-center mb-8">
                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  {validating ? (
                    <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
                  ) : (
                    <CheckCircle className="w-12 h-12 text-blue-500" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {locale === 'ka' ? 'მონაცემების ვალიდაცია' : 'Data Validation'}
                </h2>
                
                {validating ? (
                  <p className="text-gray-600">
                    {locale === 'ka' ? 'მონაცემების შემოწმება...' : 'Validating your data...'}
                  </p>
                ) : (
                  <p className="text-gray-600">
                    {locale === 'ka' ? 'ვალიდაცია დასრულდა' : 'Validation completed'}
                  </p>
                )}
              </div>

              {!validating && validationErrors.length > 0 && (
                <div className="mb-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      <h3 className="font-semibold text-red-800">
                        {locale === 'ka' ? 'ვალიდაციის შეცდომები' : 'Validation Errors'}
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {validationErrors.map((error, index) => (
                        <div key={index} className={`text-sm p-2 rounded ${
                          error.severity === 'error' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <strong>Row {error.row}, {error.field}:</strong> {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!validating && validationErrors.filter(e => e.severity === 'error').length === 0 && (
                <div className="text-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                    <p className="text-emerald-800 font-medium">
                      {locale === 'ka' ? 'ვალიდაცია წარმატებით დასრულდა!' : 'Validation passed successfully!'}
                    </p>
                    <p className="text-emerald-700 text-sm mt-2">
                      {csvData.length} {locale === 'ka' ? 'პროდუქტი მზადაა იმპორტისთვის' : 'products ready for import'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setCurrentStep('preview')}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {locale === 'ka' ? 'გადახედვა' : 'Preview Data'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {locale === 'ka' ? 'მონაცემების გადახედვა' : 'Data Preview'}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {csvData.length} {locale === 'ka' ? 'პროდუქტი' : 'products'}
                  </span>
                  <button
                    onClick={importProducts}
                    disabled={importing}
                    className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>{locale === 'ka' ? 'იმპორტის დაწყება' : 'Start Import'}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ka' ? 'სახელი' : 'Name'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ka' ? 'ფასი' : 'Price'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {locale === 'ka' ? 'მარაგი' : 'Stock'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.slice(0, 10).map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {locale === 'ka' ? product.name_ka : product.name_en}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {product.price} {product.currency || 'GEL'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{product.sku}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {csvData.length > 10 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    {locale === 'ka' ? 'და კიდევ' : 'and'} {csvData.length - 10} {locale === 'ka' ? 'მეტი...' : 'more...'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Import Step */}
          {currentStep === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8"
            >
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-12 h-12 text-blue-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {locale === 'ka' ? 'პროდუქტების იმპორტი' : 'Importing Products'}
                </h2>
                
                <p className="text-gray-600 mb-8">
                  {locale === 'ka' ? 'გთხოვთ მოიცადოთ...' : 'Please wait while we import your products...'}
                </p>

                <div className="max-w-md mx-auto mb-6">
                  <div className="bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-emerald-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {Math.round(importProgress)}% {locale === 'ka' ? 'დასრულდა' : 'complete'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && importResult && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8"
            >
              <div className="text-center mb-8">
                <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {locale === 'ka' ? 'იმპორტი დასრულდა!' : 'Import Complete!'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-emerald-50 rounded-lg p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-emerald-600">{importResult.success}</p>
                  <p className="text-sm text-emerald-700">
                    {locale === 'ka' ? 'წარმატებული' : 'Successful'}
                  </p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-6 text-center">
                  <X className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                  <p className="text-sm text-red-700">
                    {locale === 'ka' ? 'წარუმატებელი' : 'Failed'}
                  </p>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-amber-600">{importResult.skipped}</p>
                  <p className="text-sm text-amber-700">
                    {locale === 'ka' ? 'გამოტოვებული' : 'Skipped'}
                  </p>
                </div>
              </div>

              {(importResult.errors.length > 0 || importResult.warnings.length > 0) && (
                <div className="space-y-4 mb-8">
                  {importResult.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">
                        {locale === 'ka' ? 'შეცდომები' : 'Errors'}
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResult.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700">{error}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {importResult.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-800 mb-2">
                        {locale === 'ka' ? 'გაფრთხილებები' : 'Warnings'}
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResult.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-amber-700">{warning}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Link
                  href="/admin/products"
                  className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {locale === 'ka' ? 'პროდუქტების ნახვა' : 'View Products'}
                </Link>
                
                <button
                  onClick={resetImport}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {locale === 'ka' ? 'ახალი იმპორტი' : 'New Import'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}