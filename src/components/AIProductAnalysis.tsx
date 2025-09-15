'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Upload, Zap, Brain, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

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

interface AIProductAnalysisProps {
  onAnalysisComplete: (result: AIAnalysisResult) => void
  onClose: () => void
}

export const AIProductAnalysis: React.FC<AIProductAnalysisProps> = ({
  onAnalysisComplete,
  onClose
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return
    
    const newImages = Array.from(files).slice(0, 5) // Limit to 5 images
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 5))
    setError(null)
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const analyzeProduct = async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload at least one image')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Convert images to base64
      const imagePromises = uploadedImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })

      const base64Images = await Promise.all(imagePromises)

      // Call AI analysis API
      const response = await fetch('/api/ai-analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: base64Images
        })
      })

      if (!response.ok) {
        throw new Error('AI analysis failed')
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('AI Analysis error:', error)
      setError('AI analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applyAnalysis = () => {
    if (analysisResult) {
      onAnalysisComplete(analysisResult)
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Product Analysis</h2>
              <p className="text-purple-100">Upload images and let AI analyze your product automatically</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Product Images</span>
            </h3>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drop images here or click to browse</p>
              <p className="text-sm text-gray-500">Support for up to 5 images. JPEG, PNG, WebP formats.</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </div>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Button */}
          <div className="flex justify-center">
            <button
              onClick={analyzeProduct}
              disabled={uploadedImages.length === 0 || isAnalyzing}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                uploadedImages.length === 0 || isAnalyzing
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6" />
                  <span>Analyze Product</span>
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Analysis Results */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">
                    Analysis complete! Confidence: {Math.round(analysisResult.confidence * 100)}%
                  </span>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Product Names</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">English Name</label>
                        <p className="font-medium">{analysisResult.name_en}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Georgian Name</label>
                        <p className="font-medium">{analysisResult.name_ka}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Category & Brand</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Brand</label>
                        <p className="font-medium">{analysisResult.brand}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Category</label>
                        <p className="font-medium">{analysisResult.category}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Subcategory</label>
                        <p className="font-medium">{analysisResult.subcategory}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Product Details</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Material</label>
                        <p className="font-medium">{analysisResult.material}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Color</label>
                        <p className="font-medium">{analysisResult.color}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Weight</label>
                        <p className="font-medium">{analysisResult.weight}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Tags & Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Descriptions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">English Description</label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{analysisResult.description_en}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Georgian Description</label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{analysisResult.description_ka}</p>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyAnalysis}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Apply Analysis</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AIProductAnalysis

