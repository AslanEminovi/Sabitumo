'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { ShoppingCart, Menu, X, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { BrandsDropdown } from '@/components/BrandsDropdown'

const languages = [
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

export function Navbar() {
  const { t, locale, changeLocale } = useTranslation()
  const { state: cartState } = useCart()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false)

  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const brandsDropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find(l => l.code === locale)
  const cartCount = Number(cartState.totalItems || 0)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: logo and mobile toggle */}
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMenuOpen(v => !v)} className="md:hidden p-2 text-gray-700 hover:text-amber-600" aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <img src="/sabitumo1.png" alt="Sabitumo" className="h-8 w-auto" />
              <span className="hidden sm:block text-lg font-semibold text-gray-900">Sabitumo</span>
            </Link>
          </div>

          {/* Center: primary nav */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-6 flex-wrap">
              <Link href="/" className="text-gray-700 hover:text-amber-600 text-sm font-medium relative group whitespace-nowrap">
                {t('navigation', 'home')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/shop" className="text-gray-700 hover:text-amber-600 text-sm font-medium relative group whitespace-nowrap">
                {t('navigation', 'shop')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
              </Link>
              <div className="relative" ref={brandsDropdownRef}>
                <button onClick={() => setIsBrandsDropdownOpen(v => !v)} className="text-gray-700 hover:text-amber-600 text-sm font-medium flex items-center whitespace-nowrap">
                  {t('navigation', 'brands')}
                  <ChevronDown className="w-4 h-4 ml-1 text-gray-700" />
                </button>
                {/* The dropdown is positioned by the component itself; we keep it open state controlled here */}
                <BrandsDropdown isOpen={isBrandsDropdownOpen} onClose={() => setIsBrandsDropdownOpen(false)} />
              </div>
            </div>
          </div>

          {/* Right: language, user, cart */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={languageDropdownRef}>
              <button onClick={() => setIsLanguageDropdownOpen(v => !v)} className="px-2 py-1 text-sm text-gray-700 hover:text-amber-600 flex items-center gap-2">
                <span className="text-lg">{currentLanguage?.flag}</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              <AnimatePresence>
                {isLanguageDropdownOpen && (
                  <motion.div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden min-w-40"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}>
                    {languages.map(l => (
                      <button key={l.code} onClick={() => { changeLocale(l.code as 'en' | 'ka'); setIsLanguageDropdownOpen(false) }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm ${locale === l.code ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'}`}>
                        <span className="text-lg">{l.flag}</span>
                        <span className="font-medium">{l.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/auth/login" className="p-2 text-gray-700 hover:text-amber-600">
              <User className="w-6 h-6" />
            </Link>

            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-amber-600">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div className="md:hidden border-t border-gray-200 bg-white px-4 py-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}>
            <div className="space-y-2">
              <Link href="/" className="block px-2 py-2 text-gray-700 hover:text-amber-600 text-sm">{t('navigation', 'home')}</Link>
              <Link href="/shop" className="block px-2 py-2 text-gray-700 hover:text-amber-600 text-sm">{t('navigation', 'shop')}</Link>
              <button onClick={() => setIsBrandsDropdownOpen(v => !v)} className="w-full text-left px-2 py-2 text-gray-700 hover:text-amber-600 text-sm flex items-center">
                {t('navigation', 'brands')}
                <ChevronDown className="w-4 h-4 ml-1 text-gray-600" />
              </button>
              {isBrandsDropdownOpen && (
                <div className="pl-2">
                  <BrandsDropdown isOpen={isBrandsDropdownOpen} onClose={() => setIsBrandsDropdownOpen(false)} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}