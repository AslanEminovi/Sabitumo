'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GoArrowUpRight } from 'react-icons/go'
import { 
  ChevronRight
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// Custom 5.11 Tactical Logo Component
const FiveElevenLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Image
    src="/511_tactical_logo.jpg-removebg-preview-2.png"
    alt="5.11 Tactical"
    width={80}
    height={80}
    className={className}
  />
)

// Custom Cold Steel Logo Component
const ColdSteelLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Image
    src="/cold-steel-logo-01_1607027612__33201.original.png"
    alt="Cold Steel"
    width={64}
    height={64}
    className={className}
  />
)

// Custom Lowa Boots Logo Component
const LowaBootsLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Image
    src="/lowa-boots-logo.png"
    alt="Lowa Boots"
    width={80}
    height={80}
    className={className}
  />
)

// Custom CRKT Logo Component
const CRKTLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Image
    src="/uahhfaajcydbz3ynx8pb__45906.webp"
    alt="CRKT"
    width={80}
    height={80}
    className={className}
  />
)

// Custom Gerber Logo Component
const GerberLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Image
    src="/Gerber_Gear_logo.png.webp"
    alt="Gerber"
    width={80}
    height={80}
    className={className}
  />
)

// Custom Haix Logo Component
const HaixLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Image
    src="/haix-logo.png"
    alt="Haix"
    width={80}
    height={80}
    className={className}
  />
)

// Custom Maxpedition Logo Component
const MaxpeditionLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Image
    src="/maxpedition.png"
    alt="Maxpedition"
    width={80}
    height={80}
    className={className}
  />
)

// Custom Spyderco Logo Component
const SpydercoLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Image
    src="/Spyderco-Logo.png"
    alt="Spyderco"
    width={80}
    height={80}
    className={className}
  />
)

interface Brand {
  id: string
  name: string
  slug: string
  description_en?: string
  description_ka?: string
  logo?: string
  productCount: number
  icon?: React.ComponentType<{ className?: string }>
}

interface BrandsDropdownProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export const BrandsDropdown: React.FC<BrandsDropdownProps> = ({ 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  const { t, locale } = useTranslation()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch brands with product counts from database
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        
        // Get all brands for dropdown, limit to 6
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name')
          .limit(6)

        if (brandsError) throw brandsError

        // Get product counts for each brand
        const brandsWithCounts = await Promise.all(
          (brandsData || []).map(async (brand) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('brand_id', brand.id)
              .eq('is_active', true)

            // Get corresponding icon component
            const getIcon = (brandName: string) => {
              switch (brandName) {
                case 'Gerber': return GerberLogo
                case '5.11 Tactical': return FiveElevenLogo
                case 'Cold Steel': return ColdSteelLogo
                case 'LOWA': return LowaBootsLogo
                case 'Haix': return HaixLogo
                case 'Maxpedition': return MaxpeditionLogo
                case 'Spyderco': return SpydercoLogo
                default: return undefined
              }
            }

            return {
              ...brand,
              productCount: count || 0,
              icon: getIcon(brand.name)
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

    if (isOpen) {
      fetchBrands()
    }
  }, [isOpen])

  // Note: Click-outside handling is managed by the parent Navbar component

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className={`fixed top-16 left-1/2 transform -translate-x-1/2 w-screen max-w-5xl mx-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-1 ${className}`}
          initial={{ opacity: 0, y: -15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.9 }}
          transition={{ 
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
        <div className="p-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ka' ? 'ბრენდები' : 'Brands'}
            </h3>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-6 gap-4 justify-items-center items-center w-full">
            {loading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <div key={index} className="flex flex-col items-center p-3 animate-pulse min-h-[200px] justify-center rounded-xl">
                  <div className="w-32 h-32 mb-4 bg-gray-200 rounded-xl"></div>
                  <div className="h-4 w-16 mb-2 bg-gray-200 rounded"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : brands.length > 0 ? (
              brands.map((brand, index) => {
                const BrandIcon = brand.icon
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
                }
                const logoSrc = brandLogos[brand.name] || brand.logo

                return (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
            <Link
              href={`/brands/${brand.slug}`}
              className="group flex flex-col items-center justify-center p-3 transition-all duration-300 hover:scale-105 w-full h-full min-h-[200px] rounded-xl hover:bg-gray-50"
              onClick={onClose}
            >
              {/* Brand Logo */}
              <div className="mb-4 flex justify-center items-center w-full h-32">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={brand.name}
                    className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image failed to load:', logoSrc, 'for brand:', brand.name)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium text-center">{brand.name}</span>
                  </div>
                )}
              </div>
              
              {/* Brand Name */}
              <h4 className="text-sm font-semibold text-gray-900 text-center mb-2 group-hover:text-amber-600 transition-colors w-full leading-tight min-h-[20px]">
                {brand.name}
              </h4>
              
              {/* Real Product Count */}
              <p className="text-xs text-gray-500 text-center leading-tight w-full">
                {brand.productCount} {locale === 'ka' ? 'პროდუქტი' : 'products'}
              </p>
            </Link>
                  </motion.div>
                )
              })
            ) : (
              <div className="col-span-6 text-center py-8">
                <p className="text-gray-500">{locale === 'ka' ? 'ბრენდები ვერ მოიძებნა' : 'No brands found'}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/brands"
              className="inline-flex items-center space-x-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition-all duration-200 group"
              onClick={onClose}
            >
              <span>{locale === 'ka' ? 'ყველა ბრენდის ნახვა' : 'View All Brands'}</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BrandsDropdown
