'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

interface BrandCardProps {
  brand: {
    id: string
    name: string
    description: string
    logo: string
    website: string
    country: string
    founded: number
    productCount: number
    categories?: string[]
  }
  locale: 'en' | 'ka'
  className?: string
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, locale, className = '' }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`group ${className}`}
    >
      <Link
        href={`/brands/${brand.id}`}
        className="block h-full bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-200 overflow-hidden"
      >
        <div className="p-8 h-full flex flex-col items-center justify-center text-center min-h-[280px]">
          {/* Big Brand Logo - No Container */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 flex items-center justify-center">
            {(() => {
              // Brand logo mapping
              const brandLogos: { [key: string]: string } = {
                'LOWA': '/lowa-boots-logo.png',
                'Gerber': '/Gerber_Gear_logo.png.webp',
                'Gerber Gear': '/Gerber_Gear_logo.png.webp',
                'Spyderco': '/Spyderco-Logo.png',
                '5.11 Tactical': '/511_tactical_logo.jpg-removebg-preview-2.png',
                '511 Tactical': '/511_tactical_logo.jpg-removebg-preview-2.png',
                'Haix': '/haix-logo.png',
                'HAIX': '/haix-logo.png',
                'Maxpedition': '/maxpedition.png',
                'Cold Steel': '/cold-steel-logo-01_1607027612__33201.original.png',
                'Browning': '/browning-logo-logo-png-transparent.png',
                'Microtech': '/MT-Logo-Simple-Red-1200x628.png.webp'
              };
              const logoSrc = brandLogos[brand.name] || brand.logo;
              
              return logoSrc ? (
                <img
                  src={logoSrc}
                  alt={brand.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-3xl sm:text-4xl">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Brand Name */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-2">
            {brand.name}
          </h3>

          {/* Product Count */}
          <p className="text-sm text-gray-600">
            {brand.productCount} {brand.productCount === 1 ? 'product' : 'products'}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export default BrandCard

