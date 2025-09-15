'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, GripVertical, Star } from 'lucide-react'
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

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  initialImages?: string[]
  maxImages?: number
  multiple?: boolean
  className?: string
}

export function ImageUpload({ 
  onImagesChange, 
  initialImages = [], 
  maxImages = 5, 
  multiple = true,
  className = '' 
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return

    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a valid image type. Please use JPEG, PNG, or WebP.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const filesToProcess = multiple 
      ? validFiles.slice(0, maxImages - images.length)
      : validFiles.slice(0, 1)

    setUploading(true)

    try {
      const newImages: string[] = []
      
      for (const file of filesToProcess) {
        // Convert to base64 for preview (in real app, you'd upload to Supabase Storage)
        const reader = new FileReader()
        const result = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        newImages.push(result)
      }

      const updatedImages = multiple ? [...images, ...newImages] : newImages
      setImages(updatedImages)
      onImagesChange(updatedImages)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Error uploading images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
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
      const oldIndex = images.findIndex((_, index) => `image-${index}` === active.id)
      const newIndex = images.findIndex((_, index) => `image-${index}` === over?.id)
      
      const newImages = arrayMove(images, oldIndex, newIndex)
      setImages(newImages)
      onImagesChange(newImages)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

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
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 touch-manipulation ${
          index === 0 
            ? 'border-amber-400 shadow-lg' 
            : 'border-gray-200 hover:border-amber-300'
        } ${isDragging ? 'rotate-3 scale-105 z-50 shadow-2xl opacity-50' : ''}`}
      >
        {/* Thumbnail Badge */}
        {index === 0 && (
          <div className="absolute -top-2 -left-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10 shadow-lg">
            <Star className="w-3 h-3 fill-current" />
          </div>
        )}
        
        {/* Drag Handle - Always visible on mobile, hover on desktop */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 bg-black/50 text-white rounded p-2 sm:p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 touch-manipulation"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <GripVertical className="w-4 h-4 sm:w-3 sm:h-3" />
        </div>
        
        <img
          src={image}
          alt={`Upload ${index + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Remove Button - Always visible on mobile, hover on desktop */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2 right-2 w-8 h-8 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 touch-manipulation"
          style={{ minWidth: '44px', minHeight: '44px' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4 sm:w-3 sm:h-3" />
        </motion.button>

        {/* Order Number */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white rounded px-2 py-1 text-xs font-medium">
          {index + 1}
        </div>

        {/* Image overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
      </motion.div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files)}
        className="hidden"
      />

      {/* Upload Area */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-300 touch-manipulation ${
          dragActive 
            ? 'border-amber-500 bg-amber-50' 
            : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors ${
            dragActive ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-600"></div>
            ) : (
              <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <p className="text-base sm:text-lg font-medium text-gray-900 mb-1">
              {uploading ? 'Uploading...' : (
                <span>
                  <span className="block sm:hidden">Tap to browse images</span>
                  <span className="hidden sm:block">Drop images here or click to browse</span>
                </span>
              )}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {multiple 
                ? `Up to ${maxImages} images • Max 5MB each`
                : 'Single image • Max 5MB'
              }
            </p>
            <p className="text-xs text-gray-400">
              JPEG, PNG, WebP supported
            </p>
          </div>
        </div>
      </motion.div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-1 sm:space-y-0">
            <p className="text-sm font-medium text-gray-700">
              Uploaded Images ({images.length}/{maxImages})
            </p>
            <p className="text-xs text-gray-500">
              <span className="block sm:hidden">Touch & drag to reorder</span>
              <span className="hidden sm:block">Drag to reorder</span>
            </p>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map((_, index) => `image-${index}`)} strategy={horizontalListSortingStrategy}>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                <AnimatePresence>
                  {images.map((image, index) => (
                    <SortableImageItem
                      key={`image-${index}`}
                      image={image}
                      index={index}
                      onRemove={() => removeImage(index)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
          
          {/* Instructions */}
          {images.length > 1 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium mb-1">
                    Thumbnail Image
                  </p>
                  <p className="text-amber-700">
                    The first image (with star) will appear as the main thumbnail on all pages
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add More Button (when multiple is true and not at max) */}
      {multiple && images.length > 0 && images.length < maxImages && (
        <motion.button
          onClick={openFileDialog}
          className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <ImageIcon className="w-5 h-5" />
          <span>Add More Images ({maxImages - images.length} remaining)</span>
        </motion.button>
      )}
    </div>
  )
}



