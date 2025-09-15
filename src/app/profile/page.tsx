'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: 'Georgia'
  })

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!mounted) return
        
        if (!user) {
          router.push('/auth/login')
          return
        }
        
        setUser(user)
        setLoading(false)
        
        // Load profile data from user metadata or database
        if (user.user_metadata) {
          console.log('User metadata:', user.user_metadata) // Debug log
          setProfileData({
            firstName: user.user_metadata.first_name || user.user_metadata.given_name || '',
            lastName: user.user_metadata.last_name || user.user_metadata.family_name || '',
            phone: user.user_metadata.phone || '',
            address: user.user_metadata.address || '',
            city: user.user_metadata.city || '',
            country: user.user_metadata.country || 'Georgia'
          })
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    // Listen for auth state changes to refresh data
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      if (event === 'USER_UPDATED' && session?.user) {
        console.log('User updated, refreshing data:', session.user.user_metadata) // Debug log
        setUser(session.user)
        if (session.user.user_metadata) {
          setProfileData({
            firstName: session.user.user_metadata.first_name || session.user.user_metadata.given_name || '',
            lastName: session.user.user_metadata.last_name || session.user.user_metadata.family_name || '',
            phone: session.user.user_metadata.phone || '',
            address: session.user.user_metadata.address || '',
            city: session.user.user_metadata.city || '',
            country: session.user.user_metadata.country || 'Georgia'
          })
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Removed router from dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: profileData
      })
      
      if (error) {
        console.error('Error updating profile:', error)
        return
      }
      
      setIsEditing(false)
      // Update local user state
      setUser((prev: any) => ({
        ...prev,
        user_metadata: { ...prev.user_metadata, ...profileData }
      }))
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleCancel = () => {
    // Reset to original data
    if (user?.user_metadata) {
      setProfileData({
        firstName: user.user_metadata.first_name || user.user_metadata.given_name || '',
        lastName: user.user_metadata.last_name || user.user_metadata.family_name || '',
        phone: user.user_metadata.phone || '',
        address: user.user_metadata.address || '',
        city: user.user_metadata.city || '',
        country: user.user_metadata.country || 'Georgia'
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full opacity-20 blur-xl"></div>
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
          <Link href="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'ka' ? 'დეშბორდზე დაბრუნება' : 'Back to Dashboard'}
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {locale === 'ka' ? 'პროფილი' : 'Profile'}
              </h1>
              <p className="text-gray-600">
                {locale === 'ka' 
                  ? 'თქვენი პირადი ინფორმაციის მართვა' 
                  : 'Manage your personal information'
                }
              </p>
            </div>
            
            {!isEditing ? (
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {locale === 'ka' ? 'რედაქტირება' : 'Edit'}
                </motion.button>
                <motion.button
                  onClick={async () => {
                    const { data: { user: refreshedUser } } = await supabase.auth.getUser()
                    if (refreshedUser) {
                      setUser(refreshedUser)
                      if (refreshedUser.user_metadata) {
                        setProfileData({
                          firstName: refreshedUser.user_metadata.first_name || refreshedUser.user_metadata.given_name || '',
                          lastName: refreshedUser.user_metadata.last_name || refreshedUser.user_metadata.family_name || '',
                          phone: refreshedUser.user_metadata.phone || '',
                          address: refreshedUser.user_metadata.address || '',
                          city: refreshedUser.user_metadata.city || '',
                          country: refreshedUser.user_metadata.country || 'Georgia'
                        })
                      }
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {locale === 'ka' ? 'განახლება' : 'Refresh'}
                </motion.button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <motion.button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {locale === 'ka' ? 'შენახვა' : 'Save'}
                </motion.button>
                <motion.button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 mr-2" />
                  {locale === 'ka' ? 'გაუქმება' : 'Cancel'}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (Read-only) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ka' ? 'ელ-ფოსტა' : 'Email'}
              </label>
              <div className="flex items-center p-3 bg-gray-50 border border-gray-300 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {locale === 'ka' ? 'ელ-ფოსტის შეცვლა შეუძლებელია' : 'Email cannot be changed'}
              </p>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ka' ? 'სახელი' : 'First Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                    isEditing 
                      ? 'border-gray-300 focus:border-amber-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder={locale === 'ka' ? 'სახელი' : 'First name'}
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ka' ? 'გვარი' : 'Last Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                    isEditing 
                      ? 'border-gray-300 focus:border-amber-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder={locale === 'ka' ? 'გვარი' : 'Last name'}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ka' ? 'ტელეფონი' : 'Phone'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                    isEditing 
                      ? 'border-gray-300 focus:border-amber-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder={locale === 'ka' ? '+995 599 42 00 23' : '+995 599 42 00 23'}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ka' ? 'ქვეყანა' : 'Country'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="country"
                  value={profileData.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                    isEditing 
                      ? 'border-gray-300 focus:border-amber-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder={locale === 'ka' ? 'ქვეყანა' : 'Country'}
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ka' ? 'მისამართი' : 'Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                    isEditing 
                      ? 'border-gray-300 focus:border-amber-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder={locale === 'ka' ? 'სრული მისამართი' : 'Full address'}
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ka' ? 'ქალაქი' : 'City'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                    isEditing 
                      ? 'border-gray-300 focus:border-amber-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder={locale === 'ka' ? 'ქალაქი' : 'City'}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
