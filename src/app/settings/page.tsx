'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Bell, Shield, Globe, Palette, CreditCard, Trash2, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CustomNativeSelect } from '@/components/CustomNativeSelect'

export default function SettingsPage() {
  const { t, locale, changeLocale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      marketing: false
    },
    security: {
      twoFactor: false,
      loginAlerts: true
    },
    preferences: {
      language: locale,
      theme: 'light',
      currency: 'GEL'
    }
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))
  }

  const handleSaveSettings = async () => {
    try {
      // Save settings to user metadata
      const { error } = await supabase.auth.updateUser({
        data: { settings }
      })
      
      if (error) {
        console.error('Error saving settings:', error)
        return
      }
      
      // Update language if changed
      if (settings.preferences.language !== locale) {
        changeLocale(settings.preferences.language as 'en' | 'ka')
      }
      
      // Show success message (you can add a toast notification here)
      console.log('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
    }
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
                {locale === 'ka' ? 'პარამეტრები' : 'Settings'}
              </h1>
              <p className="text-gray-600">
                {locale === 'ka' 
                  ? 'თქვენი ანგარიშის პარამეტრების მართვა' 
                  : 'Manage your account preferences'
                }
              </p>
            </div>
            
            <motion.button
              onClick={handleSaveSettings}
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-4 h-4 mr-2" />
              {locale === 'ka' ? 'შენახვა' : 'Save'}
            </motion.button>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Notifications Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <Bell className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {locale === 'ka' ? 'შეტყობინებები' : 'Notifications'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {locale === 'ka' ? 'ელ-ფოსტის შეტყობინებები' : 'Email Notifications'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? 'შეკვეთების და ანგარიშის განახლებები' : 'Order and account updates'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {locale === 'ka' ? 'SMS შეტყობინებები' : 'SMS Notifications'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? 'მიწოდების განახლებები' : 'Delivery updates'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {locale === 'ka' ? 'მარკეტინგული შეტყობინებები' : 'Marketing Notifications'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? 'ფასდაკლებები და სპეციალური შეთავაზებები' : 'Discounts and special offers'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.marketing}
                    onChange={(e) => handleSettingChange('notifications', 'marketing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {locale === 'ka' ? 'უსაფრთხოება' : 'Security'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {locale === 'ka' ? 'ორ ფაქტორიანი ავტენტიფიკაცია' : 'Two-Factor Authentication'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? 'დამატებითი უსაფრთხოება თქვენი ანგარიშისთვის' : 'Extra security for your account'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactor}
                    onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {locale === 'ka' ? 'შესვლის გაფრთხილებები' : 'Login Alerts'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {locale === 'ka' ? 'შეგატყობინებთ ახალ შესვლებზე' : 'Get notified of new logins'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.loginAlerts}
                    onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Preferences Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <Globe className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {locale === 'ka' ? 'პრეფერენსები' : 'Preferences'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CustomNativeSelect
                  label={locale === 'ka' ? 'ენა' : 'Language'}
                  options={[
                    { value: 'ka', label: 'ქართული 🇬🇪' },
                    { value: 'en', label: 'English 🇺🇸' }
                  ]}
                  value={settings.preferences.language}
                  onChange={(value) => handleSettingChange('preferences', 'language', value)}
                />
              </div>

              <div>
                <CustomNativeSelect
                  label={locale === 'ka' ? 'ვალუტა' : 'Currency'}
                  options={[
                    { value: 'GEL', label: 'GEL (₾)' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' }
                  ]}
                  value={settings.preferences.currency}
                  onChange={(value) => handleSettingChange('preferences', 'currency', value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {locale === 'ka' ? 'ანგარიშის მოქმედებები' : 'Account Actions'}
            </h2>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                {locale === 'ka' ? 'ანგარიშის წაშლა' : 'Delete Account'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
