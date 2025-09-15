'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Sword, 
  Shield, 
  Target, 
  Star, 
  Wrench, 
  Compass,
  Zap,
  Package
} from 'lucide-react'

interface Category {
  id: string
  name_en: string
  name_ka: string
  slug: string
}

interface CategorySidebarProps {
  categories: Category[]
  selectedCategoryId: string
  onCategorySelect: (categoryId: string) => void
  locale: 'en' | 'ka'
  className?: string
}

// Minimalist category icons using Lucide React
const getCategoryIcon = (slug: string) => {
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'knives': Sword,
    'tactical-gear': Target,
    'survival-tools': Star,
    'keychains': Package,
    'lighters': Zap,
    'weapons': Zap,
    'gear': Package,
    'tools': Wrench,
    'equipment': Package,
    'accessories': Star,
    'outdoor': Compass,
    'hunting': Target
  }
  
  const IconComponent = iconMap[slug] || Package
  return <IconComponent className="w-5 h-5" />
}

export function CategorySidebar({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect, 
  locale,
  className = '' 
}: CategorySidebarProps) {
  return (
    <div className={`bg-gradient-to-b from-white to-gray-50/50 h-full flex flex-col shadow-lg border-r border-gray-200/50 ${className}`}>

      {/* All Categories Option */}
      <div className="p-4 pt-6">
        <button
          onClick={() => onCategorySelect('')}
          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center space-x-3 rounded-lg ${
            selectedCategoryId === '' 
              ? 'text-amber-700 bg-amber-50 border border-amber-200' 
              : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            selectedCategoryId === '' 
              ? 'bg-amber-100 text-amber-600' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            <Package className="w-4 h-4" />
          </div>
          <span>
            {locale === 'ka' ? 'ყველა კატეგორია' : 'All Categories'}
          </span>
        </button>
      </div>

      {/* Category List */}
      <div className="flex-1 px-4 pb-6 space-y-2 overflow-y-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center space-x-3 rounded-lg ${
              selectedCategoryId === category.id 
                ? 'text-amber-700 bg-amber-50 border border-amber-200' 
                : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              selectedCategoryId === category.id 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {getCategoryIcon(category.slug)}
            </div>
            <span className="truncate">
              {locale === 'ka' ? category.name_ka : category.name_en}
            </span>
          </button>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-center text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="w-3 h-3 text-amber-400" />
            <span>{locale === 'ka' ? 'პრემიუმ ხარისხი' : 'Premium Quality'}</span>
          </div>
          <div className="text-gray-400">
            {categories.length} {locale === 'ka' ? 'კატეგორია' : 'categories'}
          </div>
        </div>
      </div>
    </div>
  )
}
