'use client'

import { useState, useEffect, useRef } from 'react'
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

export function Navbar() {
  const { t, locale, changeLocale } = useTranslation()
  const { isAdminUser } = useIsAdmin()
  const { state: cartState } = useCart()
  
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Refs
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const brandsDropdownRef = useRef<HTMLDivElement>(null)

  // Ensure we're on client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Toggle functions
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleLanguageDropdown = () => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen)

  // Authentication effect - only run on client
  useEffect(() => {
    if (!isClient) return

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
        setUser(null)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [isClient])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setIsUserDropdownOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!isClient) return

    function handleClickOutside(event: MouseEvent) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
      if (brandsDropdownRef.current && !brandsDropdownRef.current.contains(event.target as Node)) {
        setIsBrandsDropdownOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    if (isBrandsDropdownOpen || isLanguageDropdownOpen || isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isBrandsDropdownOpen, isLanguageDropdownOpen, isUserDropdownOpen, isClient])

  const languages = [
    { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  const currentLanguage = languages.find(lang => lang.code === locale)

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  }

  // Safe cart count - prevent hydration issues
  const [cartCount, setCartCount] = useState(0)
  
  // Update cart count only on client side after hydration
  useEffect(() => {
    if (isClient) {
      setCartCount(cartState.totalItems)
    }
  }, [isClient, cartState.totalItems])

  return (
    <motion.nav 
      className="glass-effect shadow-elegant border-b border-gray-200/50 sticky top-0 z-50 rounded-b-3xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - New Items Button */}
          <div className="flex items-center">
            <motion.div
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 * 0.1 }}
              className="hidden sm:block mr-12"
            >
              <Link 
                href="/new-items" 
                className="text-orange-500 hover:text-orange-600 px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 relative group border-2 border-orange-500 rounded-full hover:border-orange-600 whitespace-nowrap hover:shadow-md"
              >
                {t('navigation', 'newItems') || 'New Items'}
              </Link>
            </motion.div>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-2">
                  <img 
                    src="/sabitumo1.png" 
                    alt="Sabitumo Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-base sm:text-lg font-bold text-primary-900 whitespace-nowrap">Sabitumo</span>
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-6 flex items-baseline space-x-6">
              {/* Home */}
              <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0 * 0.1 }}>
                <Link href="/" className="text-gray-700 hover:text-primary-900 px-3 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
                  {t('navigation', 'home')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
                </Link>
              </motion.div>

              {/* Shop */}
              <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 1 * 0.1 }}>
                <Link href="/shop" className="text-gray-700 hover:text-primary-900 px-3 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
                  {t('navigation', 'shop')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
                </Link>
              </motion.div>

              {/* Brands Dropdown */}
              <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 2 * 0.1 }} className="relative" ref={brandsDropdownRef}>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsBrandsDropdownOpen(prev => !prev)
                  }}
                  aria-expanded={isBrandsDropdownOpen}
                  className="text-gray-700 hover:text-primary-900 px-3 py-2 text-sm font-medium transition-all duration-200 relative group flex items-center space-x-1 whitespace-nowrap"
                >
                  <span>{t('navigation', 'brands')}</span>
                  <motion.div
                    animate={{ rotate: isBrandsDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-800 group-hover:text-amber-600" />
                  </motion.div>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
                </button>

                <BrandsDropdown
                  isOpen={isBrandsDropdownOpen}
                  onClose={() => setIsBrandsDropdownOpen(false)}
                />
              </motion.div>

              {/* Categories */}
              <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 3 * 0.1 }}>
                <Link href="/categories" className="text-gray-700 hover:text-primary-900 px-3 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
                  {t('navigation', 'categories')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
                </Link>
              </motion.div>

              {/* About */}
              <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 4 * 0.1 }}>
                <Link href="/about" className="text-gray-700 hover:text-primary-900 px-3 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
                  {t('navigation', 'about')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
                </Link>
              </motion.div>

              {/* Contact */}
              <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 5 * 0.1 }}>
                <Link href="/contact" className="text-gray-700 hover:text-primary-900 px-3 py-2 text-sm font-medium transition-all duration-200 relative group whitespace-nowrap">
                  {t('navigation', 'contact')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-200"></span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center justify-end space-x-4">
            {/* Language Switcher Dropdown */}
            <motion.div className="relative" ref={languageDropdownRef}>
              <motion.button
                onClick={toggleLanguageDropdown}
                className="group flex items-center space-x-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm hover:bg-gray-50 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{currentLanguage?.flag}</span>
                <span className="text-gray-700 font-medium">{currentLanguage?.name}</span>
                <motion.div
                  animate={{ rotate: isLanguageDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-800 group-hover:text-amber-600" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {isLanguageDropdownOpen && (
                  <motion.div 
                    className="absolute right-0 mt-3 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden min-w-48"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2 }}
                  >
                    <div className="py-2">
                      {languages.map((language) => (
                        <motion.button
                          key={language.code}
                          onClick={() => {
                            changeLocale(language.code as 'en' | 'ka')
                            setIsLanguageDropdownOpen(false)
                          }}
                          className={`w-full flex items-center space-x-3 px-6 py-3 text-sm transition-all duration-200 group ${
                            locale === language.code 
                              ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-500' 
                              : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-lg">{language.flag}</span>
                          <span className="font-medium">{language.name}</span>
                          {locale === language.code && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto"
                            >
                              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* User Account */}
            <div className="relative" ref={userDropdownRef}>
              {user ? (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <button
                    onClick={toggleUserDropdown}
                    className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {(user.user_metadata?.first_name || user.user_metadata?.given_name || user.email)?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/auth/login" className="group flex items-center space-x-2 text-gray-700 hover:text-amber-600 px-2 py-2 text-sm font-medium transition-all duration-200 relative border-b-2 border-transparent hover:border-amber-500 whitespace-nowrap">
                    <User className="w-4 h-4 text-gray-600 group-hover:text-amber-600" />
                    <span className="font-medium hidden sm:block">{t('navigation', 'login')}</span>
                  </Link>
                </motion.div>
              )}

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserDropdownOpen && user && (
                  <motion.div
                    className="absolute right-0 mt-3 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                    style={{ 
                      minWidth: '280px',
                      width: 'max-content',
                      maxWidth: '400px'
                    }}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* User Info Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {(user.user_metadata?.first_name || user.user_metadata?.given_name || user.email)?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.user_metadata?.first_name || user.user_metadata?.given_name ? 
                              `${user.user_metadata?.first_name || user.user_metadata?.given_name} ${user.user_metadata?.last_name || user.user_metadata?.family_name || ''}`.trim() :
                              'User'
                            }
                          </p>
                          <p className="text-xs text-gray-600 truncate" title={user.email}>
                            {user.email}
                          </p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-500">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Dashboard */}
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="font-medium">{locale === 'ka' ? 'დეშბორდი' : 'Dashboard'}</span>
                        </Link>
                      </motion.div>

                      {/* Profile */}
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">{locale === 'ka' ? 'პროფილი' : 'Profile'}</span>
                        </Link>
                      </motion.div>

                      {/* Orders */}
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link
                          href="/orders"
                          className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2" />
                          </svg>
                          <span className="font-medium">{locale === 'ka' ? 'ჩემი შეკვეთები' : 'My Orders'}</span>
                        </Link>
                      </motion.div>

                      {/* Settings */}
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <SettingsIcon className="w-4 h-4 text-gray-500 group-hover:text-amber-600" />
                          <span className="font-medium">{locale === 'ka' ? 'პარამეტრები' : 'Settings'}</span>
                        </Link>
                      </motion.div>

                      {/* Admin Section */}
                      {isAdminUser && (
                        <>
                          <div className="border-t border-gray-200 my-2"></div>
                          
                          {/* Admin Badge */}
                          <div className="px-6 py-2">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-sm">
                              <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.618v.382a1 1 0 11-2 0v-.382L7.754 9.868a1 1 0 01-.372-1.364zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1-5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              {locale === 'ka' ? 'ადმინისტრატორი' : 'ADMIN'}
                            </div>
                          </div>

                          {/* Product Management */}
                          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                            <Link
                              href="/admin/products"
                              className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <Package className="w-4 h-4 text-gray-500 group-hover:text-amber-600" />
                              <span className="font-medium">{locale === 'ka' ? 'პროდუქტების მართვა' : 'Manage Products'}</span>
                            </Link>
                          </motion.div>

                          {/* Analytics */}
                          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                            <Link
                              href="/admin/analytics"
                              className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 group"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span className="font-medium">{locale === 'ka' ? 'ანალიტიკა' : 'Analytics'}</span>
                            </Link>
                          </motion.div>
                        </>
                      )}

                      <div className="border-t border-gray-200 my-2"></div>

                      {/* Sign Out */}
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-6 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                        >
                          <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                          <span className="font-medium">{locale === 'ka' ? 'გასვლა' : 'Sign Out'}</span>
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart - HUGE Icon */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/cart"
                className="relative p-4 text-gray-700 hover:text-amber-600 transition-colors"
              >
                <ShoppingCart className="w-14 h-14" />
                {cartCount > 0 && (
                  <motion.span 
                    className="absolute -top-1 -right-1 bg-amber-500 text-white text-base rounded-full h-8 w-8 flex items-center justify-center font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:text-primary-900 transition-colors touch-friendly"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pt-4 pb-6 space-y-2 bg-white border-t border-gray-200 mobile-container">
              {/* Home */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0 * 0.1 }}>
                <Link href="/" className="block px-4 py-3 text-gray-700 hover:text-primary-900 hover:bg-gray-50 rounded-lg text-base font-medium transition-all duration-200 touch-friendly" onClick={() => setIsMenuOpen(false)}>
                  {t('navigation', 'home')}
                </Link>
              </motion.div>

              {/* Shop */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 * 0.1 }}>
                <Link href="/shop" className="block px-4 py-3 text-gray-700 hover:text-primary-900 hover:bg-gray-50 rounded-lg text-base font-medium transition-all duration-200 touch-friendly" onClick={() => setIsMenuOpen(false)}>
                  {t('navigation', 'shop')}
                </Link>
              </motion.div>

              {/* New Items */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 * 0.1 }}>
                <Link href="/new-items" className="block px-4 py-3 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-base font-medium border-l-4 border-orange-500 transition-all duration-200 touch-friendly" onClick={() => setIsMenuOpen(false)}>
                  {t('navigation', 'newItems') || 'New Items'}
                </Link>
              </motion.div>

              {/* Categories */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2 * 0.1 }}>
                <Link href="/categories" className="block px-4 py-3 text-gray-700 hover:text-primary-900 hover:bg-gray-50 rounded-lg text-base font-medium transition-all duration-200 touch-friendly" onClick={() => setIsMenuOpen(false)}>
                  {t('navigation', 'categories')}
                </Link>
              </motion.div>

              {/* Brands */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 3 * 0.1 }}>
                <Link href="/brands" className="block px-4 py-3 text-gray-700 hover:text-primary-900 hover:bg-gray-50 rounded-lg text-base font-medium transition-all duration-200 touch-friendly" onClick={() => setIsMenuOpen(false)}>
                  {t('navigation', 'brands')}
                </Link>
              </motion.div>

              {/* About */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 4 * 0.1 }}>
                <Link href="/about" className="block px-4 py-3 text-gray-700 hover:text-primary-900 hover:bg-gray-50 rounded-lg text-base font-medium transition-all duration-200 touch-friendly" onClick={() => setIsMenuOpen(false)}>
                  {t('navigation', 'about')}
                </Link>
              </motion.div>

              {/* Contact */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 5 * 0.1 }}>
                <Link href="/contact" className="block px-4 py-3 text-gray-700 hover:text-primary-900 hover:bg-gray-50 rounded-lg text-base font-medium transition-all duration-200 touch-friendly" onClick={() => setIsMenuOpen(false)}>
                  {t('navigation', 'contact')}
                </Link>
              </motion.div>
              
              {/* Mobile Language Switcher */}
              <motion.div 
                className="px-3 py-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex space-x-2">
                  {languages.map((language) => (
                    <motion.button
                      key={language.code}
                      onClick={() => changeLocale(language.code as 'en' | 'ka')}
                      className={`p-2 rounded flex items-center space-x-2 ${
                        locale === language.code ? 'ring-2 ring-primary-500 bg-primary-50' : 'text-gray-100'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="text-sm font-medium">{language.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}