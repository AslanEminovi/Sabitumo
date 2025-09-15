'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function OfflinePage() {
  const { t, locale } = useTranslation()
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Check if we're back online
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <WifiOff className="w-10 h-10 text-red-600" />
          </motion.div>

          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isOnline 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isOnline 
                ? (locale === 'ka' ? 'ონლაინ' : 'Online')
                : (locale === 'ka' ? 'ოფლაინ' : 'Offline')
              }
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            {locale === 'ka' 
              ? 'ინტერნეტ კავშირი არ არის' 
              : 'No Internet Connection'}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-8"
          >
            {locale === 'ka'
              ? 'შეამოწმეთ თქვენი ინტერნეტ კავშირი და სცადეთ თავიდან.'
              : 'Please check your internet connection and try again.'}
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <button
              onClick={handleRetry}
              disabled={!isOnline}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isOnline
                  ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${!isOnline ? 'animate-spin' : ''}`} />
              <span>
                {locale === 'ka' ? 'თავიდან ცდა' : 'Try Again'}
              </span>
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>
                {locale === 'ka' ? 'მთავარ გვერდზე დაბრუნება' : 'Go Home'}
              </span>
            </Link>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              {locale === 'ka' ? 'რჩევები:' : 'Tips:'}
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                {locale === 'ka' 
                  ? '• შეამოწმეთ Wi-Fi კავშირი'
                  : '• Check your Wi-Fi connection'}
              </li>
              <li>
                {locale === 'ka'
                  ? '• სცადეთ მობილური ინტერნეტი'
                  : '• Try mobile data'}
              </li>
              <li>
                {locale === 'ka'
                  ? '• გადატვირთეთ როუტერი'
                  : '• Restart your router'}
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-gray-500 mt-6"
        >
          {locale === 'ka'
            ? 'ზოგიერთი შინაარსი შესაძლოა ხელმისაწვდომი იყოს ოფლაინ რეჟიმში'
            : 'Some content may be available in offline mode'}
        </motion.p>
      </motion.div>
    </div>
  )
}
