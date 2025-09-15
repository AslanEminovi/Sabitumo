'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { ShoppingCart, Menu, X, User, ChevronDown, LogOut, Settings as SettingsIcon, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useIsAdmin } from '@/lib/admin'
import { useCart } from '@/context/CartContext'
import { BrandsDropdown } from '@/components/BrandsDropdown'

interface UserData {
  id: string
  email?: string
  user_metadata?: {
    first_name?: string
    given_name?: string
    last_name?: string
    family_name?: string
  }
}

export function NavbarNew() {
  const { t, locale, changeLocale } = useTranslation()
  const { isAdminUser } = useIsAdmin()
  const { state: cartState } = useCart()
  
  // Simple state management
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  // Toggle functions
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleLanguageDropdown = () => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen)
  const toggleBrandsDropdown = () => setIsBrandsDropdownOpen(!isBrandsDropdownOpen)
  
  // Refs for outside click detection
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const brandsDropdownRef = useRef<HTMLDivElement>(null)

  // Get user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
      if (brandsDropdownRef.current && !brandsDropdownRef.current.contains(event.target as Node)) {
        setIsBrandsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setIsUserDropdownOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Language options (fixed structure to prevent hydration issues)
  const languages = [
    { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  // Always use Georgian as default during SSR to prevent hydration issues
  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  return (
    <motion.nav 
      className="glass-effect shadow-elegant border-b border-gray-200/50 sticky top-0 z-50 rounded-b-3xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 w-full">
          
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0 min-w-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/sabitumo1.png" 
                alt="Sabitumo Logo" 
                className="h-8 w-8 object-cover rounded-full border-2 border-gray-200 hover:border-emerald-300 transition-colors duration-150"
              />
              <span className="hidden sm:block text-lg font-bold text-primary-900">Sabitumo</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 flex-1 justify-center px-4">
            {/* Home */}
            <Link href="/" className="text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
              {t('navigation', 'home')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
            </Link>

            {/* Shop */}
            <Link href="/shop" className="text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
              {t('navigation', 'shop')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
            </Link>

            {/* New Items */}
            <Link href="/new-items" className="text-orange-500 hover:text-orange-600 px-2 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
              {t('navigation', 'newItems') || 'New Items'}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-200"></span>
            </Link>

            {/* Brands Dropdown */}
            <div className="relative" ref={brandsDropdownRef}>
              <button
                onClick={toggleBrandsDropdown}
                aria-expanded={isBrandsDropdownOpen}
                className="text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200 relative group flex items-center whitespace-nowrap"
              >
                <span>{t('navigation', 'brands')}</span>
                <motion.div
                  animate={{ rotate: isBrandsDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-1 flex items-center"
                >
                  <ChevronDown className="w-4 h-4 text-gray-800" />
                </motion.div>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
              </button>

              <BrandsDropdown
                isOpen={isBrandsDropdownOpen}
                onClose={() => setIsBrandsDropdownOpen(false)}
              />
            </div>

            {/* Categories */}
            <Link href="/categories" className="text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
              {t('navigation', 'categories')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
            </Link>

            {/* About */}
            <Link href="/about" className="text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
              {t('navigation', 'about')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
            </Link>

            {/* Contact */}
            <Link href="/contact" className="text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
              {t('navigation', 'contact')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            
            {/* Language Switcher */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-all duration-200 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md"
              >
                <span className="text-base">{currentLanguage?.flag}</span>
                <span className="hidden sm:block text-sm">{currentLanguage?.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-800" />
              </button>
              
              <AnimatePresence>
                {isLanguageDropdownOpen && (
                  <motion.div 
                    className="absolute right-0 mt-3 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden min-w-48"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="py-2">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            changeLocale(language.code as 'en' | 'ka')
                            setIsLanguageDropdownOpen(false)
                          }}
                          className={`w-full flex items-center space-x-3 px-6 py-3 text-sm transition-all duration-200 ${
                            locale === language.code 
                              ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-500' 
                              : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <span className="text-lg">{language.flag}</span>
                          <span className="font-medium">{language.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile/Login */}
            <div className="relative" ref={userDropdownRef}>
              {user ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {(user.user_metadata?.first_name || user.user_metadata?.given_name || user.email)?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>
              ) : (
                <Link href="/auth/login" className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">{t('navigation', 'login')}</span>
                </Link>
              )}

              {/* User Dropdown */}
              <AnimatePresence>
                {user && isUserDropdownOpen && (
                  <motion.div 
                    className="absolute right-0 mt-3 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden min-w-60"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="py-2">
                      {/* User Info */}
                      <div className="px-6 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.user_metadata?.first_name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <Link href="/dashboard" className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                        <Package className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'დეშბორდი' : 'Dashboard'}</span>
                      </Link>

                      <Link href="/profile" className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                        <User className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'პროფილი' : 'Profile'}</span>
                      </Link>

                      <Link href="/orders" className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                        <Package className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'ჩემი შეკვეთები' : 'My Orders'}</span>
                      </Link>

                      <Link href="/settings" className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                        <SettingsIcon className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'პარამეტრები' : 'Settings'}</span>
                      </Link>

                      {/* Admin Section */}
                      {isAdminUser && (
                        <>
                          <div className="border-t border-gray-200 my-2"></div>
                          <div className="px-6 py-2">
                            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                              {locale === 'ka' ? 'ადმინისტრატორი' : 'ADMIN'}
                            </span>
                          </div>
                          <Link href="/admin/products" className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                            <Package className="w-4 h-4" />
                            <span>{locale === 'ka' ? 'პროდუქტების მართვა' : 'Manage Products'}</span>
                          </Link>
                          <Link href="/admin/analytics" className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                            <SettingsIcon className="w-4 h-4" />
                            <span>{locale === 'ka' ? 'ანალიტიკა' : 'Analytics'}</span>
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'გასვლა' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link 
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors flex items-center"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartState.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-normal">
                  {cartState.totalItems}
                </span>
              )}
            </Link>

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-gray-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md transition-all duration-200">
                  {t('navigation', 'home')}
                </Link>
                <Link href="/shop" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md transition-all duration-200">
                  {t('navigation', 'shop')}
                </Link>
                <Link href="/new-items" className="block px-3 py-2 text-base font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all duration-200">
                  {t('navigation', 'newItems') || 'New Items'}
                </Link>
                <Link href="/categories" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md transition-all duration-200">
                  {t('navigation', 'categories')}
                </Link>
                <Link href="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md transition-all duration-200">
                  {t('navigation', 'about')}
                </Link>
                <Link href="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-md transition-all duration-200">
                  {t('navigation', 'contact')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.nav>
  )
}
