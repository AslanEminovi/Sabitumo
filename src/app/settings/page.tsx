'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  CreditCard, 
  Trash2, 
  Save,
  User,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CustomNativeSelect } from '@/components/CustomNativeSelect'

interface NotificationSettings {
  email: boolean
  sms: boolean
  marketing: boolean
  orderUpdates: boolean
  stockAlerts: boolean
  promotions: boolean
}

interface SecuritySettings {
  twoFactor: boolean
  loginAlerts: boolean
  sessionTimeout: number
  passwordChangeRequired: boolean
}

interface PreferenceSettings {
  language: string
  theme: string
  currency: string
  timezone: string
  emailFrequency: string
  autoLogout: boolean
}

export default function SettingsPage() {
  const { t, locale, changeLocale } = useTranslation()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: false,
    marketing: false,
    orderUpdates: true,
    stockAlerts: false,
    promotions: false
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordChangeRequired: false
  })

  const [preferences, setPreferences] = useState<PreferenceSettings>({
    language: locale,
    theme: 'light',
    currency: 'GEL',
    timezone: 'Asia/Tbilisi',
    emailFrequency: 'weekly',
    autoLogout: false
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      
      // Load user settings from metadata or database
      if (user.user_metadata?.settings) {
        const userSettings = user.user_metadata.settings
        setNotifications(prev => ({ ...prev, ...userSettings.notifications }))
        setSecurity(prev => ({ ...prev, ...userSettings.security }))
        setPreferences(prev => ({ ...prev, ...userSettings.preferences }))
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSaveSettings = async () => {
    if (!user) return

    setSaving(true)
    try {
      const settings = {
        notifications,
        security,
        preferences
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          settings
        }
      })

      if (error) throw error

      // Update language if changed
      if (preferences.language !== locale) {
        changeLocale(preferences.language as 'en' | 'ka')
      }

      alert(locale === 'ka' ? 'პარამეტრები შენახულია' : 'Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(locale === 'ka' ? 'პარამეტრების შენახვის შეცდომა' : 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert(locale === 'ka' ? 'პაროლები არ ემთხვევა' : 'Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      alert(locale === 'ka' ? 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო' : 'Password must be at least 6 characters')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setNewPassword('')
      setConfirmPassword('')
      alert(locale === 'ka' ? 'პაროლი შეიცვალა' : 'Password changed successfully')
    } catch (error) {
      console.error('Error changing password:', error)
      alert(locale === 'ka' ? 'პაროლის შეცვლის შეცდომა' : 'Error changing password')
    }
  }

  const tabs = [
    { id: 'notifications', label: locale === 'ka' ? 'შეტყობინებები' : 'Notifications', icon: Bell },
    { id: 'security', label: locale === 'ka' ? 'უსაფრთხოება' : 'Security', icon: Shield },
    { id: 'preferences', label: locale === 'ka' ? 'პრეფერენციები' : 'Preferences', icon: Globe },
    { id: 'account', label: locale === 'ka' ? 'ანგარიში' : 'Account', icon: User }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {locale === 'ka' ? 'პარამეტრები' : 'Settings'}
                </h1>
                <p className="text-sm text-gray-600">
                  {locale === 'ka' ? 'ანგარიშის კონფიგურაცია' : 'Configure your account preferences'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (locale === 'ka' ? 'შენახვა...' : 'Saving...') : (locale === 'ka' ? 'შენახვა' : 'Save Changes')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
            >
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {locale === 'ka' ? 'შეტყობინებების პარამეტრები' : 'Notification Settings'}
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {locale === 'ka' ? 'ელ. ფოსტის შეტყობინებები' : 'Email Notifications'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {locale === 'ka' ? 'მიიღეთ შეტყობინებები ელ. ფოსტაზე' : 'Receive notifications via email'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {locale === 'ka' ? 'შეკვეთების განახლებები' : 'Order Updates'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {locale === 'ka' ? 'შეკვეთის სტატუსის შეცვლის შესახებ' : 'Get notified about order status changes'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.orderUpdates}
                          onChange={(e) => setNotifications({...notifications, orderUpdates: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {locale === 'ka' ? 'მარაგის გაფრთხილებები' : 'Stock Alerts'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {locale === 'ka' ? 'პროდუქტის მარაგში დაბრუნებისას' : 'When products are back in stock'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.stockAlerts}
                          onChange={(e) => setNotifications({...notifications, stockAlerts: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {locale === 'ka' ? 'მარკეტინგული შეტყობინებები' : 'Marketing Communications'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {locale === 'ka' ? 'აქციებისა და სიახლეების შესახებ' : 'Promotions and product news'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.marketing}
                          onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {locale === 'ka' ? 'უსაფრთხოების პარამეტრები' : 'Security Settings'}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Password Change */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        {locale === 'ka' ? 'პაროლის შეცვლა' : 'Change Password'}
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {locale === 'ka' ? 'ახალი პაროლი' : 'New Password'}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                              placeholder={locale === 'ka' ? 'ახალი პაროლი' : 'Enter new password'}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {locale === 'ka' ? 'პაროლის დადასტურება' : 'Confirm Password'}
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder={locale === 'ka' ? 'პაროლის დადასტურება' : 'Confirm new password'}
                          />
                        </div>
                        
                        <button
                          onClick={handlePasswordChange}
                          disabled={!newPassword || !confirmPassword}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {locale === 'ka' ? 'პაროლის შეცვლა' : 'Change Password'}
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {locale === 'ka' ? 'ორფაქტორიანი ავტორიზაცია' : 'Two-Factor Authentication'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {locale === 'ka' ? 'დამატებითი უსაფრთხოება' : 'Add extra security to your account'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.twoFactor}
                          onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {locale === 'ka' ? 'შესვლის გაფრთხილებები' : 'Login Alerts'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {locale === 'ka' ? 'ახალი შესვლების შესახებ' : 'Get notified of new logins'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.loginAlerts}
                          onChange={(e) => setSecurity({...security, loginAlerts: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {locale === 'ka' ? 'პრეფერენციები' : 'Preferences'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'ენა' : 'Language'}
                      </label>
                      <CustomNativeSelect
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'ka', label: 'ქართული' }
                        ]}
                        value={preferences.language}
                        onChange={(value) => setPreferences({...preferences, language: value})}
                        placeholder={locale === 'ka' ? 'ენის არჩევა' : 'Select language'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'თემა' : 'Theme'}
                      </label>
                      <CustomNativeSelect
                        options={[
                          { value: 'light', label: locale === 'ka' ? 'ღია' : 'Light' },
                          { value: 'dark', label: locale === 'ka' ? 'მუქი' : 'Dark' },
                          { value: 'system', label: locale === 'ka' ? 'სისტემური' : 'System' }
                        ]}
                        value={preferences.theme}
                        onChange={(value) => setPreferences({...preferences, theme: value})}
                        placeholder={locale === 'ka' ? 'თემის არჩევა' : 'Select theme'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'ვალუტა' : 'Currency'}
                      </label>
                      <CustomNativeSelect
                        options={[
                          { value: 'GEL', label: 'GEL (₾)' },
                          { value: 'USD', label: 'USD ($)' },
                          { value: 'EUR', label: 'EUR (€)' }
                        ]}
                        value={preferences.currency}
                        onChange={(value) => setPreferences({...preferences, currency: value})}
                        placeholder={locale === 'ka' ? 'ვალუტის არჩევა' : 'Select currency'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ka' ? 'ელ. ფოსტის სიხშირე' : 'Email Frequency'}
                      </label>
                      <CustomNativeSelect
                        options={[
                          { value: 'daily', label: locale === 'ka' ? 'ყოველდღიურად' : 'Daily' },
                          { value: 'weekly', label: locale === 'ka' ? 'კვირეულად' : 'Weekly' },
                          { value: 'monthly', label: locale === 'ka' ? 'ყოველთვიურად' : 'Monthly' },
                          { value: 'never', label: locale === 'ka' ? 'არასდროს' : 'Never' }
                        ]}
                        value={preferences.emailFrequency}
                        onChange={(value) => setPreferences({...preferences, emailFrequency: value})}
                        placeholder={locale === 'ka' ? 'სიხშირის არჩევა' : 'Select frequency'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {locale === 'ka' ? 'ანგარიშის მართვა' : 'Account Management'}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Account Info */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        {locale === 'ka' ? 'ანგარიშის ინფორმაცია' : 'Account Information'}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {locale === 'ka' ? 'მომხმარებლის ID' : 'User ID'}
                            </p>
                            <p className="text-xs text-gray-600">{user?.id?.slice(0, 8)}...</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {locale === 'ka' ? 'რეგისტრაციის თარიღი' : 'Registration Date'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(profileData.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Export */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="font-medium text-blue-900 mb-4">
                        {locale === 'ka' ? 'მონაცემების ექსპორტი' : 'Data Export'}
                      </h4>
                      <p className="text-sm text-blue-800 mb-4">
                        {locale === 'ka' 
                          ? 'ჩამოტვირთეთ თქვენი ანგარიშის ყველა მონაცემი' 
                          : 'Download all your account data and order history'
                        }
                      </p>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'მონაცემების ექსპორტი' : 'Export Data'}</span>
                      </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="font-medium text-red-900 mb-4">
                        {locale === 'ka' ? 'საშიში ზონა' : 'Danger Zone'}
                      </h4>
                      <p className="text-sm text-red-800 mb-4">
                        {locale === 'ka' 
                          ? 'ანგარიშის წაშლა შეუქცევადია. ყველა მონაცემი წაიშლება.' 
                          : 'Account deletion is irreversible. All your data will be permanently deleted.'
                        }
                      </p>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        <span>{locale === 'ka' ? 'ანგარიშის წაშლა' : 'Delete Account'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}